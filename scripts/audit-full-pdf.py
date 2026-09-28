"""Text-layer, font, pagination, and cold-replay checks for the full PDF.

--probe reports diagnostic builds without granting release acceptance.
Visual page review is a separate required release check.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

import pikepdf


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "output" / "pdf" / "openlogic-te-Telu-IN-full-OLP0722.pdf"
COLD = ROOT / "output" / "pdf" / "openlogic-te-Telu-IN-full-OLP0722-cold.pdf"
HTML_QA = ROOT / "evidence" / "FULL-HTML-QA.json"
REPORT = ROOT / "evidence" / "FULL-PDF-STRUCTURAL-QA.json"
TELUGU = re.compile(r"[\u0c00-\u0c7f]")
ID = re.compile(r"^OLP-\d{4}\r?$", re.MULTILINE)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inspect(pdf_path: Path, *, probe: bool) -> dict[str, object]:
    fonts = subprocess.run(["pdffonts", str(pdf_path)], capture_output=True, check=True, text=True, encoding="utf-8", errors="replace").stdout
    text_result = subprocess.run(["pdftotext", "-raw", "-enc", "UTF-8", str(pdf_path), "-"], capture_output=True, check=True)
    extracted = text_result.stdout.decode("utf-8")
    all_ids = re.findall(r"OLP-\d{4}", extracted)
    expected_ids = {f"OLP-{number:04d}" for number in range(1, 723)}
    pages_text = extracted.split("\f")
    if pages_text and not pages_text[-1].strip():
        pages_text.pop()
    orphan_unit_labels = [
        {"page": number, "unit_id": lines[-1].strip()}
        for number, value in enumerate(pages_text, 1)
        if (lines := [line for line in value.splitlines() if line.strip()])
        and ID.fullmatch(lines[-1].strip())
    ]
    with pikepdf.Pdf.open(pdf_path) as pdf:
        pages = len(pdf.pages)
        tagged = "/StructTreeRoot" in pdf.Root
        content_lengths = []
        for page in pdf.pages:
            contents = page.get("/Contents")
            if contents is None:
                content_lengths.append(0)
            elif isinstance(contents, pikepdf.Stream):
                content_lengths.append(len(contents.read_bytes()))
            else:
                content_lengths.append(sum(len(stream.read_bytes()) for stream in contents))
        page_sizes = {
            (round(float(page.mediabox[2]) - float(page.mediabox[0]), 1), round(float(page.mediabox[3]) - float(page.mediabox[1]), 1))
            for page in pdf.pages
        }
    result = {
        "schema": "openlogic-te-full-pdf-structural-qa/1",
        "status": "diagnostic_unaccepted" if probe else "structural_pass_visual_pending",
        "filename": pdf_path.name,
        "bytes": pdf_path.stat().st_size,
        "sha256": sha256(pdf_path),
        "pages": pages,
        "page_sizes_points": sorted(page_sizes),
        "tag_tree_present": tagged,
        "text_layer_bytes": len(text_result.stdout),
        "telugu_code_points_extracted": len(TELUGU.findall(extracted)),
        "unit_id_markers": len(all_ids),
        "unique_unit_id_markers": len(set(all_ids)),
        "unit_ids_seen_anywhere": len(set(all_ids)),
        "unit_ids_not_extracted": sorted(expected_ids - set(all_ids)),
        "empty_pages": [number for number, value in enumerate(pages_text, 1) if not value.strip() and content_lengths[number - 1] < 100],
        "sparse_text_pages_for_visual_review": [number for number, value in enumerate(pages_text, 1) if len(value.strip()) < 40],
        "orphan_unit_labels": orphan_unit_labels,
        "replacement_characters": extracted.count("\ufffd"),
        "noto_regular_embedded": bool(re.search(r"NotoSerifTelugu-Regular\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes", fonts)),
        "noto_bold_embedded": bool(re.search(r"NotoSerifTelugu-Bold\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes", fonts)),
        "extraction_note": "Poppler can insert spaces inside shaped Telugu words; character coverage and searchable phrases are checked separately from exact whitespace fidelity.",
    }
    if not probe:
        qa = json.loads(HTML_QA.read_text(encoding="utf-8"))
        require(qa["status"] == "COMPLETE_PASS" and qa["units"] == 722, "Accepted source HTML is absent")
        require(PDF.read_bytes() == COLD.read_bytes(), "Cold PDF replay differs")
        require(900 <= pages <= 2500 and len(page_sizes) == 1 and all(abs(width - 595) < 0.2 and abs(height - 841.9) < 0.2 for width, height in page_sizes), "Unexpected full PDF pagination or page size")
        require(tagged and result["noto_regular_embedded"] and result["noto_bold_embedded"], "PDF tags or Telugu fonts missing")
        require(len(pages_text) == pages and not result["empty_pages"], "Empty or unmatched PDF page")
        require(not orphan_unit_labels, "A unit label is stranded at the foot of a page")
        require(set(all_ids) >= expected_ids, "PDF unit coverage incomplete")
        require(result["telugu_code_points_extracted"] > 500_000 and result["replacement_characters"] == 0, "Text-layer corruption or missing Telugu")
        require("ఓపెన్ లాజిక్" in extracted and "సమితి" in extracted and "నిరూపణ" in extracted, "Expected searchable Telugu terms absent")
        result["source_html_qa_sha256"] = sha256(HTML_QA)
        result["cold_sha256"] = sha256(COLD)
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, default=PDF)
    parser.add_argument("--probe", action="store_true")
    args = parser.parse_args()
    result = inspect(args.pdf.resolve(), probe=args.probe)
    if not args.probe:
        REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()

"""Assemble the final visual-delta QA receipt for the repaired EPUB."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import zipfile

from lxml import etree, html


EPUB_NAME = "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.epub"
QA_NAME = "CUMULATIVE-OLP0279-EPUB-QA.json"
OUTPUT_NAME = "CUMULATIVE-OLP0279-EPUB-RENDER-QA.json"
EXPECTED_OLD_SHA256 = "fce845469d300ce4a86a4f7b909387976582c735ee0b881215537ab5ccc64b3e"
EXPECTED_COMMIT = "2892803b925b0330bca6200df21ce27b68208cdd"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def member(epub: Path, name: str) -> bytes:
    with zipfile.ZipFile(epub) as archive:
        return archive.read(name)


def unit_hashes(reader_payload: bytes, normalize_citations: bool = False) -> dict[str, str]:
    document = html.fromstring(reader_payload)
    result = {}
    for unit in document.xpath("//section[@data-unit-id]"):
        candidate = copy.deepcopy(unit)
        if normalize_citations:
            for citation in candidate.xpath(".//*[contains(concat(' ',normalize-space(@class),' '),' citation ')]"):
                citation.text = "CITATION-LABEL"
                for child in list(citation):
                    citation.remove(child)
        result[candidate.get("id")] = sha256(etree.tostring(candidate, method="html"))
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--previous-epub", type=Path, required=True)
    arguments = parser.parse_args()
    root = arguments.root.resolve()
    previous_epub = arguments.previous_epub.resolve()
    final_epub = root / "output/release" / EPUB_NAME
    qa_path = root / "evidence" / QA_NAME
    render_receipt_path = root / "tmp/v040-epub-targeted-render/render-receipt.json"
    require(final_epub.is_file() and previous_epub.is_file(), "Comparison EPUB is absent")
    require(qa_path.is_file() and render_receipt_path.is_file(), "QA input is absent")
    previous_payload = previous_epub.read_bytes()
    final_payload = final_epub.read_bytes()
    require(sha256(previous_payload) == EXPECTED_OLD_SHA256, "Previous published EPUB is not the expected baseline")

    old_reader = member(previous_epub, "OEBPS/reader.xhtml")
    new_reader = member(final_epub, "OEBPS/reader.xhtml")
    old_units = unit_hashes(old_reader)
    new_units = unit_hashes(new_reader)
    changed_units = [unit_id for unit_id in sorted(old_units) if old_units[unit_id] != new_units.get(unit_id)]
    require(len(old_units) == len(new_units) == 276, "Reader unit count changed")
    expected_citation_units = [
        "OLP-0035", "OLP-0036", "OLP-0037", "OLP-0044", "OLP-0046", "OLP-0048",
        "OLP-0050", "OLP-0052", "OLP-0053", "OLP-0054", "OLP-0140", "OLP-0156",
    ]
    require(changed_units == expected_citation_units, f"Unexpected source-unit changes: {changed_units}")
    require(
        unit_hashes(old_reader, normalize_citations=True) == unit_hashes(new_reader, normalize_citations=True),
        "Source units differ beyond citation-label normalization",
    )

    qa = json.loads(qa_path.read_text(encoding="utf-8"))
    render_receipt = json.loads(render_receipt_path.read_text(encoding="utf-8"))
    require(qa["status"] == "COMPLETE_PASS", "EPUB validation receipt did not pass")
    require(qa["artifact"]["sha256"] == sha256(final_payload), "Validation receipt targets a different EPUB")
    require(qa["epubcheck"]["errors"] == qa["epubcheck"]["warnings"] == 0, "EPUBCheck is not clean")
    require({name: len(record["pages"]) for name, record in render_receipt["artifacts"].items()} == {"title": 3, "about": 3, "bibliography": 2, "citation": 1}, "Unexpected targeted render pagination")

    title_text = " ".join(html.fromstring(member(final_epub, "OEBPS/title.xhtml")).itertext())
    about_text = " ".join(html.fromstring(member(final_epub, "OEBPS/about.xhtml")).itertext())
    reader_text = " ".join(html.fromstring(new_reader).itertext())
    source_sha = qa["source_identity"]["html_sha256"]
    require(source_sha not in title_text, "Raw source SHA remains on the title page")
    require(source_sha in about_text, "Technical source SHA is absent from About")
    for expected in (
        "Uber eine elementare Frage der Mannigfaltigkeitslehre",
        "David Hilbert's Lectures on the Foundations of Arithmetic and Logic 1917--1933",
        "Stevin Numbers and Reality",
        "Die Grundlagen der Arithmetik: Eine logisch mathematische Untersuchung uber den Begriff der Zahl",
        "Forall x: Calgary. An Introduction to Formal Logic",
        "Magnus et al., 2021",
    ):
        require(expected in reader_text, f"Rendered reader is missing {expected!r}")

    result = {
        "schema": "openlogic-te-epub-render-qa/2",
        "date": "2026-09-20",
        "status": "COMPLETE_PASS",
        "subject": {
            "filename": EPUB_NAME,
            "bytes": len(final_payload),
            "sha256": sha256(final_payload),
            "scope": "OLP-0004 through OLP-0279; 276 of 722 corpus units",
            "immutable_source_commit": EXPECTED_COMMIT,
            "reader_xhtml_bytes": len(new_reader),
            "reader_xhtml_sha256": sha256(new_reader),
            "reader_css_bytes": len(member(final_epub, "OEBPS/reader.css")),
            "reader_css_sha256": sha256(member(final_epub, "OEBPS/reader.css")),
        },
        "validation_receipt": {
            "path": f"evidence/{QA_NAME}",
            "sha256": sha256(qa_path.read_bytes()),
            "epubcheck": qa["epubcheck"],
            "internal_links": qa["structure"]["links"]["internal_links"],
            "fragment_targets": qa["structure"]["links"]["fragment_targets"],
            "all_links_resolved": qa["structure"]["links"]["all_resolved"],
        },
        "delta_binding": {
            "previous_public_epub_sha256": EXPECTED_OLD_SHA256,
            "source_units_compared": 276,
            "source_units_identical_after_citation_label_normalization": 276,
            "raw_changed_units": changed_units,
            "change_explanation": "The 12 raw-changed units are exactly the units containing citations. Their labels now use compact family-name forms; OLP-0140's six-author Magnus record becomes Magnus et al., 2021. No translated prose, English source, mathematics, statements, figures, diagrams, IDs, or targets changed.",
            "prior_full_sample_render_receipt_sha256": "2cab3ad4267a0115d2854568c8ef16bd31df534795adfe28284a9453c59c96cd",
        },
        "targeted_render": render_receipt,
        "visual_cases": [
            {"case": "title and partial-edition scope", "result": "pass", "observed": "The Telugu title, 276-of-722 scope, partial-edition notice, version, and navigation labels are legible and unclipped; no raw SHA appears."},
            {"case": "technical provenance placement", "result": "pass", "observed": "The full frozen-source revision and semantic-HTML SHA remain legible on the About page."},
            {"case": "nested-brace bibliography titles", "result": "pass", "observed": "Cantor1892, EwaldSieg2013, KatzKatz2012, Frege1884, and Magnus2021 render with complete titles and no exposed LaTeX command."},
            {"case": "multi-author citation reflow", "result": "pass", "observed": "The Telugu and English OLP-0140 footnotes render Magnus et al., 2021 on one unclipped page with normal link wrapping."},
            {"case": "unchanged reader body", "result": "pass", "observed": "All 276 source units are byte-equivalent to the previous public EPUB after citation-label normalization; the 12 raw-changed units are exactly those containing citation labels."},
        ],
        "finding": "No clipped text, exposed bibliography markup, misplaced technical provenance, or changed reader-body content was observed in the repaired EPUB delta.",
    }
    output_path = root / "evidence" / OUTPUT_NAME
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"status": result["status"], "evidence": str(output_path), "subject": result["subject"]}))


if __name__ == "__main__":
    main()

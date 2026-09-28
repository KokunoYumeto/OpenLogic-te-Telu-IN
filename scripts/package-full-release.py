"""Package the accepted 722-unit edition as reproducible v1.0.1 assets."""

from __future__ import annotations

import hashlib
import io
import json
import shutil
import subprocess
import zipfile
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "release"
TAG = "v1.0.1-full-olp0722"
REVISION = "9620cc73f9c8e0ad003c514a5d3748f29611c4c0"
ZIP_TIME = (2026, 9, 28, 0, 0, 0)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def git(*args: str) -> str:
    return subprocess.check_output(["git", "-C", str(ROOT), *args], text=True, encoding="utf-8").strip()


def accepted(path: str, status: str = "COMPLETE_PASS") -> dict:
    data = json.loads((ROOT / path).read_text(encoding="utf-8"))
    require(data.get("status") == status, f"Unaccepted QA: {path}")
    return data


def zip_entries(target: Path, entries: list[tuple[str, bytes]]) -> None:
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(entries):
            normalized = PurePosixPath(name)
            require(not normalized.is_absolute() and ".." not in normalized.parts, f"Unsafe archive path: {name}")
            info = zipfile.ZipInfo(normalized.as_posix(), date_time=ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def put_versioned(path: Path, source: Path) -> None:
    if path.exists():
        require(digest(path) == digest(source), f"Refusing to overwrite changed versioned asset: {path.name}")
    else:
        shutil.copyfile(source, path)


def artifact(path: Path, role: str) -> dict:
    return {"filename": path.name, "bytes": path.stat().st_size, "sha256": digest(path), "role": role}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    require(not git("status", "--porcelain"), "Commit all release sources before packaging")
    commit = git("rev-parse", "HEAD")
    source_manifest = [json.loads(line) for line in (ROOT / "evidence" / "SOURCE_MANIFEST.jsonl").read_text(encoding="utf-8").splitlines() if line]
    require(len(source_manifest) == 722, "The frozen source manifest is not complete")
    require({item["order"] for item in source_manifest} == set(range(1, 723)), "Source unit order is incomplete")

    structure = json.loads((ROOT / "evidence" / "CUMULATIVE-OLP0722-STRUCTURAL-QA.json").read_text(encoding="utf-8"))
    require(len(structure.get("units", [])) == 722 and all(
        all(unit[key] for key in ("paragraph_alignment", "structure_match", "math_multiset_match", "token_parity", "protected_identifier_parity"))
        and not unit["unicode_replacement_char"] and not unit["unpaired_surrogate"]
        for unit in structure["units"]
    ), "Full structural audit is incomplete")
    html = accepted("evidence/FULL-HTML-QA.json")
    token_headings = accepted("evidence/FULL-TOKEN-HEADING-QA.json")
    epub = accepted("evidence/FULL-EPUB-QA.json")
    pdf = accepted("evidence/FULL-PDF-STRUCTURAL-QA.json", "structural_pass_visual_pending")
    visual = accepted("evidence/FULL-PDF-VISUAL-QA.json")
    language = accepted("evidence/FULL-READER-LANGUAGE-TRIAGE.json")
    decisions = accepted("evidence/TRANSLATION_DECISION_QA.json", "pass")
    require(html["units"] == epub["units"] == decisions["coverage"]["reader_units"] == 722, "Reader or decision coverage differs")
    require(token_headings["html_sha256"] == next(item["sha256"] for item in html["files"] if item["name"] == "index.html"), "Token-heading audit covers different HTML")
    require(epub["epubcheck"]["errors"] == epub["epubcheck"]["warnings"] == 0, "EPUBCheck is not clean")
    require(pdf["pages"] == visual["pages"] and pdf["sha256"] == visual["pdf_sha256"], "PDF visual review does not bind the accepted PDF")
    require(not pdf["orphan_unit_labels"] and not pdf["empty_pages"], "PDF has a pagination defect")
    require(language["blocks_examined"] > 12_000 and not language["likely_untranslated_prose"],
            "Full reader language triage found unresolved flags")

    pdf_source = ROOT / "output" / "pdf" / "openlogic-te-Telu-IN-full-OLP0722.pdf"
    epub_source = OUT / "openlogic-te-Telu-IN-full-OLP0722.epub"
    require(digest(pdf_source) == pdf["sha256"] and digest(epub_source) == epub["sha256"], "Accepted reader bytes changed")
    # Zenodo previews the first previewable filename by default; keep the
    # pertinent complete PDF ahead of inherited partial-edition PDFs.
    pdf_asset = OUT / f"00-openlogic-te-Telu-IN-full-OLP0722-{TAG}.pdf"
    epub_asset = OUT / f"openlogic-te-Telu-IN-full-OLP0722-{TAG}.epub"
    put_versioned(pdf_asset, pdf_source)
    put_versioned(epub_asset, epub_source)

    html_root = ROOT / "output" / "html" / "full"
    html_entries = [(item["name"], (html_root / item["name"]).read_bytes()) for item in html["files"]]
    for item, (_, data) in zip(html["files"], html_entries):
        require(hashlib.sha256(data).hexdigest() == item["sha256"], f"Accepted HTML asset changed: {item['name']}")
    html_entries.append(("README.txt", "OpenLogic Telugu complete offline reader, 722 of 722 units. Unzip and open index.html. The reader uses local MathML, SVG diagrams, and bundled fonts; no network connection or script runtime is required.\n".encode("utf-8")))
    html_zip = OUT / f"openlogic-te-Telu-IN-full-HTML-OLP0722-{TAG}.zip"
    zip_entries(html_zip, html_entries)

    translation_paths = [f"translation/{item['source_path']}" for item in source_manifest]
    support = ["translation/TELUGU_TOKENS.json", "evidence/SOURCE_MANIFEST.jsonl", "evidence/SOURCE_CORRECTIONS.jsonl", "evidence/TERM_DECISIONS.jsonl", "LICENSE.md", "ATTRIBUTION.md"]
    editable_names = sorted(set(translation_paths + support))
    require(all((ROOT / name).is_file() for name in editable_names), "An editable source component is absent")
    editable_entries = [(name, (ROOT / name).read_bytes()) for name in editable_names]
    editable_entries.append(("README.txt", "OpenLogic Telugu editable TeX, all 722 frozen-source-aligned modules. The separately provided full-source archive includes the upstream TeX infrastructure, build tools, and detailed QA evidence.\n".encode("utf-8")))
    editable_zip = OUT / f"openlogic-te-Telu-IN-editable-TeX-OLP0722-{TAG}.zip"
    zip_entries(editable_zip, editable_entries)

    source_zip = OUT / f"openlogic-te-Telu-IN-full-source-OLP0722-{TAG}.zip"
    if not source_zip.exists():
        subprocess.run(["git", "-C", str(ROOT), "archive", "--format=zip", f"--output={source_zip}", commit], check=True)
    with zipfile.ZipFile(source_zip) as archive:
        require("README.md" in archive.namelist() and len(archive.namelist()) > 1000, "Full source archive is incomplete")

    qa_names = [
        "evidence/CUMULATIVE-OLP0722-STRUCTURAL-QA.json",
        "evidence/FULL-HTML-QA.json",
        "evidence/FULL-TOKEN-HEADING-QA.json",
        "evidence/FULL-EPUB-QA.json",
        "evidence/FULL-PDF-STRUCTURAL-QA.json",
        "evidence/FULL-PDF-VISUAL-QA.json",
        "evidence/TRANSLATION_DECISION_QA.json",
        "evidence/FULL-READER-LANGUAGE-TRIAGE.json",
        "evidence/FULL-LANGUAGE-CORRECTIONS-20260928.md",
        "evidence/FULL-SEMANTIC-SPOTCHECK-20260928.md",
    ]
    qa_zip = OUT / f"openlogic-te-Telu-IN-QA-OLP0722-{TAG}.zip"
    zip_entries(qa_zip, [(name, (ROOT / name).read_bytes()) for name in qa_names])

    roles = {
        pdf_asset: "complete_tagged_searchable_pdf",
        epub_asset: "complete_reflowable_mathml_epub",
        html_zip: "complete_offline_html_reader",
        editable_zip: "all_722_editable_telugu_tex_units",
        source_zip: "committed_full_source_snapshot",
        qa_zip: "release_qa_receipts_and_review_disclosures",
    }
    artifacts = [artifact(path, role) for path, role in sorted(roles.items(), key=lambda item: item[0].name)]
    manifest = {
        "schema": "openlogic-te-release-manifest/5",
        "version": TAG,
        "date": "2026-09-28",
        "repository_commit": commit,
        "source_revision": REVISION,
        "language": "te-Telu-IN",
        "scope": {"source_units": 722, "translated_editable_units": 722, "html_reader_units": 722, "epub_reader_units": 722, "pdf_reader_units": 722, "complete_edition": True},
        "lineage": {"prior_github_release": "v1.0.0-full-olp0722", "zenodo_concept_doi": "10.5281/zenodo.22307937", "prior_zenodo_version_doi": "10.5281/zenodo.22726674", "new_zenodo_version_doi": None},
        "review_boundary": "Machine-assisted translation with source-alignment and structural QA; not independently human-reviewed. Frozen-source proof gaps and four unresolved frozen-source cross-reference occurrences are disclosed in the reader and evidence.",
        "qa_receipts": [{"path": name, "sha256": digest(ROOT / name)} for name in qa_names],
        "artifacts": artifacts,
    }
    manifest_path = OUT / f"release-manifest-{TAG}.json"
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    if manifest_path.exists():
        require(manifest_path.read_bytes() == manifest_bytes, "Versioned manifest changed")
    else:
        manifest_path.write_bytes(manifest_bytes)
    checksums_path = OUT / f"SHA256SUMS-{TAG}.txt"
    checksums = "".join(f"{digest(path)}  {path.name}\n" for path in sorted([*roles, manifest_path], key=lambda item: item.name)).encode("ascii")
    if checksums_path.exists():
        require(checksums_path.read_bytes() == checksums, "Versioned checksums changed")
    else:
        checksums_path.write_bytes(checksums)
    print(json.dumps({"version": TAG, "commit": commit, "artifacts": artifacts, "manifest": artifact(manifest_path, "release_manifest"), "checksums": artifact(checksums_path, "sha256_checksums")}, ensure_ascii=False))


if __name__ == "__main__":
    main()

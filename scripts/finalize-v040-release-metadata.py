"""Write the reconciled v0.4.0 release manifest and checksum inventory."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re


VERSION = "0.4.0-cumulative-olp0279"
RELEASE_TAG = "v0.4.0-cumulative-olp0279"
SOURCE_COMMIT = "2892803b925b0330bca6200df21ce27b68208cdd"
SOURCE_REVISION = "9620cc73f9c8e0ad003c514a5d3748f29611c4c0"
MANIFEST_NAME = "release-manifest-v0.4.0.json"
CHECKSUM_NAME = "SHA256SUMS-v0.4.0.txt"

ROLES = {
    "CUMULATIVE-OLP0279-EPUB-QA.json": "repaired_cumulative_epub_machine_qa",
    "CUMULATIVE-OLP0279-EPUB-RENDER-QA.json": "repaired_cumulative_epub_visual_delta_qa",
    "CUMULATIVE-OLP0279-SOURCE-REPAIR-QA.json": "repaired_source_companion_cold_rebuild_qa",
    "SOURCE-PAIRINGS-v0.4.0.json": "source_to_reader_pairing_inventory",
    "SOURCE-REPAIR-v0.4.0.json": "source_repair_package_receipt",
    "openlogic-te-Telu-IN-cumulative-OLP0279-QA.json": "cumulative_pdf_qa_receipt",
    "openlogic-te-Telu-IN-cumulative-OLP0279-build-source-v0.4.0.zip": "exact_offline_pdf_and_epub_build_source",
    "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.epub": "repaired_reflowable_cumulative_epub",
    "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.pdf": "cumulative_pdf",
    "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.tex": "direct_flattened_cumulative_latex",
    "openlogic-te-Telu-IN-editable-OLP0279-v0.4.0.zip": "exact_editable_latex_checkpoint",
    "openlogic-te-Telu-IN-full-source-v0.4.0.zip": "full_repository_source_snapshot",
    "openlogic-te-Telu-IN-sfr-html-OLP0026-v0.4.0.zip": "inherited_legacy_23_unit_offline_html",
    "openlogic-te-Telu-IN-sfr-v0.3.0.epub": "inherited_legacy_23_unit_epub",
}

REPAIRED = {
    "CUMULATIVE-OLP0279-EPUB-QA.json",
    "CUMULATIVE-OLP0279-EPUB-RENDER-QA.json",
    "CUMULATIVE-OLP0279-SOURCE-REPAIR-QA.json",
    "SOURCE-PAIRINGS-v0.4.0.json",
    "SOURCE-REPAIR-v0.4.0.json",
    "openlogic-te-Telu-IN-cumulative-OLP0279-build-source-v0.4.0.zip",
    "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.epub",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--release-dir", type=Path, required=True)
    parser.add_argument("--repair-commit", required=True)
    arguments = parser.parse_args()
    release_dir = arguments.release_dir.resolve()
    repair_commit = arguments.repair_commit.lower()
    if not re.fullmatch(r"[0-9a-f]{40}", repair_commit):
        raise RuntimeError(f"Invalid repair commit: {repair_commit!r}")

    artifacts = []
    for filename, role in sorted(ROLES.items()):
        path = release_dir / filename
        if not path.is_file():
            raise RuntimeError(f"Missing release asset: {filename}")
        artifacts.append(
            {
                "filename": filename,
                "bytes": path.stat().st_size,
                "sha256": sha256(path),
                "role": role,
                "publication_state": "repaired_or_added" if filename in REPAIRED else "preserved_unchanged",
            }
        )

    manifest = {
        "schema": "openlogic-te-release-manifest/5",
        "version": VERSION,
        "date": "2026-09-20",
        "repository_commit": SOURCE_COMMIT,
        "repair_implementation_commit": repair_commit,
        "source_revision": SOURCE_REVISION,
        "scope": {
            "editable_latex": "OLP-0004 through OLP-0279; 276 of 722 unique source units",
            "pdf_reader": "OLP-0004 through OLP-0279; 276 unique editable units; native import topology prints 328 occurrences including 52 intentional shared-module repetitions",
            "semantic_html_reader": "Legacy release package: OLP-0004 through OLP-0026; 23 of 722 units",
            "epub_reader": "OLP-0004 through OLP-0279; 276 of 722 units",
            "frozen_english_source": "722 of 722 units",
            "complete_edition": False,
        },
        "reader_boundaries_are_explicit": True,
        "lineage": {
            "github_repository": "https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN",
            "github_release_tag": RELEASE_TAG,
            "github_pages_legacy_reader": "https://kokunoyumeto.github.io/OpenLogic-te-Telu-IN/sfr/",
            "prior_release": "v0.3.0-sfr-epub",
            "zenodo_concept_doi": "10.5281/zenodo.22307937",
            "latest_zenodo_version_doi": "10.5281/zenodo.22726674",
            "new_zenodo_version": None,
        },
        "publication_note": "GitHub-only cumulative reader/source checkpoint; prior releases and DOI lineage remain unchanged.",
        "repair_note": "Balanced BibTeX parsing restores nested-brace titles; raw source hashes moved from the title page to technical provenance; the source companion now reproduces both PDF and EPUB paths offline; legacy 23-unit artifacts and their source pairings remain attached.",
        "archive_contents": {
            "editable_tex_units": 276,
            "editable_archive_entries": 289,
            "full_source_entries": 1240,
            "legacy_offline_html_entries": 17,
            "build_source_entries": 1386,
            "build_source_translation_units": 276,
            "build_source_frozen_english_units": 722,
        },
        "verification": {
            "epubcheck": "5.4.0; EPUB 3.4 rules; 0 fatal, 0 error, 0 warning, 0 info",
            "epub_cold_rebuild_byte_identical": True,
            "source_companion_cold_rebuild_matches_release": True,
            "source_companion_tex_runs_for_this_repair": 0,
            "full_linguistic_certification": False,
        },
        "source_pairings": "SOURCE-PAIRINGS-v0.4.0.json",
        "artifacts": artifacts,
    }
    manifest_path = release_dir / MANIFEST_NAME
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    checksum_paths = [release_dir / artifact["filename"] for artifact in artifacts] + [manifest_path]
    checksum_payload = "".join(
        f"{sha256(path)}  {path.name}\n" for path in sorted(checksum_paths, key=lambda item: item.name)
    )
    checksum_path = release_dir / CHECKSUM_NAME
    checksum_path.write_text(checksum_payload, encoding="ascii", newline="\n")
    result = {
        "manifest": {"filename": MANIFEST_NAME, "bytes": manifest_path.stat().st_size, "sha256": sha256(manifest_path)},
        "checksums": {"filename": CHECKSUM_NAME, "bytes": checksum_path.stat().st_size, "sha256": sha256(checksum_path), "entries": len(checksum_paths)},
        "artifacts": len(artifacts),
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()

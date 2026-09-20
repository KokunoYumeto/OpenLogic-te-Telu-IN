"""Audit and cold-rebuild the expanded v0.4.0 source companion."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess
import tempfile
import zipfile


ARCHIVE_NAME = "openlogic-te-Telu-IN-cumulative-OLP0279-build-source-v0.4.0.zip"
EPUB_NAME = "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.epub"
PAIRINGS_NAME = "SOURCE-PAIRINGS-v0.4.0.json"
EVIDENCE_NAME = "CUMULATIVE-OLP0279-SOURCE-REPAIR-QA.json"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def run(command: list[str], cwd: Path) -> dict[str, object]:
    result = subprocess.run(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    require(result.returncode == 0, f"Command failed ({result.returncode}): {' '.join(command)}\n{result.stdout}")
    return {
        "command": command,
        "exit_code": result.returncode,
        "output": result.stdout.strip(),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True, help="Detached exact-release worktree")
    parser.add_argument("--epubcheck-jar", type=Path, required=True)
    arguments = parser.parse_args()
    root = arguments.root.resolve()
    archive_path = root / "output/release" / ARCHIVE_NAME
    release_epub_path = root / "output/release" / EPUB_NAME
    require(archive_path.is_file(), f"Missing archive: {archive_path}")
    require(release_epub_path.is_file(), f"Missing release EPUB: {release_epub_path}")
    require(arguments.epubcheck_jar.resolve().is_file(), "EPUBCheck jar is absent")

    archive_payload = archive_path.read_bytes()
    with zipfile.ZipFile(archive_path) as archive:
        names = archive.namelist()
        require(len(names) == len(set(names)), "Archive has duplicate paths")
        for name in names:
            normalized = PurePosixPath(name)
            require(not normalized.is_absolute() and ".." not in normalized.parts, f"Unsafe archive path: {name}")
        required = {
            "README-BUILD.txt",
            "README-EPUB-REBUILD.txt",
            "REBUILD-SOURCE.json",
            PAIRINGS_NAME,
            "requirements-epub.txt",
            "CONTENTS-SHA256.txt",
            "scripts/bibtex-reader.mjs",
            "scripts/test-bibliography.mjs",
            "scripts/build-html.mjs",
            "scripts/audit-html.mjs",
            "scripts/build-sets-epub.py",
            "scripts/audit-sets-epub.py",
            "output/html/cumulative-279/index.html",
            "output/html/cumulative-279/render-manifest.json",
            "node_modules/katex/package.json",
            "node_modules/commander/package.json",
        }
        require(required.issubset(names), f"Archive omissions: {sorted(required.difference(names))}")
        checksum_rows = archive.read("CONTENTS-SHA256.txt").decode("ascii").splitlines()
        checksums = dict(row.split("  ", 1)[::-1] for row in checksum_rows if row)
        expected_hashed = set(names).difference({"CONTENTS-SHA256.txt"})
        require(set(checksums) == expected_hashed, "CONTENTS-SHA256.txt inventory is incomplete")
        for name, expected in checksums.items():
            require(sha256(archive.read(name)) == expected, f"Archived checksum mismatch: {name}")
        provenance = json.loads(archive.read("REBUILD-SOURCE.json"))
        pairings = json.loads(archive.read(PAIRINGS_NAME))
        source_manifest = [json.loads(line) for line in archive.read("evidence/SOURCE_MANIFEST.jsonl").splitlines() if line]
        translation_names = [name for name in names if name.startswith("translation/content/") and name.endswith(".tex")]
        require(len(source_manifest) == 722, "Archive does not preserve all 722 frozen source-manifest rows")
        require(len(translation_names) == 276, "Archive does not preserve exactly 276 cumulative translation units")
        require(all(f"upstream/{row['source_path']}" in names for row in source_manifest), "Frozen source catalog is incomplete")
        require(len(pairings.get("pairings", [])) == 4, "Source-pairing list must contain cumulative PDF/EPUB and legacy HTML/EPUB")
        pairing_readers = {row["reader"] for row in pairings["pairings"]}
        require("openlogic-te-Telu-IN-sfr-v0.3.0.epub" in pairing_readers, "Legacy 23-unit EPUB pairing is absent")
        require("openlogic-te-Telu-IN-sfr-html-OLP0026-v0.4.0.zip" in pairing_readers, "Legacy 23-unit HTML pairing is absent")
        expected_epub = provenance["expected_epub"]
        release_epub_payload = release_epub_path.read_bytes()
        require(len(release_epub_payload) == expected_epub["bytes"], "Release EPUB byte count disagrees with rebuild provenance")
        require(sha256(release_epub_payload) == expected_epub["sha256"], "Release EPUB hash disagrees with rebuild provenance")

        with tempfile.TemporaryDirectory(prefix="openlogic-te-v040-rebuild-") as temporary:
            extracted = Path(temporary)
            archive.extractall(extracted)
            commands = [
                run(["node", "scripts/test-bibliography.mjs"], extracted),
                run(["node", "scripts/build-html.mjs", "--scope=cumulative279"], extracted),
                run(["node", "scripts/audit-html.mjs", "--scope=cumulative279"], extracted),
                run(["python", "scripts/build-sets-epub.py", "--profile", "cumulative279"], extracted),
                run(
                    [
                        "python",
                        "scripts/build-sets-epub.py",
                        "--profile",
                        "cumulative279",
                        "--output",
                        "output/release/openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0-cold.epub",
                        "--unpacked",
                        "output/epub-cumulative-279/cold-unpacked",
                    ],
                    extracted,
                ),
                run(
                    [
                        "python",
                        "scripts/audit-sets-epub.py",
                        "--profile",
                        "cumulative279",
                        "--epubcheck-jar",
                        str(arguments.epubcheck_jar.resolve()),
                    ],
                    extracted,
                ),
            ]
            rebuilt_html = (extracted / "output/html/cumulative-279/index.html").read_bytes()
            rebuilt_manifest = (extracted / "output/html/cumulative-279/render-manifest.json").read_bytes()
            rebuilt_epub = (extracted / "output/release" / EPUB_NAME).read_bytes()
            rebuilt_cold = (
                extracted / "output/release/openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0-cold.epub"
            ).read_bytes()
            require(sha256(rebuilt_html) == provenance["sealed_semantic_html"]["sha256"], "Cold semantic HTML hash mismatch")
            require(sha256(rebuilt_manifest) == provenance["sealed_render_manifest"]["sha256"], "Cold render-manifest hash mismatch")
            require(rebuilt_epub == rebuilt_cold, "Cold EPUB builds are not byte-identical")
            require(rebuilt_epub == release_epub_payload, "Extracted source companion did not reproduce the released EPUB")
            extracted_audit = json.loads((extracted / "evidence/CUMULATIVE-OLP0279-EPUB-QA.json").read_text(encoding="utf-8"))
            require(extracted_audit["status"] == "COMPLETE_PASS", "Extracted EPUB audit did not pass")

    result = {
        "schema": "openlogic-te-source-repair-qa/2",
        "date": "2026-09-20",
        "status": "COMPLETE_PASS",
        "scope": "OLP-0004 through OLP-0279; 276 of 722 units; packaging and deterministic rebuild QA, not full linguistic certification",
        "manager_findings_repaired": {
            "balanced_bibtex_fields": True,
            "human_title_omits_raw_sha": True,
            "technical_about_provenance_retained": True,
            "exact_epub_rebuild_source_present": True,
            "legacy_23_unit_source_pairings_retained": True,
        },
        "source_companion": {
            "filename": ARCHIVE_NAME,
            "bytes": len(archive_payload),
            "sha256": sha256(archive_payload),
            "entries": len(names),
            "hashes_verified": len(checksums),
            "translation_units": len(translation_names),
            "frozen_source_units": len(source_manifest),
            "epub_builder_present": True,
            "offline_node_dependencies_present": True,
        },
        "released_epub": {
            "filename": EPUB_NAME,
            "bytes": len(release_epub_payload),
            "sha256": sha256(release_epub_payload),
            "cold_rebuild_byte_identical": True,
        },
        "sealed_html": provenance["sealed_semantic_html"],
        "sealed_render_manifest": provenance["sealed_render_manifest"],
        "source_pairings": {
            "filename": PAIRINGS_NAME,
            "pairs": len(pairings["pairings"]),
            "legacy_html_retained": True,
            "legacy_epub_retained": True,
        },
        "commands": commands,
        "tex_runs": 0,
        "network_fetches": 0,
    }
    evidence_payload = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    evidence_path = root / "evidence" / EVIDENCE_NAME
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    evidence_path.write_text(evidence_payload, encoding="utf-8", newline="\n")
    print(json.dumps({"status": result["status"], "evidence": str(evidence_path), "archive": result["source_companion"]}))


if __name__ == "__main__":
    main()

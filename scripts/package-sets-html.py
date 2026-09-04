"""Build deterministic, cumulative v0.2.0 Sets HTML and source archives."""

from __future__ import annotations

from pathlib import Path, PurePosixPath
import hashlib
import io
import json
import subprocess
import zipfile


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "release"
OUT.mkdir(parents=True, exist_ok=True)
VERSION = "0.2.0-sets-html"
SOURCE_REVISION = "9620cc73f9c8e0ad003c514a5d3748f29611c4c0"
ZIP_TIMESTAMP = (2026, 9, 4, 0, 0, 0)
EXCLUDED_TRACKED_PREFIXES = ("build/", "node_modules/", "output/")


def run_git(*args: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tracked_files() -> list[str]:
    names = run_git("ls-files", "-z").decode("utf-8").split("\0")
    files = [name for name in names if name]
    return sorted(
        name for name in files
        if not name.startswith(EXCLUDED_TRACKED_PREFIXES)
    )


def checked_file(name: str) -> Path:
    path = (ROOT / name).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        raise RuntimeError(f"Absent or unsafe package input: {name}")
    return path


def zip_bytes(entries: list[tuple[str, bytes]]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(
        buffer,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    ) as archive:
        for name, data in sorted(entries):
            normalized = PurePosixPath(name)
            if normalized.is_absolute() or ".." in normalized.parts:
                raise RuntimeError(f"Unsafe archive path: {name}")
            info = zipfile.ZipInfo(normalized.as_posix(), date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(
                info,
                data,
                compress_type=zipfile.ZIP_DEFLATED,
                compresslevel=9,
            )
    return buffer.getvalue()


if subprocess.run(["git", "-C", str(ROOT), "diff", "--quiet"]).returncode != 0:
    raise RuntimeError("Refusing to package tracked working-tree changes")
if subprocess.run(["git", "-C", str(ROOT), "diff", "--cached", "--quiet"]).returncode != 0:
    raise RuntimeError("Refusing to package staged changes")

commit = run_git("rev-parse", "HEAD").decode("ascii").strip()
tracked = tracked_files()

html_names = [name for name in tracked if name.startswith("docs/sets/")]
if not html_names or "docs/sets/index.html" not in html_names:
    raise RuntimeError("Tracked semantic Sets reader is incomplete")
html_entries = [
    (name.removeprefix("docs/sets/"), checked_file(name).read_bytes())
    for name in html_names
]
html_entries.append((
    "README.txt",
    (
        "OpenLogic Telugu Sets semantic reader, v0.2.0\n"
        "\n"
        "Unzip this archive and open index.html in a browser. The reader is fully "
        "self-contained: Telugu fonts, MathML, diagrams, licenses, and the canonical "
        "English source disclosures are local. This reader covers OLP-0004 through "
        "OLP-0010 (7 of 722 source units); it is not the complete Telugu edition.\n"
    ).encode("utf-8"),
))
html_archive = zip_bytes(html_entries)

source_entries = [(name, checked_file(name).read_bytes()) for name in tracked]
source_archive = zip_bytes(source_entries)

html_path = OUT / "openlogic-te-Telu-IN-sets-html-v0.2.0.zip"
source_path = OUT / "openlogic-te-Telu-IN-source-checkpoint-v0.2.0.zip"
payloads = {html_path: html_archive, source_path: source_archive}

qa_files = [
    "evidence/HTML-SETS-DETERMINISTIC-QA.json",
    "evidence/HTML-SETS-BROWSER-QA.json",
    "evidence/GITHUB-COMMIT-d1daedb8f907-READBACK.json",
    "evidence/GITHUB-PAGES-READBACK.json",
    "evidence/EXPERT_REVIEW_LOG.jsonl",
    "evidence/SOURCE_CORRECTIONS.jsonl",
]
manifest = {
    "schema": "openlogic-te-release-manifest/2",
    "version": VERSION,
    "date": "2026-09-04",
    "scope": {
        "semantic_reader": "OLP-0004 through OLP-0010; 7 of 722 units",
        "editable_translation_checkpoint": "OLP-0004 through OLP-0026; 23 of 722 units",
        "complete_edition": False,
    },
    "source_revision": SOURCE_REVISION,
    "repository_commit": commit,
    "lineage": {
        "github_repository": "https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN",
        "github_pages": "https://kokunoyumeto.github.io/OpenLogic-te-Telu-IN/sets/",
        "zenodo_concept_doi": "10.5281/zenodo.22307937",
        "prior_zenodo_version_doi": "10.5281/zenodo.22307938",
    },
    "artifacts": [
        {
            "filename": path.name,
            "bytes": len(data),
            "sha256": sha256(data),
            "role": "new",
        }
        for path, data in payloads.items()
    ],
    "inherited_artifacts": [
        {
            "filename": "openlogic-te-Telu-IN-sets-v0.1.0.pdf",
            "bytes": 160275,
            "sha256": "4272102d0e7ef34f819d582304a19442ece75ed9b34a07fd677461f37cbaf719",
        },
        {
            "filename": "openlogic-te-Telu-IN-sets-source-v0.1.0.zip",
            "bytes": 415750,
            "sha256": "26277e219d037a0353b13e2f9a63568a5a9bec5e23bc04bc779c6b368fb00080",
        },
        {
            "filename": "release-manifest.json",
            "bytes": 645,
            "sha256": "6ca267b5d436027647b820b1c1ffc16420f6fd864079d925c12bab5a93bf12c5",
        },
    ],
    "qa_evidence": [
        {
            "path": name,
            "bytes": checked_file(name).stat().st_size,
            "sha256": sha256(checked_file(name).read_bytes()),
        }
        for name in qa_files
    ],
    "archive_contents": {
        "html_files": len(html_entries),
        "source_files": len(source_entries),
        "source_file_basis": "tracked files at repository_commit, excluding build, node_modules, and output",
    },
}
manifest_path = OUT / "release-manifest-v0.2.0.json"
payloads[manifest_path] = (
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
).encode("utf-8")

for destination, data in payloads.items():
    if destination.exists() and destination.read_bytes() != data:
        raise RuntimeError(
            f"Refusing to overwrite versioned artifact with different bytes: {destination.name}"
        )
for destination, data in payloads.items():
    destination.write_bytes(data)

print(json.dumps(manifest, ensure_ascii=False))

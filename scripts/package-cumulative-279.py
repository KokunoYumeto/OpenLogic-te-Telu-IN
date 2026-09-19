"""Build deterministic GitHub release assets for the OLP-0279 checkpoint."""

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
VERSION = "0.4.0-cumulative-olp0279"
SOURCE_REVISION = "9620cc73f9c8e0ad003c514a5d3748f29611c4c0"
ZIP_TIMESTAMP = (2026, 9, 20, 0, 0, 0)
EXCLUDED_PREFIXES = ("build/", "node_modules/", "output/", "release-stage/", "tmp/")


def run_git(*args: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob(commit: str, name: str) -> bytes:
    return run_git("show", f"{commit}:{name}")


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


def write_versioned(path: Path, data: bytes) -> None:
    if path.exists() and path.read_bytes() != data:
        raise RuntimeError(f"Refusing to overwrite changed versioned asset: {path.name}")
    path.write_bytes(data)


if subprocess.run(["git", "-C", str(ROOT), "diff", "--quiet"]).returncode != 0:
    raise RuntimeError("Refusing to package tracked working-tree changes")
if subprocess.run(["git", "-C", str(ROOT), "diff", "--cached", "--quiet"]).returncode != 0:
    raise RuntimeError("Refusing to package staged changes")

commit = run_git("rev-parse", "HEAD").decode("ascii").strip()
tracked = sorted(
    name
    for name in run_git("ls-tree", "-r", "--name-only", commit).decode("utf-8").splitlines()
    if name and not name.startswith(EXCLUDED_PREFIXES)
)

manifest_rows = [
    json.loads(line)
    for line in git_blob(commit, "evidence/SOURCE_MANIFEST.jsonl").decode("utf-8").splitlines()
    if line
]
scoped_rows = [row for row in manifest_rows if 4 <= row["order"] <= 279]
if len(scoped_rows) != 276:
    raise RuntimeError(f"Expected 276 editable units, found {len(scoped_rows)}")

editable_names = [f"translation/{row['source_path']}" for row in scoped_rows]
editable_support = [
    "translation/TELUGU_TOKENS.json",
    "editions/cumulative-279.tex",
    "scripts/prepare-cumulative-279.mjs",
    "scripts/build-cumulative-279.ps1",
    "evidence/SOURCE_MANIFEST.jsonl",
    "evidence/SOURCE_CORRECTIONS.jsonl",
    "evidence/TERM_DECISIONS.jsonl",
    "evidence/CUMULATIVE-OLP0279-STRUCTURAL-QA.json",
    "evidence/CUMULATIVE-OLP0279-PDF-QA.json",
    "evidence/TRANSLATION_DECISION_QA.json",
    "LICENSE.md",
    "ATTRIBUTION.md",
]
for name in editable_names + editable_support:
    if name not in tracked:
        raise RuntimeError(f"Missing tracked editable-package input: {name}")

editable_readme = (
    "OpenLogic Telugu editable checkpoint through OLP-0279\n\n"
    "This deterministic archive contains 276 editable Telugu TeX units, "
    "OLP-0004 through OLP-0279, plus the exact token map, source manifest, "
    "correction/terminology ledgers, cumulative QA, PDF master, and guarded "
    "build scripts. It is not the complete 722-unit edition. The full-source "
    "archive in the same release additionally contains all frozen English "
    "source and upstream TeX infrastructure.\n"
).encode("utf-8")
editable_entries = [(name, git_blob(commit, name)) for name in editable_names + editable_support]
editable_entries.append(("EDITABLE-CHECKPOINT-README.txt", editable_readme))
editable_archive = zip_bytes(editable_entries)

source_entries = [(name, git_blob(commit, name)) for name in tracked]
source_entries.append((
    "SOURCE-ARCHIVE-README.txt",
    (
        f"OpenLogic Telugu full source snapshot at commit {commit}.\n"
        "Contains all tracked release sources, including 722 frozen English "
        "TeX units and 276 editable Telugu TeX units through OLP-0279. "
        "Generated build/output directories are intentionally excluded.\n"
    ).encode("utf-8"),
))
source_archive = zip_bytes(source_entries)

html_names = [name for name in tracked if name.startswith("docs/sfr/")]
if "docs/sfr/index.html" not in html_names:
    raise RuntimeError("Tracked 23-unit SFR HTML reader is absent")
html_entries = [
    (name.removeprefix("docs/sfr/"), git_blob(commit, name))
    for name in html_names
]
html_entries.append((
    "README.txt",
    (
        "OpenLogic Telugu semantic HTML reader\n\n"
        "Unzip and open index.html. This self-contained reader covers OLP-0004 "
        "through OLP-0026 (23 of 722 units): the complete Sets, Relations, and "
        "Functions chapters. It is intentionally smaller than the 276-unit PDF "
        "and editable-source checkpoint.\n"
    ).encode("utf-8"),
))
html_archive = zip_bytes(html_entries)

pdf_path = ROOT / "output/pdf/openlogic-te-Telu-IN-cumulative-OLP0279.pdf"
epub_path = OUT / "openlogic-te-Telu-IN-sfr-v0.3.0.epub"
if not pdf_path.is_file():
    raise RuntimeError("Cumulative PDF is absent")
if not epub_path.is_file():
    raise RuntimeError("Verified 23-unit EPUB is absent")

qa_blob = git_blob(commit, "evidence/CUMULATIVE-OLP0279-PDF-QA.json")
payloads: dict[Path, bytes] = {
    OUT / "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.pdf": pdf_path.read_bytes(),
    OUT / "openlogic-te-Telu-IN-editable-OLP0279-v0.4.0.zip": editable_archive,
    OUT / "openlogic-te-Telu-IN-full-source-v0.4.0.zip": source_archive,
    OUT / "openlogic-te-Telu-IN-sfr-html-OLP0026-v0.4.0.zip": html_archive,
    OUT / epub_path.name: epub_path.read_bytes(),
    OUT / "openlogic-te-Telu-IN-cumulative-OLP0279-QA.json": qa_blob,
}

roles = {
    "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.pdf": "new_cumulative_pdf",
    "openlogic-te-Telu-IN-editable-OLP0279-v0.4.0.zip": "new_exact_editable_latex",
    "openlogic-te-Telu-IN-full-source-v0.4.0.zip": "new_full_source_snapshot",
    "openlogic-te-Telu-IN-sfr-html-OLP0026-v0.4.0.zip": "new_offline_package_of_verified_reader",
    "openlogic-te-Telu-IN-sfr-v0.3.0.epub": "inherited_verified_epub",
    "openlogic-te-Telu-IN-cumulative-OLP0279-QA.json": "new_pdf_qa_receipt",
}
artifacts = [
    {
        "filename": path.name,
        "bytes": len(data),
        "sha256": sha256(data),
        "role": roles[path.name],
    }
    for path, data in sorted(payloads.items(), key=lambda item: item[0].name)
]

manifest = {
    "schema": "openlogic-te-release-manifest/4",
    "version": VERSION,
    "date": "2026-09-20",
    "repository_commit": commit,
    "source_revision": SOURCE_REVISION,
    "scope": {
        "editable_latex": "OLP-0004 through OLP-0279; 276 of 722 unique source units",
        "pdf_reader": "OLP-0004 through OLP-0279; 276 unique editable units; native import topology may print shared proof modules in both propositional and first-order contexts",
        "semantic_html_reader": "OLP-0004 through OLP-0026; 23 of 722 units",
        "epub_reader": "OLP-0004 through OLP-0026; 23 of 722 units",
        "frozen_english_source": "722 of 722 units",
        "complete_edition": False,
    },
    "reader_boundaries_are_distinct": True,
    "lineage": {
        "github_repository": "https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN",
        "github_release_tag": "v0.4.0-cumulative-olp0279",
        "github_pages": "https://kokunoyumeto.github.io/OpenLogic-te-Telu-IN/sfr/",
        "prior_release": "v0.3.0-sfr-epub",
        "zenodo_concept_doi": "10.5281/zenodo.22307937",
        "latest_zenodo_version_doi": "10.5281/zenodo.22726674",
        "new_zenodo_version": None,
    },
    "publication_note": "GitHub-only cumulative reader/source checkpoint; prior releases and DOI lineage remain unchanged.",
    "archive_contents": {
        "editable_tex_units": len(editable_names),
        "editable_archive_entries": len(editable_entries),
        "full_source_entries": len(source_entries),
        "offline_html_entries": len(html_entries),
    },
    "artifacts": artifacts,
}
manifest_data = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
manifest_path = OUT / "release-manifest-v0.4.0.json"
write_versioned(manifest_path, manifest_data)

for destination, data in payloads.items():
    write_versioned(destination, data)

checksum_targets = sorted([*payloads, manifest_path], key=lambda path: path.name)
checksum_data = "".join(
    f"{sha256(path.read_bytes())}  {path.name}\n"
    for path in checksum_targets
).encode("ascii")
checksum_path = OUT / "SHA256SUMS-v0.4.0.txt"
write_versioned(checksum_path, checksum_data)

print(json.dumps({
    "version": VERSION,
    "repository_commit": commit,
    "artifacts": artifacts,
    "manifest": {"filename": manifest_path.name, "bytes": len(manifest_data), "sha256": sha256(manifest_data)},
    "checksums": {"filename": checksum_path.name, "bytes": len(checksum_data), "sha256": sha256(checksum_data)},
}, ensure_ascii=False))

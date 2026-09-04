"""Deterministic, allowlisted chapter archive. Run from any working directory."""
from pathlib import Path
import hashlib
import io
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "release"
OUT.mkdir(parents=True, exist_ok=True)
NAMES = ["sets", "basics", "subsets", "important-sets",
         "unions-and-intersections", "pairs-and-products", "russells-paradox"]
FILES = [
    "README.md", "ATTRIBUTION.md", "LICENSE.md",
    "editions/sets.tex", "scripts/prepare-sets.mjs",
    "scripts/build-sets.ps1", "scripts/package-sets.py", "scripts/audit-batch.mjs",
    "fonts/NotoSerifTelugu-Regular.ttf", "fonts/NotoSerifTelugu-Bold.ttf",
    "fonts/OFL.txt", "upstream/LICENSE.md", "upstream/README.md",
    "evidence/SOURCE_MANIFEST.jsonl", "evidence/CANON_SOURCES.jsonl",
    "evidence/CANON_PASSAGES.jsonl", "evidence/TERM_DECISIONS.jsonl",
    "evidence/SEGMENT_CANON_USE.jsonl",
    "evidence/BATCH-001-STRUCTURAL-QA.json",
    "evidence/BATCH-001-SEMANTIC-REVIEW.md",
    "evidence/SETS-FINAL-QA.json",
]
FILES += [f"{side}/content/sets-functions-relations/sets/{name}.tex"
          for side in ["upstream", "translation"] for name in NAMES]
FILES += [f"upstream/assets/diagrams/{name}.tikz"
          for name in ["union", "intersection", "difference"]]

def digest(data):
    return hashlib.sha256(data).hexdigest()

archive = OUT / "openlogic-te-Telu-IN-sets-source-v0.1.0.zip"
archive_buffer = io.BytesIO()
with zipfile.ZipFile(archive_buffer, "w", compression=zipfile.ZIP_DEFLATED,
                     compresslevel=9) as z:
    for name in sorted(FILES):
        source = (ROOT / name).resolve()
        if not source.is_relative_to(ROOT) or not source.is_file():
            raise RuntimeError(f"Absent or unsafe package input: {name}")
        info = zipfile.ZipInfo(name, date_time=(2026, 9, 4, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED,
                   compresslevel=9)

archive_data = archive_buffer.getvalue()
pdf_data = (ROOT / "build/sets.pdf").read_bytes()
qa = json.loads((ROOT / "evidence/SETS-FINAL-QA.json").read_text(encoding="utf-8-sig"))
if digest(pdf_data) != qa["pdf_sha256"]:
    raise RuntimeError("PDF bytes differ from visually inspected QA artifact")
pdf = OUT / "openlogic-te-Telu-IN-sets-v0.1.0.pdf"
payloads = {pdf: pdf_data, archive: archive_data}
records = [{"filename": p.name, "bytes": len(data),
            "sha256": digest(data)} for p, data in payloads.items()]
manifest = {"schema": "openlogic-te-release-manifest/1",
            "version": "0.1.0-sets", "date": "2026-09-04",
            "scope": "OLP-0004 through OLP-0010, 7 of 722 units; not the full edition",
            "source_revision": "9620cc73f9c8e0ad003c514a5d3748f29611c4c0",
            "artifacts": records}
payloads[OUT / "release-manifest.json"] = (
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
for destination, data in payloads.items():
    if destination.exists() and destination.read_bytes() != data:
        raise RuntimeError("Refusing to overwrite a versioned release artifact. "
                           "Preserve the published snapshot and choose a new version.")
for destination, data in payloads.items():
    destination.write_bytes(data)
print(json.dumps(manifest, ensure_ascii=False))

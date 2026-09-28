"""Assemble a directly downloadable, source-faithful 722-unit TeX compendium.

This does not rebuild or replace the accepted PDF. Every translated unit body
is inlined exactly once in manifest order. The companion ZIP contains the
tracked source tree, its dependencies, this generator, and reconstruction notes.
"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "release"
TAG = "v1.0.1-full-olp0722"
TEX_NAME = f"01-openlogic-te-Telu-IN-direct-LaTeX-OLP0722-{TAG}.tex"
ZIP_NAME = f"02-openlogic-te-Telu-IN-full-source-OLP0722-{TAG}-addendum.zip"
ASSEMBLY_NAME = f"direct-LaTeX-OLP0722-{TAG}-ASSEMBLY.json"
ZIP_TIME = (2026, 9, 28, 0, 0, 0)
BEGIN = re.compile(rb"\\begin\s*\{document\}")
END = re.compile(rb"\\end\s*\{document\}")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def source_rows() -> list[dict]:
    manifest = ROOT / "evidence" / "SOURCE_MANIFEST.jsonl"
    rows = [json.loads(line) for line in manifest.read_text(encoding="utf-8").splitlines() if line]
    require(len(rows) == 722 and [row["order"] for row in rows] == list(range(1, 723)),
            "Expected the exact ordered 722-unit source manifest")
    return rows


def accepted_unit_hashes() -> dict[str, str]:
    qa = json.loads((ROOT / "evidence" / "CUMULATIVE-OLP0722-STRUCTURAL-QA.json").read_text(encoding="utf-8"))
    units = qa["units"]
    require(len(units) == 722 and all(
        unit["paragraph_alignment"] and unit["structure_match"] and unit["math_multiset_match"]
        and unit["token_parity"] and unit["protected_identifier_parity"]
        and not unit["unicode_replacement_char"] and not unit["unpaired_surrogate"]
        for unit in units
    ), "Full structural QA is not accepted")
    return {unit["unit_id"]: unit["translation_sha256"] for unit in units}


def body_of(raw: bytes, label: str) -> tuple[bytes, str]:
    raw.decode("utf-8")  # Fail on invalid source encoding without normalizing it.
    starts = list(BEGIN.finditer(raw))
    ends = list(END.finditer(raw))
    if not starts and not ends:
        return raw, "unwrapped_fragment"
    require(len(starts) == len(ends) == 1 and starts[0].end() < ends[0].start(),
            f"Expected one matched TeX document body or an unwrapped fragment: {label}")
    return raw[starts[0].end():ends[0].start()], "document_body"


PREAMBLE = r"""% ఓపెన్ లాజిక్ తెలుగు — పూర్తి 722-విభాగాల నేరుగా పొందగల LaTeX మూలం
% ఈ ఫైలు ఒకే మూలసంగ్రహం; ప్రచురిత PDFను HTML పాఠక రూపం నుంచి నిర్మించారు.
% ప్రతి OLP విభాగం అసలు అనువాద ఫైలు శరీరంతో కింద ఒక్కసారి మాత్రమే ఉంది.
\documentclass[11pt,a4paper,openany]{memoir}
\newcommand*{\olpath}{upstream}
\usepackage{fontspec}
\setmainfont{Latin Modern Roman}
\setsansfont{Latin Modern Sans}
\setmonofont{Latin Modern Mono}
\newfontfamily{\telugufont}{NotoSerifTelugu-Regular.ttf}[
  Path=fonts/,Script=Telugu,Language=Telugu,
  BoldFont=NotoSerifTelugu-Bold.ttf,
  ItalicFont=NotoSerifTelugu-Regular.ttf,
  BoldItalicFont=NotoSerifTelugu-Bold.ttf]
\usepackage[Latin,Telugu]{ucharclasses}
\setTransitionsForLatin{\rmfamily}{}
\setTransitionTo{Telugu}{\telugufont}
\XeTeXgenerateactualtext=1
\input{upstream/sty/open-logic.sty}
\input{upstream/sty/open-logic-defer.sty}
\includeenv{editorial}
\problemsperchapter
\let\cleardoublepage\clearpage
\pagestyle{plain}
\providecommand{\tetoken}[2]{#1}
\providecommand{\ను}{{\telugufont ను}}
\providecommand{\MPని}{\MP{}\ను}
\providecommand{\QRతో}{\QR{}{\telugufont తో}}
\providecommand{\dotsను}{\dots{}\ను}
\providecommand{\dotsకు}{\dots{}\telugufont కు}
\providecommand{\sourcecorrection}[2]{}
% దిగుమతుల శరీరాలన్నీ ఇప్పటికే ఇక్కడ ఉన్నాయి; మళ్లీ లోడ్ చేయవద్దు.
\RenewDocumentCommand\olimport{s o m o}{}
\ProvideDocumentCommand\subfile{m}{}
\RenewDocumentCommand\subfile{m}{}
\def\partname{{\telugufont భాగం}}
\def\chaptername{{\telugufont అధ్యాయం}}
\def\contentsname{{\telugufont విషయ సూచిక}}
\def\figurename{{\telugufont పటం}}
\def\proofname{{\telugufont నిరూపణ}}
\hypersetup{pdftitle={ఓపెన్ లాజిక్ తెలుగు — పూర్తి 722-విభాగాల మూలసంగ్రహం},
  pdfauthor={The Open Logic Project; OpenAI Codex machine-assisted Telugu edition}}
\tolerance=3000
\emergencystretch=4em
\raggedbottom
\begin{document}
\begin{titlingpage}
{\HUGE\telugufont ఓపెన్ లాజిక్ తెలుగు\par}
\vskip 3ex
{\Large\telugufont పూర్తి 722-విభాగాల సవరించగల LaTeX మూలసంగ్రహం\par}
\vfill
{\telugufont ఇది యంత్ర-సహాయ అనువాదం. స్వతంత్ర మానవ నిపుణ సమీక్ష జరగలేదు.
ప్రచురిత పాఠక PDF, EPUB, HTML వేరు; ఈ ఫైలు వాటి TeX నిర్మాణ నకలు కాదు.\par}
\end{titlingpage}
\frontmatter
\tableofcontents*
\mainmatter
"""

POSTAMBLE = r"""
\backmatter
\bibliographystyle{upstream/bib/natbib-oup}
\bibliography{upstream/bib/open-logic}
\end{document}
"""


def assemble() -> tuple[bytes, dict]:
    rows = source_rows()
    hashes = accepted_unit_hashes()
    parts = [PREAMBLE.encode("utf-8")]
    offset = len(parts[0])
    entries = []
    for row in rows:
        unit = row["unit_id"]
        relative = PurePosixPath(row["source_path"])
        require(not relative.is_absolute() and ".." not in relative.parts, f"Unsafe source path: {relative}")
        target = ROOT / "translation" / relative
        raw = target.read_bytes()
        require(sha(raw) == hashes[unit], f"Accepted translation changed: {unit}")
        body, form = body_of(raw, unit)
        marker = f"% BEGIN TRANSLATED UNIT {unit} | {relative.as_posix()} | sha256:{sha(raw)}\n".encode("utf-8")
        close = f"% END TRANSLATED UNIT {unit}\n".encode("utf-8")
        body_offset = offset + len(marker)
        block = marker + body + (b"" if body.endswith(b"\n") else b"\n") + close
        parts.append(block)
        offset += len(block)
        entries.append({
            "unit_id": unit,
            "path": f"translation/{relative.as_posix()}",
            "source_role": row["source_role"],
            "extraction": form,
            "raw_bytes": len(raw),
            "raw_sha256": sha(raw),
            "inlined_body_offset": body_offset,
            "inlined_body_bytes": len(body),
            "inlined_body_sha256": sha(body),
        })
    parts.append(POSTAMBLE.encode("utf-8"))
    payload = b"".join(parts)
    require(payload.count(b"% BEGIN TRANSLATED UNIT ") == 722
            and payload.count(b"% END TRANSLATED UNIT ") == 722,
            "Direct TeX marker count differs from the 722-unit manifest")
    for entry in entries:
        start = entry["inlined_body_offset"]
        end = start + entry["inlined_body_bytes"]
        require(sha(payload[start:end]) == entry["inlined_body_sha256"],
                f"Assembly changed an inlined body: {entry['unit_id']}")
    require(sum(entry["extraction"] == "unwrapped_fragment" for entry in entries) == 2,
            "The accepted source has exactly two unwrapped TeX fragments")
    result = {
        "schema": "openlogic-te-direct-latex-assembly/1",
        "scope_units": 722,
        "source_revision": "9620cc73f9c8e0ad003c514a5d3748f29611c4c0",
        "assembled_filename": TEX_NAME,
        "assembled_bytes": len(payload),
        "assembled_sha256": sha(payload),
        "units": entries,
        "rendering_note": "Single-file source compendium; accepted PDF is reconstructed from the full semantic HTML, not this TeX document.",
    }
    return payload, result


def tracked_paths() -> list[str]:
    raw = subprocess.check_output(["git", "-C", str(ROOT), "ls-files", "-z"])
    paths = [name.decode("utf-8") for name in raw.split(b"\0") if name]
    require(paths and len(paths) == len(set(paths)), "Tracked source paths are absent or repeated")
    return sorted(paths)


def companion_zip(tex: bytes, manifest: bytes) -> dict:
    output = OUT / ZIP_NAME
    files = [(name, (ROOT / name).read_bytes()) for name in tracked_paths()]
    files.extend([(TEX_NAME, tex), (ASSEMBLY_NAME, manifest)])
    require("README-RECONSTRUCTION.md" in {name for name, _data in files},
            "Telugu reconstruction instructions are missing")
    require(any(name.startswith("upstream/sty/") for name, _data in files)
            and any(name.startswith("upstream/assets/") for name, _data in files)
            and any(name.startswith("fonts/") for name, _data in files),
            "Class, macro, figure or font dependencies are missing")
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files):
            normalized = PurePosixPath(name)
            require(not normalized.is_absolute() and ".." not in normalized.parts,
                    f"Unsafe companion path: {name}")
            info = zipfile.ZipInfo(normalized.as_posix(), date_time=ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(output) as archive:
        require(archive.testzip() is None and len(archive.namelist()) == len(files),
                "Companion ZIP failed integrity or count checks")
        require(sha(archive.read(TEX_NAME)) == sha(tex)
                and sha(archive.read(ASSEMBLY_NAME)) == sha(manifest),
                "Companion ZIP changed the assembled source")
    return {"filename": ZIP_NAME, "bytes": output.stat().st_size,
            "sha256": sha(output.read_bytes()), "entries": len(files)}


def main() -> None:
    require(not subprocess.check_output(["git", "-C", str(ROOT), "status", "--porcelain"]).strip(),
            "Commit the bounded source and instructions before creating the companion archive")
    OUT.mkdir(parents=True, exist_ok=True)
    tex, result = assemble()
    manifest = (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    tex_path = OUT / TEX_NAME
    manifest_path = OUT / ASSEMBLY_NAME
    for path, data in ((tex_path, tex), (manifest_path, manifest)):
        if path.exists():
            require(path.read_bytes() == data, f"Refusing to overwrite changed asset: {path.name}")
        else:
            path.write_bytes(data)
    archive = companion_zip(tex, manifest)
    print(json.dumps({"direct_tex": {"filename": TEX_NAME, "bytes": len(tex), "sha256": sha(tex)},
                      "assembly_manifest": {"filename": ASSEMBLY_NAME, "bytes": len(manifest),
                                            "sha256": sha(manifest)},
                      "companion_zip": archive}, ensure_ascii=False))


if __name__ == "__main__":
    main()

"""Compile the frozen SFR TikZ diagrams to deterministic, local SVG assets.

This is a maintainer step, not part of ordinary HTML/EPUB reading. It obtains
the shared Interlanguage TeX slot before invoking pdfLaTeX or dvisvgm.
"""

from __future__ import annotations

import ctypes
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = ROOT / "upstream"
BUILD = ROOT / "build" / "reader-diagrams"
OUTPUT = ROOT / "editions" / "reader-assets" / "diagrams"
MANIFEST = OUTPUT / "manifest.json"
MUTEX_NAME = "Global\\InterlanguageTeXSlotV1"
WAIT_TIMEOUT_MS = 30_000

EXTERNAL = (
    "assets/diagrams/function.tikz",
    "assets/diagrams/surjective.tikz",
    "assets/diagrams/injective.tikz",
    "assets/diagrams/bijective.tikz",
    "assets/diagrams/composition.tikz",
)
INLINE_UNITS = (
    "content/sets-functions-relations/relations/graphs.tex",
    "content/sets-functions-relations/relations/trees.tex",
)
TIKZ_RE = re.compile(r"\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def wrapper(snippet: str) -> str:
    return r"""\documentclass[tikz,border=3pt]{standalone}
\usepackage{amsmath,amssymb}
\usetikzlibrary{arrows,automata,intersections,positioning}
\definecolor{oldiagcolorA}{rgb}{0.15,0.15,0.15}
\definecolor{oldiagcolorB}{rgb}{0.13,0.35,0.62}
\definecolor{oldiagcolorC}{rgb}{0.68,0.19,0.25}
\definecolor{oldiagcolorD}{HTML}{1973ba}
\definecolor{oldiagcolorE}{HTML}{4d6f39}
\begin{document}
""" + snippet + "\n\\end{document}\n"


def normalize_svg(path: Path) -> bytes:
    parser = etree.XMLParser(resolve_entities=False, no_network=True, remove_comments=True)
    root = etree.parse(str(path), parser=parser).getroot()
    for metadata in root.xpath("//*[local-name()='metadata']"):
        metadata.getparent().remove(metadata)
    root.set("data-generator", "dvisvgm-no-fonts")
    return etree.tostring(root, encoding="utf-8", xml_declaration=True, pretty_print=False)


def compile_svg(name: str, snippet: str) -> bytes:
    work = BUILD / name
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    source = work / "diagram.tex"
    source.write_text(wrapper(snippet), encoding="utf-8", newline="\n")
    latex = subprocess.run(
        ["pdflatex", "-interaction=batchmode", "-halt-on-error", "-no-shell-escape", "diagram.tex"],
        cwd=work,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    require(latex.returncode == 0, f"pdfLaTeX failed for {name}:\n{latex.stdout[-4000:]}")
    raw_svg = work / "diagram.raw.svg"
    convert = subprocess.run(
        ["dvisvgm", "--pdf", "--no-fonts", "--exact-bbox", "--bbox=min", "--output=" + str(raw_svg), "diagram.pdf"],
        cwd=work,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    require(convert.returncode == 0 and raw_svg.is_file(), f"dvisvgm failed for {name}:\n{convert.stdout[-4000:]}")
    return normalize_svg(raw_svg)


class TeXSlot:
    def __enter__(self) -> "TeXSlot":
        kernel = ctypes.windll.kernel32
        kernel.CreateMutexW.argtypes = [ctypes.c_void_p, ctypes.c_bool, ctypes.c_wchar_p]
        kernel.CreateMutexW.restype = ctypes.c_void_p
        self.handle = kernel.CreateMutexW(None, False, MUTEX_NAME)
        require(bool(self.handle), "could not create TeX slot mutex")
        result = kernel.WaitForSingleObject(self.handle, WAIT_TIMEOUT_MS)
        require(result in (0x00000000, 0x00000080), "TeX slot busy; no TeX process was launched")
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        kernel = ctypes.windll.kernel32
        kernel.ReleaseMutex(self.handle)
        kernel.CloseHandle(self.handle)


def inputs() -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for relative in EXTERNAL:
        payload = (UPSTREAM / relative).read_text(encoding="utf-8")
        require(payload.count("\\begin{tikzpicture}") == 1, f"unexpected external TikZ shape: {relative}")
        records.append(
            {
                "name": Path(relative).stem,
                "source_path": relative,
                "source_sha256": sha256(payload.encode("utf-8")),
                "snippet_index": 1,
                "snippet": payload,
            }
        )
    for relative in INLINE_UNITS:
        payload = (UPSTREAM / relative).read_text(encoding="utf-8")
        snippets = TIKZ_RE.findall(payload)
        require(bool(snippets), f"missing inline TikZ: {relative}")
        for index, snippet in enumerate(snippets, 1):
            digest = sha256(snippet.encode("utf-8"))
            records.append(
                {
                    "name": "inline-" + digest[:16],
                    "source_path": relative,
                    "source_sha256": sha256(payload.encode("utf-8")),
                    "snippet_index": index,
                    "snippet_sha256": digest,
                    "snippet": snippet,
                }
            )
    require(len(records) == 8, f"unexpected diagram count: {len(records)}")
    require(len({row["name"] for row in records}) == len(records), "duplicate diagram name")
    return records


def main() -> None:
    records = inputs()
    BUILD.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for stale_name in ("inline-67bc14ded3614a59.svg", "inline-adfd8b1868d5aea1.svg"):
        stale = OUTPUT / stale_name
        if stale.is_file():
            stale.unlink()
    with TeXSlot():
        for record in records:
            rendered = compile_svg(str(record["name"]), str(record.pop("snippet")))
            destination = OUTPUT / f"{record['name']}.svg"
            destination.write_bytes(rendered)
            record["svg_path"] = destination.relative_to(ROOT).as_posix()
            record["svg_bytes"] = len(rendered)
            record["svg_sha256"] = sha256(rendered)
    manifest = {
        "schema": "openlogic-te-reader-diagrams/1",
        "source_revision": "9620cc73f9c8e0ad003c514a5d3748f29611c4c0",
        "conversion": "Frozen TikZ compiled under the shared TeX lock, then converted by dvisvgm with text outlined as paths; localized semantic descriptions are supplied by the HTML/EPUB renderer.",
        "diagrams": records,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"status": "pass", "diagrams": len(records), "manifest": MANIFEST.relative_to(ROOT).as_posix()}, ensure_ascii=False))


if __name__ == "__main__":
    main()

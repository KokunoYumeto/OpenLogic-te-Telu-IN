"""Render exact targeted XHTML from the cumulative EPUB for visual QA."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

from lxml import etree


XHTML_NS = "http://www.w3.org/1999/xhtml"
NS = {"x": XHTML_NS}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(command: list[str], cwd: Path) -> str:
    result = subprocess.run(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode:
        raise RuntimeError(f"Command failed ({result.returncode}): {' '.join(command)}\n{result.stdout}")
    return result.stdout


def neutralized(source: Path, destination: Path) -> None:
    tree = etree.parse(str(source))
    for anchor in tree.xpath("//x:a", namespaces=NS):
        anchor.attrib.pop("href", None)
    tree.write(str(destination), encoding="utf-8", xml_declaration=True, doctype="<!DOCTYPE html>")


def bibliography_document(reader: Path, destination: Path) -> None:
    tree = etree.parse(str(reader))
    bibliography = tree.xpath("//*[@id='bibliography']")
    if len(bibliography) != 1:
        raise RuntimeError(f"Expected one bibliography, found {len(bibliography)}")
    root = etree.Element(f"{{{XHTML_NS}}}html", nsmap={None: XHTML_NS})
    root.set("lang", "en")
    root.append(copy.deepcopy(tree.getroot().find(f"{{{XHTML_NS}}}head")))
    body = etree.SubElement(root, f"{{{XHTML_NS}}}body")
    main = etree.SubElement(body, f"{{{XHTML_NS}}}main")
    main.append(copy.deepcopy(bibliography[0]))
    etree.ElementTree(root).write(
        str(destination), encoding="utf-8", xml_declaration=True, doctype="<!DOCTYPE html>"
    )


def citation_document(reader: Path, destination: Path) -> None:
    tree = etree.parse(str(reader))
    unit = tree.xpath("//*[@id='OLP-0140']")
    if len(unit) != 1:
        raise RuntimeError(f"Expected OLP-0140 once, found {len(unit)}")
    footnotes = unit[0].xpath(".//x:section[contains(concat(' ', normalize-space(@class), ' '), ' footnotes ')]", namespaces=NS)
    if len(footnotes) != 2:
        raise RuntimeError(f"Expected two OLP-0140 footnote sections, found {len(footnotes)}")
    root = etree.Element(f"{{{XHTML_NS}}}html", nsmap={None: XHTML_NS})
    root.set("lang", "te-Telu-IN")
    root.append(copy.deepcopy(tree.getroot().find(f"{{{XHTML_NS}}}head")))
    body = etree.SubElement(root, f"{{{XHTML_NS}}}body")
    main = etree.SubElement(body, f"{{{XHTML_NS}}}main")
    heading = etree.SubElement(main, f"{{{XHTML_NS}}}h1")
    heading.text = "OLP-0140 citation render"
    for footnote in footnotes:
        main.append(copy.deepcopy(footnote))
    etree.ElementTree(root).write(
        str(destination), encoding="utf-8", xml_declaration=True, doctype="<!DOCTYPE html>"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--ebook-convert", type=Path, required=True)
    parser.add_argument("--pdftoppm", type=Path, required=True)
    arguments = parser.parse_args()
    root = arguments.root.resolve()
    oebps = root / "output/epub-cumulative-279/unpacked/OEBPS"
    output = root / "tmp/v040-epub-targeted-render"
    if output.exists():
        shutil.rmtree(output)
    working = output / "xhtml"
    working.mkdir(parents=True)
    for relative in ("reader.css", "fonts", "assets"):
        source = oebps / relative
        destination = working / relative
        if source.is_dir():
            shutil.copytree(source, destination)
        else:
            shutil.copy2(source, destination)
    neutralized(oebps / "title.xhtml", working / "title.xhtml")
    neutralized(oebps / "about.xhtml", working / "about.xhtml")
    bibliography_document(oebps / "reader.xhtml", working / "bibliography.xhtml")
    citation_document(oebps / "reader.xhtml", working / "citation.xhtml")

    artifacts: dict[str, object] = {}
    for stem in ("title", "about", "bibliography", "citation"):
        source = working / f"{stem}.xhtml"
        pdf = output / f"{stem}.pdf"
        run(
            [
                str(arguments.ebook_convert.resolve()),
                str(source),
                str(pdf),
                "--paper-size",
                "a4",
                "--pdf-page-margin-left",
                "36",
                "--pdf-page-margin-right",
                "36",
                "--pdf-page-margin-top",
                "36",
                "--pdf-page-margin-bottom",
                "36",
            ],
            working,
        )
        raster_prefix = output / stem
        run([str(arguments.pdftoppm.resolve()), "-png", "-r", "150", str(pdf), str(raster_prefix)], output)
        pages = sorted(output.glob(f"{stem}-*.png"))
        artifacts[stem] = {
            "source_sha256": sha256(source),
            "pdf": {"path": str(pdf), "bytes": pdf.stat().st_size, "sha256": sha256(pdf)},
            "pages": [
                {"path": str(page), "bytes": page.stat().st_size, "sha256": sha256(page)} for page in pages
            ],
        }
    receipt = {
        "schema": "openlogic-te-targeted-epub-render/1",
        "renderer": "calibre ebook-convert 9.11.0",
        "rasterizer": "Poppler pdftoppm 26.07.0",
        "artifacts": artifacts,
    }
    receipt_path = output / "render-receipt.json"
    receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"receipt": str(receipt_path), "page_counts": {key: len(value["pages"]) for key, value in artifacts.items()}}))


if __name__ == "__main__":
    main()

"""Fail-closed structural and validator audit for the full 722-unit EPUB."""

from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import re
import subprocess
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EPUB = ROOT / "output" / "release" / "openlogic-te-Telu-IN-full-OLP0722.epub"
DEFAULT_COLD = ROOT / "output" / "release" / "openlogic-te-Telu-IN-full-OLP0722-cold.epub"
HTML_MANIFEST = ROOT / "output" / "html" / "full" / "render-manifest.json"
HTML_QA = ROOT / "evidence" / "FULL-HTML-QA.json"
REPORT = ROOT / "evidence" / "FULL-EPUB-QA.json"
XHTML = "http://www.w3.org/1999/xhtml"
MATHML = "http://www.w3.org/1998/Math/MathML"
OPF = "http://www.idpf.org/2007/opf"
EPUB = "http://www.idpf.org/2007/ops"
ZIP_TIMESTAMP = (2026, 9, 28, 0, 0, 0)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def epubcheck(epub: Path, jar: Path) -> dict[str, object]:
    require(jar.is_file(), f"EPUBCheck JAR absent: {jar}")
    result = subprocess.run(["java", "-jar", str(jar), str(epub)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    output = result.stdout + result.stderr
    require(result.returncode == 0, f"EPUBCheck failed:\n{output[-6000:]}")
    summary = re.search(r"Messages:\s*(\d+) fatals?\s*/\s*(\d+) errors?\s*/\s*(\d+) warnings?", output)
    require(summary is not None and summary.groups() == ("0", "0", "0"), f"EPUBCheck did not report a clean result:\n{output[-3000:]}")
    version_result = subprocess.run(["java", "-jar", str(jar), "--version"], capture_output=True, text=True, encoding="utf-8", errors="replace")
    version = re.search(r"EPUBCheck\s+v?([\d.]+)", version_result.stdout + version_result.stderr)
    require(version_result.returncode == 0 and version is not None, "EPUBCheck version could not be verified")
    return {"tool": "EPUBCheck " + version.group(1), "fatal": 0, "errors": 0, "warnings": 0}


def audit(epub: Path, cold: Path, jar: Path, *, probe: bool = False) -> dict[str, object]:
    payload = epub.read_bytes()
    cold_payload = cold.read_bytes() if not probe else payload
    if not probe:
        require(payload == cold_payload, "Cold build differs byte-for-byte")
    html_manifest = json.loads(HTML_MANIFEST.read_text(encoding="utf-8"))
    if not probe:
        html_qa = json.loads(HTML_QA.read_text(encoding="utf-8"))
        require(html_qa["status"] == "COMPLETE_PASS" and html_qa["units"] == 722, "HTML source not accepted")
    with zipfile.ZipFile(epub) as archive:
        require(archive.testzip() is None, "EPUB ZIP CRC failure")
        infos = archive.infolist()
        names = [info.filename for info in infos]
        require(names and names[0] == "mimetype", "EPUB mimetype must be first")
        require(len(names) == len(set(names)), "Duplicate ZIP path")
        require(infos[0].compress_type == zipfile.ZIP_STORED, "EPUB mimetype must not be compressed")
        require(all(info.date_time == ZIP_TIMESTAMP for info in infos), "Unstable ZIP timestamp")
        require(archive.read("mimetype") == b"application/epub+zip", "Wrong EPUB MIME type")
        require("OEBPS/package.opf" in names and "OEBPS/nav.xhtml" in names, "Package or navigation missing")
        opf = etree.fromstring(archive.read("OEBPS/package.opf"))
        package_items = opf.findall(f".//{{{OPF}}}manifest/{{{OPF}}}item")
        hrefs = {item.get("id"): item.get("href") for item in package_items}
        require(len(hrefs) == len(package_items), "Duplicate OPF item id")
        resources = {"OEBPS/" + href for href in hrefs.values()}
        require(set(names) == resources | {"mimetype", "META-INF/container.xml", "OEBPS/package.opf"}, "Unmanifested or missing ZIP resource")
        reader_ids = [name for name in hrefs if name.startswith("reader-")]
        require(80 <= len(reader_ids) <= 300, "Unexpected full EPUB reader partition count")
        spine = [item.get("idref") for item in opf.findall(f".//{{{OPF}}}spine/{{{OPF}}}itemref")]
        require(spine == ["title", "nav", *reader_ids, "bibliography", "about", "license"], "EPUB spine is not in reading order")
        language = opf.find(".//{http://purl.org/dc/elements/1.1/}language")
        require(language is not None and language.text == "te-Telu-IN", "Wrong package language")
        require("పూర్తి" in "".join(opf.find(".//{http://purl.org/dc/elements/1.1/}title").itertext()), "Package title does not identify full edition")
        meta = {node.get("property"): node.text for node in opf.findall(f".//{{{OPF}}}metadata/{{{OPF}}}meta")}
        require(meta.get("rendition:layout") == "reflowable", "EPUB not marked reflowable")
        anchor_files: dict[str, set[str]] = {}
        links: list[tuple[str, str]] = []
        unit_ids: list[str] = []
        math_count = 0
        english_details = 0
        image_count = 0
        maximum_reader_bytes = 0
        for name in names:
            if not name.endswith(".xhtml"):
                continue
            data = archive.read(name)
            root = etree.fromstring(data)
            require(root.tag == f"{{{XHTML}}}html", f"Invalid XHTML root: {name}")
            anchors = [node.get("id") for node in root.iter() if node.get("id")]
            require(len(anchors) == len(set(anchors)), f"Duplicate anchor within {name}")
            anchor_files[name] = set(anchors)
            for node in root.iter():
                if href := node.get("href"):
                    links.append((name, href))
                if node.tag == f"{{{XHTML}}}section" and "source-unit" in (node.get("class") or "").split():
                    unit_ids.append(node.get("id"))
                    require(node.get("data-translation-sha256"), f"Missing target identity: {node.get('id')}")
                if node.tag == f"{{{XHTML}}}details" and "english" in (node.get("class") or "").split():
                    english_details += 1
                if node.tag == f"{{{MATHML}}}math":
                    math_count += 1
                if node.tag == f"{{{XHTML}}}img":
                    image_count += 1
                    require(node.get("alt"), f"Unlabelled image in {name}")
            if not probe:
                require(b"diagram-pending" not in data and b"<merror" not in data and b"!!" not in data, f"Unresolved content marker in {name}")
            if name.startswith("OEBPS/text/reader-"):
                maximum_reader_bytes = max(maximum_reader_bytes, len(data))
            for token in root.iter():
                if token.tag in {f"{{{MATHML}}}{kind}" for kind in ("mi", "mo", "mn", "ms", "mtext")}:
                    require(not any(isinstance(child.tag, str) for child in token), f"Invalid MathML token child in {name}")
        require(len(unit_ids) == len(set(unit_ids)) == 722, "Wrong EPUB unit count")
        require(unit_ids == [row["unit_id"] for row in html_manifest["units"]], "EPUB unit reading order differs from accepted HTML")
        require(english_details == 722, "Missing canonical English disclosures")
        require(math_count == len(html_manifest["math"]) + len(html_manifest["english_math"]), "MathML expression count changed")
        require(maximum_reader_bytes < 500_000, "Reader XHTML section is too large")
        for current, href in links:
            parsed = urlsplit(href)
            if parsed.scheme in {"https", "http", "mailto"}:
                continue
            require(not parsed.scheme and not parsed.netloc, f"Unsupported EPUB link: {href}")
            target = posixpath.normpath(posixpath.join(posixpath.dirname(current), unquote(parsed.path))) if parsed.path else current
            require(target in names, f"Broken EPUB resource link from {current}: {href}")
            if parsed.fragment:
                require(unquote(parsed.fragment) in anchor_files.get(target, set()), f"Broken EPUB anchor from {current}: {href}")
        diagram_assets = [name for name in names if name.startswith("OEBPS/assets/diagrams/") and name.endswith(".svg")]
        expected_diagrams = {Path(record["svg_path"]).name for record in html_manifest["assets"] if record.get("svg_path")}
        require({Path(name).name for name in diagram_assets} == expected_diagrams, "Diagram asset coverage differs from accepted HTML")
        for name in diagram_assets:
            etree.fromstring(archive.read(name))
    validator = epubcheck(epub, jar)
    return {"schema": "openlogic-te-full-epub-qa/1", "status": "diagnostic_unaccepted" if probe else "COMPLETE_PASS", "filename": epub.name, "bytes": len(payload), "sha256": sha256(payload), "cold_replay_sha256": sha256(cold_payload) if not probe else None, "source_html_sha256": html_manifest["html_sha256"], "units": 722, "reader_documents": len(reader_ids), "maximum_reader_document_bytes": maximum_reader_bytes, "mathml_roots": math_count, "english_disclosures": english_details, "diagram_assets": len(diagram_assets), "image_instances": image_count, "links_checked": len(links), "zip_entries": len(names), "epubcheck": validator}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epub", type=Path, default=DEFAULT_EPUB)
    parser.add_argument("--cold-epub", type=Path, default=DEFAULT_COLD)
    parser.add_argument("--epubcheck-jar", type=Path, required=True)
    parser.add_argument("--probe", action="store_true")
    args = parser.parse_args()
    report = audit(args.epub.resolve(), args.cold_epub.resolve(), args.epubcheck_jar.resolve(), probe=args.probe)
    if not args.probe:
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

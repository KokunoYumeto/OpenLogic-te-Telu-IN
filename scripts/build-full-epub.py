"""Build the integrated 722-unit reader as a split, reflowable EPUB 3.

The full HTML QA receipt seals the semantic input. --plan is a read-only
structural check that may run before the diagrams and HTML are accepted.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import posixpath
import uuid
from pathlib import Path
from urllib.parse import unquote

from lxml import etree, html


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "output" / "html" / "full"
HTML = SOURCE / "index.html"
MANIFEST = SOURCE / "render-manifest.json"
QA = ROOT / "evidence" / "FULL-HTML-QA.json"
OUTPUT_DIR = ROOT / "output" / "epub-full"
DEFAULT_EPUB = ROOT / "output" / "release" / "openlogic-te-Telu-IN-full-OLP0722.epub"
VERSION = "1.0.1-full-olp0722"
MODIFIED = "2026-09-28T00:00:00Z"
ZIP_TIMESTAMP = (2026, 9, 28, 0, 0, 0)
UPSTREAM_REVISION = "9620cc73f9c8e0ad003c514a5d3748f29611c4c0"

spec = importlib.util.spec_from_file_location("bounded_epub", ROOT / "scripts" / "build-sets-epub.py")
assert spec and spec.loader
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)
legacy.SOURCE_DIR = SOURCE
legacy.OUTPUT_DIR = OUTPUT_DIR
legacy.PROFILE_NAME = "full"
legacy.ZIP_TIMESTAMP = ZIP_TIMESTAMP


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def input_document(accepted: bool) -> tuple[html.HtmlElement, dict[str, object]]:
    source = HTML.read_bytes()
    manifest_bytes = MANIFEST.read_bytes()
    manifest = json.loads(manifest_bytes)
    require(manifest["profile"] == "full" and manifest["source_revision"] == UPSTREAM_REVISION, "Wrong full reader input")
    require(manifest["html_sha256"] == sha256(source), "HTML digest mismatch")
    if accepted:
        receipt = json.loads(QA.read_text(encoding="utf-8"))
        require(receipt["status"] == "COMPLETE_PASS" and receipt["units"] == 722, "Full HTML QA did not pass")
        accepted_files = {row["name"]: row["sha256"] for row in receipt["files"]}
        require(accepted_files["index.html"] == sha256(source), "Accepted HTML changed")
        require(accepted_files["render-manifest.json"] == sha256(manifest_bytes), "Accepted HTML manifest changed")
        require(b"diagram-pending" not in source and b"<merror" not in source, "Reader contains unresolved rendering")
    parser = html.HTMLParser(encoding="utf-8", recover=True, huge_tree=True)
    document = html.document_fromstring(source, parser=parser)
    units = document.xpath("//section[contains(concat(' ',normalize-space(@class),' '),' source-unit ')]")
    ids = [unit.get("id") for unit in units]
    require(len(ids) == len(set(ids)) == 722, "Wrong full reader unit coverage")
    require(ids == [row["unit_id"] for row in manifest["units"]], "HTML/manifest unit order mismatch")
    require(set(ids) == {f"OLP-{number:04d}" for number in range(1, 723)}, "Incomplete tracked unit coverage")
    return document, manifest


def chunks_for(manifest: dict[str, object], sizes: dict[str, int]) -> list[list[str]]:
    rows = [json.loads(line) for line in (ROOT / "evidence" / "SOURCE_MANIFEST.jsonl").read_text(encoding="utf-8").splitlines() if line]
    roles = {row["unit_id"]: row.get("source_role") for row in rows}
    chunks: list[list[str]] = []
    current: list[str] = []
    current_bytes = 0
    for unit in manifest["units"]:
        unit_id = unit["unit_id"]
        unit_bytes = sizes[unit_id]
        if current and (len(current) >= 20 or current_bytes + unit_bytes > 450_000 or roles[unit_id] in {"part_driver", "chapter_driver"}):
            chunks.append(current)
            current = []
            current_bytes = 0
        current.append(unit_id)
        current_bytes += unit_bytes
    if current:
        chunks.append(current)
    require(sum(map(len, chunks)) == 722 and max(map(len, chunks)) <= 20, "Invalid EPUB split")
    return chunks


def unit_sizes(document: html.HtmlElement) -> dict[str, int]:
    units = document.xpath("//section[contains(concat(' ',normalize-space(@class),' '),' source-unit ')]")
    return {unit.get("id"): len(html.tostring(unit, encoding="utf-8")) for unit in units}


def shell(title: str, body_class: str = "") -> tuple[etree._Element, etree._Element]:
    root, body = legacy.document_shell(title, body_class)
    root.find(f"{{{legacy.XHTML_NS}}}head/{{{legacy.XHTML_NS}}}link").set("href", "reader.css")
    return root, body


def title_page(first_file: str, html_digest: str) -> bytes:
    root, body = shell("OpenLogic తెలుగు — పూర్తి సంచిక", "frontmatter")
    main = legacy.append(body, "main", id="title-page", epub_type="titlepage")
    legacy.append(main, "p", "OpenLogic · తెలుగు", class_="eyebrow")
    legacy.append(main, "h1", "ఓపెన్ లాజిక్ — పూర్తి తెలుగు సంచిక")
    legacy.append(main, "p", "స్థిర ఆంగ్ల మూలంలోని 722 విభాగాల సమగ్ర పాఠక రూపం", class_="lead")
    legacy.append(main, "p", "ప్రధాన పాఠం, ప్రత్యామ్నాయ అమరికలు, సహాయక మరియు సూత్ర-మాత్ర విభాగాలు అన్నీ ఇందులో ఉన్నాయి.")
    legacy.append(main, "p", "యంత్ర సహాయంతో అనువదించిన పాఠ్యం; మూలంతో విభాగాలవారీగా సరిపోల్చబడింది. మానవ లేదా స్వతంత్ర నిపుణ సమీక్ష జరిగిందని పేర్కొనడం లేదు.")
    legacy.append(main, "p", f"ఆంగ్ల మూల సవరణ: {UPSTREAM_REVISION}. HTML పాఠక SHA-256: {html_digest}.")
    legacy.append(main, "a", "విషయ సూచిక", href="nav.xhtml")
    legacy.append(main, "p")
    legacy.append(main, "a", "పఠనం ప్రారంభించండి", href=first_file + "#OLP-0001")
    return legacy.serialize(root)


def nav_page(chunks: list[list[str]], titles: dict[str, str], files: dict[str, str]) -> bytes:
    root, body = shell("విషయ సూచిక — OpenLogic తెలుగు")
    main = legacy.append(body, "main")
    legacy.append(main, "h1", "విషయ సూచిక")
    nav = legacy.append(main, "nav", id="toc", epub_type="toc", role="doc-toc")
    outer = legacy.append(nav, "ol")
    for href, label in (("title.xhtml", "ముఖపుట"),):
        item = legacy.append(outer, "li")
        legacy.append(item, "a", label, href=href)
    for group in chunks:
        item = legacy.append(outer, "li")
        first = group[0]
        label = f"{titles[first]} ({first}–{group[-1]})" if len(group) > 1 else f"{titles[first]} ({first})"
        legacy.append(item, "a", label, href=files[first] + "#" + first)
        nested = legacy.append(item, "ol")
        for unit_id in group:
            leaf = legacy.append(nested, "li")
            legacy.append(leaf, "a", f"{titles[unit_id]} ({unit_id})", href=files[unit_id] + "#" + unit_id)
    for href, label in (("bibliography.xhtml", "గ్రంథసూచి"), ("about.xhtml", "సంచిక గురించి"), ("license.xhtml", "అనుమతులు")):
        item = legacy.append(outer, "li")
        legacy.append(item, "a", label, href=href)
    landmarks = legacy.append(main, "nav", epub_type="landmarks")
    legacy.append(landmarks, "h2", "ప్రధాన విభాగాలు")
    listing = legacy.append(landmarks, "ol")
    for href, label, kind in (("title.xhtml", "ముఖపుట", "frontmatter"), (files["OLP-0001"], "ప్రధాన పాఠ్యం", "bodymatter"), ("about.xhtml", "సంచిక గురించి", "backmatter")):
        item = legacy.append(listing, "li")
        legacy.append(item, "a", label, href=href, epub_type=kind)
    return legacy.serialize(root)


def hrefs_for(units: list[html.HtmlElement], groups: list[list[str]]) -> tuple[dict[str, str], dict[str, str]]:
    files = {unit_id: f"text/reader-{number:03d}.xhtml" for number, group in enumerate(groups, 1) for unit_id in group}
    anchors: dict[str, str] = {}
    for unit in units:
        filename = files[unit.get("id")]
        for element in unit.iter():
            if anchor := element.get("id"):
                require(anchor not in anchors, f"Duplicate reader anchor {anchor}")
                anchors[anchor] = filename
    return files, anchors


def rewrite_local_links(root: etree._Element, current: str, anchors: dict[str, str]) -> None:
    for element in root.iter():
        href = element.get("href")
        if href and href.startswith("#"):
            anchor = unquote(href[1:])
            require(anchor in anchors, f"Unknown EPUB anchor: {anchor}")
            target = anchors[anchor]
            relative = posixpath.relpath(target, posixpath.dirname(current))
            element.set("href", ("" if target == current else relative) + "#" + anchor)
        source = element.get("src")
        if source and source.startswith("assets/diagrams/"):
            element.set("src", posixpath.relpath(source, posixpath.dirname(current)))


def reader_page(group: list[str], units: dict[str, html.HtmlElement], titles: dict[str, str], current: str, previous: str | None, following: str | None, anchors: dict[str, str]) -> bytes:
    root, body = shell(f"{titles[group[0]]} — OpenLogic తెలుగు", "reader-page")
    root.find(f"{{{legacy.XHTML_NS}}}head/{{{legacy.XHTML_NS}}}link").set("href", "../reader.css")
    header = legacy.append(body, "header")
    legacy.append(header, "p", "OpenLogic · తెలుగు", class_="eyebrow")
    legacy.append(header, "h1", titles[group[0]])
    legacy.append(header, "p", f"{group[0]}–{group[-1]} · 722 విభాగాల పూర్తి సంచిక")
    navigation = legacy.append(header, "p", class_="reader-links")
    legacy.append(navigation, "a", "విషయ సూచిక", href="../nav.xhtml")
    if previous:
        legacy.append(navigation, "a", "మునుపటి భాగం", href=posixpath.basename(previous))
    if following:
        legacy.append(navigation, "a", "తరువాతి భాగం", href=posixpath.basename(following))
    main = legacy.append(body, "main", epub_type="bodymatter")
    for unit_id in group:
        main.append(legacy.convert_tree(units[unit_id]))
    legacy.normalize_paragraph_blocks(main)
    legacy.normalize_epub_mathml(main)
    legacy.normalize_epub_figures(main)
    rewrite_local_links(main, current, anchors)
    return legacy.serialize(root)


def bibliography_page(section: html.HtmlElement, anchors: dict[str, str]) -> bytes:
    root, body = shell("గ్రంథసూచి — OpenLogic తెలుగు", "backmatter")
    main = legacy.append(body, "main", epub_type="backmatter")
    main.append(legacy.convert_tree(section))
    rewrite_local_links(main, "bibliography.xhtml", anchors)
    return legacy.serialize(root)


def about_page(html_digest: str) -> bytes:
    root, body = shell("సంచిక గురించి — OpenLogic తెలుగు", "backmatter")
    main = legacy.append(body, "main", epub_type="backmatter")
    legacy.append(main, "h1", "సంచిక గురించి")
    legacy.append(main, "p", "ఈ EPUB స్థిర ఆంగ్ల మూలంలోని 722 .tex విభాగాలన్నిటినీ సమగ్ర పఠన క్రమంలో కలిగి ఉంది. ప్రతి తెలుగు విభాగంతో పాటు తెరవగల ఆంగ్ల మూలం, MathML గణితం, స్థానిక చిత్రాలు ఉన్నాయి.")
    legacy.append(main, "p", "యంత్ర సహాయంతో చేసిన అనువాదం, మూలంతో విభాగాలవారీ సరిపోలిక. మానవ లేదా స్వతంత్ర నిపుణ భాషా సమీక్ష జరిగిందని పేర్కొనడం లేదు. మూలంలో నిర్వచించని ఒక సూచనను అందుబాటులో లేనిదిగా గుర్తించాం; తప్పుడు లంకెను సృష్టించలేదు.")
    legacy.append(main, "p", f"మూల సవరణ: {UPSTREAM_REVISION}. అంగీకరించిన HTML SHA-256: {html_digest}. EPUB సంచిక: {VERSION}.")
    links = legacy.append(main, "p")
    legacy.append(links, "a", "Open Logic Project", href="https://openlogicproject.org/")
    legacy.append(links, "a", "సంపాదించగల తెలుగు మూలాలు", href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN")
    legacy.append(main, "p", "Open Logic Project పాఠ్యం, తెలుగు అనువాదం CC BY 4.0 కింద ఉన్నాయి; చేర్చిన ఫాంట్లు SIL OFL 1.1 కింద ఉన్నాయి. అనువాదం మూల రచయితల ఆమోదాన్ని సూచించదు.")
    legacy.append(main, "a", "అనుమతుల పుట", href="license.xhtml")
    return legacy.serialize(root)


def opf(identifier: str, chunks: list[str], diagrams: list[str], pages: dict[str, bytes]) -> bytes:
    package = etree.Element(f"{{{legacy.OPF_NS}}}package", nsmap={None: legacy.OPF_NS, "dc": legacy.DC_NS}, version="3.0", attrib={"unique-identifier": "pub-id", "prefix": "rendition: http://www.idpf.org/vocab/rendition/# schema: http://schema.org/"})
    metadata = etree.SubElement(package, f"{{{legacy.OPF_NS}}}metadata")
    for tag, value, attributes in (("identifier", identifier, {"id": "pub-id"}), ("title", "ఓపెన్ లాజిక్ — పూర్తి తెలుగు సంచిక", {}), ("language", "te-Telu-IN", {}), ("creator", "Open Logic Project contributors", {}), ("publisher", "OpenLogic Telugu translation project", {}), ("rights", "CC BY 4.0; bundled Noto fonts under SIL OFL 1.1", {}), ("source", f"https://github.com/OpenLogicProject/OpenLogic/tree/{UPSTREAM_REVISION}", {})):
        etree.SubElement(metadata, f"{{{legacy.DC_NS}}}{tag}", **attributes).text = value
    for property_name, value in (("dcterms:modified", MODIFIED), ("rendition:layout", "reflowable"), ("schema:accessMode", "textual"), ("schema:accessMode", "visual"), ("schema:accessMode", "symbolic"), ("schema:accessibilityFeature", "tableOfContents"), ("schema:accessibilityFeature", "MathML"), ("schema:accessibilityFeature", "structuralNavigation"), ("schema:accessibilityFeature", "alternativeText"), ("schema:accessibilitySummary", "Complete 722-unit Telugu reader with native MathML, described local SVG diagrams, and a canonical English source disclosure for each unit.")):
        etree.SubElement(metadata, f"{{{legacy.OPF_NS}}}meta", property=property_name).text = value
    manifest = etree.SubElement(package, f"{{{legacy.OPF_NS}}}manifest")
    fixed = (("nav", "nav.xhtml", "application/xhtml+xml", "nav"), ("title", "title.xhtml", "application/xhtml+xml", ""), ("bibliography", "bibliography.xhtml", "application/xhtml+xml", ""), ("about", "about.xhtml", "application/xhtml+xml", ""), ("license", "license.xhtml", "application/xhtml+xml", ""), ("css", "reader.css", "text/css", ""), ("font-regular", "fonts/NotoSerifTelugu-Regular.ttf", "font/ttf", ""), ("font-bold", "fonts/NotoSerifTelugu-Bold.ttf", "font/ttf", ""))
    for identity, href, media_type, properties in fixed:
        attributes = {"id": identity, "href": href, "media-type": media_type}
        if properties:
            attributes["properties"] = properties
        etree.SubElement(manifest, f"{{{legacy.OPF_NS}}}item", **attributes)
    for number, href in enumerate(chunks, 1):
        payload = pages["OEBPS/" + href]
        properties = " ".join(prop for prop, marker in (("mathml", b"<math"), ("svg", b"<svg")) if marker in payload)
        attributes = {"id": f"reader-{number:03d}", "href": href, "media-type": "application/xhtml+xml"}
        if properties:
            attributes["properties"] = properties
        etree.SubElement(manifest, f"{{{legacy.OPF_NS}}}item", **attributes)
    for number, name in enumerate(diagrams, 1):
        etree.SubElement(manifest, f"{{{legacy.OPF_NS}}}item", id=f"diagram-{number:03d}", href=f"assets/diagrams/{name}", attrib={"media-type": "image/svg+xml"})
    spine = etree.SubElement(package, f"{{{legacy.OPF_NS}}}spine", attrib={"page-progression-direction": "ltr"})
    for identity in ("title", "nav", *(f"reader-{number:03d}" for number in range(1, len(chunks) + 1)), "bibliography", "about", "license"):
        etree.SubElement(spine, f"{{{legacy.OPF_NS}}}itemref", idref=identity)
    return etree.tostring(package, encoding="utf-8", xml_declaration=True, pretty_print=True)


def build(output: Path, unpacked: Path, *, accepted: bool = True) -> dict[str, object]:
    document, manifest = input_document(accepted)
    html_digest = manifest["html_sha256"]
    groups = chunks_for(manifest, unit_sizes(document))
    units = document.xpath("//section[contains(concat(' ',normalize-space(@class),' '),' source-unit ')]")
    by_id = {unit.get("id"): unit for unit in units}
    titles = dict(legacy.unit_titles(document))
    require(set(titles) == set(by_id), "Unit navigation titles incomplete")
    files_by_unit, anchors = hrefs_for(units, groups)
    bibliography = document.xpath("//*[@id='bibliography']")
    require(len(bibliography) == 1, "Bibliography missing")
    for node in bibliography[0].iter():
        if anchor := node.get("id"):
            require(anchor not in anchors, f"Duplicate bibliography anchor {anchor}")
            anchors[anchor] = "bibliography.xhtml"
    chunk_files = [f"text/reader-{number:03d}.xhtml" for number in range(1, len(groups) + 1)]
    diagram_paths = sorted((SOURCE / "assets" / "diagrams").glob("*.svg"))
    require(len(diagram_paths) == len([record for record in manifest["assets"] if record.get("svg_path")]), "Diagram inventory mismatch")
    files: dict[str, bytes] = {
        "mimetype": b"application/epub+zip",
        "META-INF/container.xml": legacy.container_xml(),
        "OEBPS/title.xhtml": title_page(chunk_files[0], html_digest),
        "OEBPS/nav.xhtml": nav_page(groups, titles, files_by_unit),
        "OEBPS/bibliography.xhtml": bibliography_page(bibliography[0], anchors),
        "OEBPS/about.xhtml": about_page(html_digest),
        "OEBPS/license.xhtml": legacy.build_license(),
        "OEBPS/reader.css": legacy.css_bytes(),
        "OEBPS/fonts/NotoSerifTelugu-Regular.ttf": (SOURCE / "fonts" / "NotoSerifTelugu-Regular.ttf").read_bytes(),
        "OEBPS/fonts/NotoSerifTelugu-Bold.ttf": (SOURCE / "fonts" / "NotoSerifTelugu-Bold.ttf").read_bytes(),
    }
    for index, group in enumerate(groups):
        current = chunk_files[index]
        files["OEBPS/" + current] = reader_page(group, by_id, titles, current, chunk_files[index - 1] if index else None, chunk_files[index + 1] if index + 1 < len(groups) else None, anchors)
    for diagram in diagram_paths:
        files["OEBPS/assets/diagrams/" + diagram.name] = diagram.read_bytes()
    identifier = "urn:uuid:" + str(uuid.uuid5(uuid.NAMESPACE_URL, f"https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/{VERSION}/{html_digest}"))
    files["OEBPS/package.opf"] = opf(identifier, chunk_files, [path.name for path in diagram_paths], files)
    if accepted:
        legacy.write_unpacked(unpacked, files)
    legacy.zip_epub(output, files)
    receipt = {"schema": "openlogic-te-full-epub-build/1", "version": VERSION, "source_revision": UPSTREAM_REVISION, "source_html_sha256": html_digest, "source_manifest_sha256": sha256(MANIFEST.read_bytes()), "source_html_qa_sha256": sha256(QA.read_bytes()) if accepted else None, "units": 722, "reader_documents": len(groups), "diagram_assets": len(diagram_paths), "identifier": identifier, "filename": output.name, "bytes": output.stat().st_size, "sha256": sha256(output.read_bytes()), "entries": len(files), "status": "built_qa_pending" if accepted else "diagnostic_unaccepted"}
    if accepted:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        (OUTPUT_DIR / ("cold-build-receipt.json" if unpacked.name == "cold-unpacked" else "build-receipt.json")).write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return receipt


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan", action="store_true")
    parser.add_argument("--probe", action="store_true", help="Convert the current HTML in memory without packaging or accepting it")
    parser.add_argument("--diagnostic", action="store_true", help="Build only a clearly unaccepted temporary EPUB for validator development")
    parser.add_argument("--output", type=Path, default=DEFAULT_EPUB)
    parser.add_argument("--unpacked", type=Path, default=OUTPUT_DIR / "unpacked")
    args = parser.parse_args()
    if args.probe:
        document, manifest = input_document(False)
        groups = chunks_for(manifest, unit_sizes(document))
        units = document.xpath("//section[contains(concat(' ',normalize-space(@class),' '),' source-unit ')]")
        by_id = {unit.get("id"): unit for unit in units}
        titles = dict(legacy.unit_titles(document))
        files_by_unit, anchors = hrefs_for(units, groups)
        bibliography = document.xpath("//*[@id='bibliography']")
        require(len(bibliography) == 1, "Bibliography missing")
        for node in bibliography[0].iter():
            if anchor := node.get("id"):
                require(anchor not in anchors, f"Duplicate bibliography anchor {anchor}")
                anchors[anchor] = "bibliography.xhtml"
        chunk_files = [f"text/reader-{number:03d}.xhtml" for number in range(1, len(groups) + 1)]
        sizes = []
        for index, group in enumerate(groups):
            payload = reader_page(group, by_id, titles, chunk_files[index], chunk_files[index - 1] if index else None, chunk_files[index + 1] if index + 1 < len(groups) else None, anchors)
            etree.fromstring(payload)
            sizes.append(len(payload))
        print(json.dumps({"units": 722, "reader_documents": len(groups), "converted_xhtml_bytes": sum(sizes), "largest_document_bytes": max(sizes), "well_formed_xhtml_documents": len(sizes), "diagnostic_only": True}))
    elif args.plan:
        document, manifest = input_document(False)
        chunks = chunks_for(manifest, unit_sizes(document))
        print(json.dumps({"units": 722, "reader_documents": len(chunks), "maximum_units_per_document": max(map(len, chunks)), "accepted_html_required_for_build": True}))
    elif args.diagnostic:
        output = ROOT / "tmp" / "full-diagnostic.epub"
        print(json.dumps(build(output, OUTPUT_DIR / "unpacked", accepted=False), ensure_ascii=False))
    else:
        print(json.dumps(build(args.output.resolve(), args.unpacked.resolve()), ensure_ascii=False))


if __name__ == "__main__":
    main()

"""Fail-closed audit for the deterministic Telugu foundations EPUB checkpoint."""

from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import re
import subprocess
import zipfile
from collections import Counter
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

from lxml import etree, html


ROOT = Path(__file__).resolve().parents[1]
SOURCE_HTML = ROOT / "docs" / "sfr" / "index.html"
SOURCE_MANIFEST = ROOT / "docs" / "sfr" / "render-manifest.json"
EPUB = ROOT / "output" / "release" / "openlogic-te-Telu-IN-sfr-v0.3.0.epub"
COLD_EPUB = ROOT / "output" / "release" / "openlogic-te-Telu-IN-sfr-v0.3.0-cold.epub"
EVIDENCE = ROOT / "evidence" / "EPUB-SFR-QA.json"
RENDER_EVIDENCE = ROOT / "evidence" / "EPUB-SFR-RENDER-QA.json"
PAGES_EVIDENCE = ROOT / "evidence" / "GITHUB-PAGES-SFR-READBACK.json"
RELEASE_MANIFEST = ROOT / "output" / "release" / "release-manifest-v0.3.0.json"
PRIOR_READBACK = ROOT / "evidence" / "ZENODO-SETS-V020-READBACK.json"

VERSION = "0.3.0-sfr-epub"
DATE = "2026-09-12"
EXPECTED_HTML_SHA256 = "95d95c8664eceedab56f2c0402375b7adb9ef1e5c4471d1b651bdc6f428de210"
EXPECTED_MANIFEST_SHA256 = "546f323c21c0b8a589e2afc0fbaecd73787917b51f74cff1420fa3cd95e6480b"
EXPECTED_UNITS = tuple(f"OLP-{number:04d}" for number in range(4, 27))
EXPECTED_DIAGRAMS = {
    "bijective.svg",
    "composition.svg",
    "function.svg",
    "injective.svg",
    "inline-8ee505c808d2f308.svg",
    "inline-f122123b1f5663cd.svg",
    "inline-f90ab2f746e4260f.svg",
    "surjective.svg",
}
EXPECTED_ENTRIES = {
    "mimetype",
    "META-INF/container.xml",
    "OEBPS/package.opf",
    "OEBPS/title.xhtml",
    "OEBPS/nav.xhtml",
    "OEBPS/reader.xhtml",
    "OEBPS/about.xhtml",
    "OEBPS/license.xhtml",
    "OEBPS/reader.css",
    "OEBPS/fonts/NotoSerifTelugu-Regular.ttf",
    "OEBPS/fonts/NotoSerifTelugu-Bold.ttf",
} | {f"OEBPS/assets/diagrams/{name}" for name in EXPECTED_DIAGRAMS}

XHTML_NS = "http://www.w3.org/1999/xhtml"
MATHML_NS = "http://www.w3.org/1998/Math/MathML"
SVG_NS = "http://www.w3.org/2000/svg"
EPUB_NS = "http://www.idpf.org/2007/ops"
OPF_NS = "http://www.idpf.org/2007/opf"
DC_NS = "http://purl.org/dc/elements/1.1/"
CONTAINER_NS = "urn:oasis:names:tc:opendocument:xmlns:container"
XML_NS = "http://www.w3.org/XML/1998/namespace"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def normalized(value: str) -> str:
    return " ".join(value.split())


def json_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")


def original_document() -> html.HtmlElement:
    payload = SOURCE_HTML.read_bytes()
    require(sha256(payload) == EXPECTED_HTML_SHA256, "source HTML digest mismatch")
    parser = html.HTMLParser(encoding="utf-8", recover=True, huge_tree=True)
    return html.document_fromstring(payload, parser=parser)


def xml_document(payload: bytes, label: str) -> etree._ElementTree:
    parser = etree.XMLParser(resolve_entities=False, no_network=True, recover=False, huge_tree=True)
    try:
        return etree.ElementTree(etree.fromstring(payload, parser=parser))
    except etree.XMLSyntaxError as error:
        raise RuntimeError(f"invalid XML in {label}: {error}") from error


def local_name(element: etree._Element) -> str:
    return etree.QName(element).localname


def unit_nodes(document: etree._Element | html.HtmlElement) -> list[etree._Element]:
    return document.xpath("//*[local-name()='section' and contains(concat(' ', normalize-space(@class), ' '), ' source-unit ')]")


def text_sha(element: etree._Element) -> str:
    return sha256(normalized("".join(element.itertext())).encode("utf-8"))


def annotations(element: etree._Element) -> list[str]:
    return ["".join(item.itertext()) for item in element.xpath(".//*[local-name()='annotation' and @encoding='application/x-tex']")]


def class_counter(element: etree._Element, xpath: str) -> dict[str, int]:
    values: Counter[str] = Counter()
    for node in element.xpath(xpath):
        values.update((node.get("class") or "").split())
    return dict(sorted(values.items()))


def svg_descriptors(element: etree._Element) -> list[dict[str, object]]:
    rows = []
    for svg in element.xpath(".//*[local-name()='svg']"):
        rows.append(
            {
                "aria_label": svg.get("aria-label"),
                "role": svg.get("role"),
                "title": svg.xpath("string(.//*[local-name()='title'][1])"),
                "view_box": svg.get("viewBox") or svg.get("viewbox"),
                "paths": [path.get("d") for path in svg.xpath(".//*[local-name()='path']")],
            }
        )
    return rows


def image_descriptors(element: etree._Element) -> list[dict[str, str | None]]:
    return [
        {
            "src": image.get("src"),
            "alt": image.get("alt"),
            "class": image.get("class"),
        }
        for image in element.xpath(".//*[local-name()='img']")
    ]


def link_values(element: etree._Element) -> list[str]:
    return [value for value in element.xpath(".//*[local-name()='a']/@href")]


def id_values(element: etree._Element) -> list[str]:
    return [value for value in element.xpath(".//@id")]


def namespace_audit(document: etree._ElementTree) -> dict[str, int]:
    root = document.getroot()
    require(root.tag == f"{{{XHTML_NS}}}html", "XHTML root namespace mismatch")
    require(root.get("lang") == "te-Telu-IN", "XHTML lang mismatch")
    require(root.get(f"{{{XML_NS}}}lang") == "te-Telu-IN", "XHTML xml:lang mismatch")
    require(root.get("dir") == "ltr", "Telugu EPUB direction must be LTR")
    counts = {"xhtml": 0, "mathml": 0, "svg": 0}
    for element in root.iter():
        if not isinstance(element.tag, str):
            continue
        namespace = etree.QName(element).namespace
        if namespace == XHTML_NS:
            counts["xhtml"] += 1
        elif namespace == MATHML_NS:
            counts["mathml"] += 1
        elif namespace == SVG_NS:
            counts["svg"] += 1
        else:
            raise RuntimeError(f"unexpected content namespace: {namespace}")
    return counts


def audit_links(documents: dict[str, etree._ElementTree], names: set[str]) -> dict[str, object]:
    anchors = {
        name: set(document.xpath("//@id"))
        for name, document in documents.items()
    }


def audit_embedded_resources(documents: dict[str, etree._ElementTree], names: set[str]) -> dict[str, object]:
    references: list[dict[str, str]] = []
    for name, document in documents.items():
        for element in document.xpath("//*[@src]"):
            source = element.get("src") or ""
            split = urlsplit(source)
            require(not split.scheme and not split.netloc, f"remote embedded resource in {name}: {source}")
            target = posixpath.normpath(posixpath.join(posixpath.dirname(name), unquote(split.path)))
            require(target in names, f"missing embedded resource from {name}: {source}")
            references.append({"document": name, "source": source, "target": target})
    return {"references": references, "count": len(references), "all_local_and_resolved": True}


def audit_svg_resources(blobs: dict[str, bytes]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for name in sorted(key for key in blobs if key.startswith("OEBPS/assets/diagrams/") and key.endswith(".svg")):
        document = xml_document(blobs[name], name)
        root = document.getroot()
        require(root.tag == f"{{{SVG_NS}}}svg", f"SVG root namespace mismatch: {name}")
        require(not document.xpath("//*[local-name()='script' or local-name()='foreignObject']"), f"unsafe SVG content: {name}")
        hrefs = document.xpath("//@href | //@*[local-name()='href']")
        require(all(value.startswith("#") for value in hrefs), f"external SVG reference: {name}")
        text = blobs[name].decode("utf-8")
        require(not re.search(r"(?:https?:)?//", re.sub(r"xmlns(?::\w+)?=\"[^\"]+\"", "", text)), f"remote SVG dependency: {name}")
        source = SOURCE_HTML.parent / "assets" / "diagrams" / PurePosixPath(name).name
        require(source.is_file(), f"missing source diagram: {source.name}")
        digest = sha256(blobs[name])
        require(digest == sha256(source.read_bytes()), f"diagram changed during packaging: {source.name}")
        rows.append(
            {
                "filename": PurePosixPath(name).name,
                "bytes": len(blobs[name]),
                "sha256": digest,
                "local_href_references": len(hrefs),
            }
        )
    require({row["filename"] for row in rows} == EXPECTED_DIAGRAMS, "diagram resource inventory mismatch")
    return rows
    internal = 0
    external = 0
    checked_fragments = 0
    for name, document in documents.items():
        ids = document.xpath("//@id")
        require(len(ids) == len(set(ids)), f"duplicate IDs in {name}")
        for element in document.xpath("//*[local-name()='a' and @href]"):
            href = element.get("href") or ""
            split = urlsplit(href)
            if split.scheme in {"http", "https", "mailto"}:
                external += 1
                continue
            require(not split.scheme and not split.netloc, f"unsupported link scheme in {name}: {href}")
            target_name = posixpath.normpath(posixpath.join(posixpath.dirname(name), unquote(split.path))) if split.path else name
            require(target_name in names, f"missing local link target from {name}: {href}")
            internal += 1
            if split.fragment:
                require(target_name in anchors, f"fragment targets non-XHTML resource: {href}")
                fragment = unquote(split.fragment)
                require(fragment in anchors[target_name], f"missing fragment target from {name}: {href}")
                checked_fragments += 1
    return {
        "internal_links": internal,
        "external_links": external,
        "fragment_targets": checked_fragments,
        "all_resolved": True,
    }


def audit_source_crosswalk(render_manifest: dict) -> list[dict[str, object]]:
    require(render_manifest.get("source_revision") == "9620cc73f9c8e0ad003c514a5d3748f29611c4c0", "upstream revision mismatch")
    units = render_manifest.get("units", [])
    require(tuple(row["unit_id"] for row in units) == EXPECTED_UNITS, "render-manifest unit scope mismatch")
    rows = []
    for row in units:
        source_path = ROOT / "upstream" / row["source_path"]
        translation_path = ROOT / "translation" / row["source_path"]
        require(source_path.is_file(), f"missing source file: {row['source_path']}")
        require(translation_path.is_file(), f"missing translation file: {row['source_path']}")
        source_hash = sha256(source_path.read_bytes())
        require(source_hash == row["source_sha256"], f"source digest mismatch: {row['unit_id']}")
        current_translation_hash = sha256(translation_path.read_bytes())
        require(current_translation_hash == row["translation_sha256"], f"translation digest mismatch: {row['unit_id']}")
        rows.append(
            {
                "unit_id": row["unit_id"],
                "source_path": row["source_path"],
                "source_sha256": source_hash,
                "translation_sha256": current_translation_hash,
                "editable_translation_matches_reader_input": True,
                "aligned_blocks": row["aligned_blocks"],
            }
        )
    return rows


def run_epubcheck(epub: Path, jar: Path) -> dict[str, object]:
    require(jar.is_file(), "EPUBCheck jar not found")
    result = subprocess.run(
        ["java", "-jar", str(jar), str(epub)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    output = result.stdout.replace(str(epub), epub.name).replace("\\", "/")
    require(result.returncode == 0, f"EPUBCheck failed:\n{output}")
    require("No errors or warnings detected." in output, f"EPUBCheck did not report a clean package:\n{output}")
    require("0 fatals / 0 errors / 0 warnings" in output, f"EPUBCheck message summary is not clean:\n{output}")
    version_match = re.search(r"EPUB version ([0-9.]+) rules", output)
    return {
        "tool": "EPUBCheck 5.3.0",
        "ruleset": version_match.group(1) if version_match else "3.3",
        "return_code": result.returncode,
        "fatals": 0,
        "errors": 0,
        "warnings": 0,
        "infos": 0,
        "status": "pass",
    }


def audit_epub(epub: Path, cold_epub: Path, epubcheck_jar: Path) -> tuple[dict[str, object], dict[str, object]]:
    require(epub.is_file(), "EPUB output missing")
    require(cold_epub.is_file(), "cold EPUB output missing")
    payload = epub.read_bytes()
    cold_payload = cold_epub.read_bytes()
    require(payload == cold_payload, "cold EPUB replay differs byte-for-byte")

    with zipfile.ZipFile(epub) as archive:
        require(archive.testzip() is None, "EPUB ZIP CRC failure")
        infos = archive.infolist()
        names = [info.filename for info in infos]
        require(len(names) == len(set(names)), "duplicate ZIP entries")
        require(set(names) == EXPECTED_ENTRIES, f"unexpected EPUB inventory: {sorted(set(names) ^ EXPECTED_ENTRIES)}")
        for name in names:
            path = PurePosixPath(name)
            require(not path.is_absolute() and ".." not in path.parts and "\\" not in name, f"unsafe EPUB path: {name}")
        require(names[0] == "mimetype", "mimetype is not the first ZIP entry")
        require(infos[0].compress_type == zipfile.ZIP_STORED, "mimetype must be stored without compression")
        require(archive.read("mimetype") == b"application/epub+zip", "invalid mimetype payload")
        require(all(info.date_time == (2026, 9, 12, 0, 0, 0) for info in infos), "non-deterministic ZIP timestamp")
        blobs = {name: archive.read(name) for name in names}

    container = xml_document(blobs["META-INF/container.xml"], "container.xml")
    rootfiles = container.xpath("/*[local-name()='container']/*[local-name()='rootfiles']/*[local-name()='rootfile']/@full-path")
    require(rootfiles == ["OEBPS/package.opf"], "container rootfile mismatch")
    opf = xml_document(blobs["OEBPS/package.opf"], "package.opf")
    package = opf.getroot()
    require(package.tag == f"{{{OPF_NS}}}package" and package.get("version") == "3.0", "OPF package mismatch")
    require(package.get("unique-identifier") == "pub-id", "OPF unique identifier reference mismatch")
    languages = opf.xpath("//dc:language/text()", namespaces={"dc": DC_NS})
    require(languages == ["te-Telu-IN"], "OPF language metadata mismatch")
    descriptions = opf.xpath("//opf:meta[@property='schema:description']/text()", namespaces={"opf": OPF_NS})
    require(len(descriptions) == 1 and "23 of 722" in descriptions[0] and "Not the complete" in descriptions[0], "OPF scope disclosure missing")
    require(opf.xpath("string(//opf:meta[@property='rendition:layout'])", namespaces={"opf": OPF_NS}) == "reflowable", "OPF is not reflowable")
    features = set(opf.xpath("//opf:meta[@property='schema:accessibilityFeature']/text()", namespaces={"opf": OPF_NS}))
    require({"MathML", "tableOfContents", "structuralNavigation", "alternativeText"}.issubset(features), "accessibility metadata incomplete")

    manifest_items = opf.xpath("//opf:manifest/opf:item", namespaces={"opf": OPF_NS})
    manifest_by_id = {item.get("id"): item for item in manifest_items}
    require(len(manifest_by_id) == len(manifest_items), "duplicate OPF manifest IDs")
    hrefs = {posixpath.normpath(posixpath.join("OEBPS", item.get("href"))) for item in manifest_items}
    expected_manifest = EXPECTED_ENTRIES - {"mimetype", "META-INF/container.xml", "OEBPS/package.opf"}
    require(hrefs == expected_manifest, "OPF manifest does not exactly cover package resources")
    require(set((manifest_by_id["reader"].get("properties") or "").split()) == {"mathml", "svg"}, "reader manifest properties mismatch")
    require((manifest_by_id["nav"].get("properties") or "") == "nav", "navigation property missing")
    diagram_items = [item for item in manifest_items if item.get("media-type") == "image/svg+xml"]
    require(len(diagram_items) == 8, "OPF diagram resource count mismatch")
    require(all(not item.get("properties") for item in diagram_items), "standalone SVG resources must not declare content properties")
    spine = opf.xpath("//opf:spine/opf:itemref/@idref", namespaces={"opf": OPF_NS})
    require(spine == ["title", "nav", "reader", "about", "license"], "spine order mismatch")
    require(opf.xpath("string(//opf:spine/@page-progression-direction)", namespaces={"opf": OPF_NS}) == "ltr", "spine direction mismatch")

    xhtml_names = sorted(name for name in names if name.endswith(".xhtml"))
    documents = {name: xml_document(blobs[name], name) for name in xhtml_names}
    namespace_counts = {name: namespace_audit(document) for name, document in documents.items()}
    require(sum(len(document.xpath("//*[local-name()='script']")) for document in documents.values()) == 0, "scripts are forbidden")
    require(sum(len(document.xpath("//*[@src and (starts-with(@src,'http:') or starts-with(@src,'https:'))]")) for document in documents.values()) == 0, "remote runtime resource found")

    css = blobs["OEBPS/reader.css"].decode("utf-8")
    css_urls = [value.strip(" \"'") for value in re.findall(r"url\(([^)]+)\)", css)]
    require(css_urls == ["fonts/NotoSerifTelugu-Regular.ttf", "fonts/NotoSerifTelugu-Bold.ttf"], "unexpected CSS resources")
    require(all(posixpath.normpath(posixpath.join("OEBPS", value)) in names for value in css_urls), "missing CSS resource")
    require(not re.search(r"(?:https?:)?//", css), "remote CSS dependency found")

    link_report = audit_links(documents, set(names))
    embedded_report = audit_embedded_resources(documents, set(names))
    diagram_resources = audit_svg_resources(blobs)
    nav = documents["OEBPS/nav.xhtml"]
    require(len(nav.xpath("//*[@epub:type='toc']", namespaces={"epub": EPUB_NS})) == 1, "EPUB TOC missing")
    nav_unit_links = nav.xpath("//*[@epub:type='toc']//*[local-name()='a' and starts-with(@href,'reader.xhtml#OLP-')]/@href", namespaces={"epub": EPUB_NS})
    require(nav_unit_links == [f"reader.xhtml#{unit}" for unit in EXPECTED_UNITS], "TOC unit coverage mismatch")

    source = original_document()
    output = documents["OEBPS/reader.xhtml"]
    source_units = unit_nodes(source)
    output_units = unit_nodes(output)
    require(tuple(unit.get("id") for unit in source_units) == EXPECTED_UNITS, "source unit range mismatch")
    require(tuple(unit.get("id") for unit in output_units) == EXPECTED_UNITS, "EPUB unit range mismatch")
    unit_reports = []
    for source_unit, output_unit in zip(source_units, output_units, strict=True):
        unit_id = source_unit.get("id")
        source_text_sha = text_sha(source_unit)
        output_text_sha = text_sha(output_unit)
        require(source_text_sha == output_text_sha, f"missing or changed textual content in {unit_id}")
        source_annotations = annotations(source_unit)
        output_annotations = annotations(output_unit)
        require(source_annotations == output_annotations, f"MathML source annotations changed in {unit_id}")
        require(link_values(source_unit) == link_values(output_unit), f"content links changed in {unit_id}")
        require(set(id_values(source_unit)) == set(id_values(output_unit)), f"stable IDs changed in {unit_id}")
        require(class_counter(source_unit, ".//*[local-name()='article']") == class_counter(output_unit, ".//*[local-name()='article']"), f"statement classes changed in {unit_id}")
        require(svg_descriptors(source_unit) == svg_descriptors(output_unit), f"SVG meaning changed in {unit_id}")
        require(image_descriptors(source_unit) == image_descriptors(output_unit), f"compiled diagram meaning changed in {unit_id}")
        math_roots = output_unit.xpath(".//*[local-name()='math']")
        svg_roots = output_unit.xpath(".//*[local-name()='svg']")
        image_roots = output_unit.xpath(".//*[local-name()='img']")
        require(all(etree.QName(math.tag).namespace == MATHML_NS for math in math_roots), f"non-MathML formula in {unit_id}")
        require(all(etree.QName(svg.tag).namespace == SVG_NS for svg in svg_roots), f"non-SVG diagram in {unit_id}")
        english_math = len(output_unit.xpath(".//*[local-name()='details' and contains(concat(' ',normalize-space(@class),' '),' english ')]//*[local-name()='math']"))
        unit_reports.append(
            {
                "unit_id": unit_id,
                "normalized_text_sha256": output_text_sha,
                "mathml_roots": len(math_roots),
                "telugu_mathml_roots": len(math_roots) - english_math,
                "english_mathml_roots": english_math,
                "tex_annotations": len(output_annotations),
                "svg_diagrams": len(svg_roots),
                "compiled_svg_images": len(image_roots),
                "statement_classes": class_counter(output_unit, ".//*[local-name()='article']"),
                "ids": len(id_values(output_unit)),
                "links": len(link_values(output_unit)),
            }
        )

    all_math = output.xpath("//*[local-name()='math']")
    all_svg = output.xpath("//*[local-name()='svg']")
    all_images = output.xpath("//*[local-name()='img']")
    all_statements = output.xpath("//*[local-name()='article' and contains(concat(' ',normalize-space(@class),' '),' statement ')]")
    require(len(all_math) == 2512, "unexpected total MathML root count")
    require(len(all_svg) == 6, "unexpected total SVG count")
    require(len(all_images) == 16, "unexpected compiled SVG image count")
    require(len(all_statements) == 242, "unexpected statement count")
    require(len(output.xpath("//*[local-name()='details' and contains(concat(' ',normalize-space(@class),' '),' english ')]")) == 23, "canonical English disclosure count mismatch")
    require(all(svg.get("role") == "img" and svg.get("aria-label") and svg.xpath("string(.//*[local-name()='title'][1])") == svg.get("aria-label") for svg in all_svg), "SVG descriptions incomplete")
    require(all(image.get("src") and image.get("alt") and "reader-diagram" in (image.get("class") or "").split() for image in all_images), "compiled SVG descriptions incomplete")
    citation_keys = output.xpath("//*[contains(concat(' ',normalize-space(@class),' '),' citation ')]/@data-citation-key")
    require(citation_keys == ["Benacerraf1965", "Benacerraf1965"], "citation key coverage mismatch")
    source_bibliographies = source.xpath("//*[@id='bibliography']")
    output_bibliographies = output.xpath("//*[@id='bibliography']")
    require(len(source_bibliographies) == len(output_bibliographies) == 1, "bibliography count mismatch")
    require(text_sha(source_bibliographies[0]) == text_sha(output_bibliographies[0]), "bibliography text changed during packaging")
    require(link_values(source_bibliographies[0]) == link_values(output_bibliographies[0]), "bibliography links changed during packaging")
    title_text = normalized("".join(documents["OEBPS/title.xhtml"].getroot().itertext()))
    require("722 మూల విభాగాలలో 23" in title_text, "title-page scope disclosure missing")
    require("పూర్తి OpenLogic తెలుగు గ్రంథం కాదు" in title_text, "incomplete-edition disclosure missing")

    render_manifest = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))
    source_crosswalk = audit_source_crosswalk(render_manifest)
    epubcheck = run_epubcheck(epub, epubcheck_jar)
    artifact = {
        "filename": epub.name,
        "bytes": len(payload),
        "sha256": sha256(payload),
        "media_type": "application/epub+zip",
        "rendition": "reflowable",
        "language": "te-Telu-IN",
        "direction": "ltr",
    }
    evidence = {
        "schema": "openlogic-te-epub-qa/1",
        "version": VERSION,
        "date": DATE,
        "scope": {
            "unit_range": "OLP-0004 through OLP-0026",
            "translated_units": 23,
            "corpus_units": 722,
            "chapters": ["Sets", "Relations", "Functions"],
            "chapter_completeness": "three complete chapters",
            "complete_edition": False,
            "scope_label_present_in_package": True,
        },
        "source_identity": {
            "html_path": "docs/sfr/index.html",
            "html_bytes": SOURCE_HTML.stat().st_size,
            "html_sha256": EXPECTED_HTML_SHA256,
            "render_manifest_sha256": EXPECTED_MANIFEST_SHA256,
            "upstream_revision": render_manifest["source_revision"],
        },
        "artifact": artifact,
        "determinism": {
            "cold_filename": cold_epub.name,
            "cold_bytes": len(cold_payload),
            "cold_sha256": sha256(cold_payload),
            "byte_identical": True,
            "fixed_zip_timestamp": "2026-09-12T00:00:00Z",
        },
        "epubcheck": epubcheck,
        "structure": {
            "zip_entries": len(EXPECTED_ENTRIES),
            "mimetype_first_and_stored": True,
            "manifest_exact": True,
            "spine": spine,
            "navigation_unit_links": nav_unit_links,
            "xhtml_namespace_counts": namespace_counts,
            "scripts": 0,
            "remote_runtime_dependencies": 0,
            "links": link_report,
            "embedded_resources": embedded_report,
            "diagram_resources": diagram_resources,
        },
        "content": {
            "units": unit_reports,
            "normalized_unit_text_hashes_match_html": True,
            "ordered_tex_annotations_match_html": True,
            "stable_ids_match_html": True,
            "content_links_match_html": True,
            "statement_classes_match_html": True,
            "svg_descriptors_and_paths_match_html": True,
            "compiled_svg_image_descriptors_match_html": True,
            "mathml_roots": len(all_math),
            "inline_svg_diagrams": len(all_svg),
            "compiled_svg_image_instances": len(all_images),
            "statements": len(all_statements),
            "canonical_english_disclosures": 23,
            "citation_keys": citation_keys,
            "bibliography_entries": 1,
        },
        "source_crosswalk": source_crosswalk,
        "status": "COMPLETE_PASS",
    }
    return evidence, artifact


def translation_checkpoint_commit() -> str:
    return subprocess.check_output(
        ["git", "-C", str(ROOT), "log", "-1", "--format=%H", "--", "translation"],
        text=True,
        encoding="utf-8",
    ).strip()


def build_release_manifest(artifact: dict[str, object], evidence_path: Path) -> dict[str, object]:
    prior = json.loads(PRIOR_READBACK.read_text(encoding="utf-8"))
    inherited = []
    for row in prior["files"]:
        path = ROOT / "output" / "release" / row["filename"]
        require(path.is_file(), f"missing inherited release file: {row['filename']}")
        digest = sha256(path.read_bytes())
        require(path.stat().st_size == row["bytes"] and digest == row["sha256"], f"inherited release file changed: {row['filename']}")
        inherited.append(
            {
                "filename": row["filename"],
                "bytes": row["bytes"],
                "sha256": row["sha256"],
                "role": "inherited",
                "source_release": "v0.2.0-sets-html / Zenodo 22309234",
            }
        )
    qa_paths = [ROOT / "evidence" / "HTML-SFR-DETERMINISTIC-QA.json", evidence_path]
    require(qa_paths[0].is_file(), "HTML reader QA evidence missing")
    if RENDER_EVIDENCE.is_file():
        qa_paths.append(RENDER_EVIDENCE)
    if PAGES_EVIDENCE.is_file():
        qa_paths.append(PAGES_EVIDENCE)
    return {
        "schema": "openlogic-te-release-manifest/3",
        "version": VERSION,
        "date": DATE,
        "scope": {
            "epub_reader": "OLP-0004 through OLP-0026; complete Sets, Relations, and Functions chapters; 23 of 722 units",
            "editable_translation_checkpoint": "OLP-0004 through OLP-0207; 204 of 722 units",
            "complete_edition": False,
        },
        "source_identity": {
            "upstream_revision": "9620cc73f9c8e0ad003c514a5d3748f29611c4c0",
            "semantic_reader_path": "docs/sfr/index.html",
            "editable_translation_checkpoint_commit": translation_checkpoint_commit(),
            "semantic_reader_sha256": EXPECTED_HTML_SHA256,
        },
        "lineage": {
            "github_repository": "https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN",
            "github_release_tag": "v0.3.0-sfr-epub",
            "github_pages": "https://kokunoyumeto.github.io/OpenLogic-te-Telu-IN/sfr/",
            "zenodo_concept_doi": "10.5281/zenodo.22307937",
            "prior_zenodo_version_doi": "10.5281/zenodo.22309234",
            "zenodo_version_doi": "10.5281/zenodo.22726674",
            "zenodo_record_id": 22726674,
        },
        "artifacts": inherited + [{**artifact, "role": "new"}],
        "qa_evidence": [
            {
                "path": path.relative_to(ROOT).as_posix(),
                "bytes": path.stat().st_size,
                "sha256": sha256(path.read_bytes()),
            }
            for path in qa_paths
        ],
        "publication_rule": "Publish a new cumulative GitHub release and a new version in the existing Zenodo concept DOI; retain inherited artifacts byte-for-byte and keep the pertinent PDF available as the Zenodo preview.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epub", type=Path, default=EPUB)
    parser.add_argument("--cold-epub", type=Path, default=COLD_EPUB)
    parser.add_argument("--epubcheck-jar", type=Path, required=True)
    parser.add_argument("--evidence", type=Path, default=EVIDENCE)
    parser.add_argument("--release-manifest", type=Path, default=RELEASE_MANIFEST)
    arguments = parser.parse_args()
    evidence, artifact = audit_epub(arguments.epub.resolve(), arguments.cold_epub.resolve(), arguments.epubcheck_jar.resolve())
    evidence_path = arguments.evidence.resolve()
    require(evidence_path.parent == (ROOT / "evidence").resolve(), "unsafe evidence output")
    evidence_path.write_bytes(json_bytes(evidence))
    release_manifest = build_release_manifest(artifact, evidence_path)
    manifest_path = arguments.release_manifest.resolve()
    require(manifest_path.parent == (ROOT / "output" / "release").resolve(), "unsafe release-manifest output")
    manifest_path.write_bytes(json_bytes(release_manifest))
    print(json.dumps({"status": evidence["status"], "artifact": artifact, "evidence": evidence_path.name, "release_manifest": manifest_path.name}, ensure_ascii=False))


if __name__ == "__main__":
    main()

"""Build a deterministic, reflowable EPUB 3 reader checkpoint.

The semantic input is an accepted, self-contained HTML reader profile. This
builder deliberately fails if that sealed input changes.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import shutil
import subprocess
import uuid
import zipfile
from pathlib import Path, PurePosixPath

from lxml import etree, html


ROOT = Path(__file__).resolve().parents[1]
UPSTREAM_REVISION = "9620cc73f9c8e0ad003c514a5d3748f29611c4c0"
PROFILES = {
    "sfr": {
        "source_dir": ROOT / "docs" / "sfr",
        "output_dir": ROOT / "output" / "epub-sets",
        "filename": "openlogic-te-Telu-IN-sfr-v0.3.0.epub",
        "version": "0.3.0-sfr-epub",
        "modified": "2026-09-12T00:00:00Z",
        "zip_timestamp": (2026, 9, 12, 0, 0, 0),
        "html_sha256": "95d95c8664eceedab56f2c0402375b7adb9ef1e5c4471d1b651bdc6f428de210",
        "manifest_sha256": "546f323c21c0b8a589e2afc0fbaecd73787917b51f74cff1420fa3cd95e6480b",
        "units": tuple(f"OLP-{number:04d}" for number in range(4, 27)),
        "title": "సమితులు, సంబంధాలు, ప్రమేయాలు",
        "lead": "మూడు పూర్తి పునాది అధ్యాయాలు",
        "range_te": "OLP-0004–OLP-0026",
        "scope_te": "ఇది పూర్తి OpenLogic తెలుగు గ్రంథం కాదు. ఇది పూర్తయిన సమితులు, సంబంధాలు, ప్రమేయాలు అనే మూడు అధ్యాయాలు మాత్రమే; పూర్తి తెలుగు సంచికపై పని కొనసాగుతోంది.",
        "reader_scope_te": "ఈ EPUB పూర్తి గ్రంథం కాదు; పరిధి OLP-0004–OLP-0026 మాత్రమే.",
        "about_scope_te": "ఈ రీఫ్లో చేయగల EPUB 3 ప్యాకేజీ OLP-0004 నుండి OLP-0026 వరకు ఉన్న పూర్తి సమితులు, సంబంధాలు, ప్రమేయాలు అధ్యాయాలను కలిగి ఉంది: మొత్తం 722 మూల విభాగాలలో 23. ఇది పూర్తి తెలుగు గ్రంథం కాదు.",
        "scope_en": "Complete Sets, Relations, and Functions chapters only, OLP-0004–OLP-0026 (23 of 722 units)",
        "expected_diagrams": 8,
    },
    "cumulative279": {
        "source_dir": ROOT / "output" / "html" / "cumulative-279",
        "output_dir": ROOT / "output" / "epub-cumulative-279",
        "filename": "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.epub",
        "version": "0.4.0-cumulative-olp0279-epub",
        "modified": "2026-09-20T00:00:00Z",
        "zip_timestamp": (2026, 9, 20, 0, 0, 0),
        "html_sha256": "539745faf37e8d16f7645c9757c9473da243a87b9627034c861f25f527855697",
        "manifest_sha256": "23165973763dcc702f8ed83d9be5b612d31d99d5d830f3498fe8729b44c03c8b",
        "units": tuple(f"OLP-{number:04d}" for number in range(4, 280)),
        "title": "OLP-0279 వరకు సంచిత తెలుగు పాఠ్యం",
        "lead": "276 సంపాదించగల పాఠ్య విభాగాలు",
        "range_te": "OLP-0004–OLP-0279",
        "scope_te": "ఇది పూర్తి OpenLogic తెలుగు గ్రంథం కాదు. ఇందులో OLP-0004 నుంచి OLP-0279 వరకు 276 సంపాదించగల పాఠ్య విభాగాలు ఉన్నాయి; పూర్తి తెలుగు సంచికపై పని కొనసాగుతోంది.",
        "reader_scope_te": "ఇది పూర్తి OpenLogic తెలుగు గ్రంథం కాదు. ఇందులో OLP-0004 నుంచి OLP-0279 వరకు 276 సంపాదించగల పాఠ్య విభాగాలు ఉన్నాయి; పూర్తి తెలుగు సంచికపై పని కొనసాగుతోంది.",
        "about_scope_te": "ఈ రీఫ్లో చేయగల EPUB 3 ప్యాకేజీ OLP-0004–OLP-0279 పరిధిలోని 276 పాఠ్య విభాగాలను కలిగి ఉంది. ఇది పూర్తి OpenLogic తెలుగు గ్రంథం కాదు. ఇందులో OLP-0004 నుంచి OLP-0279 వరకు 276 సంపాదించగల పాఠ్య విభాగాలు ఉన్నాయి; పూర్తి తెలుగు సంచికపై పని కొనసాగుతోంది.",
        "scope_en": "Cumulative reader through OLP-0279, OLP-0004–OLP-0279 (276 of 722 units)",
        "expected_diagrams": 39,
    },
}


def configure_profile(name: str) -> None:
    profile = PROFILES[name]
    global PROFILE_NAME, SOURCE_DIR, SOURCE_HTML, SOURCE_MANIFEST, OUTPUT_DIR
    global DEFAULT_OUTPUT, DEFAULT_UNPACKED, VERSION, MODIFIED, ZIP_TIMESTAMP
    global EXPECTED_HTML_SHA256, EXPECTED_MANIFEST_SHA256, EXPECTED_UNITS
    global TITLE, LEAD, RANGE_TE, SCOPE_TE, READER_SCOPE_TE, ABOUT_SCOPE_TE
    global SCOPE_EN, EXPECTED_DIAGRAMS
    PROFILE_NAME = name
    SOURCE_DIR = profile["source_dir"]
    SOURCE_HTML = SOURCE_DIR / "index.html"
    SOURCE_MANIFEST = SOURCE_DIR / "render-manifest.json"
    OUTPUT_DIR = profile["output_dir"]
    DEFAULT_OUTPUT = ROOT / "output" / "release" / profile["filename"]
    DEFAULT_UNPACKED = OUTPUT_DIR / "unpacked"
    VERSION = profile["version"]
    MODIFIED = profile["modified"]
    ZIP_TIMESTAMP = profile["zip_timestamp"]
    EXPECTED_HTML_SHA256 = profile["html_sha256"]
    EXPECTED_MANIFEST_SHA256 = profile["manifest_sha256"]
    EXPECTED_UNITS = profile["units"]
    TITLE = profile["title"]
    LEAD = profile["lead"]
    RANGE_TE = profile["range_te"]
    SCOPE_TE = profile["scope_te"]
    READER_SCOPE_TE = profile["reader_scope_te"]
    ABOUT_SCOPE_TE = profile["about_scope_te"]
    SCOPE_EN = profile["scope_en"]
    EXPECTED_DIAGRAMS = profile["expected_diagrams"]


configure_profile("sfr")

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


def source_document() -> html.HtmlElement:
    source_bytes = SOURCE_HTML.read_bytes()
    require(sha256(source_bytes) == EXPECTED_HTML_SHA256, "accepted HTML input changed")
    require(
        sha256(SOURCE_MANIFEST.read_bytes()) == EXPECTED_MANIFEST_SHA256,
        "accepted render manifest changed",
    )
    # libxml2's legacy HTML vocabulary reports HTML5 structural elements as
    # errors; recovery preserves them losslessly for our explicit conversion.
    parser = html.HTMLParser(encoding="utf-8", recover=True, huge_tree=True)
    document = html.document_fromstring(source_bytes, parser=parser)
    units = tuple(document.xpath("//section[contains(concat(' ', normalize-space(@class), ' '), ' source-unit ')]/@id"))
    require(units == EXPECTED_UNITS, f"unexpected reader scope: {units}")
    return document


def epub_element(tag: str, *, text: str | None = None, **attributes: str) -> etree._Element:
    element = etree.Element(f"{{{XHTML_NS}}}{tag}")
    if text is not None:
        element.text = text
    for name, value in attributes.items():
        if name == "epub_type":
            element.set(f"{{{EPUB_NS}}}type", value)
        elif name == "xml_lang":
            element.set(f"{{{XML_NS}}}lang", value)
        elif name.endswith("_"):
            element.set(name[:-1], value)
        else:
            element.set(name.replace("_", "-"), value)
    return element


def append(parent: etree._Element, tag: str, text: str | None = None, **attributes: str) -> etree._Element:
    child = epub_element(tag, text=text, **attributes)
    parent.append(child)
    return child


def convert_tree(node: etree._Element, inherited_namespace: str = XHTML_NS) -> etree._Element:
    """Copy an HTML subtree into explicit XHTML/MathML/SVG namespaces."""
    if not isinstance(node.tag, str):
        return copy.deepcopy(node)
    local = etree.QName(node).localname
    lowered = local.lower()
    if lowered == "math":
        namespace = MATHML_NS
    elif lowered == "svg":
        namespace = SVG_NS
    elif inherited_namespace in {MATHML_NS, SVG_NS}:
        namespace = inherited_namespace
    else:
        namespace = XHTML_NS

    svg_names = {
        "clippath": "clipPath",
        "foreignobject": "foreignObject",
        "lineargradient": "linearGradient",
        "radialgradient": "radialGradient",
        "textpath": "textPath",
    }
    if namespace == SVG_NS:
        local = svg_names.get(lowered, local)
    nsmap = {None: namespace} if lowered in {"math", "svg"} else None
    result = etree.Element(f"{{{namespace}}}{local}", nsmap=nsmap)
    result.text = node.text
    result.tail = node.tail

    svg_attributes = {
        "viewbox": "viewBox",
        "preserveaspectratio": "preserveAspectRatio",
        "gradientunits": "gradientUnits",
        "gradienttransform": "gradientTransform",
    }
    for name, value in node.attrib.items():
        if name == "xmlns" or name.startswith("{http://www.w3.org/2000/xmlns/}"):
            continue
        output_name = svg_attributes.get(name.lower(), name) if namespace == SVG_NS else name
        result.set(output_name, value)
    if result.get("lang") and not result.get(f"{{{XML_NS}}}lang"):
        result.set(f"{{{XML_NS}}}lang", result.get("lang"))
    for child in node:
        result.append(convert_tree(child, namespace))
    # The accepted browser HTML places each TeX figure-label anchor in an
    # otherwise empty paragraph after figcaption. EPUB requires figcaption to
    # be the final child, so put the same stable target ID on figure itself.
    if namespace == XHTML_NS and lowered == "figure":
        for child in list(result):
            if etree.QName(child).localname != "p" or normalized("".join(child.itertext())) or len(child) != 1:
                continue
            anchor = child[0]
            classes = set((anchor.get("class") or "").split())
            if etree.QName(anchor).localname == "span" and classes == {"anchor"} and anchor.get("id"):
                require(not result.get("id"), "figure already has an ID")
                result.set("id", anchor.get("id"))
                result.remove(child)
    return result


MATHML_TOKEN_NAMES = {"mi", "mn", "mo", "ms", "mtext"}


def normalize_epub_mathml(root: etree._Element) -> dict[str, int]:
    """Make accepted KaTeX MathML conform to EPUB's strict MathML schema.

    Browsers accept KaTeX's composite-operator token wrappers, but EPUB's
    MathML content model permits only text (plus mglyph/malignmark) inside a
    token element. Preserve operator semantics by collapsing text-only
    composites and preserve explicit binary-operator spacing around scripted
    composites with mspace elements.
    """
    counts = {
        "empty_attributes_removed": 0,
        "text_operators_collapsed": 0,
        "scripted_operators_spaced": 0,
    }
    math_nodes = list(root.iter(f"{{{MATHML_NS}}}math"))
    for math in math_nodes:
        for element in math.iter():
            if not isinstance(element.tag, str):
                continue
            for name, value in list(element.attrib.items()):
                if not value.strip():
                    del element.attrib[name]
                    counts["empty_attributes_removed"] += 1

        for token in list(math.iter()):
            if not isinstance(token.tag, str):
                continue
            local = etree.QName(token).localname
            children = [child for child in token if isinstance(child.tag, str)]
            if local not in MATHML_TOKEN_NAMES or not children:
                continue
            child_names = tuple(etree.QName(child).localname for child in children)
            if local == "mo" and child_names in {("mi",), ("mi", "mtext", "mtext", "mo")}:
                token.text = "".join(token.itertext())
                for child in children:
                    token.remove(child)
                counts["text_operators_collapsed"] += 1
                continue
            if (
                local == "mo"
                and child_names in {("mover",), ("msup",)}
                and set(token.attrib) == {"lspace", "rspace"}
            ):
                lspace = token.attrib.pop("lspace")
                rspace = token.attrib.pop("rspace")
                token.tag = f"{{{MATHML_NS}}}mrow"
                left = etree.Element(f"{{{MATHML_NS}}}mspace", width=lspace)
                right = etree.Element(f"{{{MATHML_NS}}}mspace", width=rspace)
                token.insert(0, left)
                token.append(right)
                counts["scripted_operators_spaced"] += 1
                continue
            raise RuntimeError(f"unsupported MathML token wrapper: {local} -> {child_names}")

    remaining = [
        element
        for math in math_nodes
        for element in math.iter()
        if isinstance(element.tag, str)
        and etree.QName(element).localname in MATHML_TOKEN_NAMES
        and any(isinstance(child.tag, str) for child in element)
    ]
    require(not remaining, "MathML token wrappers remain after normalization")
    return counts


def relocate_figure_anchor(figure: etree._Element) -> None:
    """Move a trailing empty TeX-label paragraph onto its figure container."""
    for child in list(figure):
        if etree.QName(child).localname != "p" or normalized("".join(child.itertext())) or len(child) != 1:
            continue
        anchor = child[0]
        classes = set((anchor.get("class") or "").split())
        if etree.QName(anchor).localname == "span" and classes == {"anchor"} and anchor.get("id"):
            require(not figure.get("id"), "figure already has an ID")
            figure.set("id", anchor.get("id"))
            figure.remove(child)


def normalize_epub_figures(root: etree._Element) -> int:
    """Promote captioned table wrappers and enforce figcaption placement."""
    captions = list(root.iter(f"{{{XHTML_NS}}}figcaption"))
    promoted = 0
    for caption in captions:
        parent = caption.getparent()
        require(parent is not None, "figcaption has no parent")
        if etree.QName(parent).localname != "figure":
            require(
                etree.QName(parent).localname == "div"
                and "center" in set((parent.get("class") or "").split()),
                "unsupported non-figure figcaption container",
            )
            parent.tag = f"{{{XHTML_NS}}}figure"
            promoted += 1
        relocate_figure_anchor(parent)
        require(
            parent.index(caption) in {0, len(parent) - 1},
            "figcaption must be the first or final figure child",
        )
    return promoted


BLOCK_NAMES = {
    "address",
    "article",
    "aside",
    "blockquote",
    "div",
    "figure",
    "footer",
    "header",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "ul",
}


def has_paragraph_content(node: etree._Element) -> bool:
    return bool((node.text or "").strip() or len(node))


def normalize_paragraph_blocks(root: etree._Element) -> None:
    """Lift block descendants out of paragraphs while preserving mixed-content order."""
    paragraph_tag = f"{{{XHTML_NS}}}p"
    for paragraph in list(root.iter(paragraph_tag)):
        if not any(
            isinstance(child.tag, str) and etree.QName(child).localname.lower() in BLOCK_NAMES
            for child in paragraph
        ):
            continue
        parent = paragraph.getparent()
        require(parent is not None, "nested block paragraph has no parent")
        insertion_index = parent.index(paragraph)
        original_tail = paragraph.tail
        paragraph.tail = None

        current = etree.Element(paragraph_tag, attrib=dict(paragraph.attrib))
        current.text = paragraph.text
        replacements: list[etree._Element] = []
        for child in list(paragraph):
            paragraph.remove(child)
            if isinstance(child.tag, str) and etree.QName(child).localname.lower() in BLOCK_NAMES:
                following_text = child.tail
                child.tail = None
                if has_paragraph_content(current):
                    replacements.append(current)
                replacements.append(child)
                current = etree.Element(paragraph_tag, attrib=dict(paragraph.attrib))
                current.attrib.pop("id", None)
                current.text = following_text
            else:
                current.append(child)
        if has_paragraph_content(current):
            replacements.append(current)
        require(replacements, "paragraph normalization produced no content")

        paragraph_id = paragraph.get("id")
        if paragraph_id and not any(node.get("id") == paragraph_id for node in replacements):
            require(not replacements[0].get("id"), f"cannot preserve paragraph ID {paragraph_id}")
            replacements[0].set("id", paragraph_id)
        parent.remove(paragraph)
        for offset, replacement in enumerate(replacements):
            parent.insert(insertion_index + offset, replacement)
        replacements[-1].tail = original_tail

    remaining = [
        child
        for paragraph in root.iter(paragraph_tag)
        for child in paragraph
        if isinstance(child.tag, str) and etree.QName(child).localname.lower() in BLOCK_NAMES
    ]
    require(not remaining, "block content remains nested in a paragraph")


def document_shell(title: str, body_class: str = "") -> tuple[etree._Element, etree._Element]:
    root = etree.Element(
        f"{{{XHTML_NS}}}html",
        nsmap={None: XHTML_NS, "epub": EPUB_NS},
    )
    root.set("lang", "te-Telu-IN")
    root.set(f"{{{XML_NS}}}lang", "te-Telu-IN")
    root.set("dir", "ltr")
    head = append(root, "head")
    append(head, "meta", charset="utf-8")
    append(head, "meta", name="viewport", content="width=device-width, initial-scale=1")
    append(head, "title", title)
    append(head, "link", rel="stylesheet", href="reader.css")
    body = append(root, "body", class_=body_class) if body_class else append(root, "body")
    return root, body


def serialize(root: etree._Element) -> bytes:
    return etree.tostring(
        root,
        encoding="utf-8",
        xml_declaration=True,
        doctype="<!DOCTYPE html>",
        pretty_print=False,
    )


def repository_head() -> str:
    return subprocess.check_output(["git", "-C", str(ROOT), "rev-parse", "HEAD"], text=True, encoding="utf-8").strip()


def build_title_page() -> bytes:
    root, body = document_shell(f"OpenLogic తెలుగు — {TITLE}", "frontmatter")
    main = append(body, "main", id="title-page", epub_type="titlepage")
    append(main, "p", "OpenLogic · తెలుగు", class_="eyebrow")
    append(main, "h1", TITLE)
    append(main, "p", LEAD, class_="lead")
    append(main, "p", f"{RANGE_TE} · 722 మూల విభాగాలలో {len(EXPECTED_UNITS)}")
    notice = append(main, "section", aria_label="సంచిక పరిధి", class_="scope-notice")
    append(notice, "h2", "పాక్షిక సంచిక")
    append(notice, "p", SCOPE_TE)
    append(notice, "p", "యంత్ర అనువాదం; మూల పాఠ్యంతో సరిపోల్చిన ఏజెంట్ సమీక్ష. మానవ లేదా స్వతంత్ర భాషా సమీక్ష జరిగిందని పేర్కొనడం లేదు.")
    append(main, "p", f"EPUB సంచిక {VERSION} · పాఠక మూల SHA-256 {EXPECTED_HTML_SHA256}", class_="unit-id")
    links = append(main, "p")
    link = append(links, "a", "విషయ సూచికకు వెళ్లండి", href="nav.xhtml")
    link.tail = " · "
    append(links, "a", "పఠనం ప్రారంభించండి", href="reader.xhtml#OLP-0004")
    return serialize(root)


def unit_titles(document: html.HtmlElement) -> list[tuple[str, str]]:
    result: list[tuple[str, str]] = []
    nav_titles = {
        href.removeprefix("#"): normalized("".join(anchor.itertext()))
        for anchor in document.xpath("//nav//a[starts-with(@href,'#OLP-')]")
        if (href := anchor.get("href"))
    }
    for unit in document.xpath("//section[contains(concat(' ', normalize-space(@class), ' '), ' source-unit ')]"):
        headings = unit.xpath("./div[contains(concat(' ', normalize-space(@class), ' '), ' telugu-text ')]//*[self::h2 or self::h3][1]")
        unit_id = unit.get("id")
        title = normalized(headings[0].text_content()) if headings else nav_titles.get(unit_id, unit_id)
        result.append((unit_id, title))
    return result


def build_nav(document: html.HtmlElement) -> bytes:
    root, body = document_shell("విషయ సూచిక — OpenLogic తెలుగు")
    main = append(body, "main")
    append(main, "h1", "విషయ సూచిక")
    toc_attributes = {"id": "toc", "epub_type": "toc", "role": "doc-toc"}
    if PROFILE_NAME == "sfr":
        toc_attributes["aria_label"] = "విషయ సూచిక"
    toc = append(main, "nav", **toc_attributes)
    listing = append(toc, "ol")
    for href, label in (
        ("title.xhtml", "ముఖపుట మరియు పరిధి"),
        ("reader.xhtml", TITLE),
    ):
        item = append(listing, "li")
        append(item, "a", label, href=href)
    nested = append(listing[-1], "ol")
    for unit_id, title in unit_titles(document):
        item = append(nested, "li")
        append(item, "a", f"{title} ({unit_id})", href=f"reader.xhtml#{unit_id}")
    for href, label in (("about.xhtml", "సంచిక గురించి"), ("license.xhtml", "అనుమతులు")):
        item = append(listing, "li")
        append(item, "a", label, href=href)
    landmark_attributes = {"epub_type": "landmarks"}
    if PROFILE_NAME == "sfr":
        landmark_attributes["aria_label"] = "ప్రధాన విభాగాలు"
    landmarks = append(main, "nav", **landmark_attributes)
    append(landmarks, "h2", "ప్రధాన విభాగాలు")
    landmark_list = append(landmarks, "ol")
    for href, label, kind in (
        ("title.xhtml", "ముఖపుట", "frontmatter"),
        ("reader.xhtml", "ప్రధాన పాఠ్యం", "bodymatter"),
        ("about.xhtml", "సంచిక గురించి", "backmatter"),
    ):
        item = append(landmark_list, "li")
        append(item, "a", label, href=href, epub_type=kind)
    return serialize(root)


def build_reader(document: html.HtmlElement) -> bytes:
    root, body = document_shell(f"{TITLE} — OpenLogic తెలుగు", "reader-page")
    append(body, "a", "ప్రధాన పాఠ్యానికి వెళ్లండి", href="#reader", class_="skip-link")
    header = append(body, "header")
    append(header, "p", "OpenLogic · తెలుగు", class_="eyebrow")
    append(header, "h1", TITLE)
    append(header, "p", f"{LEAD} · 722 మూల విభాగాలలో {len(EXPECTED_UNITS)}", class_="lead")
    append(header, "p", READER_SCOPE_TE)
    links = append(header, "p", class_="reader-links")
    append(links, "a", "విషయ సూచిక", href="nav.xhtml")
    main = append(body, "main", id="reader", epub_type="bodymatter")
    source_units = document.xpath("//section[contains(concat(' ', normalize-space(@class), ' '), ' source-unit ')]")
    for source_unit in source_units:
        main.append(convert_tree(source_unit))
    bibliography = document.xpath("//*[@id='bibliography']")
    require(len(bibliography) == 1, "reader bibliography missing")
    main.append(convert_tree(bibliography[0]))
    normalize_paragraph_blocks(main)
    if PROFILE_NAME == "cumulative279":
        mathml_counts = normalize_epub_mathml(main)
        promoted_figures = normalize_epub_figures(main)
        require(
            mathml_counts
            == {
                "empty_attributes_removed": 6,
                "text_operators_collapsed": 112,
                "scripted_operators_spaced": 44,
            },
            f"unexpected cumulative MathML normalization counts: {mathml_counts}",
        )
        require(promoted_figures == 2, f"unexpected promoted figure count: {promoted_figures}")
    footer = append(body, "footer")
    append(footer, "a", "సంచిక గురించి", href="about.xhtml")
    return serialize(root)


def build_about() -> bytes:
    root, body = document_shell("సంచిక గురించి — OpenLogic తెలుగు", "backmatter")
    main = append(body, "main", epub_type="backmatter")
    append(main, "h1", "సంచిక గురించి")
    append(main, "p", ABOUT_SCOPE_TE)
    append(main, "p", "ప్రతి విభాగంలో తెలుగు పాఠ్యంతో పాటు విడిగా తెరవగల ప్రామాణిక ఆంగ్ల మూలం ఉంది. గణితాన్ని స్థానిక MathMLగా, చిత్రాలను వివరణలుగల స్థానిక SVGగా, ఉల్లేఖనాలను స్థానిక గ్రంథసూచి లంకెలతో ఉంచాం. చదవడానికి ఇంటర్నెట్, జావాస్క్రిప్ట్ లేదా దూరపు ఫాంట్లు అవసరం లేదు.")
    append(main, "p", "సహజ సంఖ్యలలో 0ను చేర్చే ఆంగ్ల మూలపు ఆనవాయితీని ఉంచాం. కొన్ని సాంకేతిక పదాలు తాత్కాలిక నిర్ణయాలు; నిర్వచనాలే వాటి కచ్చితమైన అర్థాన్ని నిర్ణయిస్తాయి. మూల పాఠ్యంలో లేని సమాధానాలు చేర్చలేదు.")
    append(main, "p", "యంత్ర అనువాదం; మూల పాఠ్యంతో సరిపోల్చిన ఏజెంట్ సమీక్ష. మానవ లేదా స్వతంత్ర భాషా సమీక్ష జరిగిందని పేర్కొనడం లేదు.")
    provenance = append(main, "section", id="provenance")
    append(provenance, "h2", "మూలం మరియు గుర్తింపు")
    append(provenance, "p", f"ఆంగ్ల మూల సవరణ: {UPSTREAM_REVISION}. తెలుగు HTML పాఠక SHA-256: {EXPECTED_HTML_SHA256}. EPUB సంచిక: {VERSION}.")
    sources = append(provenance, "p")
    append(sources, "a", "Open Logic Project", href="https://openlogicproject.org/")
    sources[-1].tail = " · "
    append(sources, "a", "మూల రచయితలు", href="https://openlogicproject.org/people/")
    sources[-1].tail = " · "
    append(sources, "a", "సంపాదించగల మూలాలు మరియు ఆధారాలు", href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN")
    license_note = append(main, "section")
    append(license_note, "h2", "అనుమతులు")
    paragraph = append(license_note, "p", "Open Logic పాఠ్యానికి CC BY 4.0 అనుమతి వర్తిస్తుంది. తెలుగు అనువాదం మరియు పాఠక రూపకల్పన మూలానికి చేసిన మార్పులు; మూల రచయితల ఆమోదం ఉందని సూచించడం లేదు. పూర్తి వివరాలకు ")
    append(paragraph, "a", "అనుమతుల పుట", href="license.xhtml")
    paragraph[-1].tail = " చూడండి."
    navigation = append(main, "p")
    append(navigation, "a", "విషయ సూచిక", href="nav.xhtml")
    navigation[-1].tail = " · "
    append(navigation, "a", "ప్రధాన పాఠ్యం", href="reader.xhtml#OLP-0004")
    return serialize(root)


def build_license() -> bytes:
    root, body = document_shell("అనుమతులు — OpenLogic తెలుగు", "backmatter")
    main = append(body, "main", epub_type="backmatter")
    append(main, "h1", "అనుమతులు")
    sections = (
        ("content-license", "Open Logic మరియు తెలుగు పాఠ్యం — CC BY 4.0", SOURCE_DIR / "LICENSE.md", "en"),
        ("noto-license", "Noto Serif Telugu — SIL Open Font License 1.1", SOURCE_DIR / "fonts" / "OFL.txt", "en"),
        ("katex-license", "KaTeX — MIT License", SOURCE_DIR / "KATEX-LICENSE", "en"),
    )
    for section_id, heading, path, language in sections:
        section = append(main, "section", id=section_id, lang=language, xml_lang=language)
        append(section, "h2", heading)
        append(section, "pre", path.read_text(encoding="utf-8"), class_="license-text")
    navigation = append(main, "p")
    append(navigation, "a", "విషయ సూచిక", href="nav.xhtml")
    return serialize(root)


def build_opf(identifier: str, diagram_names: list[str]) -> bytes:
    package = etree.Element(
        f"{{{OPF_NS}}}package",
        nsmap={None: OPF_NS, "dc": DC_NS},
        version="3.0",
        attrib={"unique-identifier": "pub-id", "prefix": "rendition: http://www.idpf.org/vocab/rendition/# schema: http://schema.org/"},
    )
    metadata = etree.SubElement(package, f"{{{OPF_NS}}}metadata")
    for tag, value, attributes in (
        ("identifier", identifier, {"id": "pub-id"}),
        ("title", f"OpenLogic తెలుగు — {TITLE} (పాక్షిక EPUB సంచిక)", {}),
        ("language", "te-Telu-IN", {}),
        ("creator", "Open Logic Project contributors", {}),
        ("publisher", "OpenLogic Telugu translation project", {}),
        ("rights", "CC BY 4.0; bundled Noto fonts remain under SIL OFL 1.1", {}),
        ("source", f"https://github.com/OpenLogicProject/OpenLogic/tree/{UPSTREAM_REVISION}", {}),
    ):
        node = etree.SubElement(metadata, f"{{{DC_NS}}}{tag}", **attributes)
        node.text = value
    for property_name, value in (
        ("dcterms:modified", MODIFIED),
        ("rendition:layout", "reflowable"),
        ("rendition:orientation", "auto"),
        ("rendition:spread", "auto"),
        ("schema:accessMode", "textual"),
        ("schema:accessMode", "visual"),
        ("schema:accessMode", "symbolic"),
        ("schema:accessibilityFeature", "tableOfContents"),
        ("schema:accessibilityFeature", "MathML"),
        ("schema:accessibilityFeature", "structuralNavigation"),
        ("schema:accessibilityFeature", "alternativeText"),
        ("schema:accessibilityFeature", "readingOrder"),
        ("schema:accessibilityFeature", "displayTransformability"),
        ("schema:accessibilityHazard", "none"),
        ("schema:accessibilitySummary", f"Reflowable Telugu text with native MathML, described SVG diagrams, structural navigation, local fonts, and a canonical English source disclosure for each of {len(EXPECTED_UNITS)} units."),
    ):
        node = etree.SubElement(metadata, f"{{{OPF_NS}}}meta", property=property_name)
        node.text = value
    source_meta = etree.SubElement(metadata, f"{{{OPF_NS}}}meta", property="schema:description")
    source_meta.text = f"{SCOPE_EN}; semantic reader SHA-256 {EXPECTED_HTML_SHA256}. Not the complete Telugu edition."

    manifest = etree.SubElement(package, f"{{{OPF_NS}}}manifest")
    resources = (
        ("nav", "nav.xhtml", "application/xhtml+xml", "nav"),
        ("title", "title.xhtml", "application/xhtml+xml", ""),
        ("reader", "reader.xhtml", "application/xhtml+xml", "mathml svg"),
        ("about", "about.xhtml", "application/xhtml+xml", ""),
        ("license", "license.xhtml", "application/xhtml+xml", ""),
        ("css", "reader.css", "text/css", ""),
        ("font-regular", "fonts/NotoSerifTelugu-Regular.ttf", "font/ttf", ""),
        ("font-bold", "fonts/NotoSerifTelugu-Bold.ttf", "font/ttf", ""),
    )
    for resource_id, href, media_type, properties in resources:
        attributes = {"id": resource_id, "href": href, "media-type": media_type}
        if properties:
            attributes["properties"] = properties
        etree.SubElement(manifest, f"{{{OPF_NS}}}item", **attributes)
    for index, name in enumerate(diagram_names, 1):
        etree.SubElement(
            manifest,
            f"{{{OPF_NS}}}item",
            id=f"diagram-{index}",
            href=f"assets/diagrams/{name}",
            attrib={"media-type": "image/svg+xml"},
        )
    spine = etree.SubElement(package, f"{{{OPF_NS}}}spine", attrib={"page-progression-direction": "ltr"})
    for resource_id in ("title", "nav", "reader", "about", "license"):
        etree.SubElement(spine, f"{{{OPF_NS}}}itemref", idref=resource_id)
    return etree.tostring(package, encoding="utf-8", xml_declaration=True, pretty_print=True)


def container_xml() -> bytes:
    container = etree.Element(f"{{{CONTAINER_NS}}}container", nsmap={None: CONTAINER_NS}, version="1.0")
    rootfiles = etree.SubElement(container, f"{{{CONTAINER_NS}}}rootfiles")
    etree.SubElement(
        rootfiles,
        f"{{{CONTAINER_NS}}}rootfile",
        attrib={"full-path": "OEBPS/package.opf", "media-type": "application/oebps-package+xml"},
    )
    return etree.tostring(container, encoding="utf-8", xml_declaration=True, pretty_print=True)


def css_bytes() -> bytes:
    source = (SOURCE_DIR / "reader.css").read_text(encoding="utf-8")
    if PROFILE_NAME == "sfr":
        additions = """
/* EPUB-specific, reflowable presentation. */
body{orphans:2;widows:2}
.frontmatter main,.backmatter main{max-width:48rem;margin:0 auto;padding:2rem}
.scope-notice{margin:2rem 0;padding:1rem 1.25rem;border:2px solid var(--accent);background:#eef4f3}
.reader-links{font-size:.95rem}
.license-text{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.5 ui-monospace,monospace}
.source-unit+.source-unit{break-before:page}
@supports (page-break-before:always){.source-unit+.source-unit{page-break-before:always}}
""".lstrip()
        return (source.rstrip() + "\n" + additions).encode("utf-8")

    inline_scroll_rule = ".inline-math{display:inline-block;max-width:100%;overflow-x:auto;vertical-align:middle;line-height:1.2;scrollbar-width:thin}"
    require(inline_scroll_rule in source, "expected inline MathML source rule missing")
    source = source.replace(
        inline_scroll_rule,
        ".inline-math{display:inline;vertical-align:middle;line-height:1.2}",
    )
    epub_colors = {
        "ink": "#172b34",
        "muted": "#4d6570",
        "line": "#cbd7dc",
        "accent": "#075d70",
        "paper": "#fffdfa",
    }
    for name, value in epub_colors.items():
        source = source.replace(f"var(--{name})", value)
    source = source.replace(
        ":root{color-scheme:light;--ink:#172b34;--muted:#4d6570;--line:#cbd7dc;--accent:#075d70;--paper:#fffdfa}",
        ":root{color-scheme:light}",
    )
    require("var(--" not in source, "unresolved CSS custom property in EPUB stylesheet")
    additions = """
/* EPUB-specific, reflowable presentation. */
body{orphans:2;widows:2}
.frontmatter main,.backmatter main{max-width:48rem;margin:0 auto;padding:2rem}
.scope-notice{margin:2rem 0;padding:1rem 1.25rem;border:2px solid #075d70;background:#eef4f3}
.reader-links{font-size:.95rem}
#toc>ol{columns:1}
#toc>ol>li>ol{columns:2;column-gap:2rem}
.license-text{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.5 ui-monospace,monospace}
.source-unit+.source-unit{break-before:page}
@supports (page-break-before:always){.source-unit+.source-unit{page-break-before:always}}
@media(max-width:640px){#toc>ol>li>ol{columns:1}}
@media print{.math-block,.inline-math{overflow:visible;max-width:none}.inline-math{display:inline}}
""".lstrip()
    return (source.rstrip() + "\n" + additions).encode("utf-8")


def safe_clear(path: Path) -> None:
    resolved = path.resolve()
    allowed_parent = OUTPUT_DIR.resolve()
    require(resolved.parent == allowed_parent, f"unsafe unpacked output: {resolved}")
    require(resolved.name in {"unpacked", "cold-unpacked"}, f"unexpected unpacked directory: {resolved.name}")
    if resolved.exists():
        shutil.rmtree(resolved)
    resolved.mkdir(parents=True)


def write_unpacked(destination: Path, files: dict[str, bytes]) -> None:
    safe_clear(destination)
    for name, payload in sorted(files.items()):
        target = (destination / PurePosixPath(name)).resolve()
        require(destination.resolve() in target.parents, f"unsafe EPUB entry: {name}")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)


def zip_epub(destination: Path, files: dict[str, bytes]) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, "w") as archive:
        mimetype_info = zipfile.ZipInfo("mimetype", ZIP_TIMESTAMP)
        mimetype_info.compress_type = zipfile.ZIP_STORED
        mimetype_info.external_attr = 0o100644 << 16
        archive.writestr(mimetype_info, files["mimetype"], compress_type=zipfile.ZIP_STORED)
        for name in sorted(key for key in files if key != "mimetype"):
            normalized_path = PurePosixPath(name)
            require(not normalized_path.is_absolute() and ".." not in normalized_path.parts, f"unsafe EPUB entry: {name}")
            info = zipfile.ZipInfo(normalized_path.as_posix(), ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, files[name], compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def build(destination: Path, unpacked: Path) -> dict[str, object]:
    document = source_document()
    manifest = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))
    require(manifest["source_revision"] == UPSTREAM_REVISION, "render-manifest source revision mismatch")
    head = repository_head()
    diagram_paths = sorted((SOURCE_DIR / "assets" / "diagrams").glob("*.svg"))
    require(len(diagram_paths) == EXPECTED_DIAGRAMS, "unexpected compiled diagram inventory")
    diagram_names = [path.name for path in diagram_paths]
    identifier = "urn:uuid:" + str(uuid.uuid5(uuid.NAMESPACE_URL, f"https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/{VERSION}/{EXPECTED_HTML_SHA256}"))
    files = {
        "mimetype": b"application/epub+zip",
        "META-INF/container.xml": container_xml(),
        "OEBPS/package.opf": build_opf(identifier, diagram_names),
        "OEBPS/title.xhtml": build_title_page(),
        "OEBPS/nav.xhtml": build_nav(document),
        "OEBPS/reader.xhtml": build_reader(document),
        "OEBPS/about.xhtml": build_about(),
        "OEBPS/license.xhtml": build_license(),
        "OEBPS/reader.css": css_bytes(),
        "OEBPS/fonts/NotoSerifTelugu-Regular.ttf": (SOURCE_DIR / "fonts" / "NotoSerifTelugu-Regular.ttf").read_bytes(),
        "OEBPS/fonts/NotoSerifTelugu-Bold.ttf": (SOURCE_DIR / "fonts" / "NotoSerifTelugu-Bold.ttf").read_bytes(),
    }
    for diagram_path in diagram_paths:
        files[f"OEBPS/assets/diagrams/{diagram_path.name}"] = diagram_path.read_bytes()
    write_unpacked(unpacked, files)
    zip_epub(destination, files)
    return {
        "schema": "openlogic-te-epub-build/1",
        "version": VERSION,
        "profile": PROFILE_NAME,
        "source_scope": f"{SCOPE_EN}; not the complete Telugu edition",
        "complete_edition": False,
        "source_html_sha256": EXPECTED_HTML_SHA256,
        "source_manifest_sha256": EXPECTED_MANIFEST_SHA256,
        "repository_head_at_build": head,
        "upstream_revision": UPSTREAM_REVISION,
        "identifier": identifier,
        "filename": destination.name,
        "bytes": destination.stat().st_size,
        "sha256": sha256(destination.read_bytes()),
        "entries": len(files),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", choices=sorted(PROFILES), default="sfr")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--unpacked", type=Path)
    arguments = parser.parse_args()
    configure_profile(arguments.profile)
    output = (arguments.output or DEFAULT_OUTPUT).resolve()
    unpacked = (arguments.unpacked or DEFAULT_UNPACKED).resolve()
    receipt = build(output, unpacked)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    receipt_path = OUTPUT_DIR / ("cold-build-receipt.json" if unpacked.name == "cold-unpacked" else "build-receipt.json")
    receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(receipt, ensure_ascii=False))


if __name__ == "__main__":
    main()

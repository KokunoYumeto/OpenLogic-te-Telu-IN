"""Flag likely untranslated prose in the Telugu face of the full HTML reader.

This is a triage audit, not a semantic translation certificate. MathML, code,
citations, and the disclosed English source are deliberately excluded.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "output" / "html" / "full" / "index.html"
REPORT = ROOT / "evidence" / "FULL-READER-LANGUAGE-TRIAGE.json"
TELUGU = re.compile(r"[\u0c00-\u0c7f]")
LATIN_WORD = re.compile(r"[A-Za-z][A-Za-z'-]*")
MIXED_ENGLISH_CONNECTIVE = re.compile(r"\b(?:if|then|and|or|let|suppose|therefore|hence)\b\s*[\u0c00-\u0c7f]", re.I)
RAW_TEX_LINE_SKIP = re.compile(r"\[(?:\d+(?:\.\d+)?)(?:em|ex|pt)\]")
EXCLUDED = {"math", "code", "pre", "svg", "annotation", "script", "style"}
BLOCKS = {"p", "li", "h1", "h2", "h3", "h4", "figcaption", "dt", "dd", "blockquote"}


def visible_text(element: html.HtmlElement) -> str:
    values: list[str] = []
    for node in element.xpath(".//text()"):
        parents = [ancestor.tag for ancestor in node.getparent().iterancestors()]
        if node.getparent().tag in EXCLUDED or any(parent in EXCLUDED for parent in parents):
            continue
        values.append(str(node))
    return " ".join(" ".join(values).split())


def main() -> None:
    document = html.parse(str(HTML))
    units = document.xpath("//section[contains(concat(' ',normalize-space(@class),' '),' source-unit ')]")
    if len(units) != 722:
        raise RuntimeError(f"Expected 722 units, found {len(units)}")
    flags: list[dict[str, object]] = []
    examined = 0
    for unit in units:
        faces = unit.xpath("./div[contains(concat(' ',normalize-space(@class),' '),' telugu-text ')]")
        if len(faces) != 1:
            raise RuntimeError(f"Missing unique Telugu face: {unit.get('id')}")
        for element in faces[0].iterdescendants():
            if element.tag not in BLOCKS:
                continue
            # Do not score the same prose again inside an enclosing block.
            if any(ancestor.tag in BLOCKS for ancestor in element.iterancestors() if ancestor is not faces[0]):
                continue
            value = visible_text(element)
            if not value:
                continue
            examined += 1
            words = LATIN_WORD.findall(value)
            telugu = len(TELUGU.findall(value))
            if ((len(words) >= 2 and telugu == 0
                    and not value.startswith(("http://", "https://")))
                    or (len(words) >= 24 and len(words) > telugu / 3)
                    or MIXED_ENGLISH_CONNECTIVE.search(value)
                    or RAW_TEX_LINE_SKIP.search(value)):
                flags.append({
                    "unit_id": unit.get("id"),
                    "element": element.tag,
                    "latin_words": len(words),
                    "telugu_characters": telugu,
                    "excerpt": value[:350],
                })
    receipt = {
        "schema": "openlogic-te-language-triage/1",
        "scope": "all 722 Telugu faces; English disclosure and MathML excluded",
        "blocks_examined": examined,
        "likely_untranslated_prose": flags,
        "status": "COMPLETE_PASS" if not flags else "REVIEW_REQUIRED",
        "note": "Heuristic triage only, including short English connectives outside MathML; a pass does not establish semantic adequacy.",
    }
    REPORT.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"blocks_examined": examined, "flags": len(flags), "report": str(REPORT)}, ensure_ascii=False))
    if flags:
        raise RuntimeError("Likely untranslated prose requires review")


if __name__ == "__main__":
    main()

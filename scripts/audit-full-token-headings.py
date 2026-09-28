"""Inspect rendered Telugu headings for unresolved OpenLogic token switches."""

from __future__ import annotations

import json
import re
import hashlib
from html import unescape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "output" / "html" / "full" / "index.html"
REPORT = ROOT / "evidence" / "FULL-TOKEN-HEADING-QA.json"
CONTROLLED_ENGLISH = re.compile(
    r"\b(?:derivation|derivability|proof|formula|sentence|domain|tableau|valuation|identity|enumerable|nonenumerable|lambda definable)\b",
    re.IGNORECASE,
)
MALFORMED_TELUGU = ("వ్యుత్పత్తులుకు", "వాక్యాలుల", "నిర్మాణాలుల", "వ్యక్తి క్షేత్రాలులను", "సూత్రాలు సమితి")
SECTION = re.compile(r'<section class="source-unit" id="(OLP-\d{4})"')
HEADING = re.compile(r'<h([123])(?:\s[^>]*)?>(.*?)</h\1>', re.DOTALL)
TAGS = re.compile(r"<[^>]+>")


def main() -> None:
    raw_html = PAGE.read_bytes()
    markup = raw_html.decode("utf-8")
    sections = list(SECTION.finditer(markup))
    flags = []
    heading_count = 0
    for index, section in enumerate(sections):
        stop = sections[index + 1].start() if index + 1 < len(sections) else markup.find("</main>", section.start())
        fragment = markup[section.start():stop].split('<details class="english"', 1)[0]
        for heading in HEADING.finditer(fragment):
            heading_count += 1
            text = " ".join(unescape(TAGS.sub("", heading.group(2))).split())
            english = CONTROLLED_ENGLISH.findall(text)
            malformed = [term for term in MALFORMED_TELUGU if term in text]
            if english or malformed:
                flags.append({"unit_id": section.group(1), "heading": text, "english": english, "malformed": malformed})
    result = {"schema": "openlogic-te-token-heading-audit/1", "html_sha256": hashlib.sha256(raw_html).hexdigest(), "units": len(sections), "headings": heading_count, "flags": flags, "status": "COMPLETE_PASS" if not flags and len(sections) == 722 else "review_needed"}
    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=True))
    if flags:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

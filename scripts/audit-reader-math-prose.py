"""Check prose inside Telugu MathML without treating notation as English.

The ordinary language audit excludes MathML, but mtext can contain real
sentences, conditions and connectives. This supplementary check deliberately
does not translate identifiers or borrowed axiom/rule names.
"""

from __future__ import annotations

import json
import re
import hashlib
from pathlib import Path

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
ENGLISH_PROSE = re.compile(r"\b(?:if|iff|and|or|is|otherwise|tends|by|definition|etc)\b", re.I)
MALFORMED_IFF = re.compile(r"అప్పుడే\s+మరియు\s+అప్పుడే")


def findings(document: html.HtmlElement) -> list[dict[str, str]]:
    result = []
    for unit in document.xpath("//section[contains(concat(' ',normalize-space(@class),' '),' source-unit ')]"):
        for face in unit.xpath("./div[contains(concat(' ',normalize-space(@class),' '),' telugu-text ')]"):
            for element in face.xpath(".//*[local-name()='mtext']"):
                text = " ".join(" ".join(element.itertext()).split())
                if ENGLISH_PROSE.search(text) or MALFORMED_IFF.search(text):
                    result.append({"unit_id": unit.get("id"), "text": text})
            # A prose abbreviation typed directly in math becomes separate
            # italic identifiers, not mtext. Detect the verified residual
            # `etc.` pattern without treating general symbol runs as words.
            for row in face.xpath(".//*[local-name()='mrow']"):
                atoms = [(element.tag.rsplit('}', 1)[-1], ''.join(element.itertext()))
                         for element in row]
                if any(atoms[index:index + 4] == [('mi', 'e'), ('mi', 't'), ('mi', 'c'), ('mo', '.')]
                       for index in range(max(0, len(atoms) - 3))):
                    result.append({"unit_id": unit.get("id"), "text": "etc.", "kind": "math_identifier_prose"})
    return result


def main() -> None:
    page = ROOT / "output/html/full/index.html"
    raw = page.read_bytes()
    document = html.fromstring(raw)
    units = document.xpath("//section[contains(concat(' ',normalize-space(@class),' '),' source-unit ')]")
    expected_ids = {f"OLP-{number:04d}" for number in range(1, 723)}
    complete = len(units) == 722 and {unit.get("id") for unit in units} == expected_ids
    flagged = findings(document)
    result = {
        "schema": "openlogic-te-math-prose-audit/1",
        "scope": "English connective/condition mtext and literal etc. abbreviation in MathML of all 722 Telugu faces",
        "html_sha256": hashlib.sha256(raw).hexdigest(),
        "units": len(units),
        "complete_unit_coverage": complete,
        "flags": flagged,
        "status": "COMPLETE_PASS" if complete and not flagged else "REVIEW_REQUIRED",
        "limitations": "Not a semantic certificate; mathematical identifiers and borrowed rule/axiom names are not flagged.",
    }
    destination = ROOT / "evidence/FULL-MATH-PROSE-QA.json"
    destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"flags": len(flagged), "report": str(destination)}))
    if flagged or not complete:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

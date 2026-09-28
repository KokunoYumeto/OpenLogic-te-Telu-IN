"""Export one unit from the integrated reader for isolated layout diagnostics."""

from __future__ import annotations

import argparse
from pathlib import Path

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "output" / "html" / "full" / "index.html"
DESTINATION = ROOT / "tmp" / "pdfs"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("unit_id", nargs="+", help="One or more consecutive units to inspect")
    args = parser.parse_args()
    document = html.parse(str(SOURCE))
    units = [document.xpath(f"//section[@id='{unit_id}' and contains(concat(' ',normalize-space(@class),' '),' source-unit ')]") for unit_id in args.unit_id]
    if any(len(matches) != 1 for matches in units):
        raise RuntimeError(f"Unique reader unit not found: {args.unit_id}")
    section = "".join(html.tostring(matches[0], encoding="unicode") for matches in units)
    label = "-".join(args.unit_id)
    page = (
        '<!doctype html><html lang="te-Telu-IN"><head><meta charset="utf-8">'
        f'<title>{label} layout diagnostic</title>'
        '<link rel="stylesheet" href="../../editions/reader.css"></head><body><main>'
        + section + '</main></body></html>\n'
    )
    DESTINATION.mkdir(parents=True, exist_ok=True)
    target = DESTINATION / f"visual-{label}.html"
    target.write_text(page, encoding="utf-8")
    print(target)


if __name__ == "__main__":
    main()

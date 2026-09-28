"""Normalize browser-print metadata while preserving pages and PDF tags."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import pikepdf


FIXED_DATE = "D:20260928000000Z"
NODE_ID = re.compile(rb"node(\d{8})")
TRAILER_ID = re.compile(rb"/ID \[<[0-9a-fA-F]{32}><[0-9a-fA-F]{32}>\]")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonicalize_browser_ids(pdf_bytes: bytes) -> tuple[bytes, int]:
    """Normalize Chrome's offset tag IDs, preserving cross-reference offsets.

    Chrome assigns run-dependent accessibility-node numbers and gaps. They
    appear as fixed-width names in its tag tree, ID tree and table header
    references, but their relative order is stable for identical renders.
    Same-width rank substitution leaves object offsets intact; the trailer
    ID is then derived from the normalized bytes.
    """
    values = [int(value) for value in NODE_ID.findall(pdf_bytes)]
    if not values:
        raise RuntimeError("Tagged Chrome PDF has no accessibility-node IDs")
    ranks = {value: index for index, value in enumerate(sorted(set(values)), 1)}
    normalized = NODE_ID.sub(lambda match: b"node" + f"{ranks[int(match.group(1))]:08d}".encode("ascii"), pdf_bytes)
    blank_id = b"/ID [<" + b"0" * 32 + b"><" + b"0" * 32 + b">]"
    blanked, count = TRAILER_ID.subn(blank_id, normalized)
    if count != 1 or len(blanked) != len(pdf_bytes):
        raise RuntimeError("Unexpected PDF trailer ID or length change")
    digest = hashlib.sha256(blanked).hexdigest()[:32].encode("ascii")
    completed = blanked.replace(blank_id, b"/ID [<" + digest + b"><" + digest + b">]", 1)
    return completed, len(set(values))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    source = args.source.resolve()
    destination = args.destination.resolve()
    if source == destination:
        raise RuntimeError("Raw and normalized PDF paths must differ")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with pikepdf.Pdf.open(source) as pdf:
        pages = len(pdf.pages)
        tagged = "/StructTreeRoot" in pdf.Root
        pdf.docinfo["/CreationDate"] = pikepdf.String(FIXED_DATE)
        pdf.docinfo["/ModDate"] = pikepdf.String(FIXED_DATE)
        pdf.save(destination, deterministic_id=True)
    if tagged:
        normalized, normalized_ids = canonicalize_browser_ids(destination.read_bytes())
        destination.write_bytes(normalized)
    else:
        normalized_ids = 0
    with pikepdf.Pdf.open(destination) as result:
        if len(result.pages) != pages or ("/StructTreeRoot" in result.Root) != tagged:
            raise RuntimeError("PDF normalization changed pagination or tag-tree presence")
    print(json.dumps({"pages": pages, "tagged": tagged, "normalized_tag_ids": normalized_ids, "bytes": destination.stat().st_size, "sha256": sha256(destination)}))


if __name__ == "__main__":
    main()

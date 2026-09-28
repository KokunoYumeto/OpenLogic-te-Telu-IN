"""Offline safeguards for the full-edition Zenodo preview ordering."""

from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "publish-full-zenodo.py"
SPEC = importlib.util.spec_from_file_location("publish_full_zenodo", SCRIPT)
assert SPEC and SPEC.loader
zenodo = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(zenodo)

PDF = "00-complete.pdf"
OLD = "historical.zip"
PDF_CHECKSUM = "1" * 32
OLD_CHECKSUM = "0" * 32


def file_item(name: str) -> dict:
    return {
        "id": f"id-{name}",
        "filename": name,
        "filesize": 10 if name == PDF else 5,
        "checksum": PDF_CHECKSUM if name == PDF else OLD_CHECKSUM,
    }


class FakeResponse:
    def __init__(self, value):
        self.value = value

    def raise_for_status(self):
        return None

    def json(self):
        return self.value


class FakeSession:
    def __init__(self, *, retained_order: list[str]):
        self.retained_order = retained_order
        self.payload = None

    def put(self, url, json, timeout):
        self.payload = json
        return FakeResponse([file_item(PDF), file_item(OLD)])

    def get(self, url, timeout):
        return FakeResponse({
            "id": 22726675,
            "conceptrecid": "22307937",
            "submitted": False,
            "files": [file_item(name) for name in self.retained_order],
        })


class PreviewOrderTests(unittest.TestCase):
    def setUp(self):
        self.draft = {
            "id": 22726675,
            "conceptrecid": "22307937",
            "submitted": False,
            "links": {"self": "https://zenodo.org/api/deposit/depositions/22726675"},
            "files": [file_item(OLD), file_item(PDF)],
        }
        self.inherited = {OLD: (5, OLD_CHECKSUM)}
        self.assets = [{"filename": PDF, "bytes": 10,
                        "role": "complete_tagged_searchable_pdf"}]

    @patch.object(zenodo, "md5", return_value=PDF_CHECKSUM)
    def test_pdf_order_is_submitted_and_read_back(self, _md5):
        session = FakeSession(retained_order=[PDF, OLD])
        updated = zenodo.sort_complete_pdf_first(
            session, self.draft, self.inherited, self.assets
        )
        self.assertEqual(session.payload, [{"id": f"id-{PDF}"}, {"id": f"id-{OLD}"}])
        self.assertEqual(updated["files"][0]["filename"], PDF)

    @patch.object(zenodo, "md5", return_value=PDF_CHECKSUM)
    def test_rejects_order_not_retained_by_draft(self, _md5):
        session = FakeSession(retained_order=[OLD, PDF])
        with self.assertRaisesRegex(RuntimeError, "did not retain"):
            zenodo.sort_complete_pdf_first(
                session, self.draft, self.inherited, self.assets
            )


if __name__ == "__main__":
    unittest.main()

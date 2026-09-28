"""Publish the complete edition as a new version of its existing Zenodo record.

The default preflight is read-only. --execute requires a scoped ZENODO_TOKEN,
preserves every inherited file, publishes only after checking all eight new
assets, and anonymously downloads the new files to verify their SHA-256.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import quote

import requests


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "release"
TAG = "v1.0.1-full-olp0722"
CONCEPT = "10.5281/zenodo.22307937"
OLD_ID = 22726674
OLD_DOI = "10.5281/zenodo.22726674"
API = "https://zenodo.org/api"
MANIFEST = OUT / f"release-manifest-{TAG}.json"
CHECKSUMS = OUT / f"SHA256SUMS-{TAG}.txt"
RECEIPT = ROOT / "evidence" / "ZENODO-FULL-V101-READBACK.json"
GITHUB_READBACK = ROOT / "evidence" / "GITHUB-FULL-V101-READBACK.json"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def md5(path: Path) -> str:
    digest = hashlib.md5(usedforsecurity=False)
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def get_json(session: requests.Session, url: str) -> dict:
    response = session.get(url, timeout=60)
    response.raise_for_status()
    return response.json()


def normalized_file(item: dict) -> tuple[str, int, str]:
    filename = item.get("filename") or item.get("key")
    size = item.get("filesize") if "filesize" in item else item.get("size")
    checksum = str(item.get("checksum", "")).removeprefix("md5:")
    require(isinstance(filename, str) and isinstance(size, int) and len(checksum) == 32,
            "A Zenodo file has no verifiable filename, size, or MD5")
    return filename, size, checksum


def local_assets() -> tuple[dict, list[dict]]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    require(manifest["version"] == TAG and manifest["scope"]["source_units"] == 722
            and manifest["scope"]["complete_edition"], "Wrong or partial local release")
    assets = [*manifest["artifacts"]]
    assets.extend([
        {"filename": MANIFEST.name, "bytes": MANIFEST.stat().st_size, "sha256": sha256(MANIFEST), "role": "release_manifest"},
        {"filename": CHECKSUMS.name, "bytes": CHECKSUMS.stat().st_size, "sha256": sha256(CHECKSUMS), "role": "sha256_checksums"},
    ])
    require(len(assets) == 8 and len({item["filename"] for item in assets}) == 8,
            "Expected exactly eight distinct release assets")
    for item in assets:
        path = OUT / item["filename"]
        require(path.is_file() and path.stat().st_size == item["bytes"]
                and sha256(path) == item["sha256"], f"Local release asset changed: {item['filename']}")
    github = json.loads(GITHUB_READBACK.read_text(encoding="utf-8"))
    require(github.get("status") == "COMPLETE_PASS"
            and github.get("tag") == TAG
            and github.get("tag_commit") == manifest["repository_commit"],
            "The complete GitHub release has not passed anonymous readback")
    verified = {item["filename"]: (item["bytes"], item["sha256"])
                for item in github.get("assets", [])}
    require(len(verified) == len(assets)
            and verified == {item["filename"]: (item["bytes"], item["sha256"])
                            for item in assets},
            "Zenodo assets differ from the anonymously verified GitHub release")
    return manifest, assets


def old_public_record(session: requests.Session) -> tuple[dict, dict[str, tuple[int, str]]]:
    record = get_json(session, f"{API}/records/{OLD_ID}")
    require(record.get("id") == OLD_ID and record.get("doi") == OLD_DOI
            and record.get("conceptdoi") == CONCEPT,
            "Existing Zenodo lineage changed; inspect it before publishing")
    files = {name: (size, checksum) for name, size, checksum in map(normalized_file, record["files"])}
    require(len(files) == len(record["files"]) == 20, "Unexpected inherited Zenodo file inventory")
    return record, files


def metadata_for(draft: dict) -> dict:
    prior = draft["metadata"]
    kind = prior.get("resource_type", {})
    upload_type = prior.get("upload_type") or kind.get("type")
    publication_type = prior.get("publication_type") or kind.get("subtype")
    license_value = prior.get("license")
    license_id = license_value.get("id") if isinstance(license_value, dict) else license_value
    require(upload_type == "publication" and publication_type == "section",
            "Unexpected inherited resource type")
    require(prior.get("access_right") == "open" and license_id == "cc-by-4.0",
            "Inherited open access or CC BY license changed")
    require(prior.get("creators"), "Inherited creators are missing")
    # Do not copy read-only metadata such as the prior DOI or computed relations
    # into the new deposition: Zenodo must mint a distinct version DOI.
    metadata = {
        "upload_type": upload_type,
        "publication_type": publication_type,
        "access_right": "open",
        "license": license_id,
        "creators": [{key: value for key, value in creator.items() if value is not None}
                     for creator in prior["creators"]],
        "contributors": [{key: value for key, value in contributor.items() if value is not None}
                         for contributor in prior.get("contributors", [])],
        "keywords": prior.get("keywords", []),
        "language": prior.get("language", "tel"),
    }
    metadata.update({
        "title": "ఓపెన్ లాజిక్ తెలుగు (te-Telu-IN): పూర్తి 722-విభాగాల పాఠక సంచిక",
        "publication_date": "2026-09-28",
        "version": "1.0.1",
        "description": (
            "<p>Complete machine-assisted Telugu adaptation of all 722 tracked Open Logic Project "
            "content TeX units at frozen source revision "
            "<code>9620cc73f9c8e0ad003c514a5d3748f29611c4c0</code>. "
            "The integrated edition includes the main text, alternative arrangements and formal-only units.</p>"
            "<p>This corrected 1.0.1 edition replaces the first full release for reading and citation. "
            "It translates residual short English connectives and removes visible TeX spacing marks "
            "from the reader.</p>"
            "<p>Read the complete, searchable and tagged PDF first; the release also provides a "
            "reflowable MathML EPUB, self-contained offline HTML, all editable Telugu TeX units, "
            "full source and QA evidence. The full PDF is the intended record preview.</p>"
            "<p>This translation has source-alignment and structural QA and sampled semantic/visual "
            "review, but has <strong>not</strong> received independent human expert review. "
            "Provisional terminology and four unresolved cross-references in the frozen English "
            "source are disclosed. The older files inherited in this DOI lineage remain historical "
            "partial editions; use the new complete-edition assets for the full text.</p>"
            f"<p>Versioned source and release notes: <a href=\"https://github.com/"
            f"KokunoYumeto/OpenLogic-te-Telu-IN/releases/tag/{TAG}\">GitHub full release</a>. "
            "See the bundled attribution, license, QA and manifest files.</p>"
        ),
    })
    metadata["related_identifiers"] = [
        {"identifier": "https://github.com/OpenLogicProject/OpenLogic/tree/9620cc73f9c8e0ad003c514a5d3748f29611c4c0", "relation": "isDerivedFrom", "scheme": "url"},
        {"identifier": f"https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/releases/tag/{TAG}", "relation": "isDocumentedBy", "scheme": "url"},
        {"identifier": "https://github.com/KokunoYumeto/OpenLogic-translations", "relation": "isPartOf", "scheme": "url"},
        {"identifier": OLD_DOI, "relation": "isNewVersionOf", "scheme": "doi"},
    ]
    return metadata


def checked_draft(draft: dict, inherited: dict[str, tuple[int, str]], assets: list[dict]) -> dict[str, tuple[int, str]]:
    require(draft.get("id") != OLD_ID and str(draft.get("conceptrecid")) == "22307937"
            and not draft.get("submitted"), "Unexpected Zenodo draft identity or state")
    files = {name: (size, checksum) for name, size, checksum in map(normalized_file, draft["files"])}
    require(len(files) == len(draft["files"]), "Duplicate draft filenames")
    for name, identity in inherited.items():
        require(files.get(name) == identity, f"Inherited Zenodo file changed or absent: {name}")
    expected_new = {item["filename"] for item in assets}
    require(set(files) <= set(inherited) | expected_new, "Unexpected files in the existing Zenodo draft")
    for item in assets:
        name = item["filename"]
        if name in files:
            require(files[name] == (item["bytes"], md5(OUT / name)),
                    f"A conflicting draft asset already exists: {name}")
    return files


def sort_complete_pdf_first(session: requests.Session, draft: dict,
                            inherited: dict[str, tuple[int, str]], assets: list[dict]) -> dict:
    """Use Zenodo's documented deposit file sort before setting the preview."""
    pdf_name = next(item["filename"] for item in assets
                    if item["role"] == "complete_tagged_searchable_pdf")
    expected = set(inherited) | {item["filename"] for item in assets}
    by_name = {normalized_file(item)[0]: item for item in draft["files"]}
    require(set(by_name) == expected and len(draft["files"]) == len(expected),
            "Cannot sort an incomplete or duplicate draft file inventory")
    order = [pdf_name, *sorted(expected - {pdf_name})]
    require(all(isinstance(by_name[name].get("id"), str) for name in order),
            "A draft file has no Zenodo file identifier")
    url = f"{API}/deposit/depositions/{draft['id']}/files"
    response = session.put(url, json=[{"id": by_name[name]["id"]} for name in order], timeout=60)
    response.raise_for_status()
    require([normalized_file(item)[0] for item in response.json()] == order,
            "Zenodo did not confirm the complete PDF first in file order")
    updated = get_json(session, draft["links"]["self"])
    checked_draft(updated, inherited, assets)
    require([normalized_file(item)[0] for item in updated["files"]] == order,
            "Zenodo draft did not retain the complete PDF first in file order")
    return updated


def set_complete_pdf_preview(session: requests.Session, draft_id: int,
                             inherited: dict[str, tuple[int, str]], assets: list[dict]) -> str:
    """Set and read back the RDM draft's explicit default preview before publish."""
    pdf_name = next(item["filename"] for item in assets
                    if item["role"] == "complete_tagged_searchable_pdf")
    url = f"{API}/records/{draft_id}/draft"
    draft = get_json(session, url)
    files = draft.get("files", {})
    require(files.get("enabled") is True, "RDM draft files are not enabled")
    names = {entry["key"] for entry in files.get("entries", [])}
    require(names == set(inherited) | {item["filename"] for item in assets},
            "RDM draft file inventory differs before preview selection")
    ordered = [pdf_name, *sorted(names - {pdf_name})]
    response = session.put(url, json={"files": {"enabled": True,
                                                "default_preview": pdf_name,
                                                "order": ordered}}, timeout=60)
    response.raise_for_status()
    updated = get_json(session, url)
    selected = updated.get("files", {})
    require(updated.get("metadata", {}).get("title") == draft.get("metadata", {}).get("title")
            and updated.get("access") == draft.get("access"),
            "RDM preview update changed record metadata or access")
    require(selected.get("default_preview") == pdf_name
            and selected.get("order", [None])[0] == pdf_name
            and {entry["key"] for entry in selected.get("entries", [])} == names,
            "RDM draft did not retain the complete PDF as preview")
    return pdf_name


def publish(session: requests.Session, inherited: dict[str, tuple[int, str]], assets: list[dict]) -> int:
    old = get_json(session, f"{API}/deposit/depositions/{OLD_ID}")
    require(old.get("id") == OLD_ID and str(old.get("conceptrecid")) == "22307937",
            "Authenticated deposit is not the expected existing lineage")
    action = session.post(f"{API}/deposit/depositions/{OLD_ID}/actions/newversion", timeout=60)
    action.raise_for_status()
    latest_draft = action.json().get("links", {}).get("latest_draft")
    require(isinstance(latest_draft, str) and latest_draft.startswith(f"{API}/deposit/depositions/"),
            "Zenodo did not identify the inherited new-version draft")
    draft = get_json(session, latest_draft)
    files = checked_draft(draft, inherited, assets)
    metadata = metadata_for(draft)
    response = session.put(latest_draft, json={"metadata": metadata}, timeout=60)
    response.raise_for_status()
    draft = response.json()
    checked_draft(draft, inherited, assets)
    bucket = draft.get("links", {}).get("bucket")
    require(isinstance(bucket, str) and bucket.startswith(f"{API}/files/"),
            "Zenodo draft has no expected upload bucket")
    for item in assets:
        name = item["filename"]
        if name in files:
            continue
        with (OUT / name).open("rb") as source:
            response = session.put(f"{bucket.rstrip('/')}/{quote(name)}", data=source,
                                   headers={"Content-Type": "application/octet-stream"}, timeout=900)
        response.raise_for_status()
        uploaded = normalized_file(response.json())
        require(uploaded == (name, item["bytes"], md5(OUT / name)),
                f"Zenodo upload checksum mismatch: {name}")
        print(json.dumps({"uploaded": name, "bytes": item["bytes"]}))
    draft = get_json(session, latest_draft)
    checked_draft(draft, inherited, assets)
    require(len(draft["files"]) == len(inherited) + len(assets), "Draft file count is incomplete")
    draft = sort_complete_pdf_first(session, draft, inherited, assets)
    preview_pdf = set_complete_pdf_preview(session, int(draft["id"]), inherited, assets)
    require(preview_pdf.startswith("00-"), "Unexpected complete PDF preview filename")
    require(draft["metadata"]["title"] == metadata["title"]
            and draft["metadata"]["description"] == metadata["description"],
            "Human-facing Zenodo metadata was not retained")
    response = session.post(f"{latest_draft}/actions/publish", timeout=120)
    response.raise_for_status()
    published = response.json()
    require(published.get("id") == draft["id"] and published.get("doi"),
            "Zenodo publish response does not identify the new record")
    return int(published["id"])


def anonymous_readback(record_id: int, inherited: dict[str, tuple[int, str]], assets: list[dict]) -> dict:
    anonymous = requests.Session()
    record = None
    for attempt in range(8):
        candidate = get_json(anonymous, f"{API}/records/{record_id}")
        if candidate.get("id") == record_id and candidate.get("doi"):
            record = candidate
            break
        time.sleep(min(2 ** attempt, 10))
    require(record is not None and record.get("conceptdoi") == CONCEPT,
            "Published version is not in the existing concept DOI lineage")
    latest = get_json(anonymous, f"{API}/records/22307937")
    require(latest.get("id") == record_id, "Concept DOI does not resolve to the full edition")
    metadata = record.get("metadata", {})
    require(metadata.get("title") == "ఓపెన్ లాజిక్ తెలుగు (te-Telu-IN): పూర్తి 722-విభాగాల పాఠక సంచిక"
            and metadata.get("version") == "1.0.1"
            and metadata.get("publication_date") == "2026-09-28"
            and metadata.get("access_right") == "open"
            and metadata.get("license", {}).get("id") == "cc-by-4.0",
            "Published complete-edition metadata differs")
    related = {(item.get("relation"), item.get("identifier"))
               for item in metadata.get("related_identifiers", [])}
    require(("isDocumentedBy", f"https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/releases/tag/{TAG}") in related
            and ("isNewVersionOf", OLD_DOI) in related,
            "Published release or prior-version relation differs")
    require("all 722 tracked" in metadata.get("description", "")
            and "not received independent human expert review" in metadata.get("description", ""),
            "Published description omits the complete scope or review boundary")
    landing = anonymous.get(f"https://zenodo.org/records/{record_id}", timeout=60)
    landing.raise_for_status()
    preview_match = re.search(r'<span id="preview-file-title">([^<]+)</span>', landing.text)
    preview_filename = html.unescape(preview_match.group(1)) if preview_match else None
    complete_pdf = next(item["filename"] for item in assets if item["role"] == "complete_tagged_searchable_pdf")
    require(preview_filename == complete_pdf,
            f"The live Zenodo landing page does not preview the complete PDF: {preview_filename}")
    public_files = {item["key"]: item for item in record["files"]}
    require(len(public_files) == len(inherited) + len(assets), "Published file inventory is incomplete")
    for name, identity in inherited.items():
        require(normalized_file(public_files[name])[1:] == identity,
                f"Inherited public file was not preserved: {name}")
    checked = []
    for item in assets:
        name = item["filename"]
        remote = public_files[name]
        require(normalized_file(remote)[1:] == (item["bytes"], md5(OUT / name)),
                f"Published Zenodo file metadata differs: {name}")
        digest = hashlib.sha256()
        count = 0
        with anonymous.get(remote["links"]["self"], stream=True, timeout=900) as response:
            response.raise_for_status()
            for block in response.iter_content(chunk_size=1024 * 1024):
                digest.update(block)
                count += len(block)
        require(count == item["bytes"] and digest.hexdigest() == item["sha256"],
                f"Anonymous download differs: {name}")
        checked.append({"filename": name, "bytes": count, "sha256": digest.hexdigest(), "role": item["role"]})
        print(json.dumps({"verified": name, "bytes": count}))
    receipt = {
        "schema": "openlogic-te-zenodo-full-release-readback/1",
        "status": "COMPLETE_PASS",
        "record_id": record_id,
        "doi": record["doi"],
        "conceptdoi": CONCEPT,
        "prior_version_doi": OLD_DOI,
        "title": metadata["title"],
        "version": metadata["version"],
        "access_right": metadata["access_right"],
        "inherited_files_preserved": len(inherited),
        "new_assets_anonymously_verified": checked,
        "live_preview_filename": preview_filename,
    }
    RECEIPT.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    return receipt


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true", help="Create/publish the inherited new version and verify it")
    parser.add_argument("--verify-existing", type=int,
                        help="Anonymously verify an already-published record without an API token")
    args = parser.parse_args()
    require(not (args.execute and args.verify_existing), "Choose either --execute or --verify-existing")
    manifest, assets = local_assets()
    public, inherited = old_public_record(requests.Session())
    require(manifest["lineage"]["zenodo_concept_doi"] == CONCEPT
            and manifest["lineage"]["prior_zenodo_version_doi"] == OLD_DOI,
            "Local manifest points to a different Zenodo lineage")
    if args.verify_existing:
        receipt = anonymous_readback(args.verify_existing, inherited, assets)
        print(json.dumps({"status": receipt["status"], "doi": receipt["doi"],
                          "new_assets": len(receipt["new_assets_anonymously_verified"])}, ensure_ascii=False))
        return
    require(get_json(requests.Session(), f"{API}/records/22307937").get("id") == OLD_ID,
            "Existing Zenodo concept already has a newer public version")
    print(json.dumps({"preflight": "pass", "latest_record_id": public["id"],
                      "inherited_files": len(inherited), "new_assets": len(assets)}, ensure_ascii=False))
    if not args.execute:
        return
    token = os.environ.get("ZENODO_TOKEN", "")
    require(len(token) >= 30, "A scoped Zenodo API token is unavailable in ZENODO_TOKEN")
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}", "User-Agent": "openlogic-te-complete-release/1"})
    record_id = publish(session, inherited, assets)
    receipt = anonymous_readback(record_id, inherited, assets)
    print(json.dumps({"status": receipt["status"], "doi": receipt["doi"],
                      "new_assets": len(receipt["new_assets_anonymously_verified"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Validate and inventory the canonical translation-decision release views."""

from __future__ import annotations

import argparse
import csv
import hashlib
import importlib.metadata
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


SCHEMA_SHA256 = "50e7fa407b62c711f92f8b93be591d3b4a6e1c4adb1386c398bb5f76844d9f90"
SCHEMA_BYTES = 10787
SCHEMA_COMMIT = "811091d54be4989918864732073279a588340e6f"
SURFACES = (
    "START_HERE.md",
    "TRANSLATION_DECISIONS_FULL.md",
    "PRIORITY_REVIEW.md",
    "DECISION_OCCURRENCES.csv",
    "DECISIONS.json",
    "translation-decision.schema.json",
)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def artifact(path: Path, display_path: str) -> dict[str, object]:
    data = path.read_bytes()
    return {"path": display_path, "bytes": len(data), "sha256": digest(data)}


def jsonl(path: Path) -> list[dict[str, object]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default=None)
    args = parser.parse_args()

    repo = Path(__file__).resolve().parent.parent
    data_dir = Path(args.data_dir).resolve() if args.data_dir else repo / "evidence"
    schema_path = data_dir / "translation-decision.schema.json"
    decisions_path = data_dir / "DECISIONS.json"
    schema_bytes = schema_path.read_bytes()
    if len(schema_bytes) != SCHEMA_BYTES or digest(schema_bytes) != SCHEMA_SHA256:
        raise ValueError("Canonical schema bytes or SHA-256 differ from the frozen shared contract")

    schema = json.loads(schema_bytes)
    register = json.loads(decisions_path.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = sorted(validator.iter_errors(register), key=lambda error: list(error.absolute_path))
    if errors:
        detail = "\n".join(f"{list(error.absolute_path)}: {error.message}" for error in errors[:20])
        raise ValueError(f"Canonical schema validation failed:\n{detail}")

    decisions = register["decisions"]
    term_records = jsonl(data_dir / "TERM_DECISIONS.jsonl")
    correction_records = [item for item in jsonl(data_dir / "SOURCE_CORRECTIONS.jsonl") if item["status"].startswith("applied")]
    if len(decisions) != len(term_records) + len(correction_records):
        raise ValueError("Decision count does not match the primary ledgers")
    if register["edition_release"]["source_units"] != 108:
        raise ValueError("Edition coverage is not the expected 108 source units")
    generator = register["generator"]
    generator_path = repo / Path(generator["path_or_uri"])
    generator_bytes = generator_path.read_bytes()
    if len(generator_bytes) != generator.get("bytes") or digest(generator_bytes) != generator["sha256"]:
        raise ValueError("Generator artifact hash does not match the canonical register")

    decision_ids: set[str] = set()
    occurrence_ids: set[str] = set()
    checked_files: dict[str, str] = {}
    reader_status_counts: dict[str, int] = {}
    evidence_file_refs = 0
    for decision in decisions:
        decision_id = decision["decision_id"]
        if decision_id in decision_ids:
            raise ValueError(f"Duplicate decision id {decision_id}")
        decision_ids.add(decision_id)
        question = decision["please_double_check_question"]
        if not question or not question.startswith("Please double-check"):
            raise ValueError(f"Decision lacks plain review question lead-in: {decision_id}")
        for occurrence in decision["occurrences"]:
            occurrence_id = occurrence["occurrence_id"]
            if occurrence_id in occurrence_ids:
                raise ValueError(f"Duplicate occurrence id {occurrence_id}")
            occurrence_ids.add(occurrence_id)
            for side in ("source", "target"):
                locator = occurrence[side]
                file_path = repo / Path(locator["path"])
                raw = file_path.read_bytes()
                actual_sha = digest(raw)
                if actual_sha != locator["file_sha256"]:
                    raise ValueError(f"File hash mismatch for {locator['path']}")
                checked_files[locator["path"]] = actual_sha
                byte_span = locator["byte_span"]
                selected = raw[byte_span["start"] : byte_span["end_exclusive"]].decode("utf-8")
                if selected.replace("\r\n", "\n").strip() != locator["excerpt"]:
                    raise ValueError(f"Excerpt/byte-span mismatch for {occurrence_id} {side}")
            reader_status = occurrence["reader_locator"]["status"]
            reader_status_counts[reader_status] = reader_status_counts.get(reader_status, 0) + 1
            if reader_status == "pending" and not occurrence["reader_locator"].get("reason"):
                raise ValueError(f"Pending reader locator lacks reason: {occurrence_id}")
            for reference in occurrence["evidence_refs"]:
                if reference["path_or_uri"].startswith("evidence/"):
                    evidence_file_refs += 1
                    relative = reference["path_or_uri"].removeprefix("evidence/")
                    referred_path = data_dir / Path(relative)
                    raw = referred_path.read_bytes()
                    if digest(raw) != reference["sha256"] or len(raw) != reference.get("bytes", len(raw)):
                        raise ValueError(f"Evidence reference mismatch: {reference['path_or_uri']}")

    with (data_dir / "DECISION_OCCURRENCES.csv").open("r", encoding="utf-8", newline="") as handle:
        csv_rows = list(csv.DictReader(handle))
    if len(csv_rows) != len(occurrence_ids):
        raise ValueError("CSV occurrence count does not match DECISIONS.json")
    if {row["occurrence_id"] for row in csv_rows} != occurrence_ids:
        raise ValueError("CSV occurrence ids do not match DECISIONS.json")

    full_text = (data_dir / "TRANSLATION_DECISIONS_FULL.md").read_text(encoding="utf-8")
    missing_readable_ids = sorted(decision_id for decision_id in decision_ids if decision_id not in full_text)
    if missing_readable_ids:
        raise ValueError(f"Full readable view omits decisions: {missing_readable_ids[:5]}")
    priority_expected = {
        decision["decision_id"]
        for decision in decisions
        if decision["review_priority"] in {"urgent", "high"}
    }
    priority_text = (data_dir / "PRIORITY_REVIEW.md").read_text(encoding="utf-8")
    if any(decision_id not in priority_text for decision_id in priority_expected):
        raise ValueError("Priority view omits at least one urgent/high decision")

    artifacts = [artifact(data_dir / name, f"evidence/{name}") for name in SURFACES]
    qa = {
        "schema": "openlogic-translation-decision-qa/1",
        "status": "pass",
        "schema_contract": {
            "source_repository": "https://github.com/KokunoYumeto/OpenLogic-translations",
            "commit": SCHEMA_COMMIT,
            "bytes": SCHEMA_BYTES,
            "sha256": SCHEMA_SHA256,
            "draft": "2020-12",
        },
        "validation_engine": {
            "name": "python-jsonschema",
            "version": importlib.metadata.version("jsonschema"),
            "format_checker": True,
        },
        "coverage": {
            "state": register["edition_release"]["coverage_state"],
            "source_units": register["edition_release"]["source_units"],
            "corpus_units": 722,
            "reader_units": register["edition_release"]["reader_units"],
        },
        "counts": {
            "decisions": len(decisions),
            "terminology": sum(item["record_kind"] == "terminology" for item in decisions),
            "source_corrections": sum(item["record_kind"] == "source_correction" for item in decisions),
            "occurrences": len(occurrence_ids),
            "priority_urgent_or_high": len(priority_expected),
            "distinct_source_and_target_files_checked": len(checked_files),
            "public_evidence_file_references_checked": evidence_file_refs,
            "reader_locator_status": reader_status_counts,
        },
        "checks": {
            "canonical_schema_bytes_exact": True,
            "json_schema_validation": True,
            "generator_artifact_hash": True,
            "primary_ledger_count_reconciliation": True,
            "decision_ids_unique": True,
            "occurrence_ids_unique": True,
            "source_target_file_hashes": True,
            "source_target_byte_span_excerpts": True,
            "public_evidence_reference_hashes": True,
            "plain_please_double_check_questions": True,
            "reader_pages_never_guessed": all(status == "pending" for status in reader_status_counts),
            "full_readable_view_complete": True,
            "priority_view_complete": True,
            "occurrence_csv_reconciled": True,
        },
        "artifacts": artifacts,
    }
    output = data_dir / "TRANSLATION_DECISION_QA.json"
    output.write_text(json.dumps(qa, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"status": "pass", **qa["counts"], "qa": artifact(output, "evidence/TRANSLATION_DECISION_QA.json")}))


if __name__ == "__main__":
    main()

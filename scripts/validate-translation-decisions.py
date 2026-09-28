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
    "START_HERE.te.md",
    "START_HERE.en.md",
    "TRANSLATION_DECISIONS_FULL.md",
    "TRANSLATION_DECISIONS_FULL.en.md",
    "PRIORITY_REVIEW.md",
    "PRIORITY_REVIEW.en.md",
    "DECISION_OCCURRENCES.csv",
    "DECISIONS.json",
    "TERM_RATIONALES_TE.json",
    "TERM_ALTERNATIVES_TE.json",
    "CANON_PASSAGES_TE.json",
    "translation-decision.schema.json",
)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def artifact(path: Path, display_path: str) -> dict[str, object]:
    data = path.read_bytes()
    return {"path": display_path, "bytes": len(data), "sha256": digest(data)}


def jsonl(path: Path) -> list[dict[str, object]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def telugu_dominant(value: str) -> bool:
    telugu = sum("\u0c00" <= character <= "\u0c7f" for character in value)
    latin = sum("a" <= character.lower() <= "z" for character in value)
    return telugu > latin


def decision_section(view: str, decision_id: str) -> str:
    marker = f"## {decision_id} — "
    if view.count(marker) != 1:
        raise ValueError(f"Review view lacks a unique section for {decision_id}")
    return view.split(marker, 1)[1].split("\n## ", 1)[0]


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
    legacy_reviews = {item["review_id"]: item for item in json.loads(
        (data_dir / "EXPERT_REVIEW_LOG.json").read_text(encoding="utf-8")
    )["records"]}
    term_records = jsonl(data_dir / "TERM_DECISIONS.jsonl")
    correction_records = [item for item in jsonl(data_dir / "SOURCE_CORRECTIONS.jsonl")
                          if item["status"].startswith("applied") or
                          item["status"] == "source_proof_gap_disclosed_structural_qa_pass"]
    source_manifest = jsonl(data_dir / "SOURCE_MANIFEST.jsonl")
    expected_source_units = sum(
        (repo / "translation" / Path(str(item["source_path"]))).is_file()
        for item in source_manifest
    )
    if len(decisions) != len(term_records) + len(correction_records):
        raise ValueError("Decision count does not match the primary ledgers")
    if register["edition_release"]["source_units"] != expected_source_units:
        raise ValueError(
            "Edition coverage does not match translated files in SOURCE_MANIFEST.jsonl: "
            f"{register['edition_release']['source_units']} != {expected_source_units}"
        )
    generator = register["generator"]
    generator_path = repo / Path(generator["path_or_uri"])
    generator_bytes = generator_path.read_bytes()
    if len(generator_bytes) != generator.get("bytes") or digest(generator_bytes) != generator["sha256"]:
        raise ValueError("Generator artifact hash does not match the canonical register")

    decision_ids: set[str] = set()
    occurrence_ids: set[str] = set()
    checked_files: dict[str, str] = {}
    reader_status_counts: dict[str, int] = {}
    accepted_reader = repo / "output" / "html" / "full" / "index.html"
    reader_bytes = accepted_reader.read_bytes() if accepted_reader.is_file() else b""
    reader_hash = digest(reader_bytes) if reader_bytes else None
    reader_text = reader_bytes.decode("utf-8") if reader_bytes else ""
    evidence_file_refs = 0
    for decision in decisions:
        decision_id = decision["decision_id"]
        if decision_id in decision_ids:
            raise ValueError(f"Duplicate decision id {decision_id}")
        decision_ids.add(decision_id)
        if decision["record_kind"] == "terminology":
            primary_id = "REV-" + decision_id.removeprefix("te-Telu-IN-")
            primary_grade = legacy_reviews[primary_id]["confidence"]
            if primary_grade in {"moderate", "not_separately_graded", "mixed_provisional"} and decision["confidence"] == "high":
                raise ValueError(f"Ungraded/moderate primary term was promoted to high confidence: {decision_id}")
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
            if reader_status == "available":
                locator = occurrence["reader_locator"]
                if (locator["artifact_filename"] != "output/html/full/index.html"
                        or locator["artifact_sha256"] != reader_hash
                        or locator["profile"] != "full"
                        or f' id="{occurrence["unit_id"]}"' not in reader_text
                        or f'#{occurrence["unit_id"]}' not in locator["provenance"]):
                    raise ValueError(f"Unverified reader unit anchor: {occurrence_id}")
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
    full_english = (data_dir / "TRANSLATION_DECISIONS_FULL.en.md").read_text(encoding="utf-8")
    missing_readable_ids = sorted(decision_id for decision_id in decision_ids if decision_id not in full_text)
    if missing_readable_ids:
        raise ValueError(f"Full readable view omits decisions: {missing_readable_ids[:5]}")
    if (full_text.count("- నిపుణ సమీక్ష ప్రశ్న:") != len(decisions)
            or full_text.count("- విశ్వాసం/అనిశ్చితి:") != len(decisions)
            or any(decision_id not in full_english for decision_id in decision_ids)):
        raise ValueError("Telugu full view or English parallel view is incomplete")
    priority_expected = {
        decision["decision_id"]
        for decision in decisions
        if decision["review_priority"] in {"urgent", "high"}
    }
    priority_text = (data_dir / "PRIORITY_REVIEW.md").read_text(encoding="utf-8")
    priority_english = (data_dir / "PRIORITY_REVIEW.en.md").read_text(encoding="utf-8")
    if any(decision_id not in priority_text for decision_id in priority_expected):
        raise ValueError("Priority view omits at least one urgent/high decision")
    if (priority_text.count("- నిపుణ సమీక్ష ప్రశ్న:") != len(priority_expected)
            or priority_text.count("- విశ్వాసం/అనిశ్చితి:") != len(priority_expected)
            or any(decision_id not in priority_english for decision_id in priority_expected)):
        raise ValueError("Telugu priority view or English parallel view is incomplete")
    term_review_te = json.loads((data_dir / "TERM_RATIONALES_TE.json").read_text(encoding="utf-8"))
    term_alternatives_te = json.loads((data_dir / "TERM_ALTERNATIVES_TE.json").read_text(encoding="utf-8"))
    canon_passages_te = json.loads((data_dir / "CANON_PASSAGES_TE.json").read_text(encoding="utf-8"))
    primary_passages = {item["passage_id"] for item in jsonl(data_dir / "CANON_PASSAGES.jsonl")}
    if set(canon_passages_te) != primary_passages:
        raise ValueError("Telugu authority scope map differs from the primary passage ledger")
    for passage_id, passage in canon_passages_te.items():
        if any(not isinstance(passage.get(key), str) or len(passage[key]) < (8 if key == "region" else 15)
               or not telugu_dominant(passage[key]) for key in ("region", "role")):
            raise ValueError(f"Authority role or region lacks substantive Telugu text: {passage_id}")
    early_ids = {f"TE-T{index:03d}" for index in range(3, 81)}
    later_confidence_ids = {f"TE-T{index:03d}" for index in range(401, 413)}
    if set(term_review_te) != early_ids | later_confidence_ids:
        raise ValueError("Telugu rationale/confidence map lacks an affected term or has an unexpected term")
    for term_id in early_ids:
        review = term_review_te[term_id]
        for key in ("rationale", "confidence"):
            if not isinstance(review.get(key), str) or len(review[key]) < 35 or not telugu_dominant(review[key]):
                raise ValueError(f"Early review field lacks substantive Telugu text: {term_id} {key}")
    for term_id in later_confidence_ids:
        review = term_review_te[term_id]
        if set(review) != {"confidence"} or len(review["confidence"]) < 35 or not telugu_dominant(review["confidence"]):
            raise ValueError(f"Later English-only confidence detail not localized: {term_id}")
    terminology = [item for item in decisions if item["record_kind"] == "terminology"]
    expected_alternative_ids = {
        item["decision_id"].removeprefix("te-Telu-IN-")
        for item in terminology[:80] if item["alternatives"]
    }
    if set(term_alternatives_te) != expected_alternative_ids:
        raise ValueError("Telugu alternative map differs from early primary terminology decisions")
    for decision in terminology:
        term_id = decision["decision_id"].removeprefix("te-Telu-IN-")
        full_section = decision_section(full_text, decision["decision_id"])
        priority_section = decision_section(priority_text, decision["decision_id"]) if decision["decision_id"] in priority_expected else None
        for section in (full_section, priority_section):
            if section is None:
                continue
            review = term_review_te.get(term_id, {})
            if "rationale" in review and review["rationale"] not in section:
                raise ValueError(f"Specific Telugu rationale not rendered: {term_id}")
            if "confidence" in review and review["confidence"] not in section:
                raise ValueError(f"Specific Telugu confidence detail not rendered: {term_id}")
            if term_id in early_ids and "స్థిర మూలంలోని “" in section:
                raise ValueError(f"Generic rationale remains in early Telugu view: {term_id}")
            for authority in decision["authorities_checked"]:
                passage = canon_passages_te.get(authority["passage_id"])
                if passage and (passage["region"] not in section or passage["role"] not in section):
                    raise ValueError(f"Authority scope not rendered in Telugu: {term_id} {authority['passage_id']}")
            alternatives = term_alternatives_te.get(term_id, [])
            if term_id in expected_alternative_ids and len(alternatives) != len(decision["alternatives"]):
                raise ValueError(f"Alternative count changed in Telugu view: {term_id}")
            for alternative in alternatives:
                if (len(alternative.get("reason", "")) < 15 or not telugu_dominant(alternative["reason"])
                        or alternative["rendering"] not in section or alternative["reason"] not in section):
                    raise ValueError(f"Alternative and reason not substantively rendered: {term_id}")
    for decision in decisions:
        section = decision_section(full_text, decision["decision_id"])
        alternative_line = next((line for line in section.splitlines() if line.startswith("- ఇతర ఎంపికలు: ")), "")
        rendered_count = sum(alternative_line.count(f"({label}:") for label in (
            "పరిశీలించదగిన ప్రత్యామ్నాయం", "తిరస్కరించిన ఎంపిక", "వేరే భావానికి", "వేరే శైలికి"
        ))
        if rendered_count != len(decision["alternatives"]):
            raise ValueError(f"Review alternatives not fully rendered: {decision['decision_id']}")
        if decision["alternatives"] and (not telugu_dominant(alternative_line)
                                         or "వివరణాత్మక కారణాలు సమాంతర ఆంగ్ల నమోదులో ఉన్నాయి" in alternative_line
                                         or "Leaving reader-visible explanatory prose untranslated" in alternative_line
                                         or "Translate the defective source wording" in alternative_line):
            raise ValueError(f"Review alternatives retain untranslated explanation: {decision['decision_id']}")
    start_here = (data_dir / "START_HERE.md").read_text(encoding="utf-8")
    if ("722/722" not in start_here or "నిర్ణయాలు" not in start_here
            or "తొలి 80 పదజాల నిర్ణయాల నిర్దిష్ట ఆధార-పరిమితులు" not in start_here
            or "సాక్ష్యపు పూర్తి సూక్ష్మ పరిమితులు ఆంగ్ల సమాంతర నమోదులో ఉన్నాయి" in start_here
            or start_here != (data_dir / "START_HERE.te.md").read_text(encoding="utf-8")
            or not (data_dir / "START_HERE.en.md").is_file()):
        raise ValueError("Current Telugu review entry point or English parallel view is incomplete")
    for identifier in ("te-Telu-IN-TE-T001", "te-Telu-IN-TE-T002", "te-Telu-IN-TE-T005", "te-Telu-IN-TE-T006", "te-Telu-IN-TE-T007", "te-Telu-IN-TE-T010"):
        selected = next(item for item in decisions if item["decision_id"] == identifier)
        if selected["confidence"] != "medium" or not selected["provisional"]:
            raise ValueError(f"Conservative confidence reconciliation regressed: {identifier}")

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
            "reader_pages_never_guessed": all(
                occurrence["reader_locator"].get("printed_page") is None
                and occurrence["reader_locator"].get("assembled_pdf_page") is None
                for decision in decisions for occurrence in decision["occurrences"]
            ),
            "accepted_html_unit_anchors_verified": reader_status_counts.get("available", 0) == len(occurrence_ids) if register["edition_release"]["coverage_state"] == "complete" else True,
            "full_readable_view_complete": True,
            "priority_view_complete": True,
            "early_term_specific_rationales_and_confidence_rendered": True,
            "later_english_confidence_details_rendered": True,
            "alternative_reasons_and_term_authority_scope_rendered": True,
            "telugu_review_questions_present": True,
            "english_parallel_views_preserved": True,
            "primary_confidence_reconciled": True,
            "occurrence_csv_reconciled": True,
        },
        "artifacts": artifacts,
    }
    output = data_dir / "TRANSLATION_DECISION_QA.json"
    output.write_text(json.dumps(qa, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"status": "pass", **qa["counts"], "qa": artifact(output, "evidence/TRANSLATION_DECISION_QA.json")}))


if __name__ == "__main__":
    main()

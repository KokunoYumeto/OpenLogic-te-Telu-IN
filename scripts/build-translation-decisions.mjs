import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dataArg = process.argv.find(arg => arg.startsWith('--data-dir='));
if (process.argv.some(arg => arg.startsWith('--') && !arg.startsWith('--data-dir='))) {
  throw new Error('Unknown option');
}
const dataDir = dataArg ? path.resolve(dataArg.slice(11)) : path.join(root, 'evidence');
const slash = value => value.replaceAll('\\', '/');
const readJsonl = name => fs.readFileSync(path.join(dataDir, name), 'utf8').trim().split(/\r?\n/).map(JSON.parse);
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const fileInfo = file => {
  const data = fs.readFileSync(file);
  return {bytes: data.length, sha256: sha256(data)};
};
const publicArtifact = (relativePath, version_or_ref) => {
  const info = fileInfo(path.join(dataDir, relativePath));
  return {
    path_or_uri: `evidence/${slash(relativePath)}`,
    bytes: info.bytes,
    sha256: info.sha256,
    ...(version_or_ref ? {version_or_ref} : {})
  };
};

const terms = readJsonl('TERM_DECISIONS.jsonl');
const passages = Object.fromEntries(readJsonl('CANON_PASSAGES.jsonl').map(item => [item.passage_id, item]));
const sources = Object.fromEntries(readJsonl('CANON_SOURCES.jsonl').map(item => [item.source_id, item]));
const corrections = readJsonl('SOURCE_CORRECTIONS.jsonl').filter(item => item.status.startsWith('applied'));
const ledger = readJsonl('SEGMENT_CANON_USE.jsonl');
const segments = Object.fromEntries(ledger.map(item => [item.segment_id, item]));
const legacy = JSON.parse(fs.readFileSync(path.join(dataDir, 'EXPERT_REVIEW_LOG.json'), 'utf8')).records;
const legacyById = Object.fromEntries(legacy.map(item => [item.review_id, item]));

const edition = Object.freeze({
  edition_id: 'openlogic-te-Telu-IN',
  language_tag: 'te-Telu-IN',
  language_name: 'Telugu',
  script: 'Telu',
  territory: 'IN',
  locale: 'te-Telu-IN',
  register_or_variant: 'standard formal Telugu',
  notation_profile: 'international logical and mathematical notation with Arabic decimal digits and Latin metavariables',
  layer_type: 'semantic_translation',
  parent_semantic_edition_id: null
});

const artifactRefs = {
  terms: publicArtifact('TERM_DECISIONS.jsonl', 'partial-108-of-722'),
  passages: publicArtifact('CANON_PASSAGES.jsonl', 'consulted-passage-index'),
  corrections: publicArtifact('SOURCE_CORRECTIONS.jsonl', 'applied-source-corrections')
};

const lineStarts = text => {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') starts.push(index + 1);
  }
  return starts;
};

const locateLines = ({repoPath, fileId, expectedSha, start, end, term, intendedSense, context}) => {
  const absolutePath = path.join(root, ...slash(repoPath).split('/'));
  const buffer = fs.readFileSync(absolutePath);
  const actualSha = sha256(buffer);
  if (actualSha !== expectedSha) throw new Error(`File hash mismatch for ${repoPath}: ${actualSha} != ${expectedSha}`);
  const text = buffer.toString('utf8');
  if (text !== text.normalize('NFC')) throw new Error(`Non-NFC file in decision locator: ${repoPath}`);
  const starts = lineStarts(text);
  if (start < 1 || end < start || end > starts.length) throw new Error(`Invalid lines ${start}-${end} in ${repoPath}`);
  const charStart = starts[start - 1];
  const charEnd = end < starts.length ? starts[end] : text.length;
  const excerpt = text.slice(charStart, charEnd).replaceAll('\r\n', '\n').trim();
  if (!excerpt) throw new Error(`Empty excerpt for ${repoPath}:${start}-${end}`);
  return {
    path: slash(repoPath),
    file_id: fileId,
    file_sha256: actualSha,
    line_span: {status: 'available', start, end},
    byte_span: {
      status: 'available',
      start: Buffer.byteLength(text.slice(0, charStart), 'utf8'),
      end_exclusive: Buffer.byteLength(text.slice(0, charEnd), 'utf8')
    },
    printed_page: null,
    excerpt,
    term,
    intended_sense: intendedSense,
    context
  };
};

const fileRange = (locator, fallbackStart, fallbackEnd) => {
  const match = locator?.match(/:(\d+)(?:-(\d+))?$/);
  return match ? {start: Number(match[1]), end: Number(match[2] ?? match[1])} : {start: fallbackStart, end: fallbackEnd};
};

const proseRanges = (locator, fallbackStart, fallbackEnd) => {
  const match = locator?.match(/^lines?\s+((?:\d+(?:-\d+)?(?:\s*(?:,\s*|and\s+))?)+)/i);
  if (!match) return [{start: fallbackStart, end: fallbackEnd}];
  const ranges = [...match[1].matchAll(/(\d+)(?:-(\d+))?/g)].map(item => ({start: Number(item[1]), end: Number(item[2] ?? item[1])}));
  return ranges;
};

const readerPending = () => ({
  status: 'pending',
  reason: 'The cited unit is not yet integrated into the coherent full reader; no printed or assembled PDF page is guessed.'
});

const uniqueArtifacts = refs => [...new Map(refs.map(ref => [`${ref.path_or_uri}\0${ref.sha256}`, ref])).values()];

const termEvidenceRefs = term => uniqueArtifacts([
  artifactRefs.terms,
  artifactRefs.passages,
  ...(term.passages ?? []).map(id => {
    const passage = passages[id];
    if (!passage) throw new Error(`Unknown passage ${id}`);
    return {
      path_or_uri: `private-canon://${passage.source_id}/pdf-page-${passage.pdf_page}`,
      sha256: passage.page_image_sha256,
      version_or_ref: passage.passage_id
    };
  })
]);

const authorityForPassage = (term, passageId) => {
  const passage = passages[passageId];
  const source = passage && sources[passage.source_id];
  if (!passage || !source) throw new Error(`Incomplete authority ${passageId}`);
  const directlyAttested = /^attested(?:$|_|-)/.test(term.status) || /attested_headwords/.test(term.status);
  return {
    authority_id: `${passage.source_id}:${passage.passage_id}`,
    citation: `${source.title} (${source.institution})`,
    passage_id: passage.passage_id,
    locator: `PDF page ${passage.pdf_page}; printed page ${passage.printed_page ?? 'not stated'}; ${passage.region}`,
    source_sha256: passage.source_sha256,
    passage_sha256: passage.page_image_sha256,
    status: directlyAttested ? 'checked_supports' : 'checked_context_only',
    note: passage.role
  };
};

const alternativeObjects = (values = []) => values.flatMap(value => {
  if (/\(chosen\b/i.test(value)) return [];
  const rendering = value.replace(/\s*\([^)]*\)\s*$/u, '').trim();
  if (!rendering || /^No separate alternative was recorded/i.test(rendering)) return [];
  const parenthetical = value.match(/\(([^)]*)\)\s*$/u)?.[1];
  let disposition = 'viable_alternative';
  if (/not adopted|rejected/i.test(value)) disposition = 'rejected';
  else if (/other sense/i.test(value)) disposition = 'reserved_for_other_sense';
  else if (/other register/i.test(value)) disposition = 'reserved_for_other_register';
  return [{
    rendering,
    disposition,
    reason: parenthetical || 'Recorded as a reversible alternative in the legacy decision ledger.'
  }];
});

const termConfidence = term => {
  const uncertainty = term.uncertainty ?? '';
  if (/high(?:\s|-)*(?:nomenclatural|lexical)|medium-high/i.test(uncertainty) || /provisional_(?:descriptive|philosophical|formal)/.test(term.status)) return 'low';
  if (/^attested$|^attested_after_postdraft_review$/.test(term.status) && !uncertainty) return 'high';
  if (/^attested(?:_|$)/.test(term.status) && /^Low(?:\b|$)/i.test(uncertainty)) return 'high';
  return 'medium';
};

const oneLine = value => String(value ?? '').replace(/\s+/gu, ' ').trim();
const questionFor = record => {
  const question = oneLine(record.precise_review_questions.join(' '));
  if (!question.startsWith('Please double-check')) throw new Error(`Review question lacks required lead-in: ${record.review_id}`);
  return question;
};

const termDecisions = terms.map(term => {
  const record = legacyById[`REV-${term.term_id}`];
  if (!record) throw new Error(`Missing legacy record for ${term.term_id}`);
  const intendedSense = term.scope ?? `The OpenLogic technical sense or grouped senses of “${term.source_term}” instantiated by the cited definitions, formulas, examples, and proofs; this is not an unrestricted claim about every everyday or specialist use.`;
  const decisionId = `te-Telu-IN-${term.term_id}`;
  const occurrences = record.implementation_locations.map((location, index) => {
    const segment = segments[location.segment_id];
    if (!segment) throw new Error(`Missing segment ${location.segment_id}`);
    const sourceRange = fileRange(location.source_locator, segment.source_start_line, segment.source_end_line);
    const targetRange = fileRange(location.target_locator, segment.target_start_line, segment.target_end_line);
    return {
      occurrence_id: `${decisionId}-OCC-${String(index + 1).padStart(3, '0')}`,
      unit_id: location.unit_id,
      semantic_unit_id: location.segment_id,
      part_title: null,
      chapter_title: null,
      section_title: location.section_path,
      source: locateLines({
        repoPath: `upstream/${location.source_file.replace(/^upstream\//, '')}`,
        fileId: `${location.unit_id}:source`,
        expectedSha: location.source_unit_sha256,
        ...sourceRange,
        term: term.source_term,
        intendedSense,
        context: `Recorded terminology occurrence; legacy locator ${location.source_locator}.`
      }),
      target: locateLines({
        repoPath: location.target_file,
        fileId: `${location.unit_id}:target:te-Telu-IN`,
        expectedSha: location.translation_unit_sha256,
        ...targetRange,
        term: term.telugu,
        intendedSense,
        context: `Accepted Telugu rendering; legacy locator ${location.target_locator}.`
      }),
      reader_locator: readerPending(),
      evidence_refs: termEvidenceRefs(term)
    };
  });
  const confidence = termConfidence(term);
  const provisional = !/^attested$|^attested_after_postdraft_review$/.test(term.status) || confidence !== 'high';
  return {
    decision_id: decisionId,
    supersedes: [],
    record_kind: 'terminology',
    recording_mode: 'retrospective',
    edition,
    source_term_or_construction: term.source_term,
    intended_sense: intendedSense,
    chosen_rendering: term.telugu,
    rationale: record.rationale,
    authorities_checked: (term.passages ?? []).map(id => authorityForPassage(term, id)),
    alternatives: alternativeObjects(record.alternatives_considered_or_recorded),
    confidence,
    confidence_reason: term.uncertainty ?? `The primary record labels the evidence status ${term.status}; no separate confidence grade was recorded, so this adapter assigns a conservative medium grade.`,
    provisional,
    review_priority: confidence === 'low' ? 'high' : confidence === 'medium' ? 'normal' : 'low',
    expert_review_useful: true,
    expert_review_reason: 'A Telugu logic or mathematics specialist can assess idiom and established nomenclature without changing the source-controlled mathematical sense.',
    please_double_check_question: questionFor(record),
    occurrences
  };
});

const auditFileCache = new Map();
const walk = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const dataFiles = walk(path.join(dataDir, 'source-audits'));
const auditArtifact = (expectedSha, basename, version) => {
  const key = `${expectedSha}\0${basename}`;
  if (!auditFileCache.has(key)) {
    const match = dataFiles.find(file => path.basename(file) === basename && fileInfo(file).sha256 === expectedSha);
    auditFileCache.set(key, match ? path.relative(dataDir, match) : null);
  }
  const relativePath = auditFileCache.get(key);
  return relativePath
    ? publicArtifact(relativePath, version)
    : {path_or_uri: `private-audit://${version}/${basename}`, sha256: expectedSha, version_or_ref: version};
};

const correctionDecisions = corrections.map(correction => {
  const record = legacyById[`REV-${correction.finding_id}`];
  if (!record) throw new Error(`Missing legacy record for ${correction.finding_id}`);
  const location = record.implementation_locations[0];
  const segment = segments[location.segment_id];
  if (!segment) throw new Error(`Missing segment ${location.segment_id}`);
  const sourceRanges = proseRanges(correction.source_locator, segment.source_start_line, segment.source_end_line);
  const targetRange = fileRange(correction.target_locator, segment.target_start_line, segment.target_end_line);
  const decisionId = `te-Telu-IN-${correction.finding_id}`;
  const intendedSense = `Repair the audited ${correction.classification.replaceAll('_', ' ')} at ${correction.source_locator}, preserving unaffected notation and argument structure.`;
  const reviewArtifact = auditArtifact(correction.audit_review_sha256, 'REVIEW.md', correction.audit_id);
  const findingsArtifact = auditArtifact(correction.audit_findings_sha256, 'FINDINGS.json', correction.finding_id);
  return {
    decision_id: decisionId,
    supersedes: [],
    record_kind: 'source_correction',
    recording_mode: 'contemporaneous',
    edition,
    source_term_or_construction: `${correction.finding_id}: ${correction.classification.replaceAll('_', ' ')}`,
    intended_sense: intendedSense,
    chosen_rendering: correction.body_treatment,
    rationale: `The bounded source audit identified the defect against the frozen source unit and controlling local mathematics. The translation applies only the recorded repair and discloses it adjacent to the affected passage.`,
    authorities_checked: [{
      authority_id: `${correction.audit_id}:${correction.finding_id}`,
      citation: `Bounded OpenLogic source audit ${correction.audit_id}, finding ${correction.finding_id}`,
      passage_id: correction.finding_id,
      locator: `${correction.source_path}; ${correction.source_locator}`,
      source_sha256: correction.source_sha256,
      passage_sha256: correction.audit_findings_sha256,
      status: 'checked_supports',
      note: `${correction.classification}; ${correction.body_treatment}.`
    }],
    alternatives: [{
      rendering: 'Translate the defective source wording or formula verbatim.',
      disposition: 'rejected',
      reason: 'That would knowingly reproduce the audited defect and conflict with the controlling local mathematics.'
    }],
    confidence: 'high',
    confidence_reason: 'The correction is fixed by the cited source audit, exact source bytes, and correction-aware structural comparison; only specialist assessment of Telugu disclosure phrasing remains useful.',
    provisional: false,
    review_priority: 'normal',
    expert_review_useful: true,
    expert_review_reason: 'Optional specialist review can improve the clarity of the Telugu disclosure without reopening the source-fixed mathematical repair.',
    please_double_check_question: questionFor(record),
    occurrences: sourceRanges.map((sourceRange, index) => {
      const alignedSegment = ledger.find(item =>
        item.unit_id === correction.unit_id &&
        item.source_path === correction.source_path &&
        item.source_start_line <= sourceRange.start &&
        item.source_end_line >= sourceRange.start
      ) ?? segment;
      return {
        occurrence_id: `${decisionId}-OCC-${String(index + 1).padStart(3, '0')}`,
        unit_id: correction.unit_id,
        semantic_unit_id: alignedSegment.segment_id,
        part_title: null,
        chapter_title: null,
        section_title: location.section_path,
        source: locateLines({
          repoPath: `upstream/${correction.source_path}`,
          fileId: `${correction.unit_id}:source`,
          expectedSha: correction.source_sha256,
          ...sourceRange,
          term: correction.finding_id,
          intendedSense,
          context: correction.source_locator
        }),
        target: locateLines({
          repoPath: location.target_file,
          fileId: `${correction.unit_id}:target:te-Telu-IN`,
          expectedSha: location.translation_unit_sha256,
          ...targetRange,
          term: correction.finding_id,
          intendedSense,
          context: correction.target_locator
        }),
        reader_locator: readerPending(),
        evidence_refs: uniqueArtifacts([artifactRefs.corrections, reviewArtifact, findingsArtifact])
      };
    })
  };
});

const decisions = [...termDecisions, ...correctionDecisions];
const occurrenceCount = decisions.reduce((sum, decision) => sum + decision.occurrences.length, 0);
const generatorInfo = fileInfo(import.meta.filename);
const canonical = {
  schema_version: 'openlogic-translation-decisions/1.0.0',
  edition_release: {
    edition,
    release_tag: null,
    repository: 'https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN',
    doi: null,
    source_revision: '9620cc73f9c8e0ad003c514a5d3748f29611c4c0',
    coverage_state: 'partial',
    source_units: 108,
    reader_units: null
  },
  generator: {
    path_or_uri: 'scripts/build-translation-decisions.mjs',
    bytes: generatorInfo.bytes,
    sha256: generatorInfo.sha256,
    version_or_ref: 'canonical-schema-adapter-v1'
  },
  decisions
};
fs.writeFileSync(path.join(dataDir, 'DECISIONS.json'), `${JSON.stringify(canonical, null, 2)}\n`);

const lineLabel = span => span.status === 'available' ? `${span.start}${span.end === span.start ? '' : `-${span.end}`}` : span.status;
const byteLabel = span => span.status === 'available' ? `${span.start}-${span.end_exclusive}` : span.status;
const full = [
  '# Full translation-decision register',
  '',
  `Edition: **${edition.language_tag} / ${edition.script} / ${edition.register_or_variant}**. Coverage: **108 of 722 source units drafted**. This readable view contains all ${decisions.length} decisions and ${occurrenceCount} recorded occurrences.`,
  '',
  'Final reader/PDF page locators remain pending until the cited units are integrated into the coherent reader. Source and target file, line, byte, unit, semantic-unit, and SHA-256 locators are authoritative now. No decision creates a translation hold.',
  ''
];
for (const decision of decisions) {
  full.push(
    `## ${decision.decision_id} — ${oneLine(decision.source_term_or_construction)}`,
    '',
    `- Kind / recording mode: ${decision.record_kind} / ${decision.recording_mode}`,
    '',
    `- Chosen rendering or treatment: ${oneLine(decision.chosen_rendering)}`,
    '',
    `- Intended sense: ${oneLine(decision.intended_sense)}`,
    '',
    `- Locale / script / form: ${edition.language_tag} / ${edition.script} / ${edition.register_or_variant}`,
    '',
    `- Confidence / provisional / priority: ${decision.confidence} / ${decision.provisional} / ${decision.review_priority}`,
    '',
    `- Confidence reason: ${oneLine(decision.confidence_reason)}`,
    '',
    `- Rationale: ${oneLine(decision.rationale)}`,
    '',
    `- Authorities checked: ${decision.authorities_checked.map(authority => `${authority.authority_id} [${authority.status}], ${authority.locator ?? 'no locator'}; ${authority.note}`).join(' | ')}`,
    '',
    `- Alternatives: ${decision.alternatives.length ? decision.alternatives.map(item => `${item.rendering} [${item.disposition}: ${item.reason}]`).join(' | ') : 'None separately recorded.'}`,
    '',
    `- Review question: ${decision.please_double_check_question}`,
    '',
    '- Occurrences:',
    ''
  );
  for (const occurrence of decision.occurrences) {
    full.push(`  - ${occurrence.occurrence_id}; ${occurrence.unit_id}; ${occurrence.semantic_unit_id}; source ${occurrence.source.path}:${lineLabel(occurrence.source.line_span)} bytes ${byteLabel(occurrence.source.byte_span)} SHA-256 ${occurrence.source.file_sha256}; target ${occurrence.target.path}:${lineLabel(occurrence.target.line_span)} bytes ${byteLabel(occurrence.target.byte_span)} SHA-256 ${occurrence.target.file_sha256}; reader page pending.`);
  }
  full.push('');
}
fs.writeFileSync(path.join(dataDir, 'TRANSLATION_DECISIONS_FULL.md'), `${full.join('\n').trimEnd()}\n`);

const priorityDecisions = decisions.filter(decision => decision.review_priority === 'urgent' || decision.review_priority === 'high');
const priority = [
  '# Priority review',
  '',
  `This view contains ${priorityDecisions.length} of ${decisions.length} decisions marked urgent or high priority. Review is useful but never a release or translation hold.`,
  '',
  'Final reader pages remain pending; exact source and target file/line locators are shown.',
  ''
];
for (const decision of priorityDecisions) {
  priority.push(
    `## ${decision.decision_id} — ${oneLine(decision.source_term_or_construction)}`,
    '',
    `- Chosen rendering: ${oneLine(decision.chosen_rendering)}`,
    '',
    `- Confidence / provisional: ${decision.confidence} / ${decision.provisional}`,
    '',
    `- Occurrences: ${decision.occurrences.map(item => `${item.unit_id} ${item.target.path}:${lineLabel(item.target.line_span)}`).join('; ')}`,
    '',
    `- Review question: ${decision.please_double_check_question}`,
    ''
  );
}
fs.writeFileSync(path.join(dataDir, 'PRIORITY_REVIEW.md'), `${priority.join('\n').trimEnd()}\n`);

const occurrenceRows = decisions.flatMap(decision => decision.occurrences.map(occurrence => ({
  decision_id: decision.decision_id,
  occurrence_id: occurrence.occurrence_id,
  record_kind: decision.record_kind,
  recording_mode: decision.recording_mode,
  review_priority: decision.review_priority,
  confidence: decision.confidence,
  provisional: decision.provisional,
  source_term_or_construction: decision.source_term_or_construction,
  chosen_rendering: decision.chosen_rendering,
  language_tag: edition.language_tag,
  script: edition.script,
  territory: edition.territory,
  register_or_variant: edition.register_or_variant,
  notation_profile: edition.notation_profile,
  unit_id: occurrence.unit_id,
  semantic_unit_id: occurrence.semantic_unit_id,
  source_path: occurrence.source.path,
  source_file_sha256: occurrence.source.file_sha256,
  source_line_start: occurrence.source.line_span.start,
  source_line_end: occurrence.source.line_span.end,
  source_byte_start: occurrence.source.byte_span.start,
  source_byte_end_exclusive: occurrence.source.byte_span.end_exclusive,
  target_path: occurrence.target.path,
  target_file_sha256: occurrence.target.file_sha256,
  target_line_start: occurrence.target.line_span.start,
  target_line_end: occurrence.target.line_span.end,
  target_byte_start: occurrence.target.byte_span.start,
  target_byte_end_exclusive: occurrence.target.byte_span.end_exclusive,
  reader_status: occurrence.reader_locator.status,
  reader_page: occurrence.reader_locator.printed_page ?? '',
  reader_reason: occurrence.reader_locator.reason ?? '',
  please_double_check_question: decision.please_double_check_question
})));
const csvHeaders = Object.keys(occurrenceRows[0]);
const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const csv = [csvHeaders.map(csvCell).join(','), ...occurrenceRows.map(row => csvHeaders.map(header => csvCell(row[header])).join(','))].join('\n') + '\n';
fs.writeFileSync(path.join(dataDir, 'DECISION_OCCURRENCES.csv'), csv);

const startHere = `# Start here: Telugu translation decisions

Status: **partial — 108 of 722 source units drafted**. The canonical register currently contains **${decisions.length} decisions** (${termDecisions.length} terminology/sense decisions and ${correctionDecisions.length} source-correction decisions) with **${occurrenceCount} concrete occurrences**.

Use these views:

- [Full readable register](TRANSLATION_DECISIONS_FULL.md)
- [Priority review](PRIORITY_REVIEW.md)
- [Per-occurrence CSV](DECISION_OCCURRENCES.csv)
- [Canonical machine register](DECISIONS.json)
- [Canonical JSON Schema](translation-decision.schema.json)
- [Deterministic validation record](TRANSLATION_DECISION_QA.json)

The edition recommendation is one standard formal Telugu edition in Telugu script: **te-Telu-IN / Telu**. It preserves Arabic decimal digits, Latin metavariables, logic notation, and left-to-right mathematics. The evidence spans Telangana, Andhra Pradesh, and pre-bifurcation witnesses but is not an exhaustive regional survey; it does not currently justify a second Roman-script, AP/TS-split, Telugu-digit, or colloquial edition. This recommendation is reversible if later specialist evidence warrants a separate form.

No inspected source establishes a current Top 10 language ranking or a quantified adoption effect. Census, PISA, catalogue, and token-size evidence must not be presented as ranking evidence. Any future script, notation, pronunciation, or accessibility companion must be separately authored or deterministically generated and separately manifested; it neither replaces nor delays the faithful Telugu translation.

Every judgment-dependent item records its source-controlled sense, chosen rendering or treatment, rationale, checked authority, alternatives, confidence, provisional status, and a plain “Please double-check” question. Every occurrence binds a unit and semantic-unit identifier to source and target files, lines, byte spans, and SHA-256 hashes. Reader/PDF pages are explicitly pending until coherent-reader pagination exists; no page is guessed. Optional expert review remains useful and creates no translation hold.

The older \`EXPERT_REVIEW_*\` files remain as compatibility views. The canonical schema is copied byte-for-byte from OpenLogic-translations commit \`811091d54be4989918864732073279a588340e6f\`; its expected SHA-256 is \`50e7fa407b62c711f92f8b93be591d3b4a6e1c4adb1386c398bb5f76844d9f90\`.
`;
fs.writeFileSync(path.join(dataDir, 'START_HERE.md'), startHere);

console.log(JSON.stringify({
  schema_version: canonical.schema_version,
  decisions: decisions.length,
  terminology: termDecisions.length,
  source_corrections: correctionDecisions.length,
  priority: priorityDecisions.length,
  occurrences: occurrenceCount,
  status: 'partial_no_holds_reader_pages_pending'
}));

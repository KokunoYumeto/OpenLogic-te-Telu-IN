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
const corrections = readJsonl('SOURCE_CORRECTIONS.jsonl').filter(item => item.status.startsWith('applied') || item.status === 'source_proof_gap_disclosed_structural_qa_pass');
const ledger = readJsonl('SEGMENT_CANON_USE.jsonl');
const segments = Object.fromEntries(ledger.map(item => [item.segment_id, item]));
const legacy = JSON.parse(fs.readFileSync(path.join(dataDir, 'EXPERT_REVIEW_LOG.json'), 'utf8')).records;
const legacyById = Object.fromEntries(legacy.map(item => [item.review_id, item]));
const sourceManifest = readJsonl('SOURCE_MANIFEST.jsonl');
const sourceUnitTotal = sourceManifest.length;
const draftedSourceUnits = sourceManifest.filter(item => fs.existsSync(path.join(root, 'translation', ...slash(item.source_path).split('/')))).length;
const coverageVersion = `${draftedSourceUnits}-of-${sourceUnitTotal}-source-units`;

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
  terms: publicArtifact('TERM_DECISIONS.jsonl', coverageVersion),
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

const htmlReader = path.join(root, 'output', 'html', 'full', 'index.html');
const htmlQaPath = path.join(dataDir, 'FULL-HTML-QA.json');
const htmlQa = fs.existsSync(htmlQaPath) ? JSON.parse(fs.readFileSync(htmlQaPath, 'utf8')) : null;
const acceptedReader = draftedSourceUnits === sourceUnitTotal && htmlQa?.status === 'COMPLETE_PASS' &&
  htmlQa.units === sourceUnitTotal && fs.existsSync(htmlReader) &&
  htmlQa.files?.some(item => item.name === 'index.html' && item.sha256 === fileInfo(htmlReader).sha256);
const readerSha = acceptedReader ? fileInfo(htmlReader).sha256 : null;
const readerLocator = unitId => acceptedReader ? {
  status: 'available',
  artifact_filename: 'output/html/full/index.html',
  artifact_sha256: readerSha,
  profile: 'full',
  printed_page: null,
  assembled_pdf_page: null,
  provenance: `Verified complete HTML reader, unit-level anchor #${unitId}; source/target line and byte spans locate the exact occurrence. A PDF occurrence page is not asserted.`
} : {
  status: 'pending',
  reason: 'The integrated HTML reader has not passed complete QA; no reader or PDF page locator is asserted.'
};

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
  // An attestation is not a separately graded high-confidence decision. In the
  // primary ledger, "Low" describes uncertainty, not the confidence grade.
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
      reader_locator: readerLocator(location.unit_id),
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
    confidence_reason: record.confidence === 'moderate'
      ? `The primary review grades this moderate (represented here as medium). Its uncertainty note is not a confidence grade: ${term.uncertainty ?? 'No separate uncertainty note was recorded.'}`
      : term.uncertainty ?? `The primary record labels the evidence status ${term.status}; no separate confidence grade was recorded, so this adapter assigns a conservative ${confidence} grade.`,
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
  const linkedSegments = ledger.filter(item =>
    item.unit_id === correction.unit_id &&
    item.source_path === correction.source_path &&
    item.source_corrections?.includes(correction.finding_id)
  );
  if (!linkedSegments.length) throw new Error(`Missing correction links for ${correction.finding_id}`);
  const sourceRanges = proseRanges(correction.source_locator, segment.source_start_line, segment.source_end_line);
  const targetRange = fileRange(correction.target_locator, segment.target_start_line, segment.target_end_line);
  const decisionId = `te-Telu-IN-${correction.finding_id}`;
  const qualified = correction.qualification?.disposition === 'rejected_false_positive';
  const proofGap = ['OLTELAMALP-005', 'OLTELAMALP-006', 'OLTELAMCRPB-003', 'OLTELAMCRB-001', 'OLTELAMCRB-003', 'OLTELAMCRPBE-002', 'OLTELAMCRPBE-003', 'OLTELAMCRPBE-004', 'OLTELAMCRPBE-005', 'OLTELAMCRBE-001', 'OLTELAMCRBE-002', 'OLTELAMCRBE-003', 'OLTELAMCRBE-004'].includes(correction.finding_id);
  const intendedSense = qualified
    ? `Preserve the valid source construction at ${correction.source_locator}, present its equivalent explicit notation for readability, and record that the historical error classification was rejected as a false positive.`
    : proofGap
    ? `Preserve the source argument at ${correction.source_locator}, disclose the identified definition or proof limitation, and do not claim to have supplied a complete proof.`
    : `Repair the audited ${correction.classification.replaceAll('_', ' ')} at ${correction.source_locator}, preserving unaffected notation and argument structure.`;
  const reviewArtifact = auditArtifact(correction.audit_review_sha256, 'REVIEW.md', correction.audit_id);
  const findingsArtifact = auditArtifact(correction.audit_findings_sha256, 'FINDINGS.json', correction.finding_id);
  const qualificationArtifact = correction.qualification?.review_path
    ? publicArtifact(correction.qualification.review_path.replace(/^evidence\//u, ''), correction.qualification.disposition)
    : null;
  const evidenceRefs = uniqueArtifacts([artifactRefs.corrections, reviewArtifact, findingsArtifact, ...(qualificationArtifact ? [qualificationArtifact] : [])]);
  const mappedOccurrences = linkedSegments.length === 1
    ? sourceRanges.map(sourceRange => {
        const alignedSegment = ledger.find(item =>
          item.unit_id === correction.unit_id &&
          item.source_path === correction.source_path &&
          item.source_start_line <= sourceRange.start &&
          item.source_end_line >= sourceRange.start
        ) ?? segment;
        return {alignedSegment, sourceRange, targetRange};
      })
    : linkedSegments.flatMap(alignedSegment => {
        const intersections = sourceRanges.flatMap(range => {
          const start = Math.max(range.start, alignedSegment.source_start_line);
          const end = Math.min(range.end, alignedSegment.source_end_line);
          return start <= end ? [{start, end}] : [];
        });
        const mappedSourceRanges = intersections.length
          ? intersections
          : [{start: alignedSegment.source_start_line, end: alignedSegment.source_end_line}];
        return mappedSourceRanges.map(sourceRange => ({
          alignedSegment,
          sourceRange,
          targetRange: {
            start: alignedSegment.target_start_line,
            end: alignedSegment.target_end_line,
          },
        }));
      });
  return {
    decision_id: decisionId,
    supersedes: [],
    record_kind: 'source_correction',
    recording_mode: 'contemporaneous',
    edition,
    source_term_or_construction: qualified
      ? `${correction.finding_id}: historical ${correction.classification.replaceAll('_', ' ')} classification (rejected false positive)`
      : `${correction.finding_id}: ${correction.classification.replaceAll('_', ' ')}`,
    intended_sense: intendedSense,
    chosen_rendering: correction.body_treatment,
    rationale: qualified
      ? `A later consolidation review established that the nested source notation is valid because \\cardeq takes two mandatory arguments. The historical audit claim remains traceable, while the target gives the equivalent two explicit comparisons and its adjacent note records the rejected-false-positive disposition.`
      : proofGap
      ? `The bounded source audit identified an unresolved definition or proof limitation. The target keeps the printed argument with an adjacent disclosure; structural QA checks preservation and does not complete the mathematical proof.`
      : `The bounded source audit identified the defect against the frozen source unit and controlling local mathematics. The translation applies only the recorded repair and discloses it adjacent to the affected passage.`,
    authorities_checked: [{
      authority_id: `${correction.audit_id}:${correction.finding_id}`,
      citation: `Bounded OpenLogic source audit ${correction.audit_id}, finding ${correction.finding_id}`,
      passage_id: correction.finding_id,
      locator: `${correction.source_path}; ${correction.source_locator}`,
      source_sha256: correction.source_sha256,
      passage_sha256: correction.audit_findings_sha256,
      status: 'checked_supports',
      note: qualified
        ? `Historical classification ${correction.classification}, superseded by ${correction.qualification.disposition}; ${correction.body_treatment}.`
        : `${correction.classification}; ${correction.body_treatment}.`
    }],
    alternatives: qualified ? [{
      rendering: 'Retain the valid nested cardinality construction verbatim.',
      disposition: 'viable_alternative',
      reason: 'It is mathematically valid, but the two explicit comparisons are clearer in the Telugu target.'
    }] : proofGap ? [{
      rendering: 'Present the source proof as complete without qualifying the unsupported step.',
      disposition: 'rejected',
      reason: 'The identified missing definition, side condition or derivation has not been supplied.'
    }] : [{
      rendering: 'Translate the defective source wording or formula verbatim.',
      disposition: 'rejected',
      reason: 'That would knowingly reproduce the audited defect and conflict with the controlling local mathematics.'
    }],
    confidence: proofGap ? 'low' : 'high',
    confidence_reason: qualified
      ? 'The notation expansion and the proof establish mathematical equivalence, and the cited consolidation review rejects the former defect claim; only specialist assessment of Telugu qualification phrasing remains useful.'
      : proofGap
      ? 'The unresolved definition or proof step was identified against the frozen source; no complete replacement proof has been established, and structural parity is not a proof check.'
      : 'The correction is fixed by the cited source audit, exact source bytes, and correction-aware structural comparison; only specialist assessment of Telugu disclosure phrasing remains useful.',
    provisional: proofGap,
    review_priority: proofGap ? 'high' : 'normal',
    expert_review_useful: true,
    expert_review_reason: qualified
      ? 'Optional specialist review can improve the clarity of the Telugu qualification without reopening the consolidation review’s mathematical disposition.'
      : proofGap
      ? 'A mathematical reviewer could construct or check a complete proof and assess the Telugu disclosure; the current edition claims no such completion.'
      : 'Optional specialist review can improve the clarity of the Telugu disclosure without reopening the source-fixed mathematical repair.',
    please_double_check_question: questionFor(record),
    occurrences: mappedOccurrences.map(({alignedSegment, sourceRange, targetRange: mappedTargetRange}, index) => {
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
          expectedSha: alignedSegment.translation_unit_sha256,
          ...mappedTargetRange,
          term: correction.finding_id,
          intendedSense,
          context: linkedSegments.length === 1
            ? correction.target_locator
            : `${correction.target_locator}; mapped segment ${alignedSegment.segment_id}`
        }),
        reader_locator: readerLocator(correction.unit_id),
        evidence_refs: evidenceRefs
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
    coverage_state: acceptedReader ? 'complete' : 'partial',
    source_units: draftedSourceUnits,
    reader_units: acceptedReader ? sourceUnitTotal : null
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

const termByDecisionId = new Map(terms.map(term => [`te-Telu-IN-${term.term_id}`, term]));
const correctionByDecisionId = new Map(corrections.map(item => [`te-Telu-IN-${item.finding_id}`, item]));
const termReviewTe = JSON.parse(fs.readFileSync(path.join(dataDir, 'TERM_RATIONALES_TE.json'), 'utf8'));
const canonPassagesTe = JSON.parse(fs.readFileSync(path.join(dataDir, 'CANON_PASSAGES_TE.json'), 'utf8'));
const termAlternativesTe = JSON.parse(fs.readFileSync(path.join(dataDir, 'TERM_ALTERNATIVES_TE.json'), 'utf8'));
const hasTelugu = value => /[\u0c00-\u0c7f]/u.test(value ?? '');
const isTeluguDominant = value => {
  const telugu = (value?.match(/[\u0c00-\u0c7f]/gu) ?? []).length;
  const latin = (value?.match(/[a-z]/giu) ?? []).length;
  return telugu > latin;
};
const correctionNote = correction => {
  const targetPath = path.join(root, ...slash(correction.target_locator.split(':')[0]).split('/'));
  const source = fs.readFileSync(targetPath, 'utf8');
  const marker = new RegExp(`\\\\sourcecorrection\\s*\\{\\s*${correction.finding_id}\\s*\\}\\s*\\{`, 'gu');
  const match = marker.exec(source);
  if (!match) throw new Error(`Missing Telugu source-correction note for ${correction.finding_id}`);
  let depth = 1;
  let end = match.index + match[0].length;
  for (; end < source.length && depth; end += 1) {
    if (source[end - 1] === '\\') continue;
    if (source[end] === '{') depth += 1;
    else if (source[end] === '}') depth -= 1;
  }
  if (depth) throw new Error(`Unclosed source-correction note for ${correction.finding_id}`);
  const note = source.slice(match.index + match[0].length, end - 1).trim();
  if (!hasTelugu(note)) throw new Error(`Source-correction note is not Telugu for ${correction.finding_id}`);
  return note;
};
const correctionNotes = new Map(corrections.map(item => [item.finding_id, correctionNote(item)]));

const lineLabel = span => span.status === 'available' ? `${span.start}${span.end === span.start ? '' : `-${span.end}`}` : span.status;
const byteLabel = span => span.status === 'available' ? `${span.start}-${span.end_exclusive}` : span.status;
const full = [
  '# Full translation-decision register',
  '',
  `Edition: **${edition.language_tag} / ${edition.script} / ${edition.register_or_variant}**. Coverage: **${draftedSourceUnits} of ${sourceUnitTotal} source units drafted**. This readable view contains all ${decisions.length} decisions and ${occurrenceCount} recorded occurrences.`,
  '',
  acceptedReader
    ? 'The accepted full HTML reader provides verified unit-level anchors. Source and target file, line, byte, unit, semantic-unit, and SHA-256 locators identify exact occurrences; PDF occurrence pages are not asserted. No decision creates a translation hold.'
    : 'Reader locators remain pending until integrated reader QA passes. Source and target file, line, byte, unit, semantic-unit, and SHA-256 locators are authoritative now. No decision creates a translation hold.',
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
    full.push(`  - ${occurrence.occurrence_id}; ${occurrence.unit_id}; ${occurrence.semantic_unit_id}; source ${occurrence.source.path}:${lineLabel(occurrence.source.line_span)} bytes ${byteLabel(occurrence.source.byte_span)} SHA-256 ${occurrence.source.file_sha256}; target ${occurrence.target.path}:${lineLabel(occurrence.target.line_span)} bytes ${byteLabel(occurrence.target.byte_span)} SHA-256 ${occurrence.target.file_sha256}; ${acceptedReader ? `reader output/html/full/index.html#${occurrence.unit_id} (unit-level; PDF occurrence page not asserted)` : 'reader locator pending'}.`);
  }
  full.push('');
}
fs.writeFileSync(path.join(dataDir, 'TRANSLATION_DECISIONS_FULL.en.md'), `${full.join('\n').trimEnd()}\n`);

const priorityDecisions = decisions.filter(decision => decision.review_priority === 'urgent' || decision.review_priority === 'high');
const priority = [
  '# Priority review',
  '',
  `This view contains ${priorityDecisions.length} of ${decisions.length} decisions marked urgent or high priority. Review is useful but never a release or translation hold.`,
  '',
  acceptedReader ? 'Accepted HTML unit anchors are recorded in the canonical register; PDF occurrence pages are not asserted. Exact source and target file/line locators are shown.' : 'Reader locators remain pending; exact source and target file/line locators are shown.',
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
fs.writeFileSync(path.join(dataDir, 'PRIORITY_REVIEW.en.md'), `${priority.join('\n').trimEnd()}\n`);

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
  reader_artifact: occurrence.reader_locator.artifact_filename ?? '',
  reader_anchor: occurrence.reader_locator.status === 'available' ? `#${occurrence.unit_id}` : '',
  reader_page: occurrence.reader_locator.printed_page ?? '',
  reader_reason: occurrence.reader_locator.reason ?? '',
  please_double_check_question: decision.please_double_check_question
})));
const csvHeaders = Object.keys(occurrenceRows[0]);
const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const csv = [csvHeaders.map(csvCell).join(','), ...occurrenceRows.map(row => csvHeaders.map(header => csvCell(row[header])).join(','))].join('\n') + '\n';
fs.writeFileSync(path.join(dataDir, 'DECISION_OCCURRENCES.csv'), csv);

const startHere = `# Start here: Telugu translation decisions

Status: **${acceptedReader ? 'complete reader coverage' : 'partial reader coverage'} — ${draftedSourceUnits} of ${sourceUnitTotal} source units translated**. The canonical register currently contains **${decisions.length} decisions** (${termDecisions.length} terminology/sense decisions and ${correctionDecisions.length} source-correction decisions) with **${occurrenceCount} concrete occurrences**.

Use these views:

- [Full readable register](TRANSLATION_DECISIONS_FULL.md)
- [Priority review](PRIORITY_REVIEW.md)
- [Per-occurrence CSV](DECISION_OCCURRENCES.csv)
- [Canonical machine register](DECISIONS.json)
- [Canonical JSON Schema](translation-decision.schema.json)
- [Deterministic validation record](TRANSLATION_DECISION_QA.json)

The edition recommendation is one standard formal Telugu edition in Telugu script: **te-Telu-IN / Telu**. It preserves Arabic decimal digits, Latin metavariables, logic notation, and left-to-right mathematics. The evidence spans Telangana, Andhra Pradesh, and pre-bifurcation witnesses but is not an exhaustive regional survey; it does not currently justify a second Roman-script, AP/TS-split, Telugu-digit, or colloquial edition. This recommendation is reversible if later specialist evidence warrants a separate form.

No inspected source establishes a current Top 10 language ranking or a quantified adoption effect. Census, PISA, catalogue, and token-size evidence must not be presented as ranking evidence. Any future script, notation, pronunciation, or accessibility companion must be separately authored or deterministically generated and separately manifested; it neither replaces nor delays the faithful Telugu translation.

Every judgment-dependent item records its source-controlled sense, chosen rendering or treatment, rationale, checked authority, alternatives, confidence, provisional status, and a plain “Please double-check” question. Every occurrence binds a unit and semantic-unit identifier to source and target files, lines, byte spans, and SHA-256 hashes. ${acceptedReader ? 'Accepted full HTML unit anchors are available and hashed; exact PDF occurrence pages are not asserted.' : 'Integrated reader locators remain pending release QA; no page is guessed.'} Optional expert review remains useful and creates no translation hold.

The older \`EXPERT_REVIEW_*\` files remain as compatibility views. The canonical schema is copied byte-for-byte from OpenLogic-translations commit \`811091d54be4989918864732073279a588340e6f\`; its expected SHA-256 is \`50e7fa407b62c711f92f8b93be591d3b4a6e1c4adb1386c398bb5f76844d9f90\`.
`;
fs.writeFileSync(path.join(dataDir, 'START_HERE.en.md'), startHere);

const teConfidence = value => ({high: 'అధిక', medium: 'మధ్యస్థ', low: 'తక్కువ'})[value] ?? value;
const tePriority = value => ({urgent: 'అత్యవసరం', high: 'ఎక్కువ', normal: 'సాధారణ', low: 'తక్కువ'})[value] ?? value;
const teBoolean = value => value ? 'అవును' : 'కాదు';
const sourceNoteQuote = note => note.split(/\r?\n/u).map(line => `> ${line}`).join('\n');
const termRationaleTe = decision => {
  const term = termByDecisionId.get(decision.decision_id);
  if (!term) throw new Error(`Missing primary term for ${decision.decision_id}`);
  if (termReviewTe[term.term_id]?.rationale) return oneLine(termReviewTe[term.term_id].rationale);
  if (isTeluguDominant(term.basis)) return oneLine(term.basis);
  if (isTeluguDominant(term.scope)) return oneLine(term.scope);
  if (term.term_id === 'TE-T001') return 'TE-P001లో గణిత సమితికి “సమితి” అనే వాడుక కనిపిస్తుంది. ఇక్కడి నిర్వచనాలు, సూత్రాలు మాత్రం స్థిర Open Logic మూలం నిర్ణయించినవే; ఆ పేజీని వాటికి స్వతంత్ర నిరూపణగా చూపడం లేదు.';
  if (term.term_id === 'TE-T002') return 'TE-P008లో సభ్యత్వ/చేర్పు సందర్భంలో “మూలకం” అనే వాడుక కనిపిస్తుంది. “సభ్యము” నమోదైన ప్రత్యామ్నాయం; మూలంలోని సభ్యత్వ నిర్వచనాన్ని ఈ పద ఎంపిక మార్చదు.';
  const refs = (term.passages ?? []).join(', ');
  return `స్థిర మూలంలోని “${oneLine(term.source_term)}” భావానికి “${oneLine(term.telugu)}” రూపాన్ని ఎంచుకున్నాం. ${refs ? `${refs} పేజీల వాడుక/సందర్భం, వాటి నమోదైన పరిమితులను పరిగణించాం.` : 'ఈ ప్రత్యేక రూపానికి ప్రత్యక్ష స్థానిక పేజీ ఆధారం నమోదు కాలేదు.'} ఖచ్చితమైన గణిత అర్థం మూల నిర్వచనాలు, సూత్రాలు, ఉదాహరణలకే లోబడి ఉంటుంది; ఆంగ్ల ప్రాథమిక వివరణ సమాంతర నమోదులో నిలిచింది.`;
};
const termConfidenceTe = decision => {
  const term = termByDecisionId.get(decision.decision_id);
  const grade = `నమోదైన విశ్వాస స్థాయి ${teConfidence(decision.confidence)}; ఇది ఎంపిక చేసిన తెలుగు రూపంపై ఉన్న ఆధారాన్ని సూచిస్తుంది, మొత్తం గణిత పాఠ్యానికి ధ్రువీకరణ కాదు.`;
  if (termReviewTe[term.term_id]?.confidence) return `${grade} ${oneLine(termReviewTe[term.term_id].confidence)}`;
  if (term.term_id === 'TE-T001') return `${grade} ప్రాథమిక నమోదులో విడి స్థాయి ఇవ్వలేదు; TE-P001లో పద వినియోగం ఉన్నా స్వతంత్ర నిపుణ సమీక్ష మిగిలింది. అందుకే సాంప్రదాయికంగా మధ్యస్థ స్థాయి, తాత్కాలిక స్థితి ఉంచాం.`;
  if (term.term_id === 'TE-T002') return `${grade} సభ్యత్వ నామవాచకంపై అనిశ్చితి తక్కువని ప్రాథమిక గమనిక చెబుతుంది; “సభ్యము” పర్యాయం సంపాదకీయ ఎంపిక. పాత సమీక్ష స్థాయి moderate కాబట్టి దాన్ని మధ్యస్థంగా చూపి, నిపుణ సమీక్షకు తెరిచి ఉంచాం.`;
  if (term.term_id === 'TE-T005') return `${grade} ప్రాథమిక గమనికలోని “Low” అనిశ్చితిని సూచిస్తుంది, విశ్వాస స్థాయిని కాదు; పాత సమీక్షలో moderate కావడంతో మధ్యస్థంగా ఉంచాం.`;
  if (isTeluguDominant(term.uncertainty)) return `${grade} ${oneLine(term.uncertainty)}`;
  if (decision.confidence === 'low') return `${grade} మూల నిర్వచనం భావాన్ని నియంత్రించినా ఈ ప్రత్యేక తెలుగు నామకరణానికి ప్రత్యక్ష స్థానిక ప్రమాణం పరిమితం లేదా తాత్కాలికం. నిపుణ సూచనతో మార్చవచ్చు; అది ప్రచురణను ఆపదు.`;
  return `${grade} తనిఖీ చేసిన పేజీ/మూల సందర్భం ఉపయోగపడినా ప్రాథమిక నమోదులో అధిక స్థాయి విడిగా నిర్ధారించలేదు. పదరూపం నిపుణ సమీక్షకు తెరిచి ఉంది; అది ప్రచురణకు అడ్డంకి కాదు.`;
};
const correctionRationaleTe = decision => {
  const correction = correctionByDecisionId.get(decision.decision_id);
  if (!correction) throw new Error(`Missing primary correction for ${decision.decision_id}`);
  const lead = decision.provisional
    ? 'స్థిర ఆంగ్ల మూలంలో గుర్తించిన నిర్వచన/నిరూపణ పరిమితిని లక్ష్యంలో పక్కనే ప్రకటించాం; పూర్తి నిరూపణను కొత్తగా ఇచ్చామని చెప్పడం లేదు.'
    : correction.qualification?.disposition === 'rejected_false_positive'
    ? 'తరువాతి సమీక్ష పూర్వ దోష వర్గీకరణను తిరస్కరించింది. చారిత్రక నమోదు తొలగించకుండా, సమానమైన స్పష్ట రూపాన్ని లక్ష్యంలో చూపాం.'
    : 'స్థిర ఆంగ్ల మూలంలోని గుర్తించిన లోపాన్ని సంబంధిత గణిత సందర్భంతో సరిచూసి లక్ష్యంలో పరిమిత సవరణ చేశాం; మిగిలిన సంకేతాలు, వాదన పరిధి మారలేదని నిర్మాణ తనిఖీ పరిశీలిస్తుంది.';
  return `${lead} లక్ష్య పాఠ్యంలో ఉన్న ఖచ్చితమైన తెలుగు ప్రకటిత గమనిక:\n\n${sourceNoteQuote(correctionNotes.get(correction.finding_id))}`;
};
const correctionConfidenceTe = decision => decision.provisional
  ? `విశ్వాస స్థాయి ${teConfidence(decision.confidence)}: మూల ఖాళీని గుర్తించి ప్రకటించాం, కానీ దాన్ని పూరించే పూర్తి నిరూపణ స్థాపించలేదు. నిర్మాణ సమానత్వ తనిఖీ గణిత నిరూపణకు బదులు కాదు.`
  : `విశ్వాస స్థాయి ${teConfidence(decision.confidence)}: గుర్తించిన ఈ నిర్దిష్ట సవరణకు మూల బైట్లు, లక్ష్య బైట్లు, మూల-పరిశీలన ఆధారం ఉన్నాయి. ఇది స్వతంత్ర మానవ నిపుణ సమీక్ష జరిగిందని లేదా మొత్తం పాఠ్యం నిర్దోషమని ప్రకటించదు.`;
const reviewQuestionTe = decision => decision.record_kind === 'terminology'
  ? `మూలంలోని “${oneLine(decision.source_term_or_construction)}”కు “${oneLine(decision.chosen_rendering)}” అనే రూపం ఆంధ్రప్రదేశ్, తెలంగాణల అధికారిక గణిత/తర్క వాడుకలో సహజమైనదీ, సాంకేతికంగా ఖచ్చితమైనదీనా? కాకపోతే ప్రదర్శిత నిర్వచనం, సూత్రాలు, మూల పరిధి మారకుండా వాడాల్సిన నిర్దిష్ట ప్రత్యామ్నాయం ఏమిటి?`
  : `${decision.decision_id}కు లక్ష్య పాఠ్యంలో ఇచ్చిన ప్రకటిత సవరణ లేదా మూల-పరిమితి గమనిక, సంబంధిత స్థిర మూల గణితానికి ఖచ్చితంగా సరిపోతుందా? కాకపోతే మూల/లక్ష్య ఫైలు, పంక్తి, సూత్రాన్ని చూపి ఏ నిర్దిష్ట మార్పు కావాలో తెలియజేయండి; పరిష్కరించని నిరూపణను పూర్తయిందని ఊహించవద్దు.`;
const decisionRationaleTe = decision => decision.record_kind === 'terminology' ? termRationaleTe(decision) : correctionRationaleTe(decision);
const decisionConfidenceTe = decision => decision.record_kind === 'terminology' ? termConfidenceTe(decision) : correctionConfidenceTe(decision);
const authorityTe = decision => decision.authorities_checked.map(authority => {
  const status = ({checked_supports: 'ప్రత్యక్ష ఆధారం', checked_context_only: 'సందర్భం మాత్రమే'})[authority.status] ?? authority.status;
  const passage = canonPassagesTe[authority.passage_id];
  if (!passage) return `${authority.authority_id} (${status}; ${authority.locator ?? 'స్థాన సూచన లేదు'})`;
  const page = authority.locator?.match(/^PDF page (\d+); printed page (\d+);/u);
  const location = page ? `PDF పుట ${page[1]}; ముద్రిత పుట ${page[2]}` : 'పుట సూచన నమోదు కాలేదు';
  return `${authority.authority_id} (${status}; ${location}; ${passage.region}; పరిధి: ${passage.role})`;
}).join(' | ');
const teAlternativeDisposition = item => ({viable_alternative: 'పరిశీలించదగిన ప్రత్యామ్నాయం', rejected: 'తిరస్కరించిన ఎంపిక', reserved_for_other_sense: 'వేరే భావానికి', reserved_for_other_register: 'వేరే శైలికి'})[item.disposition] ?? item.disposition;
const correctionAlternativesTe = {
  'Translate the defective source wording or formula verbatim.': ['లోపభూయిష్ఠ మూల వాక్యం/సూత్రాన్ని యథాతథంగా అనువదించడం.', 'తనిఖీలో గుర్తించిన లోపాన్ని తెలిసీ పునరుత్పత్తి చేసి, స్థానిక గణిత నియంత్రణకు విరుద్ధమవుతుంది.'],
  'Retain the valid nested cardinality construction verbatim.': ['చెల్లుబాటు అయ్యే అంతర్నిహిత కార్డినాలిటీ నిర్మాణాన్ని యథాతథంగా ఉంచడం.', 'అది గణితపరంగా చెల్లుతుంది; కానీ తెలుగులో రెండు స్పష్ట తులనలను చూపడం మరింత స్పష్టం.'],
  'Present the source proof as complete without qualifying the unsupported step.': ['ఆధారం లేని దశను సూచించకుండా మూల నిరూపణ పూర్తయిందని చూపడం.', 'గుర్తించిన లోటు—నిర్వచనం, పార్శ్వ షరతు లేదా వ్యుత్పత్తి—ఇంకా పూరించలేదు.']
};
const alternativesTe = decision => {
  if (!decision.alternatives.length) return 'విడి ప్రత్యామ్నాయం ప్రాథమిక నమోదులో లేదు.';
  const termId = decision.record_kind === 'terminology' ? termByDecisionId.get(decision.decision_id)?.term_id : null;
  const reviewed = termId ? termAlternativesTe[termId] : null;
  if (reviewed && reviewed.length !== decision.alternatives.length) throw new Error(`Telugu alternative count differs for ${termId}`);
  if (termId && Number(termId.slice(-3)) <= 80 && !reviewed) throw new Error(`Missing early Telugu alternatives for ${termId}`);
  return decision.alternatives.map((item, index) => {
    const correction = decision.record_kind === 'source_correction' ? correctionAlternativesTe[item.rendering] : null;
    if (correction && item.reason !== ({
      'Translate the defective source wording or formula verbatim.': 'That would knowingly reproduce the audited defect and conflict with the controlling local mathematics.',
      'Retain the valid nested cardinality construction verbatim.': 'It is mathematically valid, but the two explicit comparisons are clearer in the Telugu target.',
      'Present the source proof as complete without qualifying the unsupported step.': 'The identified missing definition, side condition or derivation has not been supplied.'
    })[item.rendering]) throw new Error(`Unexpected correction alternative reason for ${decision.decision_id}`);
    const rendering = reviewed?.[index]?.rendering ?? correction?.[0] ?? (item.rendering === 'Leaving reader-visible explanatory prose untranslated' ? 'పాఠకుడికి కనిపించే వివరణాత్మక గద్యాన్ని అనువదించకుండా వదలడం' : item.rendering);
    const reason = reviewed?.[index]?.reason ?? correction?.[1] ?? ({'definition-controlled choice': 'మూల నిర్వచనంతో నియంత్రిత ఎంపిక.', rejected: 'పాఠక తెలుగు సంచికకు విరుద్ధం; అందుకే తిరస్కరించాం.'})[item.reason] ?? item.reason;
    return `${rendering} (${teAlternativeDisposition(item)}: ${reason})`;
  }).join(' | ');
};

const fullTe = [
  '# తెలుగు అనువాద నిర్ణయాల పూర్తి పరిశీలన నమోదు',
  '',
  `సంచిక: **${edition.language_tag} / ${edition.script} / ప్రామాణిక అధికారిక తెలుగు**. స్థిర మూల విభాగాలు **${draftedSourceUnits}/${sourceUnitTotal}** అనువదించబడ్డాయి. ఈ నమోదులో **${decisions.length} నిర్ణయాలు**, **${occurrenceCount} అమలు స్థానాలు** ఉన్నాయి. [ఆంగ్ల సమాంతర నమోదు](TRANSLATION_DECISIONS_FULL.en.md)లో ప్రాథమిక ఆంగ్ల కారణాల పూర్తి పాఠ్యం నిలిచింది.`,
  '',
  'ప్రతి స్థానానికి మూల/లక్ష్య ఫైలు, పంక్తి, బైట్-పరిధి, SHA-256 గుర్తింపులు ఇచ్చాం. తొలి పదజాల నిర్ణయాలకు నిర్దిష్ట తెలుగు కారణం, అనిశ్చితి, పర్యాయాల కారణాలు, తనిఖీ చేసిన పుటల సాక్ష్య పరిధి ఇచ్చాం; సమాంతర ఆంగ్ల ప్రాథమిక నమోదు యథాతథంగా ఉంది. మూల సవరణలకు లక్ష్య పాఠ్యంలో ఉన్న ఖచ్చిత తెలుగు ప్రకటిత గమనికను ఉటంకించాం. అంగీకరించిన పూర్తి HTMLలో విభాగ-స్థాయి లింకులు ఉన్నాయి; PDFలో ప్రతి నిర్ణయానికి ఖచ్చిత పుటను ఊహించలేదు. నిపుణ సమీక్ష ఉపయోగకరం, కానీ అనువాదం లేదా ప్రచురణకు అనుమతి-ద్వారం కాదు.',
  ''
];
for (const decision of decisions) {
  fullTe.push(
    `## ${decision.decision_id} — ${oneLine(decision.source_term_or_construction)}`,
    '',
    `- నమోదు రకం: ${decision.record_kind === 'terminology' ? 'పదజాలం/భావార్థం' : 'ప్రకటిత మూల సవరణ'}; ${decision.recording_mode === 'retrospective' ? 'తరువాత ఆధారాలతో పునర్నిర్మించిన నిర్ణయం' : 'పని సమయంలో నమోదైన నిర్ణయం'}.`,
    '',
    `- ఎంపిక చేసిన తెలుగు రూపం/చర్య: ${decision.record_kind === 'terminology' ? oneLine(decision.chosen_rendering) : 'క్రింద ఉటంకించిన లక్ష్య-గమనిక ప్రకారం పరిమిత చర్య'}.`,
    '',
    `- కారణం: ${decisionRationaleTe(decision)}`,
    '',
    `- విశ్వాసం/అనిశ్చితి: ${decisionConfidenceTe(decision)}`,
    '',
    `- స్థాయి/తాత్కాలికం/సమీక్ష ప్రాధాన్యం: ${teConfidence(decision.confidence)} / ${teBoolean(decision.provisional)} / ${tePriority(decision.review_priority)}.`,
    '',
    `- తనిఖీ చేసిన ఆధారాలు: ${authorityTe(decision)}.`,
    '',
    `- ఇతర ఎంపికలు: ${alternativesTe(decision)}`,
    '',
    `- నిపుణ సమీక్ష ప్రశ్న: ${reviewQuestionTe(decision)}`,
    '',
    '- అమలు స్థానాలు:',
    ''
  );
  for (const occurrence of decision.occurrences) {
    fullTe.push(`  - ${occurrence.occurrence_id}; ${occurrence.unit_id}; ${occurrence.semantic_unit_id}; మూలం ${occurrence.source.path}:${lineLabel(occurrence.source.line_span)} బైట్లు ${byteLabel(occurrence.source.byte_span)} SHA-256 ${occurrence.source.file_sha256}; లక్ష్యం ${occurrence.target.path}:${lineLabel(occurrence.target.line_span)} బైట్లు ${byteLabel(occurrence.target.byte_span)} SHA-256 ${occurrence.target.file_sha256}; ${acceptedReader ? `పాఠక రూపం output/html/full/index.html#${occurrence.unit_id} (విభాగ-స్థాయి; PDFలో ఖచ్చిత పుట చెప్పలేదు)` : 'పాఠక రూప స్థానం పెండింగ్'}.`);
  }
  fullTe.push('');
}
fs.writeFileSync(path.join(dataDir, 'TRANSLATION_DECISIONS_FULL.md'), `${fullTe.join('\n').trimEnd()}\n`);

const priorityTe = [
  '# అధిక ప్రాధాన్య నిపుణ సమీక్ష',
  '',
  `${decisions.length} నిర్ణయాల్లో ${priorityDecisions.length}కు అధిక/అత్యవసర సమీక్ష ప్రాధాన్యం ఉంది. సమీక్ష ఉపయోగకరం; అది అనువాదం లేదా ప్రచురణకు అడ్డంకి కాదు. ఖచ్చిత మూల/లక్ష్య స్థానాలు క్రింద ఉన్నాయి. PDFలో నిర్ణయ-స్థాయి పుటను ఊహించలేదు. [ఆంగ్ల సమాంతర జాబితా](PRIORITY_REVIEW.en.md) కూడా ఉంది.`,
  ''
];
for (const decision of priorityDecisions) {
  priorityTe.push(
    `## ${decision.decision_id} — ${oneLine(decision.source_term_or_construction)}`,
    '',
    `- ఎంపిక చేసిన తెలుగు రూపం/చర్య: ${decision.record_kind === 'terminology' ? oneLine(decision.chosen_rendering) : 'క్రింది ప్రకటిత లక్ష్య-గమనిక ప్రకారం'}.`,
    '',
    `- కారణం: ${decisionRationaleTe(decision)}`,
    '',
    `- విశ్వాసం/అనిశ్చితి: ${decisionConfidenceTe(decision)}`,
    '',
    `- స్థాయి/తాత్కాలికం: ${teConfidence(decision.confidence)} / ${teBoolean(decision.provisional)}.`,
    '',
    `- తనిఖీ చేసిన ఆధారాలు: ${authorityTe(decision)}.`,
    '',
    `- ఇతర ఎంపికలు: ${alternativesTe(decision)}`,
    '',
    `- అమలు స్థానాలు: ${decision.occurrences.map(item => `${item.unit_id} ${item.target.path}:${lineLabel(item.target.line_span)}`).join('; ')}.`,
    '',
    `- నిపుణ సమీక్ష ప్రశ్న: ${reviewQuestionTe(decision)}`,
    ''
  );
}
fs.writeFileSync(path.join(dataDir, 'PRIORITY_REVIEW.md'), `${priorityTe.join('\n').trimEnd()}\n`);

const startHereTe = `# తెలుగు అనువాద నిర్ణయాల పరిశీలనకు మార్గదర్శి

**ప్రస్తుత స్థితి:** స్థిర ఆంగ్ల మూలంలోని **${draftedSourceUnits}/${sourceUnitTotal}** విభాగాలకు తెలుగు పాఠ్యం, సమగ్ర HTML పాఠక రూపం ఉన్నాయి. యంత్ర-పఠన నమోదులో **${decisions.length} నిర్ణయాలు** (${termDecisions.length} పదజాల/భావార్థ ఎంపికలు, ${correctionDecisions.length} ప్రకటిత మూల సవరణలు), **${occurrenceCount} అమలు స్థానాలు** ఉన్నాయి. పాత 426/722, 276-భాగాల స్థితి ప్రస్తుత సంచికకు వర్తించదు.

ముందుగా [అధిక ప్రాధాన్య సమీక్ష](PRIORITY_REVIEW.md), అవసరమైతే [పూర్తి తెలుగు నమోదు](TRANSLATION_DECISIONS_FULL.md) చూడండి. తొలి 80 పదజాల నిర్ణయాల్లో మూల భావం, ఎంపిక కారణం, అనిశ్చితి, తిరస్కరించిన పర్యాయాల కారణాలు, పుట సాక్ష్యం/పరిమితులు తెలుగులో అందుబాటులో ఉన్నాయి; తరువాతి పదజాలం, ప్రకటిత మూల సవరణల నిర్ణయాలూ తెలుగు పరిశీలనలో ఉన్నాయి. మూల వాక్యరూపాన్ని పోల్చాలంటే [ఆంగ్ల సమాంతర నమోదు](TRANSLATION_DECISIONS_FULL.en.md), [ఆంగ్ల ప్రాధాన్య జాబితా](PRIORITY_REVIEW.en.md) చూడండి. ఖచ్చిత అమలు స్థానం కోసం [CSV](DECISION_OCCURRENCES.csv), యంత్ర-పఠన ఆధారానికి [కానానికల్ JSON](DECISIONS.json), దాని [schema](translation-decision.schema.json), [నిర్ణీత తనిఖీ ఫలితం](TRANSLATION_DECISION_QA.json) చూడండి.

ఒకే ప్రామాణిక అధికారిక తెలుగు లిపి సంచిక **te-Telu-IN / Telu**ను ఎంచుకున్నాం. అరబిక్ దశాంశ అంకెలు, లాటిన్ చర-గుర్తులు, తర్క-గణిత సంకేతాలు, ఎడమ-నుంచి-కుడికి గణిత అమరికను నిలిపాం. తెలంగాణ, ఆంధ్రప్రదేశ్, రాష్ట్ర విభజనకు పూర్వపు పేజీలు పరిశీలించాం; ఇది అన్ని ప్రాంతాల సంపూర్ణ సర్వే కాదు. విడి రోమన్-లిపి, AP/TS, తెలుగు-అంకెలు, వాడుకభాషా సంచికలకు ఇప్పటి సాక్ష్యం సరిపోదు. తరువాతి నిపుణ ఆధారంతో ఈ నిర్ణయాన్ని మార్చవచ్చు.

పరిశీలించిన ఆధారాల్లో తెలుగు ప్రస్తుత “Top 10” స్థానం లేదా ఈ సంచిక వాడుకపై పరిమాణాత్మక ప్రభావం స్థాపితం కాలేదు. జనగణన, PISA, గ్రంథసూచిక, టోకెన్ పరిమాణాన్ని అలాంటి ర్యాంకుకు సాక్ష్యంగా చూపకండి. భవిష్యత్తులో లిపి, ఉచ్చారణ, సంకేతనం లేదా అందుబాటు సహచర రూపం కావాలంటే విడిగా తయారుచేసి మానిఫెస్టులో నమోదు చేయాలి; అది మూలానికి నిష్ఠగల తెలుగు అనువాదానికి బదులు కాదు, అడ్డంకీ కాదు.

ప్రతి నిర్ణయంలో తెలుగు ఎంపిక, దానికి గల కారణం, ఆధారం, ప్రత్యామ్నాయం, విశ్వాస/అనిశ్చితి వివరణ, నిపుణ సమీక్ష ప్రశ్న ఉన్నాయి. పూర్వపు ఆంగ్ల పదజాల నిర్ణయాలకు ఇక్కడ సంక్షిప్త తెలుగు కారణం; సాక్ష్యపు పూర్తి సూక్ష్మ పరిమితులు ఆంగ్ల సమాంతర నమోదులో ఉన్నాయి. 705 మూల సవరణలకు లక్ష్య ఫైలులోని ఖచ్చిత తెలుగు ప్రకటిత గమనికను ఉటంకించాం. మూల/లక్ష్య ఫైలు, పంక్తి, బైట్-పరిధి, SHA-256 ద్వారా స్థానాన్ని తనిఖీ చేయండి. HTMLలో అంగీకరించిన విభాగ-స్థాయి లింకులు ఉన్నాయి; PDFలో ఒక్కో నిర్ణయానికి పుటను ఊహించలేదు. “అధిక విశ్వాసం” కూడా మొత్తం గణితానికి స్వతంత్ర మానవ ధ్రువీకరణ కాదు. సమీక్ష స్వాగతం; అది అనువాదం లేదా ప్రచురణకు అనుమతి-ద్వారం కాదు.

పాత \`EXPERT_REVIEW_*\` ఫైళ్లు అనుకూలత కోసం ఉన్నాయి. కానానికల్ schemaను OpenLogic-translations commit \`811091d54be4989918864732073279a588340e6f\` నుంచి బైట్-స్థాయిలో యథాతథంగా తీసుకున్నాం; ఊహించిన SHA-256 \`50e7fa407b62c711f92f8b93be591d3b4a6e1c4adb1386c398bb5f76844d9f90\`.
`;
fs.writeFileSync(path.join(dataDir, 'START_HERE.md'), startHereTe);
fs.writeFileSync(path.join(dataDir, 'START_HERE.te.md'), startHereTe);

console.log(JSON.stringify({
  schema_version: canonical.schema_version,
  decisions: decisions.length,
  terminology: termDecisions.length,
  source_corrections: correctionDecisions.length,
  priority: priorityDecisions.length,
  occurrences: occurrenceCount,
  status: acceptedReader ? 'complete_html_locators_no_holds' : 'partial_no_holds_reader_pending'
}));

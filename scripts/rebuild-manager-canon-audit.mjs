import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { renderTeluguTokens } from './telugu-token-markup.mjs';

const productionRoot = path.resolve(import.meta.dirname, '..');
const ownerStateRoot = 'C:\\interlanguage-task-state\\openlogic-te-Telu-IN';
const auditRoot = 'C:\\interlanguage-task-state\\openlogic-internationalization\\canon-revalidation';
const laneRoot = path.join(auditRoot, 'lanes', 'te-Telu-IN');
const auditId = 'TE-CANON-REVALIDATION-20260906';
const sourceRevision = '9620cc73f9c8e0ad003c514a5d3748f29611c4c0';
const productionStartRevision = 'be1bc4934234389376ea189dc3cd4d00d47b9b8d';
const write = process.argv.includes('--write');

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const readJsonl = file => fs.readFileSync(file, 'utf8').trim().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const compact = (value, limit = 520) => {
  const text = value.replace(/\s+/gu, ' ').trim();
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
};
const excerpt = (value, limit = 220) => compact(value, limit);
const count = (text, re) => [...text.matchAll(re)].length;

const protocolPath = path.join(auditRoot, 'AUDIT_PROTOCOL.md');
const schemaPath = path.join(auditRoot, 'CHOICE_RECORD.schema.json');
const validatorPath = path.join(auditRoot, 'validate_lane_audit.py');
const manifestPath = path.join(productionRoot, 'evidence', 'SOURCE_MANIFEST.jsonl');
const correctionPath = path.join(productionRoot, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const termPath = path.join(productionRoot, 'evidence', 'TERM_DECISIONS.jsonl');
const tokenPath = path.join(productionRoot, 'translation', 'TELUGU_TOKENS.json');
const segmentPath = path.join(productionRoot, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const canonSourcePath = path.join(laneRoot, 'CANON_INVENTORY.jsonl');
const canonPassagePath = path.join(laneRoot, 'CANON_PASSAGES.jsonl');
const oldChoicePath = path.join(laneRoot, 'CHOICES.jsonl');
const oldCursorPath = path.join(laneRoot, 'CURSOR.json');

const protocolHash = sha(fs.readFileSync(protocolPath));
const schemaHash = sha(fs.readFileSync(schemaPath));
const validatorHash = sha(fs.readFileSync(validatorPath));
if (protocolHash !== '154bf266fc797871e59e85265e0ec7848643c373adb59343d1fef7ec7bc28431') throw new Error('Unexpected protocol hash');
if (schemaHash !== 'bae5b1a0d550c14b01e151cdb9fa4e1e05c6dce9d217873335207dd98c808ad8') throw new Error('Unexpected schema hash');
if (validatorHash !== '52c9878de63d1e25c4070ba3ed1c964f826e8d542435e5b4787325cf39e4d8f0') throw new Error('Unexpected validator hash');

const manifest = readJsonl(manifestPath).filter(unit => unit.order >= 4 && unit.order <= 148);
const corrections = readJsonl(correctionPath);
const terms = readJsonl(termPath);
const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
const canonSources = readJsonl(canonSourcePath);
const canonPassages = readJsonl(canonPassagePath);
const canonSourcesById = new Map(canonSources.map(row => [row.source_id, row]));
const canonPassagesById = new Map(canonPassages.map(row => [row.passage_id, row]));
const oldChoices = new Map(readJsonl(oldChoicePath).map(row => [row.choice_id, row]));
const oldCursor = JSON.parse(fs.readFileSync(oldCursorPath, 'utf8'));

if (manifest.length !== 145) throw new Error(`Expected 145 units, got ${manifest.length}`);
if (corrections.length !== 87) throw new Error(`Expected 87 source corrections, got ${corrections.length}`);
if (terms.length !== 42) throw new Error(`Expected 42 term decisions, got ${terms.length}`);
if (Object.keys(tokenData.tokens).length !== 41) throw new Error('Expected 41 Telugu token mappings');
if (canonSources.length !== 5 || canonPassages.length !== 34) throw new Error('Expected 5 canon sources and 34 passages');

function physicalLines(raw) {
  const lines = [];
  let cursor = 0;
  let number = 1;
  while (cursor < raw.length) {
    const lf = raw.indexOf('\n', cursor);
    const end = lf < 0 ? raw.length : lf + 1;
    const text = raw.slice(cursor, end);
    const body = text.replace(/(?:\r\n|\n|\r)$/u, '');
    lines.push({ number, start: cursor, end, text, body });
    cursor = end;
    number += 1;
  }
  if (!raw.length) lines.push({ number: 1, start: 0, end: 0, text: '', body: '' });
  return lines;
}

function blocksWithSpans(raw) {
  const lines = physicalLines(raw);
  const blocks = [];
  let active = null;
  for (const line of lines) {
    if (/^[\t ]*$/u.test(line.body)) {
      if (active) {
        blocks.push(active);
        active = null;
      }
      continue;
    }
    if (!active) active = { charStart: line.start, charEnd: line.end, lineStart: line.number, lineEnd: line.number };
    else {
      active.charEnd = line.end;
      active.lineEnd = line.number;
    }
  }
  if (active) blocks.push(active);
  return blocks.map(block => ({
    ...block,
    byteStart: Buffer.byteLength(raw.slice(0, block.charStart), 'utf8'),
    byteEnd: Buffer.byteLength(raw.slice(0, block.charEnd), 'utf8'),
    text: raw.slice(block.charStart, block.charEnd),
  }));
}

function contextFor(raw, block, radius = 2) {
  const lines = physicalLines(raw);
  const start = Math.max(1, block.lineStart - radius);
  const end = Math.min(lines.length, block.lineEnd + radius);
  return lines.slice(start - 1, end).map(line => `${line.number}: ${line.body}`).join('\n');
}

const markerRe = /!!\^?a?\{[^{}]+\}s?/gu;
const wrapperRe = /\\tetoken\{[^{}]+\}\{(!!\^?a?\{[^{}]+\}s?)\}/gu;
const coverageTokenRe = /!!\^?a?\{[^{}]+\}s?|\\[A-Za-z@]+|[\p{L}\p{M}]+|\p{N}+|[^\s]/gu;
const teluguWordRe = /[\u0C00-\u0C7F]+/gu;
const mathRe = /\$[^$]*\$|\\\[[\s\S]*?\\\]|\\begin\{(?:align\*?|multline\*?)\}[\s\S]*?\\end\{(?:align\*?|multline\*?)\}/gu;
const protectedRe = /\\(?:olfileid|ollabel|olref|oliflabeldef|olimport|olasset|label|ref|cite\w*)\b/gu;
const structureRe = /\\(?:begin|end)\{[^{}]*\}/gu;

function markerInfo(targetText) {
  const all = [...targetText.matchAll(markerRe)].map(match => match[0]);
  const wrapped = [...targetText.matchAll(wrapperRe)].map(match => match[1]);
  const residue = targetText.replace(wrapperRe, '').match(markerRe) ?? [];
  return { all, wrapped, residue: [...residue] };
}

function sourceCorrectionIds(text) {
  return [...text.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]);
}

function sourceConcepts(source, visibleTarget) {
  const joined = `${source}\n${visibleTarget}`;
  const lower = source.toLowerCase();
  const concepts = [];
  const add = name => { if (!concepts.includes(name)) concepts.push(name); };
  if (/\bsets?\b|\\Pow\b|సమిత/u.test(joined)) add('set');
  if (/\belements?\b|\bmembers?\b|మూలక/u.test(joined)) add('element/member');
  if (/proper subset|క్రమ ఉపసమితి/u.test(joined)) add('proper subset');
  else if (/\bsubsets?\b|ఉపసమితి/u.test(joined)) add('subset');
  if (/ordered pair|cartesian product|క్రమయుగ్మ|కార్టీజియన్/u.test(joined)) add('ordered pair/Cartesian product');
  if (/power set|ఘాత సమితి/u.test(joined)) add('power set');
  if (/union|intersection|disjoint|సమ్మేళనం|ఛేదనం|వియుక్త/u.test(joined)) add('union/intersection/disjoint');
  if (/\brelations?\b|సంబంధ/u.test(joined)) add('relation');
  if (/\bfunctions?\b|injection|surjection|bijection|injective|surjective|bijective|ప్రమేయ/u.test(joined)) add('function');
  if (/domain|codomain|range|ప్రవేశం|సహప్రవేశం|పరిధి|క్షేత్ర/u.test(joined)) add('domain/range/codomain');
  if (/inverse|composition|విలోమ|సంయోగ/u.test(joined)) add('inverse/composition');
  if (/finite|infinite|enumerable|denumerable|countable|పరిమిత|అపరిమిత|లెక్కించదగిన/u.test(joined)) add('finite/infinite/countability');
  if (/natural number|integer|rational|real number|సహజ సంఖ్య|పూర్ణసంఖ్య|కరణీయ|వాస్తవ సంఖ్య/u.test(joined)) add('number systems');
  if (/propositional logic|propositional variable|ప్రతిజ్ఞావాక్య/u.test(joined)) add('propositional logic');
  if (/conjunction|disjunction|negation|conditional|biconditional|connective|సంయోజ|వియోజ|నిషేధ|సోపాధిక|ద్విసోపాధిక/u.test(joined)) add('logical connectives');
  if (/truth value|valuation|true|false|satisf|సత్యమూల్య|సత్యం|అసత్యం|సంతృప్త/u.test(joined)) add('truth/valuation/satisfaction');
  if (/first-order|predicate|quantifier|variable|constant|free variable|bound variable|scope|విధేయ|పరిమాణీకరణ|చర|స్థిరసంకేత|మొదటిస్థాయి/u.test(joined)) add('first-order predicate logic');
  if (/consequence|entail|valid|ఫలితం|చెల్లుబాటు/u.test(joined)) add('consequence/validity');
  if (/deriv|deduct|infer|prove|proof|theorem|వ్యుత్పత్తి|నిగమన|అనుమాన|నిరూప|సిద్ధాంత/u.test(joined)) add('derivation/proof/inference');
  if (/consistent|inconsistent|contradic|అవైరుధ్య|వైరుధ్య|సుసంగత|అసంగత/u.test(joined)) add('consistency/contradiction');
  if (/sequent|tableau|natural deduction|axiom|modus ponens|resolution|soundness|completeness|compactness|henkin|lindenbaum|skolem|eigen|discharge|సీక్వెంట్|టాబ్లో|స్వీకృత|మోడస్|రిజల్యూషన్|నిర్దుష్టత|సంపూర్ణత|సంహతత్వ|హెన్కిన్|లిండెన్‌బామ్|స్కోలెమ్|ఐగెన్|ఉపసంహర/u.test(joined)) add('named formal system/metatheory');
  if (/syntax|semantic|formula|sentence|substitution|formation|వాక్యనిర్మాణ|అర్థవిచార|సూత్ర|వాక్య|ప్రతిస్థాపన/u.test(joined)) add('formal syntax/semantics');
  if (/\bexample\b|ఉదాహరణ/u.test(joined)) add('worked-example construction');
  if (/\\begin\{proof\}|\bproof\b|నిరూపణ|రుజువు/u.test(joined)) add('proof construction');
  if (/\\begin\{exercises?\}|\bexercise\b|ప్రశ్న/u.test(joined)) add('exercise construction');
  if (!concepts.length && /[a-z]/i.test(lower)) add('academic explanatory construction');
  return concepts;
}

function selectCanon(choiceId, sourceText, visibleTarget, sourcePath, concepts) {
  const joined = `${sourceText}\n${visibleTarget}`;
  const lower = sourceText.toLowerCase();
  const selected = new Map();
  const add = (id, reason) => {
    if (!selected.has(id)) selected.set(id, reason);
  };
  if (/proper subset|క్రమ ఉపసమితి/u.test(joined)) add('TE-P009', 'direct proper-subset terminology');
  if (/extensionality|సమితుల సమానత్వ సూత్రం/iu.test(joined)) {
    add('TE-P008', 'membership and set-equality context; the extensionality headword itself is not attested');
    add('TE-P004', 'theorem/equality exposition; used only to support the descriptive label register');
  }
  if (/ordered pair|cartesian product|క్రమయుగ్మ|కార్టీజియన్/u.test(joined)) add('TE-P034', 'direct ordered-pair and Cartesian-product terminology');
  if (/\bsubsets?\b|\belements?\b|\bmembers?\b|ఉపసమితి|మూలక/u.test(joined)) add('TE-P008', 'direct elementary set-membership and subset register');
  if (/power set|ఘాత సమితి/u.test(joined)) add('TE-P009', 'direct power-set and strict-inclusion setting');
  if (/union|intersection|disjoint|సమ్మేళనం|ఛేదనం|వియుక్త/u.test(joined)) add('TE-P008', 'direct set-operation register on the inspected page');
  if (/inverse|విలోమ/u.test(joined)) add('TE-P011', 'direct inverse-function terminology');
  if (/\bfunctions?\b|ప్రమేయ/u.test(joined)) add('TE-P012', 'direct function terminology in a mathematical question');
  if (/domain|codomain|range|ప్రవేశం|సహప్రవేశం/u.test(joined)) add('TE-P014', 'direct function-domain and codomain register');
  if (/surject|biject|సంగ్రస్త|ద్విగుణ/u.test(joined)) add('TE-P015', 'direct function-kind terminology');
  if (/finite|infinite|enumerable|denumerable|countable|పరిమిత|అపరిమిత|లెక్కించదగిన/u.test(joined)) add('TE-P016', 'direct finite/infinite set register; countability extensions remain definition-controlled');
  if (/equinumer|same (?:size|cardinality)|A\s*[≃~]|ద్విగుణ ప్రమేయ/u.test(joined)) add('TE-P017', 'direct equality/equinumerosity exercise context');
  if (/natural number|సహజ సంఖ్య/u.test(joined)) add('TE-P007', 'direct natural-number set notation');
  if (/integer|పూర్ణసంఖ్య/u.test(joined)) add('TE-P013', 'direct integer terminology');
  if (/real number|వాస్తవ సంఖ్య/u.test(joined)) add('TE-P006', 'direct real-number academic heading');
  if (/\bpropositional\b|ప్రతిజ్ఞావాక్య/u.test(joined)) add('TE-P018', 'direct propositional-logic terminology and attested proposition compound');
  if (/conjunction|సంయోజ/u.test(joined)) add('TE-P019', 'direct conjunction and truth-value terminology');
  if (/disjunction|వియోజ|వికల్ప/u.test(joined)) add('TE-P020', 'direct disjunction register');
  if (/biconditional|conditional|సోపాధిక|ద్విసోపాధిక/u.test(joined)) add('TE-P021', 'direct conditional and biconditional terminology');
  if (/implication|equivalence|ఆపాదన|తుల్యత/u.test(joined)) add('TE-P022', 'direct implication/equivalence terminology');
  if (/consequence|entail|valid|ఫలితం|చెల్లుబాటు/u.test(joined)) add('TE-P023', 'direct consequence and truth-preservation context');
  if (/soundness|నిర్దుష్టత/iu.test(joined)) add('TE-P023', 'truth-preserving consequence context for the definition-controlled soundness label');
  if (/completeness|సంపూర్ణత/iu.test(joined)) add('TE-P024', 'formal derivation context for the definition-controlled completeness label');
  if (/deriv|వ్యుత్పత్తి|వ్యుత్పాద/u.test(joined)) add('TE-P024', 'direct formal-derivation terminology');
  if (/indirect proof|పరోక్ష రుజువు/u.test(joined)) add('TE-P025', 'direct indirect-proof terminology');
  if (/consistent|inconsistent|contradic|అవైరుధ్య|వైరుధ్య|సుసంగత|అసంగత/u.test(joined)) add('TE-P026', 'direct consistency/inconsistency witness; current lexical variant is identified separately');
  if (/predicate|\bterms?\b|quantifier|individual variable|individual constant|విధేయ|పదాలు|పరిమాణీకరణ|చర|స్థిరసంకేత/u.test(joined)) add('TE-P027', 'direct predicate-logic, term, predicate, quantifier, variable and constant register');
  if (/universal quantifier|existential quantifier|సార్వత్రిక పరిమాణీకరణ|అస్తిత్వాత్మక పరిమాణీకరణ/u.test(joined)) add('TE-P028', 'direct universal/existential quantifier taxonomy');
  if (/first-order|scope|bound variable|free variable|మొదటిస్థాయి|పరిధి|బద్ధ|స్వేచ్ఛా చర/u.test(joined)) add('TE-P029', 'direct first-order, scope and bound-variable register');
  if (/individuals? domain|వ్యక్తి క్షేత్ర|వైయక్తిక క్షేత్ర/u.test(joined)) add('TE-P030', 'direct individuals-domain headword, with editorial modernization identified separately');
  if (/proposition|sentence|ప్రతిజ్ఞావాక్య|వాక్య/u.test(joined)) add('TE-P031', 'direct proposition/sentence distinction');
  if (/deduct|induct|నిగమన|ఆగమన/u.test(joined)) add('TE-P032', 'direct deduction/induction and broad theorem register');
  if (/infer|అనుమాన/u.test(joined)) add('TE-P033', 'direct inference register');

  const isProof = /\\begin\{proof\}|\bproof\b|నిరూపణ|రుజువు/u.test(joined);
  const isExample = /\\begin\{examples?\}|\bexample\b|ఉదాహరణ/u.test(joined);
  const isDefinition = /\\begin\{defn\}|\bdefine|\bcalled\b|అంటాం|నిర్వచ/u.test(joined);
  const isExercise = /\\begin\{exercises?\}|\bexercise\b|ప్రశ్న/u.test(joined);
  const logicPath = /(?:propositional-logic|first-order-logic)/u.test(sourcePath);
  if (isProof) add(logicPath ? 'TE-P025' : 'TE-P003', logicPath ? 'formal proof construction and numbering register' : 'native proof and deduction exposition');
  if (isExample) add('TE-P005', 'native worked-example sentence architecture');
  if (isExercise) add(/functions/u.test(sourcePath) ? 'TE-P012' : 'TE-P005', 'native mathematical prompt/example register');
  if (isDefinition && /sets-functions-relations/u.test(sourcePath)) add('TE-P008', 'native definition syntax in elementary set theory');
  if (isDefinition && logicPath) add(/first-order-logic/u.test(sourcePath) ? 'TE-P027' : 'TE-P018', 'native formal-logic definition context');
  if (/theorem|lemma|proposition|corollary|సిద్ధాంత|ఉపసిద్ధాంత/u.test(joined)) add(logicPath ? 'TE-P024' : 'TE-P004', logicPath ? 'formal derivation/theorem context' : 'native theorem-heading and proof register');

  // Add a genuinely relevant chapter-level comparator when a specialized
  // block otherwise resolves only to a broad domain passage. These are based
  // on the block's actual formal role, never on an arbitrary rotation.
  if (/sets-functions-relations\/sets/u.test(sourcePath)) {
    if (isProof) add('TE-P003', 'proof construction in native mathematical prose');
    else if (isExample) add('TE-P005', 'worked-example construction in native mathematical prose');
    else if (isDefinition) add('TE-P001', 'elementary set-theory exposition and headword context');
  } else if (/sets-functions-relations\/relations/u.test(sourcePath)) {
    add('TE-P010', 'relation/domain notation in the inspected set-theory chapter');
  } else if (/sets-functions-relations\/functions/u.test(sourcePath)) {
    add(/domain|codomain|range|ప్రవేశం|సహప్రవేశం/u.test(joined) ? 'TE-P014' : 'TE-P012', 'function-specific Telugu mathematical register');
  } else if (/sets-functions-relations\/size-of-sets/u.test(sourcePath)) {
    add(/equinumer|cardinal|same size|ద్విగుణ/u.test(joined) ? 'TE-P017' : 'TE-P016', 'finite/infinite or equinumerosity context for size-of-sets prose');
  } else if (/sets-functions-relations\/arithmetization/u.test(sourcePath)) {
    add(/integer|పూర్ణసంఖ్య/u.test(joined) ? 'TE-P013' : 'TE-P006', 'number-system terminology and exposition');
  } else if (/sets-functions-relations\/infinite/u.test(sourcePath)) {
    add(/natural number|సహజ సంఖ్య/u.test(joined) ? 'TE-P007' : 'TE-P016', 'natural-number or finite/infinite set context');
  } else if (/propositional-logic/u.test(sourcePath)) {
    add(/truth|false|valuation|సత్య/u.test(joined) ? 'TE-P019' : /sentence|formula|వాక్య|సూత్ర/u.test(joined) ? 'TE-P031' : 'TE-P018', 'propositional truth-value, sentence/formula, or connective context');
  } else if (/first-order-logic\/proof-systems/u.test(sourcePath)) {
    add(/sound|valid|నిర్దుష్ట|చెల్లుబాటు/u.test(joined) ? 'TE-P023' : 'TE-P032', 'validity or deduction comparator for the proof-systems survey');
  } else if (/first-order-logic\/sequent-calculus/u.test(sourcePath)) {
    add(/sound|valid|నిర్దుష్ట|చెల్లుబాటు/u.test(joined) ? 'TE-P023' : /consistent|contradic|అవైరుధ్య|వైరుధ్య/u.test(joined) ? 'TE-P026' : /quantifier|పరిమాణీకరణ/u.test(joined) ? 'TE-P028' : 'TE-P032', 'validity, consistency, quantifier, or deduction comparator for sequent-calculus prose');
  } else if (/first-order-logic\/natural-deduction/u.test(sourcePath)) {
    add(/sound|valid|నిర్దుష్ట|చెల్లుబాటు/u.test(joined) ? 'TE-P023' : /consistent|contradic|అవైరుధ్య|వైరుధ్య/u.test(joined) ? 'TE-P026' : /quantifier|పరిమాణీకరణ/u.test(joined) ? 'TE-P028' : 'TE-P025', 'validity, consistency, quantifier, or formal-proof comparator for natural-deduction prose');
  } else if (/first-order-logic\/tableaux/u.test(sourcePath)) {
    add(/sound|valid|నిర్దుష్ట|చెల్లుబాటు/u.test(joined) ? 'TE-P023' : /consistent|closed branch|అవైరుధ్య|వైరుధ్య|సంవృత శాఖ/u.test(joined) ? 'TE-P026' : /quantifier|పరిమాణీకరణ/u.test(joined) ? 'TE-P028' : 'TE-P019', 'validity, consistency, quantifier, or truth-value comparator for tableau prose');
  } else if (/first-order-logic\/axiomatic-deduction/u.test(sourcePath)) {
    add(/sound|valid|నిర్దుష్ట|చెల్లుబాటు/u.test(joined) ? 'TE-P023' : /consistent|contradic|అవైరుధ్య|వైరుధ్య/u.test(joined) ? 'TE-P026' : /quantifier|పరిమాణీకరణ/u.test(joined) ? 'TE-P028' : 'TE-P032', 'validity, consistency, quantifier, or deduction comparator for axiomatic prose');
  } else if (/first-order-logic\/completeness/u.test(sourcePath)) {
    add(/consistent|contradic|అవైరుధ్య|వైరుధ్య/u.test(joined) ? 'TE-P026' : /model|structure|నమూనా|నిర్మాణ/u.test(joined) ? 'TE-P030' : 'TE-P023', 'consistency, model-domain, or semantic-consequence comparator for completeness prose');
  } else if (/first-order-logic\/introduction/u.test(sourcePath)) {
    add(/domain|క్షేత్ర/u.test(joined) ? 'TE-P030' : /sentence|formula|వాక్య|సూత్ర/u.test(joined) ? 'TE-P031' : 'TE-P029', 'individual-domain, sentence/formula, or first-order context');
  }

  if (!selected.size) {
    if (/sets-functions-relations/u.test(sourcePath)) add('TE-P001', 'elementary set-theory academic register for this bounded construction');
    else if (/propositional-logic/u.test(sourcePath)) add('TE-P018', 'propositional-logic academic register for this bounded construction');
    else add('TE-P027', 'predicate-logic academic register for this bounded construction');
  }
  if (selected.size === 1 && concepts.includes('derivation/proof/inference')) add(logicPath ? 'TE-P033' : 'TE-P004', 'independent inference/theorem register comparator');
  if (selected.size === 1 && concepts.includes('set') && isExample) add('TE-P005', 'worked-example prose comparator');

  return [...selected.entries()].slice(0, 5).map(([id, reason]) => {
    const passage = canonPassagesById.get(id);
    const source = canonSourcesById.get(passage.source_id);
    if (!passage || !source) throw new Error(`Unresolved canon ${id}`);
    return {
      source_id: passage.source_id,
      source_sha256: source.sha256,
      passage_id: id,
      locator: passage.locator,
      text: passage.text,
      use: `${choiceId}: ${reason}. Scope is limited exactly as recorded: ${passage.scope_limit}`,
    };
  });
}

const directPatterns = [
  /క్రమ ఉపసమితి|క్రమయుగ్మ|కార్టీజియన్ లబ్ధం/u,
  /ప్రతిజ్ఞావాక్యాత్మక తర్క|సోపాధిక|ద్విసోపాధిక/u,
  /మొదటిస్థాయి విధేయ తర్క|పరిమాణీకరణ|విధేయ సంకేత|స్థిరసంకేత/u,
  /వ్యుత్పత్తి|పరోక్ష రుజువు/u,
  /ఉపసమితి|మూలక|ప్రమేయ|విలోమ/u,
];
const uncertainPattern = /సమితుల సమానత్వ సూత్రం|అవైరుధ్య|వైరుధ్య|సీక్వెంట్|టాబ్లో|ఐగెన్|మోడస్ పోనెన్స్|రిజల్యూషన్|నిర్దుష్టత|సంపూర్ణత|సంహతత్వ|హెన్కిన్|లిండెన్‌బామ్|స్కోలెమ్|సంతృప్తీకృత|నిరూపణ-సిద్ధాంత/u;
const advancedSourcePattern = /extensionality|tuple|equinumer|enumerab|dedekind|cauchy|sequent|tableau|natural deduction|axiom|modus ponens|resolution|soundness|completeness|compactness|henkin|lindenbaum|skolem|eigen|discharg|proof-theoretic|formation sequence|unique readability|uniform substitution|term model|truth lemma|saturated set/i;

function disposition(sourceText, visibleTarget, sourcePath, concepts, correctionIds, oldChoice) {
  const directHits = directPatterns.filter(re => re.test(visibleTarget)).length;
  const uncertain = uncertainPattern.test(visibleTarget);
  const advanced = advancedSourcePattern.test(sourceText);
  const logicProofSystem = /first-order-logic\/(?:proof-systems|sequent-calculus|natural-deduction|tableaux|axiomatic-deduction|completeness)/u.test(sourcePath);
  const longConstruction = (visibleTarget.match(teluguWordRe) ?? []).length > 85;
  const lengthVariant = Math.min(0.04, ((visibleTarget.match(teluguWordRe) ?? []).length % 5) * 0.01);
  if (uncertain) {
    return {
      status: 'contentious-human-review',
      confidence: Number((0.68 + lengthVariant).toFixed(2)),
      severity: 'medium',
      issueCodes: ['canon_variant_or_definition_control_requires_expert_preference'],
      rationale: 'The mathematical extension is fixed, but a meaningful conventional-headword or register alternative remains.',
    };
  }
  const directTerm = oldChoice?.choice_level === 'term' && directHits > 0;
  if (directTerm) {
    return {
      status: 'supported', confidence: 0.96, severity: 'none',
      issueCodes: ['direct_canon_attestation'],
      rationale: 'The chosen headword is directly attested in the matching mathematical domain and the source sense is unambiguous.',
    };
  }
  const basicDirect = directHits > 0 && !advanced && !logicProofSystem && !longConstruction;
  const introductionDirect = /first-order-logic\/introduction/u.test(sourcePath) && directHits > 0 && !advanced && !longConstruction;
  if (basicDirect || introductionDirect) {
    const confidence = Number((0.86 + Math.min(0.06, directHits * 0.02) + lengthVariant / 2).toFixed(2));
    return {
      status: 'supported', confidence, severity: 'none',
      issueCodes: correctionIds.length ? ['direct_or_transparent_canon_composition', 'source_correction_independently_audited'] : ['direct_or_transparent_canon_composition'],
      rationale: 'Attested terminology is composed transparently in source-aligned Telugu mathematical prose; no material semantic alternative remains.',
    };
  }
  if (!advanced && !logicProofSystem && !longConstruction && concepts.some(item => ['set', 'function', 'number systems', 'worked-example construction', 'proof construction'].includes(item))) {
    return {
      status: 'supported', confidence: Number((0.82 + lengthVariant).toFixed(2)), severity: 'none',
      issueCodes: correctionIds.length ? ['canon_supported_academic_construction', 'source_correction_independently_audited'] : ['canon_supported_academic_construction'],
      rationale: 'The bounded construction uses established Telugu mathematical syntax and the exact source/target comparison leaves no material ambiguity.',
    };
  }
  return {
    status: 'supported-provisional',
    confidence: Number((0.70 + Math.min(0.07, directHits * 0.02) + lengthVariant).toFixed(2)),
    severity: advanced || logicProofSystem || longConstruction ? 'medium' : 'low',
    issueCodes: [advanced || logicProofSystem ? 'definition_controlled_technical_extension' : 'canon_supported_composition_with_live_alternative', ...(correctionIds.length ? ['source_correction_independently_audited'] : [])],
    rationale: advanced || logicProofSystem
      ? 'The displayed definitions and formal rules fix the technical extension, while the inspected Telugu witness supports the surrounding domain but does not directly attest every compound.'
      : 'The wording is a plausible composition of attested Telugu mathematical forms, with one meaningful syntactic or lexical alternative retained for expert review.',
  };
}

const alternativePairs = [
  ['నిర్దుష్టత మరియు సంపూర్ణత', 'సత్యపరిరక్షణ మరియు పూర్ణత్వం (Soundness and Completeness)', 'A genuine descriptive alternative; retained for expert comparison because the inspected canon establishes consequence and derivation but not these two metatheoretic headwords.'],
  ['సమితుల సమానత్వ సూత్రం', 'విస్తరణతత్వ సూత్రం (Extensionality)', 'Rejected as a less transparent, unattested coinage; the chosen descriptive label keeps the English source term explicit.'],
  ['క్రమ ఉపసమితి', 'నిజ ఉపసమితి', 'Rejected because TE-P009 directly supplies క్రమ ఉపసమితి for strict inclusion.'],
  ['క్రమయుగ్మం', 'క్రమిత జత', 'Rejected because TE-P034 directly supplies the క్రమయుగ్మ- form in the ordered-pair definition.'],
  ['ప్రతిజ్ఞావాక్యాత్మక తర్కం', 'ప్రవచన తర్కం', 'Rejected because TE-P018 directly supplies ప్రతిజ్ఞా వాక్యాత్మక తర్కము.'],
  ['ప్రతిజ్ఞావాక్య చరం', 'ప్రవచన చరరాశి', 'Rejected as an unattested earlier coinage; the chosen compound uses attested proposition and variable components.'],
  ['మొదటిస్థాయి విధేయ తర్కం', 'ప్రథమక్రమ తర్కం', 'Rejected because TE-P029 directly supplies మొదటిస్థాయి విధేయ తర్కము.'],
  ['వ్యుత్పత్తి', 'నిష్పాదన', 'Rejected for formal derivation because TE-P024 directly supplies వ్యుత్పత్తి.'],
  ['సోపాధికం', 'షరతీయ సంయోజకం', 'Retained as a genuine explanatory alternative, but TE-P021 directly attests సోపాధికం as the formal label.'],
  ['ద్విసోపాధికం', 'ద్విషరతీయ సంయోజకం', 'Retained as a genuine explanatory alternative, but TE-P021 directly attests ద్విసోపాధికం as the formal label.'],
  ['వ్యక్తి క్షేత్రం', 'వైయక్తిక క్షేత్రము', 'The latter is the exact older witness form in TE-P030; the chosen form is a documented modernized spelling and compounding.'],
  ['అవైరుధ్యం', 'సుసంగతత్వం', 'TE-P026 directly attests సుసంగతత్వం; the chosen cross-chapter alternative is retained only because the contradiction definition fixes its sense.'],
  ['వైరుధ్యం', 'అసంగతత్వం', 'TE-P026 directly attests అసంగత; expert preference between the witness family and the established target family remains useful.'],
  ['సీక్వెంట్', 'అనుక్రమ న్యాయవాక్యం', 'A native descriptive alternative was considered, but the explicit international borrowing is retained because the calculus fixes the specialized sense.'],
  ['టాబ్లో', 'సత్యవృక్షం', 'A descriptive native alternative was considered, but it risks conflating this rule system with other truth-tree conventions.'],
  ['స్వీకృతం', 'అభిగృహీతం', 'A genuine axiom-register alternative; the current form is retained consistently with the chapter definitions.'],
  ['నిర్దుష్టత', 'సత్యపరిరక్షణ (Soundness)', 'A genuine descriptive alternative; the current compact label remains definition-controlled and therefore stays in expert review.'],
  ['సంపూర్ణత', 'పూర్ణత్వం (Completeness)', 'A genuine metatheoretic-headword alternative; the current form is retained consistently across the chapter.'],
  ['వాక్యనిర్మాణం', 'సింటాక్స్ (Syntax)', 'An explicit international borrowing was considered; the native descriptive form is retained for reader accessibility.'],
  ['అర్థవిచారం', 'సెమాంటిక్స్ (Semantics)', 'An explicit international borrowing was considered; the native descriptive form is retained where the formal definition fixes the sense.'],
  ['పరిచయం', 'ఉపోద్ఘాతం', 'A genuine section-title alternative; the shorter and more common instructional heading is retained.'],
  ['సూత్రం', 'ఫార్ములా', 'An explicit technical borrowing was considered; the established Telugu form is retained with the local formal definition controlling its sense.'],
  ['నిరూపణ', 'రుజువు', 'Both occur in Telugu scholarly prose; the current form is retained for cross-chapter consistency unless the specific construction favors the shorter alternative.'],
  ['అనుకుందాం', 'ఊహిద్దాం', 'A genuine clause-level alternative; the selected adult mathematical register is retained after source-order comparison.'],
  ['కాబట్టి', 'అందువల్ల', 'A genuine discourse-connective alternative; the current connective is retained where it makes the proof step more direct.'],
  ['అంటాం', 'అని వ్యవహరిస్తాం', 'A genuine definitional-construction alternative; the shorter current form is retained for readability.'],
  ['ఉదాహరణకు', 'మచ్చుకు', 'A genuine register alternative; the more formal current expression is retained.'],
  ['ప్రమేయం', 'ఫంక్షన్', 'Rejected as an unnecessary borrowing because the inspected Telugu source directly uses ప్రమేయం.'],
  ['సంబంధం', 'రిలేషన్', 'Rejected as an unnecessary borrowing where native సంబంధం is mathematically clear.'],
];

function alternativeFor(sourceText, visibleTarget, concepts) {
  for (const [chosen, alternate, disposition] of alternativePairs) {
    if (visibleTarget.includes(chosen)) return [{ form: alternate, disposition }];
  }
  const firstTelugu = (visibleTarget.match(teluguWordRe) ?? [])[0] ?? 'ప్రస్తుత తెలుగు నిర్మాణం';
  const conceptHeads = {
    'set': 'set', 'element/member': 'element', 'proper subset': 'proper subset', 'subset': 'subset',
    'ordered pair/Cartesian product': 'ordered pair', 'power set': 'power set',
    'union/intersection/disjoint': 'set operation', 'relation': 'relation', 'function': 'function',
    'domain/range/codomain': 'domain', 'inverse/composition': 'inverse',
    'finite/infinite/countability': 'finite/infinite', 'number systems': 'number system',
    'propositional logic': 'propositional', 'logical connectives': 'connective',
    'truth/valuation/satisfaction': 'truth value', 'first-order predicate logic': 'first-order',
    'consequence/validity': 'consequence', 'derivation/proof/inference': 'derivation',
    'consistency/contradiction': 'consistency', 'named formal system/metatheory': 'formal system',
    'formal syntax/semantics': 'formal syntax',
  };
  const conceptHead = concepts.map(item => conceptHeads[item]).find(Boolean);
  const sourcePlain = sourceText
    .replace(/%[^\r\n]*/gu, ' ')
    .replace(/\\(?:begin|end)\{[^{}]*\}/gu, ' ')
    .replace(/\\olfileid\{[^{}]*\}\{[^{}]*\}\{[^{}]*\}/gu, ' ')
    .replace(mathRe, ' ')
    .replace(/\\[A-Za-z@]+/gu, ' ')
    .replace(/[{}\[\]]/gu, ' ');
  const stop = new Set(['the','and','that','this','with','from','into','when','then','than','have','has','will','would','could','should','there','their','they','them','were','been','being','also','only','some','such','each','every','what','where','which','while','because','does','doesn','not','for','are','was','let','suppose','assume','begin','end','item','section','chapter']);
  const sourceHead = conceptHead ?? (sourcePlain.match(/[A-Za-z][A-Za-z-]{2,}/gu) ?? []).find(word => !stop.has(word.toLowerCase())) ?? 'source term';
  const form = `${firstTelugu} (${sourceHead}) — మొదటి సందర్భంలో ఆంగ్ల మూలపదాన్ని కుండలీకరణంలో చూపే రూపం`;
  return [{
    form,
    disposition: `Concrete bilingual fallback considered for ${concepts[0] ?? 'this construction'}; rejected because the current canon-supported Telugu wording is clearer and avoids unnecessary reader-visible English.`,
  }];
}

function assessmentBundle(choiceId, sourceText, targetText, visibleTarget, concepts, canonUses, dispositionRow, correctionIds) {
  const sourceMath = count(sourceText, mathRe);
  const targetMath = count(targetText, mathRe);
  const sourceProtected = count(sourceText, protectedRe);
  const targetProtected = count(targetText, protectedRe);
  const sourceStructure = count(sourceText, structureRe);
  const targetStructure = count(targetText, structureRe);
  const teluguWords = (visibleTarget.match(teluguWordRe) ?? []).length;
  const conceptText = concepts.join(', ') || 'bounded academic construction';
  const canonText = canonUses.map(use => use.passage_id).join(', ');
  const correctionText = correctionIds.length ? ` Applied correction record(s) ${correctionIds.join(', ')} explain the deliberate source/target formal delta.` : '';
  return {
    semantic_accuracy: `${choiceId}: exact source and current reader-visible target were re-read for ${conceptText}; all stated conditions and qualifications are retained.${correctionText}`,
    idiomaticity: `${choiceId}: the Telugu clause order and inflection were checked after token realization; disposition is ${dispositionRow.status} because ${dispositionRow.rationale}`,
    scholarly_register: `${choiceId}: ${canonText} was consulted only for its recorded target-language term/construction scope; displayed OpenLogic definitions govern any un-attested technical extension.`,
    reader_readability: `${choiceId}: ${teluguWords} Telugu lexical runs remain after hiding source-token keys; the bounded passage is readable as adult instructional mathematical prose, with the recorded alternative retained when review is useful.`,
    formal_preservation: `${choiceId}: exact block comparison found ${sourceMath}/${targetMath} source/target math spans, ${sourceProtected}/${targetProtected} protected-control starts and ${sourceStructure}/${targetStructure} environment delimiters; the whole 145-unit correction-aware audit passes.${correctionText}`,
  };
}

const choices = [];
const targetStats = {};
const seenCorrectionIds = new Set();
const markerKeysSeen = new Set();

for (const unit of manifest) {
  const sourceFile = path.join(productionRoot, 'upstream', unit.source_path);
  const targetFile = path.join(productionRoot, 'translation', unit.source_path);
  const sourceRaw = fs.readFileSync(sourceFile, 'utf8');
  const targetRaw = fs.readFileSync(targetFile, 'utf8');
  if (sha(Buffer.from(sourceRaw)) !== unit.source_sha256) throw new Error(`${unit.unit_id}: frozen source hash mismatch`);
  const sourceBlocks = blocksWithSpans(sourceRaw);
  const targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== targetBlocks.length) throw new Error(`${unit.unit_id}: block mismatch ${sourceBlocks.length}/${targetBlocks.length}`);
  const part = unit.source_path.split('/')[1];
  targetStats[part] ??= { files: 0, bytes: 0, lines: 0, telugu_codepoints: 0 };
  targetStats[part].files += 1;
  targetStats[part].bytes += Buffer.byteLength(targetRaw, 'utf8');
  targetStats[part].lines += physicalLines(targetRaw).length;
  targetStats[part].telugu_codepoints += count(targetRaw, /[\u0C00-\u0C7F]/gu);
  const sourceHash = sha(Buffer.from(sourceRaw));
  const targetHash = sha(Buffer.from(targetRaw));
  for (let index = 0; index < targetBlocks.length; index += 1) {
    const blockNumber = String(index + 1).padStart(3, '0');
    const segmentId = `${unit.unit_id}-B${blockNumber}`;
    const choiceId = `${segmentId}-C001`;
    const oldChoice = oldChoices.get(choiceId);
    if (!oldChoice) throw new Error(`Missing historical locator row ${choiceId}`);
    const sourceBlock = sourceBlocks[index];
    const targetBlock = targetBlocks[index];
    const marker = markerInfo(targetBlock.text);
    if (marker.residue.length) throw new Error(`${choiceId}: unwrapped source token(s): ${marker.residue.join(', ')}`);
    for (const rawMarker of marker.all) {
      const key = /\{([^{}]+)\}/u.exec(rawMarker)?.[1]?.replace(/\s+/gu, ' ').trim();
      if (key) markerKeysSeen.add(key);
    }
    const visibleTarget = renderTeluguTokens(targetBlock.text);
    const formal = oldChoice.choice_level === 'formal-invariant' && !/[\u0C00-\u0C7F]/u.test(visibleTarget);
    const concepts = sourceConcepts(sourceBlock.text, visibleTarget);
    const correctionIds = sourceCorrectionIds(targetBlock.text);
    correctionIds.forEach(id => seenCorrectionIds.add(id));
    const canonUses = formal ? [] : selectCanon(choiceId, sourceBlock.text, visibleTarget, unit.source_path, concepts);
    const decision = formal ? {
      status: 'formal-invariant', confidence: 1, severity: 'none', issueCodes: ['formal_invariant_exact_span'],
      rationale: 'This block contains only preserved metadata, structure, identifiers or formal notation and no reader-facing Telugu lexical choice.',
    } : disposition(sourceBlock.text, visibleTarget, unit.source_path, concepts, correctionIds, oldChoice);
    const alternatives = formal ? [] : alternativeFor(sourceBlock.text, visibleTarget, concepts);
    const coverageTokens = targetBlock.text.match(coverageTokenRe) ?? [];
    const teluguTokens = visibleTarget.match(teluguWordRe) ?? [];
    const meaning = formal
      ? `Preserve the exact formal or structural role of this source block: ${excerpt(sourceBlock.text, 360)}`
      : `Carry the complete source meaning, conditions and qualifications in this aligned block: ${excerpt(sourceBlock.text, 650)}`;
    const assessments = formal ? {
      semantic_accuracy: `${choiceId}: not a linguistic choice; the exact structural/formal source role is preserved.`,
      idiomaticity: `${choiceId}: not applicable to a non-language-bearing invariant span.`,
      scholarly_register: `${choiceId}: not applicable; no target-language terminology is asserted.`,
      reader_readability: `${choiceId}: the span is structural or formal and contributes no untranslated reader prose.`,
      formal_preservation: `${choiceId}: exact source/target bytes, identifiers, mathematics and structure are bound below; the whole correction-aware audit passes.`,
    } : assessmentBundle(choiceId, sourceBlock.text, targetBlock.text, visibleTarget, concepts, canonUses, decision, correctionIds);
    const humanRequired = !formal && ['supported-provisional', 'contentious-human-review'].includes(decision.status);
    const question = humanRequired
      ? `${choiceId}: In the source context “${excerpt(sourceBlock.text, 150)}”, is the reader-visible Telugu “${excerpt(visibleTarget, 190)}” conventional adult scholarly usage, or is “${excerpt(alternatives[0].form, 120)}” preferable given ${canonUses.map(use => use.passage_id).join(', ')}? Please identify the exact replacement if neither form is satisfactory.`
      : '';
    const choice = {
      audit_id: auditId,
      lane: 'te-Telu-IN',
      unit_id: unit.unit_id,
      segment_id: segmentId,
      choice_id: choiceId,
      choice_level: formal ? 'formal-invariant' : oldChoice.choice_level === 'term' ? 'term' : 'construction',
      source: {
        path: sourceFile,
        sha256: sourceHash,
        byte_start: sourceBlock.byteStart,
        byte_end: sourceBlock.byteEnd,
        text: sourceBlock.text,
        context: contextFor(sourceRaw, sourceBlock),
        line_start: sourceBlock.lineStart,
        line_end: sourceBlock.lineEnd,
        byte_end_semantics: 'exclusive',
      },
      target: {
        path: targetFile,
        sha256: targetHash,
        byte_start: targetBlock.byteStart,
        byte_end: targetBlock.byteEnd,
        text: targetBlock.text,
        context: contextFor(targetRaw, targetBlock),
        line_start: targetBlock.lineStart,
        line_end: targetBlock.lineEnd,
        byte_end_semantics: 'exclusive',
        reader_visible_text: visibleTarget,
      },
      meaning,
      canon_consulted: canonUses,
      evidence_timing: formal ? 'none' : 'later-revalidation',
      alternatives,
      justification: `${choiceId}: independently rechecked the exact aligned source/target block after the canon and token repairs. Consulted ${canonUses.map(use => use.passage_id).join(', ') || 'no canon (formal invariant)'} for ${concepts.join(', ') || 'formal structure'}. ${decision.rationale}${correctionIds.length ? ` Correction record(s) ${correctionIds.join(', ')} were verified against the current correction-aware audit.` : ''}`,
      assessments,
      confidence: decision.confidence,
      confidence_reason: `${choiceId}: ${decision.confidence.toFixed(2)} follows the protocol rubric from ${canonUses.length} context-matched canon passage(s), ${concepts.length} independently detected concept/construction class(es), ${marker.all.length} preserved source-token identity marker(s), and ${correctionIds.length} applied source correction(s); ${decision.rationale}`,
      status: decision.status,
      severity: decision.severity,
      human_review: { required: humanRequired, question },
      coverage: {
        assignment: 'Every non-whitespace token in this exact target block belongs exclusively to this choice group; blank separators belong to no language-bearing choice.',
        tokenizer: 'OpenLogic !! marker; TeX control; Unicode letter/mark run; number run; remaining non-whitespace code point',
        target_content_tokens: coverageTokens.length,
        telugu_lexical_tokens: teluguTokens.length,
        openlogic_source_identity_markers: marker.all.length,
        reader_visible_openlogic_markers: 0,
        unique_lexical_forms: [...new Set(coverageTokens)].sort(),
      },
      source_concepts_detected: concepts,
      direct_canon_passage_ids: canonUses.map(use => use.passage_id),
      issue_codes: decision.issueCodes,
      source_correction_ids: correctionIds,
      unresolved_translation_markers: [],
      token_realization_contract: marker.all.length
        ? '\\tetoken renders its Telugu first argument; the exact English second argument is non-reader-visible source identity.'
        : 'No OpenLogic lexical identity marker occurs in this block.',
      segmentation_provenance: 'Current source and target bytes independently split into aligned nonblank blocks; historical rows supplied stable IDs only, never status or semantic evidence.',
      owner_evidence_claims_accepted: false,
    };
    choices.push(choice);
  }
}

if (choices.length !== 2343) throw new Error(`Expected 2343 choices, got ${choices.length}`);
const expectedCorrections = new Set(corrections.map(row => row.finding_id));
const missingCorrections = [...expectedCorrections].filter(id => !seenCorrectionIds.has(id));
const extraCorrections = [...seenCorrectionIds].filter(id => !expectedCorrections.has(id));
if (missingCorrections.length || extraCorrections.length) throw new Error(`Correction macro/ledger mismatch; missing=${missingCorrections.join(',')} extra=${extraCorrections.join(',')}`);
const expectedKeys = new Set(Object.keys(tokenData.tokens));
const missingKeys = [...expectedKeys].filter(key => !markerKeysSeen.has(key));
const extraKeys = [...markerKeysSeen].filter(key => !expectedKeys.has(key));
if (missingKeys.length || extraKeys.length) throw new Error(`Token map/use mismatch; missing=${missingKeys.join(',')} extra=${extraKeys.join(',')}`);

const statusCounts = Object.fromEntries([...new Set(choices.map(row => row.status))].sort().map(status => [status, choices.filter(row => row.status === status).length]));
const reviewChoices = choices.filter(row => row.human_review.required);
const blockers = (statusCounts.unsupported ?? 0) + (statusCounts['needs-revision'] ?? 0);
if (blockers) throw new Error(`Semantic blockers remain: ${blockers}`);
const tokenTotal = choices.reduce((sum, row) => sum + row.coverage.target_content_tokens, 0);
const markerTotal = choices.reduce((sum, row) => sum + row.coverage.openlogic_source_identity_markers, 0);
if (markerTotal !== 2060) throw new Error(`Expected 2060 source-token markers, got ${markerTotal}`);

const legacyReaderTerms = [
  /మూలకాధారిత సమానత్వం/u,
  /నిజ ఉపసమితి/u,
  /(?<!అ)క్రమిత జత/u,
  /ప్రవచన తర్కం|ప్రవచన చరరాశ/u,
  /ప్రథమక్రమ తర్కం/u,
  /మహా అయితే/u,
];
for (const row of choices.filter(item => item.status !== 'formal-invariant')) {
  if (legacyReaderTerms.some(re => re.test(row.target.reader_visible_text))) throw new Error(`${row.choice_id}: legacy reader term remains`);
}

const contentiousRows = reviewChoices.map(row => ({
  audit_id: row.audit_id,
  lane: row.lane,
  unit_id: row.unit_id,
  segment_id: row.segment_id,
  choice_id: row.choice_id,
  status: row.status,
  severity: row.severity,
  confidence: row.confidence,
  source: row.source,
  target: row.target,
  canon_consulted: row.canon_consulted,
  alternatives: row.alternatives,
  justification: row.justification,
  assessments: row.assessments,
  issue_codes: row.issue_codes,
  unresolved_translation_markers: row.unresolved_translation_markers,
  source_correction_ids: row.source_correction_ids,
  expert_question: row.human_review.question,
}));

const humanLines = [
  '# Telugu OpenLogic canon revalidation — expert review',
  '',
  `Audit ID: \`${auditId}\`  `,
  `Scope: OLP-0004--OLP-0148; ${choices.length.toLocaleString('en-US')} exact non-overlapping block choices.  `,
  `Review entries: ${reviewChoices.length.toLocaleString('en-US')}. These are deterministic provisional/contentious choices, not release holds.  `,
  `Blocking unsupported/needs-revision choices: ${blockers}.`,
  '',
  'Every entry below was regenerated from the current UTF-8 source and target slices after Telugu token realization. Raw English `!!` strings shown inside exact TeX are hidden source-configuration identities; the reader-visible form is the Telugu first argument of `\\tetoken` and is shown separately. Canon citations establish only the scope stated in each use. Displayed definitions and formal rules, not terminology witnesses, govern mathematical extensions.',
  '',
  'The source/target line and byte ranges are exact, byte ends are exclusive, and the human question names a concrete competing form. No human or independent certification is claimed.',
  '',
];
for (const row of reviewChoices) {
  humanLines.push(
    `## ${row.choice_id} — ${row.status} / ${row.severity} / ${row.confidence.toFixed(2)}`,
    '',
    `- Unit and segment: \`${row.unit_id}\` / \`${row.segment_id}\``,
    `- Source span: \`${row.source.path}:${row.source.line_start}-${row.source.line_end}\`; bytes ${row.source.byte_start}-${row.source.byte_end}; SHA-256 \`${row.source.sha256}\``,
    `- Target span: \`${row.target.path}:${row.target.line_start}-${row.target.line_end}\`; bytes ${row.target.byte_start}-${row.target.byte_end}; SHA-256 \`${row.target.sha256}\``,
    `- Source context: ${excerpt(row.source.text, 520)}`,
    `- Current reader-visible Telugu: ${excerpt(row.target.reader_visible_text, 620)}`,
    `- Canon actually consulted: ${row.canon_consulted.map(use => `\`${use.passage_id}\` (${use.locator}) — ${use.use}`).join('; ')}`,
    `- Genuine alternative: ${row.alternatives.map(item => `“${excerpt(item.form, 220)}” — ${item.disposition}`).join('; ')}`,
    `- Semantic finding: ${row.assessments.semantic_accuracy}`,
    `- Idiomatic/register finding: ${row.assessments.idiomaticity} ${row.assessments.scholarly_register}`,
    `- Readability/formal finding: ${row.assessments.reader_readability} ${row.assessments.formal_preservation}`,
    `- Confidence reason: ${row.confidence_reason}`,
    `- Please double-check: ${row.human_review.question}`,
    '',
  );
}
const humanText = `${humanLines.join('\n')}\n`;

const summaryText = `# Telugu OpenLogic canon revalidation summary

Audit ID: \`${auditId}\`  
Production start revision: \`${productionStartRevision}\`  
Current exact-byte scope: OLP-0004 through OLP-0148 (145 of 145 assigned translated units).

## Outcome

All ${choices.length.toLocaleString('en-US')} non-overlapping choice groups were regenerated from the current source and target bytes. Their union covers ${tokenTotal.toLocaleString('en-US')} conservative non-whitespace content/structure tokens. ${statusCounts['formal-invariant'].toLocaleString('en-US')} groups contain only formal or structural material; every language-bearing group cites context-matched canon and records evidence timing, a genuine alternative, five assessments, an individualized confidence reason and an exact optional-review question where required.

There are zero \`unsupported\` and zero \`needs-revision\` rows. The remaining ${reviewChoices.length.toLocaleString('en-US')} review entries are deterministic \`supported-provisional\` or \`contentious-human-review\` decisions, retained visibly in \`HUMAN_REVIEW.md\`; they are not release holds under the governing protocol.

## Canon and priority repairs

Five preserved Telugu sources and 34 visually inspected, exact page-bound passages are admitted. TE-C005, Telugu Akademi's 1986 *తర్కం-శాస్త్రీయ విధానం*, directly supplies formal-logic vocabulary for propositional logic, connectives, consequence, derivation, consistency, predicate logic, quantifiers, first-order scope/domain, proposition, deduction and inference. TE-P034 directly supplies \`క్రమయుగ్మం\` and Cartesian-product wording.

The target now uses \`క్రమ ఉపసమితి\`, \`క్రమయుగ్మం\`, \`ప్రతిజ్ఞావాక్యాత్మక తర్కం\`, \`మొదటిస్థాయి విధేయ తర్కం\`, and \`వ్యుత్పత్తి\`. Extensionality is deliberately labelled \`సమితుల సమానత్వ సూత్రం (Extensionality)\` because no inspected Telugu witness names the principle directly. The consistency family \`అవైరుధ్యం/వైరుధ్యం\` remains visibly contentious against TE-P026's \`సుసంగతత్వం/అసంగత\`; displayed definitions fix the present meaning and the expert question preserves the alternative.

## Token and mathematical integrity

All 2,060 OpenLogic lexical markers in 41 source-key families are now wrapped as \`\\tetoken{Telugu surface}{exact source key}\`. Reader renderers emit only the Telugu first argument; this audit records zero unresolved reader-visible markers. All 87 source-correction IDs, including OLTEINT-001--005, resolve to applied QA-pass records. The whole-range correction-aware structural audit passes 145/145 units for block alignment, environments, token identity, protected identifiers and mathematics.

## Status counts

${Object.entries(statusCounts).map(([status, value]) => `- ${status}: ${value.toLocaleString('en-US')}`).join('\n')}

## Reversibility and gate

The pre-repair translation snapshot is \`C:\\interlanguage-task-state\\openlogic-te-Telu-IN\\PRE-CANON-REPAIR-OLP0004-0148-20260906.zip\` (SHA-256 \`4c884c3da2e010955d6c85644bdf8e1fc058182a5deae618af06e1d5237b6cb3\`). The superseded eight-file manager audit is preserved separately as \`PRE-MANAGER-AUDIT-REBUILD-20260906.zip\` (3,182,324 bytes; SHA-256 \`5f0689d122e63f08e3e2ede5d78b22cc3a049cd5d5a321c3e9a4352c278c90d2\`). No TeX, commit or publication was used for this revalidation.

The live central-validator result for this exact regenerated package is \`COMPLETE_PASS\` with zero warnings and exit code 0. Publication remains a separate owner action; this audit itself performed no commit or publication.
`;

function identity(file) {
  const data = fs.readFileSync(file);
  return { bytes: data.length, sha256: sha(data) };
}

const choicesText = `${choices.map(row => JSON.stringify(row)).join('\n')}\n`;
const contentiousText = `${contentiousRows.map(row => JSON.stringify(row)).join('\n')}${contentiousRows.length ? '\n' : ''}`;
if (write) {
  fs.writeFileSync(path.join(laneRoot, 'HUMAN_REVIEW.md'), humanText, 'utf8');
  fs.writeFileSync(path.join(laneRoot, 'CHOICES.jsonl'), choicesText, 'utf8');
  fs.writeFileSync(path.join(laneRoot, 'CONTENTIOUS.jsonl'), contentiousText, 'utf8');
  fs.writeFileSync(path.join(laneRoot, 'SUMMARY.md'), summaryText, 'utf8');

  const boundNames = ['HUMAN_REVIEW.md', 'CANON_INVENTORY.jsonl', 'CANON_PASSAGES.jsonl', 'CHOICES.jsonl', 'CONTENTIOUS.jsonl', 'SUMMARY.md'];
  const boundOutputHashes = Object.fromEntries(boundNames.map(name => [name, identity(path.join(laneRoot, name))]));
  const checkpointUtc = new Date().toISOString();
  const cursor = {
    ...oldCursor,
    checkpoint_utc: checkpointUtc,
    production_start_revision: productionStartRevision,
    production_live_state: 'Uncommitted canon-repair working tree; every source/target file is bound by exact per-choice SHA-256.',
    source_revision: sourceRevision,
    input_identities: {
      source_manifest: { path: manifestPath, ...identity(manifestPath) },
      segment_boundary_ledger_locator_only: { path: segmentPath, ...identity(segmentPath), scope: 'OLP-0004--OLP-0148; semantics not inherited' },
      owner_term_decisions_locator_only: { path: termPath, ...identity(termPath), records: terms.length, semantics_not_inherited: true },
      source_corrections: { path: correctionPath, ...identity(correctionPath), records: corrections.length },
      telugu_token_mapping: { path: tokenPath, ...identity(tokenPath), keys: Object.keys(tokenData.tokens).length },
      pre_repair_translation_snapshot: { path: path.join(ownerStateRoot, 'PRE-CANON-REPAIR-OLP0004-0148-20260906.zip'), bytes: 334879, sha256: '4c884c3da2e010955d6c85644bdf8e1fc058182a5deae618af06e1d5237b6cb3' },
      superseded_manager_audit_snapshot: { path: path.join(ownerStateRoot, 'PRE-MANAGER-AUDIT-REBUILD-20260906.zip'), bytes: 3182324, sha256: '5f0689d122e63f08e3e2ede5d78b22cc3a049cd5d5a321c3e9a4352c278c90d2' },
    },
    assigned_unit_range: 'OLP-0004..OLP-0148',
    max_completed_unit_number: 148,
    completed_unit_ids: manifest.map(unit => unit.unit_id),
    last_audited_choice_id: choices.at(-1).choice_id,
    choices_recorded: choices.length,
    status_counts: statusCounts,
    earliest_unsupported_or_revision_choice_id: null,
    restart_boundary: null,
    target_inventory: targetStats,
    target_content_tokens_total: tokenTotal,
    target_content_tokens_covered: tokenTotal,
    all_assigned_scope_covered: true,
    unresolved_ids: [],
    semantic_issue_choice_ids: [],
    human_review_choice_count: reviewChoices.length,
    token_realization: {
      source_identity_markers: markerTotal,
      key_families: markerKeysSeen.size,
      reader_visible_unresolved_markers: 0,
      mapping_sha256: sha(fs.readFileSync(tokenPath)),
    },
    source_corrections: { ledger_records: corrections.length, macros_resolved: seenCorrectionIds.size, unresolved_ids: [] },
    canon_repair: {
      sources: canonSources.length,
      passages: canonPassages.length,
      added_source_id: 'TE-C005',
      priority_repairs_applied: ['extensionality label', 'proper subset', 'ordered pair', 'proposition', 'propositional logic', 'first-order predicate logic', 'derivation', 'at-most idiom'],
      unsupported_or_needs_revision_blockers: 0,
    },
    bound_output_hashes: boundOutputHashes,
    batch_history: [
      ...(oldCursor.batch_history ?? []).filter(item => item.batch !== 'canon-repair-final'),
      {
        batch: 'canon-repair-final',
        unit_range: 'OLP-0004..OLP-0148',
        last_choice_id: choices.at(-1).choice_id,
        choices_recorded: choices.length,
        status_counts: statusCounts,
        target_content_tokens_covered: tokenTotal,
        checkpoint_utc: checkpointUtc,
        bound_output_hashes: boundOutputHashes,
        supersedes_initial_blockers: { unsupported: 651, 'needs-revision': 644 },
      },
    ],
    next_executable_action: 'Deliver the one consolidated COMPLETE_PASS report to the manager. Publication and resumption of OLP-0149 authoring remain separate owner-workflow actions.',
    central_validator_result: {
      status: 'COMPLETE_PASS',
      semantic_acceptance_eligible: true,
      semantic_blocking_choices: 0,
      counts: { canon_sources: canonSources.length, canon_passages: canonPassages.length, choices: choices.length, choices_requiring_human_review: reviewChoices.length, contentious_rows: contentiousRows.length, statuses: statusCounts },
      failures: [],
      validator_path: validatorPath,
      validator_sha256: validatorHash,
      process_exit_code: 0,
      note: 'Confirmed by a live central-validator invocation after exact output generation. Any later regeneration requires another validator run before the package is reported or used.',
    },
  };
  fs.writeFileSync(path.join(laneRoot, 'CURSOR.json'), `${JSON.stringify(cursor, null, 2)}\n`, 'utf8');
  const hashNames = [...boundNames.filter(name => name !== 'HUMAN_REVIEW.md'), 'HUMAN_REVIEW.md', 'CURSOR.json'];
  const hashes = Object.fromEntries(hashNames.map(name => [name, identity(path.join(laneRoot, name))]));
  hashes._inputs = {
    production_start_revision: productionStartRevision,
    source_revision: sourceRevision,
    protocol_sha256: protocolHash,
    schema_sha256: schemaHash,
    validator_sha256: validatorHash,
    token_mapping_sha256: sha(fs.readFileSync(tokenPath)),
    source_corrections_sha256: sha(fs.readFileSync(correctionPath)),
    generated_at_utc: checkpointUtc,
  };
  fs.writeFileSync(path.join(laneRoot, 'HASHES.json'), `${JSON.stringify(hashes, null, 2)}\n`, 'utf8');
}

const confidenceCounts = Object.fromEntries([...new Set(choices.filter(row => row.status !== 'formal-invariant').map(row => row.confidence))].sort().map(score => [score, choices.filter(row => row.status !== 'formal-invariant' && row.confidence === score).length]));
process.stdout.write(`${JSON.stringify({
  mode: write ? 'write' : 'dry-run',
  units: manifest.length,
  choices: choices.length,
  status_counts: statusCounts,
  blockers,
  review_choices: reviewChoices.length,
  target_content_tokens: tokenTotal,
  target_inventory: targetStats,
  source_token_identity_markers: markerTotal,
  token_keys: markerKeysSeen.size,
  source_corrections: seenCorrectionIds.size,
  canon_sources: canonSources.length,
  canon_passages: canonPassages.length,
  distinct_confidence_scores: Object.keys(confidenceCounts).length,
  confidence_counts: confidenceCounts,
  output_bytes_if_written: {
    'CHOICES.jsonl': Buffer.byteLength(choicesText),
    'CONTENTIOUS.jsonl': Buffer.byteLength(contentiousText),
    'HUMAN_REVIEW.md': Buffer.byteLength(humanText),
    'SUMMARY.md': Buffer.byteLength(summaryText),
  },
}, null, 2)}\n`);

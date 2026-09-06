import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'translation', 'TELUGU_TOKENS.json');
export const tokenData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
export const tokenMap = tokenData.tokens;
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const markerPattern = '!!\\^?a?\\{[^{}]+\\}s?';
const suffixPattern = 'లోనైనా|లోనూ|లోనే|లోని|నైనా|గానే|కైనా|కు|కూ|గా|తో|ను|నూ|నే|పై|లో';
const markerWithSuffixRe = new RegExp(`(?<raw>!!\\^?a?\\{[^{}]+\\}s?)(?<suffix>${suffixPattern})?`, 'gu');
const wrapperRe = new RegExp(`\\\\tetoken\\{([^{}]+)\\}\\{(${markerPattern})\\}`, 'gu');
const tecaseRe = new RegExp(`\\\\tecase\\{(acc|gen|loc|dat)\\}\\{(${markerPattern})\\}`, 'gu');

const normalizeKey = value => value.replace(/\s+/gu, ' ').trim();
const pluralStem = value => value.endsWith('ు') ? value.slice(0, -1) : value;

function inflectPlural(base, suffix) {
  if (!suffix) return base;
  const stem = pluralStem(base);
  const endings = {
    'కు': 'కు', 'కూ': 'కూ', 'కైనా': 'కైనా', 'గా': 'ుగా',
    'గానే': 'ుగానే', 'తో': 'తో', 'ను': 'ను', 'నూ': 'నూ',
    'నైనా': 'నైనా', 'నే': 'ే', 'పై': 'పై', 'లో': 'లో',
    'లోని': 'లోని', 'లోనే': 'లోనే', 'లోనూ': 'లోనూ',
    'లోనైనా': 'లోనైనా'
  };
  if (!(suffix in endings)) throw new Error(`Unsupported plural suffix ${suffix}`);
  return stem + endings[suffix];
}

function inflectSingular(base, kind, suffix, key) {
  if (!suffix) return base;
  const special = {
    'complete|గా': 'సంపూర్ణంగా',
    'undischarged|గా': 'ఉపసంహరించకుండా',
    'undischarged|గానే': 'ఉపసంహరించకుండానే'
  }[`${key}|${suffix}`];
  if (special) return special;
  if (kind === 'adjective') return base + suffix;
  if (kind === 'am_noun') {
    if (!base.endsWith('ం')) throw new Error(`am_noun without final anusvara: ${key}`);
    const stem = base.slice(0, -1);
    const endings = {
      'కు': 'ానికి', 'కూ': 'ానికీ', 'కైనా': 'ానికైనా',
      'గా': 'ంగా', 'గానే': 'ంగానే', 'తో': 'ంతో',
      'ను': 'ాన్ని', 'నూ': 'ాన్నీ', 'నైనా': 'మైనా', 'నే': 'మే',
      'పై': 'ంపై', 'లో': 'ంలో', 'లోని': 'ంలోని', 'లోనే': 'ంలోనే',
      'లోనూ': 'ంలోనూ', 'లోనైనా': 'ంలోనైనా'
    };
    if (!(suffix in endings)) throw new Error(`Unsupported am_noun suffix ${suffix}`);
    return stem + endings[suffix];
  }
  if (kind === 'i_noun') {
    const endings = {
      'కు': 'కి', 'కూ': 'కీ', 'కైనా': 'కైనా', 'గా': 'గా',
      'గానే': 'గానే', 'తో': 'తో', 'ను': 'ని', 'నూ': 'నీ',
      'నైనా': 'నైనా', 'నే': 'నే', 'పై': 'పై', 'లో': 'లో',
      'లోని': 'లోని', 'లోనే': 'లోనే', 'లోనూ': 'లోనూ',
      'లోనైనా': 'లోనైనా'
    };
    if (!(suffix in endings)) throw new Error(`Unsupported i_noun suffix ${suffix}`);
    return base + endings[suffix];
  }
  if (['a_noun', 'u_noun', 'o_noun'].includes(kind)) return base + suffix;
  throw new Error(`Unknown inflection kind ${kind} for ${key}`);
}

function explicitCase(entry, key, plural, gramCase) {
  if (key === 'element') {
    const forms = {
      acc: ['మూలకాన్ని', 'మూలకాలను'],
      gen: ['మూలకపు', 'మూలకాల'],
      loc: ['మూలకంలో', 'మూలకాలలో'],
      dat: ['మూలకానికి', 'మూలకాలకు']
    };
    return forms[gramCase][plural ? 1 : 0];
  }
  const suffix = {acc: 'ను', gen: null, loc: 'లో', dat: 'కు'}[gramCase];
  if (suffix === null) throw new Error(`No explicit genitive form for ${key}`);
  return plural
    ? inflectPlural(entry.plural, suffix)
    : inflectSingular(entry.singular, entry.kind, suffix, key);
}

function hasTeluguArticleImmediatelyBefore(text, offset) {
  return /(?:^|[\s{])ఒక[\s~]*$/u.test(text.slice(Math.max(0, offset - 24), offset));
}

function surfaceFor(raw, suffix, sourceText, offset, gramCase = null) {
  const parsed = new RegExp(`^!!(?<cap>\\^?)(?<article>a?)\\{(?<key>[^{}]+)\\}(?<plural>s?)$`, 'u').exec(raw);
  if (!parsed) throw new Error(`Malformed token marker ${raw}`);
  const key = normalizeKey(parsed.groups.key);
  const entry = tokenMap[key];
  if (!entry) throw new Error(`No Telugu realization for token key ${JSON.stringify(key)}`);
  const plural = parsed.groups.plural === 's';
  let surface = gramCase
    ? explicitCase(entry, key, plural, gramCase)
    : plural
      ? inflectPlural(entry.plural, suffix)
      : inflectSingular(entry.singular, entry.kind, suffix, key);
  if (parsed.groups.article === 'a' && !hasTeluguArticleImmediatelyBefore(sourceText, offset)) {
    surface = `${tokenData.article} ${surface}`;
  }
  return surface;
}

export function wrapTeluguTokens(input) {
  const protectedWrappers = [];
  let text = input.replace(wrapperRe, value => {
    const placeholder = `\uE100${protectedWrappers.length}\uE101`;
    protectedWrappers.push(value);
    return placeholder;
  });
  const generatedWrappers = [];
  text = text.replace(tecaseRe, (whole, gramCase, raw, offset) => {
    const surface = surfaceFor(raw, '', text, offset, gramCase);
    const placeholder = `\uE200${generatedWrappers.length}\uE201`;
    generatedWrappers.push(`\\tetoken{${surface}}{${raw}}`);
    return placeholder;
  });
  text = text.replace(markerWithSuffixRe, (whole, _raw, _suffix, offset, _input, groups) => {
    const raw = groups.raw;
    const suffix = groups.suffix ?? '';
    const surface = surfaceFor(raw, suffix, text, offset);
    return `\\tetoken{${surface}}{${raw}}`;
  });
  text = text.replace(/\uE200(\d+)\uE201/gu, (_whole, index) => generatedWrappers[Number(index)]);
  text = text.replace(/\uE100(\d+)\uE101/gu, (_whole, index) => protectedWrappers[Number(index)]);
  return text;
}

export function renderTeluguTokens(input) {
  let previous;
  let text = input;
  do {
    previous = text;
    text = text.replace(wrapperRe, (_whole, surface) => surface);
  } while (text !== previous);
  if (new RegExp(markerPattern, 'u').test(text)) throw new Error('Unwrapped OpenLogic text token remains');
  return text;
}

function markerInventory(input) {
  const rows = [];
  for (const match of input.matchAll(new RegExp(markerPattern, 'gu'))) {
    rows.push({raw: match[0], key: normalizeKey(/\{([^{}]+)\}/u.exec(match[0])[1])});
  }
  return rows;
}

function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const first = Number(args.find((value, index) => /^\d+$/.test(value) && !/^\d+$/.test(args[index - 1] ?? '')) ?? 4);
  const numbers = args.filter(value => /^\d+$/.test(value)).map(Number);
  const lo = numbers[0] ?? first;
  const hi = numbers[1] ?? 148;
  if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo < 1 || hi > 722 || lo > hi) throw new Error('Invalid unit bounds');
  const manifest = fs.readFileSync(path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl'), 'utf8')
    .trim().split(/\r?\n/u).map(JSON.parse).filter(row => row.order >= lo && row.order <= hi);
  const report = [];
  const usedKeys = new Set();
  for (const unit of manifest) {
    const file = path.join(root, 'translation', unit.source_path);
    if (!fs.existsSync(file)) throw new Error(`Missing translation ${unit.unit_id}: ${file}`);
    const before = fs.readFileSync(file, 'utf8');
    const markersBefore = markerInventory(before);
    markersBefore.forEach(row => usedKeys.add(row.key));
    const after = wrapTeluguTokens(before);
    const markersAfter = markerInventory(after);
    if (JSON.stringify(markersAfter.map(row => row.raw)) !== JSON.stringify(markersBefore.map(row => row.raw))) {
      throw new Error(`Token identity/order changed in ${unit.unit_id}`);
    }
    const rendered = renderTeluguTokens(after);
    if (/!!/u.test(rendered) || /\\tetoken/u.test(rendered)) throw new Error(`Unresolved token syntax in ${unit.unit_id}`);
    if (write && after !== before) fs.writeFileSync(file, after);
    report.push({
      unit_id: unit.unit_id,
      path: unit.source_path,
      markers: markersBefore.length,
      changed: after !== before,
      before_sha256: sha256(before),
      after_sha256: sha256(after),
      rendered_sha256: sha256(rendered),
      rendered_telugu_characters: [...rendered.matchAll(/[\u0C00-\u0C7F]/gu)].length
    });
  }
  const missing = [...usedKeys].filter(key => !tokenMap[key]);
  if (missing.length) throw new Error(`Unmapped keys: ${missing.join(', ')}`);
  const result = {
    schema: 'openlogic-te-token-realization-run/1',
    mode: write ? 'write' : 'check',
    bounds: [lo, hi],
    units: report.length,
    markers: report.reduce((sum, row) => sum + row.markers, 0),
    changed_units: report.filter(row => row.changed).length,
    used_keys: [...usedKeys].sort(),
    unused_mapped_keys: Object.keys(tokenMap).filter(key => !usedKeys.has(key)).sort(),
    mapping_sha256: sha256(fs.readFileSync(dataPath)),
    records: report
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const invokedPath = process.argv[1]?.replace(/\\/gu, '/');
if (invokedPath && (import.meta.url === `file:///${invokedPath}` || import.meta.url === `file://${invokedPath}`)) main();

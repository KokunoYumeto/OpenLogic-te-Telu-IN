import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import childProcess from 'node:child_process';

const scriptRoot = path.resolve(import.meta.dirname, '..');
const option = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const unknown = process.argv.filter(value => value.startsWith('--') && !/^--(?:root|fls|output)=/u.test(value));
if (unknown.length) throw new Error(`Unknown option: ${unknown.join(', ')}`);

const root = path.resolve(option('root') ?? scriptRoot);
const flsPath = path.resolve(option('fls') ?? path.join(root, 'tmp/pdfs/cumulative-279/cumulative-279.fls'));
const outputPath = path.resolve(option('output') ?? path.join(root, 'output/release/openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.tex'));
const masterPath = path.join(root, 'editions/cumulative-279.tex');
const renderRoot = path.join(root, 'tmp/pdfs/cumulative-279/render-tree');
const expectedCommit = '2892803b925b0330bca6200df21ce27b68208cdd';
const expectedSourceRevision = '9620cc73f9c8e0ad003c514a5d3748f29611c4c0';
const normalize = value => value.replace(/\r\n/gu, '\n');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const canonical = value => path.resolve(value).toLowerCase();

const commit = childProcess.execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
if (commit !== expectedCommit) throw new Error(`Wrong release commit: ${commit}`);
for (const required of [flsPath, masterPath, renderRoot]) {
  if (!fs.existsSync(required)) throw new Error(`Missing assembly input: ${required}`);
}

const traversalRaw = normalize(fs.readFileSync(flsPath, 'utf8'))
  .split('\n')
  .filter(line => line.startsWith('INPUT '))
  .map(line => line.slice(6))
  .map(value => path.isAbsolute(value) ? value : path.resolve(root, value))
  .filter(value => canonical(value).startsWith(`${canonical(renderRoot)}${path.sep}`) && /\.tex$/iu.test(value));
const traversal = [];
for (const file of traversalRaw) {
  if (canonical(traversal.at(-1) ?? '') !== canonical(file)) traversal.push(path.resolve(file));
}
if (traversal.length !== 328) throw new Error(`Expected 328 recorded TeX inclusions, found ${traversal.length}`);
if (new Set(traversal.map(canonical)).size !== 276) throw new Error('Recorded traversal does not contain 276 unique units');

let cursor = 0;
const occurrences = [];
const isCommented = (text, index) => {
  const line = text.slice(text.lastIndexOf('\n', index - 1) + 1, index);
  for (let at = 0; at < line.length; at += 1) {
    if (line[at] !== '%') continue;
    let slashes = 0;
    for (let before = at - 1; before >= 0 && line[before] === '\\'; before -= 1) slashes += 1;
    if (slashes % 2 === 0) return true;
  }
  return false;
};

function inlineImports(text, directory, expandImports) {
  const importPattern = /\\olimport(?:\[([^\]]+)\])?\{([^{}]+)\}/gu;
  let output = '';
  let offset = 0;
  for (const match of text.matchAll(importPattern)) {
    output += text.slice(offset, match.index);
    offset = match.index + match[0].length;
    if (isCommented(text, match.index)) {
      output += match[0];
      continue;
    }
    const candidate = path.resolve(directory, match[1] ?? '.', `${match[2]}.tex`);
    const next = traversal[cursor];
    if (expandImports && next && canonical(candidate) === canonical(next)) {
      output += `\n${inlineFile(candidate, true)}\n`;
    } else {
      output += `% inactive import omitted by recorded v0.4.0 traversal: ${match[0]}`;
    }
  }
  return output + text.slice(offset);
}

function inlineFile(file, expandImports) {
  const expected = traversal[cursor];
  if (!expected || canonical(file) !== canonical(expected)) {
    throw new Error(`Traversal mismatch at ${cursor + 1}: expected ${expected}, received ${file}`);
  }
  cursor += 1;
  const raw = normalize(fs.readFileSync(file, 'utf8'));
  const begin = raw.indexOf('\\begin{document}');
  const end = raw.lastIndexOf('\\end{document}');
  if (begin < 0 || end < begin) throw new Error(`Missing document wrapper: ${file}`);
  const bodyStart = begin + '\\begin{document}'.length;
  const relative = path.relative(renderRoot, file).replaceAll('\\', '/');
  const occurrence = occurrences.filter(value => value.path === relative).length + 1;
  occurrences.push({path: relative, occurrence, sha256: sha256(Buffer.from(raw))});
  const body = inlineImports(raw.slice(bodyStart, end), path.dirname(file), expandImports);
  return [
    `% BEGIN FLATTENED SOURCE: ${relative} (occurrence ${occurrence})`,
    body.replace(/^\n/u, '').replace(/\n$/u, ''),
    `% END FLATTENED SOURCE: ${relative} (occurrence ${occurrence})`,
  ].join('\n');
}

const master = normalize(fs.readFileSync(masterPath, 'utf8'));
const subfilePattern = /\\subfile\{([^{}]+)\}/gu;
let assembled = '';
let offset = 0;
for (const match of master.matchAll(subfilePattern)) {
  assembled += master.slice(offset, match.index);
  offset = match.index + match[0].length;
  const candidate = path.resolve(root, `${match[1]}.tex`);
  const suppressImports = /content[\\/]incompleteness[\\/]incompleteness\.tex$/iu.test(candidate);
  assembled += `\n${inlineFile(candidate, !suppressImports)}\n`;
}
assembled += master.slice(offset);
if (cursor !== traversal.length) throw new Error(`Unconsumed traversal entries: ${traversal.length - cursor}`);

// An active \iftag branch that contains an inlined file cannot remain a macro
// argument: imported verbatim material would be tokenized before the branch is
// selected. The recorded .fls traversal already proves which import branches
// were active, so unwrap only branches whose first nonblank line is one of the
// recorded flattened-source markers and whose false branch is empty.
function evaluateActiveImportWrappers(value) {
  const lines = value.split('\n');
  const beginPattern = /^\s*% BEGIN FLATTENED SOURCE: (.+)\s*$/u;
  const endPattern = /^\s*% END FLATTENED SOURCE: (.+)\s*$/u;
  const openerPattern = /^\s*\\iftag\{[^}\r\n]+\}\{(?:%)?\s*$/u;
  const removed = new Set();
  const records = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!openerPattern.test(lines[index])) continue;
    let first = index + 1;
    while (first < lines.length && !lines[first].trim()) first += 1;
    const firstMarker = lines[first]?.match(beginPattern);
    if (!firstMarker) continue;
    let depth = 0;
    let cursor = first;
    while (cursor < lines.length) {
      if (beginPattern.test(lines[cursor])) depth += 1;
      else if (endPattern.test(lines[cursor])) {
        depth -= 1;
        if (depth < 0) throw new Error(`Negative flattened-marker depth at line ${cursor + 1}`);
      }
      if (depth === 0) {
        let next = cursor + 1;
        while (next < lines.length && !lines[next].trim()) next += 1;
        if (beginPattern.test(lines[next] ?? '')) {
          cursor = next;
          continue;
        }
        if (!['}{}', '}{}%'].includes(lines[next]?.trim())) {
          throw new Error(`Active import wrapper at line ${index + 1} has a nonempty or unrecognized false branch`);
        }
        removed.add(index);
        removed.add(next);
        records.push({open_line: index + 1, close_line: next + 1, first_import: firstMarker[1]});
        break;
      }
      cursor += 1;
    }
    if (cursor >= lines.length) throw new Error(`Unclosed active import wrapper at line ${index + 1}`);
  }
  return {
    text: lines.filter((_line, index) => !removed.has(index)).join('\n'),
    records,
  };
}

const banner = [
  '% OpenLogic Telugu cumulative flattened LaTeX source',
  `% Repository commit: ${expectedCommit}`,
  `% Frozen English source revision: ${expectedSourceRevision}`,
  '% Scope: OLP-0004 through OLP-0279 (276 unique editable Telugu units)',
  '% This file inlines the 328 unit occurrences recorded by the guarded release build;',
  '% 52 occurrences repeat shared proof-system modules in their native import contexts.',
  '% OpenLogic style, bibliography, asset, and font dependencies remain external and are',
  '% documented in the companion build-dependencies archive and release notes.',
  '',
].join('\n');
assembled = `${banner}${assembled}`;
const conditionalEvaluation = evaluateActiveImportWrappers(assembled);
assembled = conditionalEvaluation.text;
if (conditionalEvaluation.records.length !== 28) {
  throw new Error(`Expected to evaluate 28 active conditional import wrappers, found ${conditionalEvaluation.records.length}`);
}
fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, assembled, 'utf8');

const activeCommandCount = name => {
  const pattern = new RegExp(String.raw`\\${name}(?=\s*(?:\[|\{))`, 'gu');
  let count = 0;
  for (const match of assembled.matchAll(pattern)) {
    if (isCommented(assembled, match.index)) continue;
    const linePrefix = assembled.slice(assembled.lastIndexOf('\n', match.index - 1) + 1, match.index);
    if (/\\(?:New|Renew|Provide)DocumentCommand\s*$/u.test(linePrefix)) continue;
    count += 1;
  }
  return count;
};

const manifest = {
  schema: 'openlogic-te-flattened-latex/1',
  repository_commit: expectedCommit,
  source_revision: expectedSourceRevision,
  scope: 'OLP-0004..OLP-0279',
  unique_units: new Set(occurrences.map(value => value.path)).size,
  inlined_occurrences: occurrences.length,
  repeated_occurrences: occurrences.length - new Set(occurrences.map(value => value.path)).size,
  source_subfile_commands_remaining: activeCommandCount('subfile'),
  source_olimport_commands_remaining: activeCommandCount('olimport'),
  active_conditional_import_wrappers_evaluated: conditionalEvaluation.records.length,
  bytes: Buffer.byteLength(assembled),
  sha256: sha256(Buffer.from(assembled)),
  traversal_sha256: sha256(Buffer.from(traversal.map(value => path.relative(renderRoot, value).replaceAll('\\', '/')).join('\n') + '\n')),
  occurrences,
};
const manifestPath = outputPath.replace(/\.tex$/iu, '-ASSEMBLY.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({
  schema: manifest.schema,
  unique_units: manifest.unique_units,
  inlined_occurrences: manifest.inlined_occurrences,
  repeated_occurrences: manifest.repeated_occurrences,
  source_subfile_commands_remaining: manifest.source_subfile_commands_remaining,
  source_olimport_commands_remaining: manifest.source_olimport_commands_remaining,
  active_conditional_import_wrappers_evaluated: manifest.active_conditional_import_wrappers_evaluated,
  bytes: manifest.bytes,
  sha256: manifest.sha256,
  traversal_sha256: manifest.traversal_sha256,
  output: outputPath,
  manifest: manifestPath,
})}\n`);

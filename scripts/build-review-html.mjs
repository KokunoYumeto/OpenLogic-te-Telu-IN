#!/usr/bin/env node
// Split the already-localized review views into bounded, static GitHub Pages files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'evidence');
const destination = path.join(root, 'docs', 'review');
const fullSource = fs.readFileSync(path.join(evidence, 'TRANSLATION_DECISIONS_FULL.md'), 'utf8');
const prioritySource = fs.readFileSync(path.join(evidence, 'PRIORITY_REVIEW.md'), 'utf8');
const decisions = JSON.parse(fs.readFileSync(path.join(evidence, 'DECISIONS.json'), 'utf8')).decisions;
const pageSize = 50;
const priorityPageSize = 35;
const publicRaw = 'https://raw.githubusercontent.com/KokunoYumeto/OpenLogic-te-Telu-IN/refs/heads/main/evidence/';

const escapeText = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const requireCondition = (condition, message) => { if (!condition) throw new Error(message); };

function sectionsOf(source) {
  const pattern = /^## (te-Telu-IN-[^\s]+) — (.+)$/gmu;
  const matches = [...source.matchAll(pattern)];
  requireCondition(matches.length > 0, 'No review sections found');
  return matches.map((match, index) => ({
    id: match[1],
    title: match[2],
    body: source.slice(match.index + match[0].length, matches[index + 1]?.index ?? source.length).trim()
  }));
}

function chunks(items, size) {
  return Array.from({length: Math.ceil(items.length / size)}, (_, index) => items.slice(index * size, (index + 1) * size));
}

function fileName(kind, index) {
  return `${kind}-${String(index + 1).padStart(2, '0')}.html`;
}

function renderBody(body) {
  const output = [];
  let listOpen = false;
  let quoteOpen = false;
  const closeList = () => { if (listOpen) { output.push('</ol>'); listOpen = false; } };
  const closeQuote = () => { if (quoteOpen) { output.push('</blockquote>'); quoteOpen = false; } };
  for (const line of body.split(/\r?\n/u)) {
    if (!line.trim()) { closeList(); closeQuote(); continue; }
    if (line.startsWith('  - ')) {
      closeQuote();
      if (!listOpen) { output.push('<ol class="occurrences">'); listOpen = true; }
      const content = line.slice(4);
      const occurrence = content.match(/^(te-Telu-IN-[A-Za-z0-9-]+-OCC-\d+);/u);
      requireCondition(occurrence, `Unrecognized occurrence line: ${line.slice(0, 90)}`);
      output.push(`<li data-occurrence-id="${occurrence[1]}">${escapeText(content)}</li>`);
      continue;
    }
    closeList();
    if (line.startsWith('> ')) {
      if (!quoteOpen) { output.push('<blockquote>'); quoteOpen = true; }
      output.push(`<p>${escapeText(line.slice(2))}</p>`);
      continue;
    }
    closeQuote();
    if (line.startsWith('- ')) output.push(`<p class="field">${escapeText(line.slice(2))}</p>`);
    else output.push(`<p>${escapeText(line)}</p>`);
  }
  closeList();
  closeQuote();
  return output.join('\n');
}

function documentHtml(title, body) {
  const provenance = `<aside class="provenance" aria-label="యంత్ర-సహాయ రచన వివరాలు"><h2>యంత్ర-సహాయ రచన వివరాలు</h2><p>మూల తెలుగు అనువాదం, నిర్ణయాల నమోదు యంత్ర-సహాయ పని. చారిత్రక 276-విభాగాల నమోదులో OpenAI Codex GPT-5.6 Sol, Ultra reasoning effort పేర్కొనబడింది; తరువాతి పని-నమోదులో GPT-6 Sol, Ultra reasoning effort ఉంది. నమోదు లేని ప్రతి చారిత్రక దశకు ఒక నమూనాను ఊహించి ఆపాదించడం లేదు. <a href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/blob/main/ATTRIBUTION.md">పూర్తి ఆపాదన గమనిక</a>.</p><p>ఈ విభజించిన HTML సమీక్షా రూపాన్ని 2026-09-28న OpenAI Codex GPT-6 Sol, Ultra reasoning effortతో రూపొందించి తనిఖీ చేశాం. ఇది స్వతంత్ర మానవ భాషా/గణిత నిపుణ సమీక్ష కాదు.</p></aside>`;
  return `<!doctype html>\n<html lang="te-Telu-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="OpenLogic తెలుగు అనువాద నిర్ణయాల నిపుణ సమీక్ష"><title>${escapeText(title)}</title><link rel="stylesheet" href="review.css"></head><body>${body}${provenance}</body></html>\n`;
}

function downloadLinks() {
  const files = [
    ['TRANSLATION_DECISIONS_FULL.md', 'పూర్తి తెలుగు Markdown మూలం'],
    ['PRIORITY_REVIEW.md', 'ప్రాధాన్య తెలుగు Markdown మూలం'],
    ['DECISIONS.json', 'కానానికల్ నిర్ణయాల JSON'],
    ['DECISION_OCCURRENCES.csv', 'అమలు స్థానాల CSV'],
    ['TRANSLATION_DECISIONS_FULL.en.md', 'సమాంతర ఆంగ్ల నమోదు']
  ];
  return `<nav aria-label="మూల ఫైళ్లు"><h2>ఖచ్చిత మూల ఫైళ్లు</h2><ul>${files.map(([name, label]) => `<li><a href="${publicRaw}${name}">${label}</a></li>`).join('')}</ul><p>ఇవి మార్చని Markdown/JSON/CSV ఫైళ్లు; వెబ్ పుటలు చదవడానికి విభజించిన తెలుగు రూపం.</p></nav>`;
}

function renderArticle(section, fullLocation) {
  return `<article id="${section.id}" data-decision-id="${section.id}"><h2>${escapeText(section.id)} — ${escapeText(section.title)}</h2>${fullLocation ? `<p class="full-link"><a href="${fullLocation}#${section.id}">ఈ నిర్ణయం పూర్తి నమోదులో</a></p>` : ''}${renderBody(section.body)}<p class="backtop"><a href="#top">పుటపైకి</a></p></article>`;
}

function renderPage(kind, group, index, groups, fullLocations) {
  const isPriority = kind === 'priority';
  const heading = isPriority ? 'అధిక ప్రాధాన్య సమీక్ష' : 'పూర్తి తెలుగు నిర్ణయాల నమోదు';
  const previous = index > 0 ? `<a href="${fileName(kind, index - 1)}">మునుపటి పుట</a>` : '';
  const next = index + 1 < groups.length ? `<a href="${fileName(kind, index + 1)}">తర్వాతి పుట</a>` : '';
  const navigation = `<nav class="page-nav" aria-label="పుటలు"><a href="${isPriority ? 'priority.html' : 'index.html'}">పుటల సూచీ</a>${previous}${next}<a href="${isPriority ? 'index.html' : 'priority.html'}">${isPriority ? 'పూర్తి నమోదు' : 'ప్రాధాన్య సమీక్ష'}</a></nav>`;
  const contents = `<nav class="contents" aria-label="ఈ పుటలో నిర్ణయాలు"><h2>ఈ పుటలో నిర్ణయాలు</h2><ol>${group.map(section => `<li><a href="#${section.id}">${escapeText(section.id)} — ${escapeText(section.title)}</a></li>`).join('')}</ol></nav>`;
  const articles = group.map(section => renderArticle(section, isPriority ? fullLocations.get(section.id) : null)).join('\n');
  return documentHtml(`${heading} ${index + 1}/${groups.length}`, `<header id="top"><p class="eyebrow">OpenLogic · తెలుగు సమీక్ష</p><h1>${heading}</h1><p>పుట ${index + 1}/${groups.length}; ఈ పుటలో ${group.length} నిర్ణయాలు. మూల Markdownలోని నిర్ణయ పాఠ్యం మార్చలేదు.</p>${navigation}</header><main>${contents}${articles}</main><footer>${navigation}<p>నిపుణ సమీక్ష స్వాగతం; అది అనువాదం లేదా ప్రచురణకు అనుమతి-ద్వారం కాదు.</p></footer>`);
}

const fullSections = sectionsOf(fullSource);
const prioritySections = sectionsOf(prioritySource);
const priorityDecisions = decisions.filter(item => ['urgent', 'high'].includes(item.review_priority));
requireCondition(fullSections.length === decisions.length, 'Full-review decision count differs from canonical register');
requireCondition(prioritySections.length === priorityDecisions.length, 'Priority-review decision count differs from canonical register');
for (const [index, decision] of decisions.entries()) requireCondition(fullSections[index].id === decision.decision_id, `Full-review order mismatch at ${index}`);
for (const [index, decision] of priorityDecisions.entries()) requireCondition(prioritySections[index].id === decision.decision_id, `Priority-review order mismatch at ${index}`);

const fullGroups = chunks(fullSections, pageSize);
const priorityGroups = chunks(prioritySections, priorityPageSize);
const fullLocations = new Map(fullSections.map((section, index) => [section.id, fileName('full', Math.floor(index / pageSize))]));
fs.mkdirSync(destination, {recursive: true});
for (const [index, group] of fullGroups.entries()) fs.writeFileSync(path.join(destination, fileName('full', index)), renderPage('full', group, index, fullGroups, fullLocations));
for (const [index, group] of priorityGroups.entries()) fs.writeFileSync(path.join(destination, fileName('priority', index)), renderPage('priority', group, index, priorityGroups, fullLocations));

const fullIndex = `<header id="top"><p class="eyebrow">OpenLogic · తెలుగు సమీక్ష</p><h1>తెలుగు అనువాద నిర్ణయాల వెబ్ సూచీ</h1><p>స్థిర మూలంలోని 722/722 విభాగాలకు సంబంధించిన ${decisions.length} నిర్ణయాలు, ${decisions.reduce((sum, item) => sum + item.occurrences.length, 0)} అమలు స్థానాలు. పెద్ద Markdown నమోదును ${fullGroups.length} చదవదగిన పుటలుగా విభజించాం; నిర్ణయాల పదాలు, కారణాలు, పర్యాయాలు, సాక్ష్య పరిమితులు మార్చలేదు.</p><p><a class="primary" href="priority.html">ముందుగా అధిక ప్రాధాన్య సమీక్ష</a> · <a href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/blob/main/evidence/START_HERE.md">తెలుగు మార్గదర్శి</a></p></header><main><h2>పూర్తి నమోదు — పుటలు</h2><ol class="page-list">${fullGroups.map((group, index) => `<li><a href="${fileName('full', index)}">పుట ${index + 1}: ${escapeText(group[0].id)} – ${escapeText(group.at(-1).id)}</a> (${group.length} నిర్ణయాలు)</li>`).join('')}</ol>${downloadLinks()}</main><footer><p>నిర్ణయాల పూర్తి మూలం, ఆంగ్ల సమాంతర నమోదు, యంత్ర-పఠన సమాచారం పై లింకుల ద్వారా అందుబాటులో ఉన్నాయి.</p></footer>`;
fs.writeFileSync(path.join(destination, 'index.html'), documentHtml('తెలుగు అనువాద నిర్ణయాల వెబ్ సూచీ', fullIndex));
const priorityIndex = `<header id="top"><p class="eyebrow">OpenLogic · తెలుగు సమీక్ష</p><h1>అధిక ప్రాధాన్య సమీక్ష సూచీ</h1><p>${prioritySections.length} అధిక/అత్యవసర నిర్ణయాలు ${priorityGroups.length} చదవదగిన పుటల్లో ఉన్నాయి. సమీక్ష అనువాదానికి లేదా ప్రచురణకు అడ్డంకి కాదు.</p><p><a href="index.html">పూర్తి నిర్ణయాల సూచీ</a></p></header><main><ol class="page-list">${priorityGroups.map((group, index) => `<li><a href="${fileName('priority', index)}">పుట ${index + 1}: ${escapeText(group[0].id)} – ${escapeText(group.at(-1).id)}</a> (${group.length} నిర్ణయాలు)</li>`).join('')}</ol><h2>నేరుగా నిర్ణయానికి</h2><ol class="decision-list">${prioritySections.map((section, index) => `<li><a href="${fileName('priority', Math.floor(index / priorityPageSize))}#${section.id}">${escapeText(section.id)} — ${escapeText(section.title)}</a></li>`).join('')}</ol>${downloadLinks()}</main>`;
fs.writeFileSync(path.join(destination, 'priority.html'), documentHtml('అధిక ప్రాధాన్య సమీక్ష సూచీ', priorityIndex));
console.log(JSON.stringify({full_pages: fullGroups.length, priority_pages: priorityGroups.length, decisions: fullSections.length, priority_decisions: prioritySections.length, occurrences: decisions.reduce((sum, item) => sum + item.occurrences.length, 0)}));

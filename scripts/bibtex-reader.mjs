const accentPattern = /\\["'^`~=.^uvHckbdtr]\s*\{?([A-Za-z])\}?/gu;

function plainText(value) {
  return value
    .replace(accentPattern, '$1')
    .replace(/\\(?:emph|textit|textbf|texttt|textrm|textsf|textsc|mbox)\s*/gu, '')
    .replace(/\\LaTeX\b/gu, 'LaTeX')
    .replace(/\\TeX\b/gu, 'TeX')
    .replace(/\\([#$%&_{}])/gu, '$1')
    .replace(/[{}]/gu, '')
    .replace(/~/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function fieldValue(body, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const match = new RegExp(`(?:^|\\n)\\s*${escapedName}\\s*=\\s*`, 'iu').exec(body);
  if (!match) return '';
  let cursor = match.index + match[0].length;
  while (/\s/u.test(body[cursor] ?? '')) cursor += 1;
  const opening = body[cursor];
  if (opening === '{') {
    const start = cursor + 1;
    let depth = 1;
    cursor = start;
    while (cursor < body.length && depth > 0) {
      if (body[cursor] === '{') depth += 1;
      else if (body[cursor] === '}') depth -= 1;
      cursor += 1;
    }
    if (depth !== 0) throw new Error(`Unbalanced BibTeX field ${name}`);
    return plainText(body.slice(start, cursor - 1));
  }
  if (opening === '"') {
    const start = cursor + 1;
    let braceDepth = 0;
    cursor = start;
    while (cursor < body.length) {
      const character = body[cursor];
      if (character === '{') braceDepth += 1;
      else if (character === '}') braceDepth -= 1;
      else if (character === '"' && braceDepth === 0 && body[cursor - 1] !== '\\') break;
      cursor += 1;
    }
    if (cursor >= body.length) throw new Error(`Unterminated quoted BibTeX field ${name}`);
    return plainText(body.slice(start, cursor));
  }
  const end = body.slice(cursor).search(/[,\n]/u);
  return plainText(body.slice(cursor, end < 0 ? body.length : cursor + end));
}

export function parseBibliography(source) {
  const records = new Map();
  for (const start of source.matchAll(/@[A-Za-z]+\s*\{([^,]+),/gu)) {
    let cursor = start.index + start[0].length;
    let depth = 1;
    while (cursor < source.length && depth > 0) {
      if (source[cursor] === '{') depth += 1;
      else if (source[cursor] === '}') depth -= 1;
      cursor += 1;
    }
    if (depth !== 0) throw new Error(`Unbalanced BibTeX entry ${start[1]}`);
    const body = source.slice(start.index + start[0].length, cursor - 1);
    records.set(start[1], {
      key: start[1],
      author: fieldValue(body, 'author'),
      editor: fieldValue(body, 'editor'),
      year: fieldValue(body, 'year'),
      title: fieldValue(body, 'title'),
    });
  }
  return records;
}

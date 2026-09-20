import fs from 'node:fs';
import path from 'node:path';
import {parseBibliography} from './bibtex-reader.mjs';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'upstream/bib/open-logic.bib'), 'utf8');
const records = parseBibliography(source);
const expectedTitles = {
  Cantor1892: 'Uber eine elementare Frage der Mannigfaltigkeitslehre',
  EwaldSieg2013: "David Hilbert's Lectures on the Foundations of Arithmetic and Logic 1917--1933",
  KatzKatz2012: 'Stevin Numbers and Reality',
  Frege1884: 'Die Grundlagen der Arithmetik: Eine logisch mathematische Untersuchung uber den Begriff der Zahl',
  Magnus2021: 'Forall x: Calgary. An Introduction to Formal Logic',
};

const checked = [];
for (const [key, expectedTitle] of Object.entries(expectedTitles)) {
  const record = records.get(key);
  if (!record) throw new Error(`Missing bibliography fixture ${key}`);
  if (record.title !== expectedTitle) throw new Error(`${key}: ${JSON.stringify(record.title)} != ${JSON.stringify(expectedTitle)}`);
  checked.push({key, title: record.title});
}

process.stdout.write(`${JSON.stringify({status: 'pass', records: records.size, checked})}\n`);

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith('--')) {
    throw new Error(`Missing value for ${name}`);
  }
  return args[index + 1];
};
const allowed = new Set(['--commit', '--output', '--repository']);
for (let index = 0; index < args.length; index += 2) {
  if (!allowed.has(args[index])) throw new Error(`Unknown option ${args[index]}`);
}

const git = (...gitArgs) => execFileSync('git', gitArgs, {
  cwd: root,
  encoding: gitArgs[0] === 'show' ? 'buffer' : 'utf8',
  maxBuffer: 128 * 1024 * 1024,
});
const commit = option('--commit') ?? git('rev-parse', 'HEAD').trim();
if (!/^[0-9a-f]{40}$/u.test(commit)) throw new Error(`Expected a full commit SHA, got ${commit}`);
const repository = option('--repository') ?? 'KokunoYumeto/OpenLogic-te-Telu-IN';
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(repository)) {
  throw new Error(`Invalid GitHub repository ${repository}`);
}
const output = path.resolve(root, option('--output') ?? `evidence/GITHUB-COMMIT-${commit.slice(0, 12)}-READBACK.json`);
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const paths = git('diff-tree', '--no-commit-id', '--name-only', '--diff-filter=ACMRT', '-r', commit)
  .trim().split(/\r?\n/u).filter(Boolean);
if (!paths.length) throw new Error(`Commit ${commit} has no added or modified files`);

const encodedPath = value => value.split('/').map(encodeURIComponent).join('/');
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function fetchPublic(url) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url, { cache: 'no-store', redirect: 'follow' });
      if (response.ok) return Buffer.from(await response.arrayBuffer());
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await wait(1000 * (attempt + 1));
  }
  throw new Error(`Anonymous fetch failed for ${url}: ${lastError}`);
}

const files = new Array(paths.length);
let cursor = 0;
const workers = Array.from({ length: Math.min(6, paths.length) }, async () => {
  while (cursor < paths.length) {
    const index = cursor;
    cursor += 1;
    const filePath = paths[index];
    const publicUrl = `https://raw.githubusercontent.com/${repository}/${commit}/${encodedPath(filePath)}`;
    const expected = git('show', `${commit}:${filePath}`);
    const observed = await fetchPublic(publicUrl);
    const expectedHash = sha256(expected);
    const observedHash = sha256(observed);
    files[index] = {
      path: filePath,
      public_url: publicUrl,
      bytes: observed.length,
      sha256: observedHash,
      expected_bytes: expected.length,
      expected_sha256: expectedHash,
      match: observed.length === expected.length && observedHash === expectedHash,
    };
  }
});
await Promise.all(workers);
const status = files.every(file => file.match) ? 'COMPLETE_PASS' : 'FAIL';
const receipt = {
  schema: 'openlogic-te-commit-readback/1',
  checked_at: new Date().toISOString(),
  commit,
  anonymous: true,
  authorization_header_sent: false,
  file_count: files.length,
  files,
  status,
};
fs.writeFileSync(output, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ status, commit, files: files.length, output: path.relative(root, output).replaceAll('\\', '/') })}\n`);
if (status !== 'COMPLETE_PASS') process.exitCode = 1;

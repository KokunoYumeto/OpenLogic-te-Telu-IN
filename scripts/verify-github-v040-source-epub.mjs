import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const owner = 'KokunoYumeto';
const repository = 'OpenLogic-te-Telu-IN';
const tag = 'v0.4.0-cumulative-olp0279';
const apiUrl = `https://api.github.com/repos/${owner}/${repository}/releases/tags/${tag}`;

const option = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const outputPath = path.resolve(option('output') ?? 'evidence/GITHUB-v0.4.0-SOURCE-EPUB-REPAIR-READBACK.json');
const downloadRoot = path.resolve(option('download-root') ?? 'tmp/public-readback-v0.4.0-source-epub');
const sha256 = payload => crypto.createHash('sha256').update(payload).digest('hex');
const requireValue = (condition, message) => {
  if (!condition) throw new Error(message);
};

const expected = new Map(Object.entries({
  'openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.pdf': {
    bytes: 3297226,
    sha256: '9ef53813446e024aa86f308da6348f6f79832d22935b0aee104343f25611ff83',
  },
  'openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.tex': {
    bytes: 4156367,
    sha256: 'a3f996cf1f963cf4283cb82cc433cce7c11bad6a37c5bd7284666b12526f07bf',
  },
  'openlogic-te-Telu-IN-cumulative-OLP0279-build-source-v0.4.0.zip': {
    bytes: 1311983,
    sha256: '7d22f70e1deb6ba6f23473ef1ecaad4817a096662611ff95660f4e45df79e65d',
  },
  'openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.epub': {
    bytes: 1844059,
    sha256: 'fce845469d300ce4a86a4f7b909387976582c735ee0b881215537ab5ccc64b3e',
  },
  'SOURCE-REPAIR-v0.4.0.json': {
    bytes: 892,
    sha256: '42dd5bd5b201e6a67669dfe666d7a1d4da15b7842e410fc942ccaf20b886006f',
  },
  'CUMULATIVE-OLP0279-SOURCE-REPAIR-QA.json': {
    bytes: 5797,
    sha256: '4fd0c71845bb36926c77ee4632a0a187cb435731a21e549e843685441a8dcc37',
  },
  'CUMULATIVE-OLP0279-EPUB-QA.json': {
    bytes: 271353,
    sha256: '616d85c51b372a5f70f7290bda9fd1fc7e94953cfa7a6ea1ce2cb11ddd56cf61',
  },
  'CUMULATIVE-OLP0279-EPUB-RENDER-QA.json': {
    bytes: 5959,
    sha256: '2cab3ad4267a0115d2854568c8ef16bd31df534795adfe28284a9453c59c96cd',
  },
}));

const publicHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'openlogic-te-public-readback',
  'X-GitHub-Api-Version': '2022-11-28',
};
const releaseResponse = await fetch(apiUrl, {headers: publicHeaders, redirect: 'follow'});
requireValue(releaseResponse.ok, `Anonymous release inventory failed: HTTP ${releaseResponse.status}`);
const release = await releaseResponse.json();
requireValue(release.tag_name === tag, `Unexpected tag: ${release.tag_name}`);
requireValue(!release.draft, 'Public readback unexpectedly returned a draft release');
requireValue(Array.isArray(release.assets), 'Release inventory has no asset list');

const body = release.body ?? '';
const requiredOrder = [
  'openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.pdf',
  'openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.tex',
  'openlogic-te-Telu-IN-cumulative-OLP0279-build-source-v0.4.0.zip',
  'openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.epub',
];
const bodyPositions = Object.fromEntries(requiredOrder.map(name => [name, body.indexOf(name)]));
requireValue(requiredOrder.every(name => bodyPositions[name] >= 0), 'Release notes omit a primary artifact link');
requireValue(requiredOrder.every((name, index) => index === 0 || bodyPositions[requiredOrder[index - 1]] < bodyPositions[name]), 'Primary artifact links are not in PDF, LaTeX, build-source ZIP, EPUB order');
for (const name of requiredOrder) {
  requireValue(body.includes(expected.get(name).sha256), `Release notes omit SHA-256 for ${name}`);
}

fs.mkdirSync(downloadRoot, {recursive: true});
const assets = [];
for (const asset of [...release.assets].sort((left, right) => left.name.localeCompare(right.name))) {
  const response = await fetch(asset.browser_download_url, {
    headers: {'User-Agent': publicHeaders['User-Agent']},
    redirect: 'follow',
  });
  requireValue(response.ok, `Anonymous download failed for ${asset.name}: HTTP ${response.status}`);
  const payload = Buffer.from(await response.arrayBuffer());
  const digest = sha256(payload);
  requireValue(payload.length === asset.size, `Public byte count disagrees with inventory for ${asset.name}`);
  if (asset.digest) requireValue(asset.digest === `sha256:${digest}`, `Public digest disagrees with inventory for ${asset.name}`);
  const expectedValue = expected.get(asset.name);
  if (expectedValue) {
    requireValue(payload.length === expectedValue.bytes, `Expected byte count mismatch for ${asset.name}`);
    requireValue(digest === expectedValue.sha256, `Expected SHA-256 mismatch for ${asset.name}`);
  }
  fs.writeFileSync(path.join(downloadRoot, asset.name), payload);
  assets.push({
    name: asset.name,
    public_url: asset.browser_download_url,
    content_type: asset.content_type,
    inventory_bytes: asset.size,
    inventory_digest: asset.digest,
    observed_bytes: payload.length,
    observed_sha256: digest,
    expected_repair_artifact: Boolean(expectedValue),
    status: 'PASS',
  });
}

for (const name of expected.keys()) {
  requireValue(assets.some(asset => asset.name === name), `Expected repaired release asset is absent: ${name}`);
}

const result = {
  schema: 'openlogic-te-github-public-readback/1',
  checked_at: new Date().toISOString(),
  status: 'COMPLETE_PASS',
  transport: {
    anonymous: true,
    authorization_header_sent: false,
    inventory_url: apiUrl,
    downloads: 'public browser_download_url values returned by the anonymous inventory',
  },
  release: {
    tag: release.tag_name,
    name: release.name,
    public_url: release.html_url,
    draft: release.draft,
    prerelease: release.prerelease,
    asset_count: release.assets.length,
  },
  notes: {
    required_link_order: requiredOrder,
    observed_positions: bodyPositions,
    order_status: 'PASS',
    primary_hashes_present: true,
  },
  repaired_assets_expected: expected.size,
  all_release_assets_downloaded: assets.length,
  assets,
};
fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({
  status: result.status,
  tag: result.release.tag,
  assets: result.all_release_assets_downloaded,
  repaired_assets_expected: result.repaired_assets_expected,
  output: outputPath,
})}\n`);

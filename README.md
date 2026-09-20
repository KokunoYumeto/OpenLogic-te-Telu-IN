# OpenLogic తెలుగు (te-Telu-IN)

An in-progress Telugu machine translation of the Open Logic Project.
The complete target is 722 tracked TeX units at revision
9620cc73f9c8e0ad003c514a5d3748f29611c4c0.

## Current release

The current cumulative checkpoint is
[v0.4.0-cumulative-olp0279](https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/releases/tag/v0.4.0-cumulative-olp0279).
It provides a 515-page cumulative PDF, a reflowable cumulative EPUB, and exact
editable/build-source packages for OLP-0004 through OLP-0279 (276 of 722
units). This is a GitHub-only release; the deployed semantic HTML reader
remains bounded to OLP-0004 through OLP-0026 (23 units). This is **not the
complete OpenLogic Telugu edition**.

Latest version DOI:
[10.5281/zenodo.22726674](https://doi.org/10.5281/zenodo.22726674).
Continuing concept DOI:
[10.5281/zenodo.22307937](https://doi.org/10.5281/zenodo.22307937).
The DOI links still identify the preceding Zenodo release; no new Zenodo
version was created for v0.4.0. Prior GitHub, GitHub Pages, and Zenodo
publication verification is documented in [PUBLICATION.md](PUBLICATION.md).
The repaired v0.4.0 release has 16 public assets; its cumulative EPUB and
source companions, manifest, checksums, and QA records were downloaded
anonymously and verified byte-for-byte.

Three hundred eighteen full-unit editable TeX drafts form the contiguous
OLP-0004--OLP-0321 range; editable coverage is 318/722 and the next manifest
cursor is OLP-0322. They cover the
Sets, Relations and Functions material, Propositional and First-Order Logic,
Model Theory, Computability and Turing Machines, plus the complete introductory
chapter of Incompleteness, the complete Arithmetization of Syntax chapter and
the complete Representability in Q, Theories and Computability, and
Incompleteness and Provability chapters. All thirty-five batches have
source-aligned structural and same-agent semantic review records.

Format coverage is deliberately separate. The current cumulative PDF and EPUB
contain 276 editable units in OLP-0004--OLP-0279. The deployed semantic HTML
reader contains OLP-0004--OLP-0026 only: 23 units, the complete Sets, Relations
and Functions chapters. Thus 295 current editable drafts are not yet in that
23-unit HTML reader, and the newest 42 are not yet in the cumulative PDF or
EPUB.
The public browser version is
[OpenLogic తెలుగు — సమితులు, సంబంధాలు, ప్రమేయాలు](https://kokunoyumeto.github.io/OpenLogic-te-Telu-IN/sfr/).
No editable-source cursor is presented as reader coverage, and this bounded
release does not substitute for the unfinished full edition.

## Provenance and changes

Original: [The Open Logic Project](https://openlogicproject.org/),
[authors and contributors](https://openlogicproject.org/people/),
[frozen source](https://github.com/OpenLogicProject/OpenLogic/tree/9620cc73f9c8e0ad003c514a5d3748f29611c4c0).
Edition hub: [OpenLogic translations](https://github.com/KokunoYumeto/OpenLogic-translations).

Changes are Telugu machine translation, provisional terminology choices,
grammatical realization of source text tokens, a foundations reader,
font shaping and layout. Stable OLP identifiers, source paths, mathematical
formulas, labels, citation keys, links and exercises are retained in the
editable translation. The `upstream/content` mirror contains all 722 frozen
English TeX units, byte-for-byte matched to `evidence/SOURCE_MANIFEST.jsonl`;
those English source files are unmodified.
This edition is not endorsed by the original authors.

Native Telugu textbook pages were actually consulted and indexed by source,
page and hash. Andhra Pradesh, Telangana and pre-bifurcation witnesses are
distinguished. Evidence for prose/register is not labelled attestation of
every technical sense. Source definitions control the mathematics; in
particular, the original zero-inclusive natural-number convention is kept.
Original rights-restricted Telugu books and their page images are **not**
redistributed here.

The correction ledger records 270 confirmed source issues that are minimally
repaired and disclosed beside the affected Telugu claims. The frozen English
bytes remain unchanged. Each correction is bound to a bounded audit, an exact
source hash, target locator and declared mathematical delta. See
[SOURCE_CORRECTIONS.jsonl](evidence/SOURCE_CORRECTIONS.jsonl), the
[source-audit directory](evidence/source-audits/), and the current
[Incompleteness and Provability audit](evidence/source-audits/2026-09-20-incompleteness-provability-telugu/REVIEW.md).

The [canonical translation-decision index](evidence/START_HERE.md) exposes all
74 current terminology/sense decisions and 270 corrections across 639
implementation occurrences, with exact
source/target locators, aligned segment hashes, authorities actually checked,
known evidence limits, alternatives, uncertainty, and concrete review
questions. Its status is explicitly partial (318/722); optional expert review
creates no translation hold. The canonical views include a
[full readable register](evidence/TRANSLATION_DECISIONS_FULL.md), a
[priority view](evidence/PRIORITY_REVIEW.md), a
[one-row-per-occurrence CSV](evidence/DECISION_OCCURRENCES.csv),
[machine JSON](evidence/DECISIONS.json), the byte-exact shared
[JSON Schema](evidence/translation-decision.schema.json), and a
[validation record](evidence/TRANSLATION_DECISION_QA.json). The older
`EXPERT_REVIEW_*` files remain compatibility views. Final printed/PDF page fields
remain explicitly pending until each unit enters the coherent reader and final
pagination exists; exact unit, section, file and line locators are available now.
The sanitized [canon-revalidation receipt](evidence/CANON-REVALIDATION-RECEIPT.json)
binds the manager-audited 2,343-choice scope through OLP-0148 and its live
central-validator `COMPLETE_PASS` result without redistributing the manager package or
rights-restricted canon originals.

## QA and limitations

The 276-unit cumulative PDF passes correction-aware structural checks, a
four-pass guarded XeLaTeX/BibTeX build with identical last-two-pass hashes,
full-document text extraction, and all-page raster inspection. The final log
has zero missing glyphs, undefined references or undefined citations. Its 33
bounded overfull diagnostics (largest 58.89561 pt) were checked against the
rendered pages and remain inside the page area.

The 23-unit foundations HTML and EPUB readers pass exact source-to-reader text,
formula-annotation, identifier, link, statement-class, citation and diagram
crosswalks. The EPUB is byte-deterministic, reflowable EPUB 3, contains 2,512
MathML roots and eight packaged SVG resources, and passes EPUBCheck 5.3.0 with
zero errors or warnings. The deployed reader passed desktop and 390-pixel
visual, interaction, asset-loading and console checks; all 16 public files were
then read back anonymously and matched the repository byte-for-byte.

All 318 editable TeX drafts in OLP-0004--OLP-0321 pass correction-aware
blank-block, environment, source-token, protected-identifier and
mathematical-form checks. Thirty-five same-agent semantic reviews record
source-aligned reverse paraphrases and their limits. The cumulative structural
receipt is [CUMULATIVE-OLP0321-STRUCTURAL-QA.json](evidence/CUMULATIVE-OLP0321-STRUCTURAL-QA.json).
Beyond the explicit reader boundaries stated above, source QA does not imply
PDF, EPUB, or HTML reader integration.

QA is machine/agent performed, not human or independent review. Several
technical terms remain provisional. The PDF is not tagged. Source caveats
and terminology uncertainty are retained in the public evidence directory.
Checks on this chapter do not establish completion or QA of the whole corpus.

The decision views can be regenerated and schema-validated from the tracked
ledgers with Node.js 22+, Python 3, and `jsonschema` 4.x:

    npm run evidence:reviews

## Rebuild the cumulative PDF

Requires Windows, PowerShell 7.4+, Node.js 22+, and a current MiKTeX XeLaTeX
installation with fontspec, ucharclasses, amsmath, amssymb, amsthm, xparse,
graphicx, xcolor, TikZ, float, geometry and hyperref; Latin Modern must be
installed. Noto Serif Telugu regular/bold and their OFL are bundled.

From the full-source package or repository root, run:

    pwsh -File scripts/build-cumulative-279.ps1

The builder acquires the machine-wide Global\InterlanguageTeXSlotV1 mutex
once with a 30-second limit, holds it for all four passes and immediate
checks, disables shell escape and automatic package installation, and
releases it in finally. A busy slot launches no TeX. The verified output is
`output/pdf/openlogic-te-Telu-IN-cumulative-OLP0279.pdf`; a build receipt and
prepared render manifest are written under `tmp/pdfs/cumulative-279`.
Toolchain variation may change PDF bytes; replay equality is checked within
each build.

The earlier seven-unit Sets builder remains available as
`scripts/build-sets.ps1` for reproducing the v0.2.0 PDF.

The released source ZIP is a frozen snapshot. The packaging script refuses
to overwrite an existing versioned artifact when current source bytes differ;
use a new version for later cumulative releases.

## Build and audit the foundations HTML and EPUB readers

Requires Node.js 22+. Install the pinned dependency from `package-lock.json`,
then generate and audit the self-contained output:

    npm ci --ignore-scripts
    npm run html:sfr
    npm run audit:html:sfr
    npm run epub:sfr
    python scripts/audit-sets-epub.py --epubcheck-jar <path-to-epubcheck-5.3.0.jar>

The renderer accepts only an explicit TeX subset and fails on unknown prose
commands, environments, unresolved references, unbalanced groups, unsafe
links, unsupported diagrams or invalid mathematics. KaTeX runs only at build
time and emits MathML; the output has no client JavaScript, telemetry or
network runtime dependency. `npm run html:sfr:pages` reproduces the tracked
Pages tree under `docs/sfr`. The EPUB builder uses that audited semantic HTML as
its sole reader input and fixes ZIP timestamps for deterministic replay.

## License

The Open Logic Text is licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
The complete upstream license and disclaimer are retained in LICENSE.md.
Translation, reader and original task-authored scripts are offered under
the same license to the extent copyright applies.

Noto Serif Telugu is Copyright 2018 The Noto Project Authors and uses the
SIL Open Font License 1.1; see fonts/OFL.txt. It is not relicensed as CC BY.
See ATTRIBUTION.md for component boundaries and credits.

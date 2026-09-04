# OpenLogic తెలుగు (te-Telu-IN)

An in-progress Telugu machine translation of the Open Logic Project.
The complete target is 722 tracked TeX units at revision
9620cc73f9c8e0ad003c514a5d3748f29611c4c0.

## Current release

The current cumulative checkpoint is
[v0.2.0-sets-html](https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/releases/tag/v0.2.0-sets-html).
It adds a self-contained semantic HTML reader for the complete Sets chapter,
OLP-0004 through OLP-0010, while preserving the twelve-page v0.1.0 PDF and
source snapshot unchanged. This is **not the complete OpenLogic Telugu
edition**.

Latest version DOI:
[10.5281/zenodo.22309234](https://doi.org/10.5281/zenodo.22309234).
Continuing concept DOI:
[10.5281/zenodo.22307937](https://doi.org/10.5281/zenodo.22307937).
GitHub, GitHub Pages, and Zenodo public bytes have been anonymously verified;
see [PUBLICATION.md](PUBLICATION.md).

Fifty-nine full-unit editable drafts exist in this repository: Sets (7),
Relations (9), Functions (7), Size of Sets (14), Arithmetization (8) and
Infinite Sets (6), plus the Propositional Logic part driver and complete
Syntax and Semantics chapter (8). All eight batches have
source-aligned structural and same-agent semantic review records. The Sets
chapter also has an offline semantic HTML reader with Telugu document metadata, native MathML,
local fonts, accessible inline diagrams, resolved internal links, and a
separately collapsible copy of each canonical English unit. Its public browser
version is at [OpenLogic తెలుగు — సమితులు](https://kokunoyumeto.github.io/OpenLogic-te-Telu-IN/sets/).
Relations, Functions, Size of Sets, Arithmetization, Infinite Sets and
Propositional Logic are not yet integrated into that reader. The other 663
units and the coherent full
reader remain in progress; neither current
chapter format substitutes for that remaining work.

## Provenance and changes

Original: [The Open Logic Project](https://openlogicproject.org/),
[authors and contributors](https://openlogicproject.org/people/),
[frozen source](https://github.com/OpenLogicProject/OpenLogic/tree/9620cc73f9c8e0ad003c514a5d3748f29611c4c0).
Edition hub: [OpenLogic translations](https://github.com/KokunoYumeto/OpenLogic-translations).

Changes are Telugu machine translation, provisional terminology choices,
grammatical realization of source text tokens, a chapter-specific reader,
font shaping and layout. Stable OLP identifiers, source paths, mathematical
formulas, labels, citation keys, links and exercises are retained in the
editable translation. English source files under upstream are unmodified.
This edition is not endorsed by the original authors.

Native Telugu textbook pages were actually consulted and indexed by source,
page and hash. Andhra Pradesh, Telangana and pre-bifurcation witnesses are
distinguished. Evidence for prose/register is not labelled attestation of
every technical sense. Source definitions control the mathematics; in
particular, the original zero-inclusive natural-number convention is kept.
Original rights-restricted Telugu books and their page images are **not**
redistributed here.

Five confirmed source issues in Functions, fourteen in Size of Sets, eight
in Arithmetization, six in Infinite Sets and four in Propositional Logic are
minimally repaired and disclosed beside the affected Telugu claims. The frozen
English bytes remain unchanged. The Size of Sets records adopt ten shared
OLSIZ findings and four additional deterministic OLTESIZ findings. A proposed
eleventh OLSIZ table finding was formally retracted after byte inspection
confirmed that the source already contains the correct row break plus
`\hline`; no correction was applied for it. See
[SOURCE_CORRECTIONS.jsonl](evidence/SOURCE_CORRECTIONS.jsonl), the shared
[Size of Sets audit](evidence/source-audits/2026-09-04-size-of-sets-shared/REVIEW.md),
the bounded
[Arithmetization audit](evidence/source-audits/2026-09-04-arithmetization-telugu/REVIEW.md),
and the bounded
[Infinite Sets audit](evidence/source-audits/2026-09-05-infinite-telugu/REVIEW.md),
and the bounded
[Propositional Syntax and Semantics audit](evidence/source-audits/2026-09-05-propositional-syntax-telugu/REVIEW.md).

The [optional expert-review log](evidence/EXPERT_REVIEW_LOG.md) exposes all 33
current terminology/sense decisions and the thirty-seven corrections with exact
source/target locators, aligned segment hashes, authorities actually checked,
known evidence limits, alternatives, uncertainty, and concrete review
questions. Its status is explicitly partial (59/722); every entry is
provisional for optional expert review and none is a translation hold.

## QA and limitations

The seven-unit PDF passes exact paragraph alignment, protected identifier,
token, environment and mathematical-form checks; same-agent semantic and
reverse-paraphrase review; four-pass guarded XeLaTeX builds with identical
last-two-pass hashes; all-page visual inspection; mixed-script and Telugu
conjunct extraction samples. The final log has zero missing glyphs,
overfull boxes, undefined references or warnings.

All fifty-nine editable drafts pass correction-aware blank-block,
environment, source-token, protected-identifier and mathematical-form checks.
Eight same-agent semantic reviews record source-aligned reverse paraphrases and
their limits. Size of Sets, Arithmetization, Infinite Sets and Propositional
Logic Syntax and Semantics have source QA
only at this checkpoint; no PDF or HTML reader integration is claimed for
those thirty-six units.

QA is machine/agent performed, not human or independent review. Several
technical terms remain provisional. The PDF is not tagged. Source caveats
and terminology uncertainty are retained in the public evidence directory.
Checks on this chapter do not establish completion or QA of the whole corpus.

## Rebuild the Sets PDF

Requires Windows, PowerShell 7.4+, Node.js 22+, and a current MiKTeX XeLaTeX
installation with fontspec, ucharclasses, amsmath, amssymb, amsthm, xparse,
graphicx, xcolor, TikZ, float, geometry and hyperref; Latin Modern must be
installed. Noto Serif Telugu regular/bold and their OFL are bundled.

From the source-package or repository root, run:

    node scripts/prepare-sets.mjs
    node scripts/audit-batch.mjs 4 10 001
    pwsh -File scripts/build-sets.ps1

The builder acquires the machine-wide Global\InterlanguageTeXSlotV1 mutex
once with a 30-second limit, holds it for all four passes and immediate
checks, disables shell escape and automatic package installation, and
releases it in finally. A busy slot launches no TeX. The verified output is
build/sets.pdf; a build receipt is written under build. Toolchain variation
may change PDF bytes; replay equality is checked within each build.

The released source ZIP is a frozen snapshot. The packaging script refuses
to overwrite an existing versioned artifact when current source bytes differ;
use a new version for later cumulative releases.

## Build and audit the Sets HTML reader

Requires Node.js 22+. Install the pinned dependency from `package-lock.json`,
then generate and audit the self-contained output:

    npm ci --ignore-scripts
    npm run html
    npm run audit:html

The renderer accepts only an explicit TeX subset and fails on unknown prose
commands, environments, unresolved references, unbalanced groups, unsafe
links, unsupported diagrams or invalid mathematics. KaTeX runs only at build
time and emits MathML; the output has no client JavaScript, telemetry or
network runtime dependency. `npm run html:pages` reproduces the tracked Pages
tree under `docs/sets`.

## License

The Open Logic Text is licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
The complete upstream license and disclaimer are retained in LICENSE.md.
Translation, reader and original task-authored scripts are offered under
the same license to the extent copyright applies.

Noto Serif Telugu is Copyright 2018 The Noto Project Authors and uses the
SIL Open Font License 1.1; see fonts/OFL.txt. It is not relicensed as CC BY.
See ATTRIBUTION.md for component boundaries and credits.

# OpenLogic తెలుగు (te-Telu-IN)

An in-progress Telugu machine translation of the Open Logic Project.
The complete target is 722 tracked TeX units at revision
9620cc73f9c8e0ad003c514a5d3748f29611c4c0.

## Current release

The Sets chapter is complete as a first chapter tranche: OLP-0004 through
OLP-0010, seven source units, six sections, twelve PDF pages including front
matter. It includes definitions, examples, exercises, proofs and all three
source diagrams. This is **not the complete OpenLogic Telugu edition**.

[Download the chapter and editable source package](https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/releases).

[Zenodo DOI: 10.5281/zenodo.22307938](https://doi.org/10.5281/zenodo.22307938).
Both mirrors' public artifact bytes have been anonymously verified;
see [PUBLICATION.md](PUBLICATION.md).

Twenty-three full-unit editable drafts exist in this repository: Sets (7),
Relations (9) and Functions (7). All three batches have source-aligned
structural and same-agent semantic review records. Relations and Functions
are not yet integrated into a verified reader. The other 699 units and the coherent full reader remain in
progress. Useful semantic HTML is also unfinished; no inaccessible PDF is
represented as a substitute for it.

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

## QA and limitations

The seven-unit PDF passes exact paragraph alignment, protected identifier,
token, environment and mathematical-form checks; same-agent semantic and
reverse-paraphrase review; four-pass guarded XeLaTeX builds with identical
last-two-pass hashes; all-page visual inspection; mixed-script and Telugu
conjunct extraction samples. The final log has zero missing glyphs,
overfull boxes, undefined references or warnings.

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

## License

The Open Logic Text is licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
The complete upstream license and disclaimer are retained in LICENSE.md.
Translation, reader and original task-authored scripts are offered under
the same license to the extent copyright applies.

Noto Serif Telugu is Copyright 2018 The Noto Project Authors and uses the
SIL Open Font License 1.1; see fonts/OFL.txt. It is not relicensed as CC BY.
See ATTRIBUTION.md for component boundaries and credits.

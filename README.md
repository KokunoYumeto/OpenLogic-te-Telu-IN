# OpenLogic తెలుగు — తెలుగు పాఠకుల మార్గదర్శి (te-Telu-IN)

ఇది [ఓపెన్ లాజిక్ ప్రాజెక్ట్](https://openlogicproject.org/) పాఠ్యానికి
రూపొందుతున్న తెలుగు యంత్రానువాదం. స్థిరపరిచిన
[మూల సంచిక](https://github.com/OpenLogicProject/OpenLogic/tree/9620cc73f9c8e0ad003c514a5d3748f29611c4c0)
లోని 722 TeX ఫైళ్లన్నిటినీ అనువదించి ఒక సమగ్ర పాఠక సంచికగా ఇవ్వడమే
లక్ష్యం. ప్రస్తుతం పూర్తి సంచిక సిద్ధం కాలేదు; ఈ దిగువ పరిధులను
ఒకదానితో మరొకటి కలపకండి.

## చదవడం, దింపుకోవడం

- [ప్రస్తుత GitHub విడుదల](https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/releases/tag/v0.4.0-cumulative-olp0279)
  వద్ద OLP-0004–OLP-0279 వరకు 276/722 భాగాల 515-పేజీల PDF,
  ప్రవాహానికి అనుగుణమైన EPUB, నేరుగా దింపుకోదగిన సమీకృత LaTeX
  ఫైలు, పూర్తి సవరించదగిన మూల-వృక్ష ZIP ఉన్నాయి. PDFతోపాటు దానికి
  సరిపడే మూల ఫైళ్లను అదే విడుదలలో ఉంచాం.
- [వెబ్‌లో చదివే తెలుగు సంచిక](https://kokunoyumeto.github.io/OpenLogic-te-Telu-IN/sfr/)
  ఇంకా OLP-0004–OLP-0026 వరకే, అంటే 23/722 భాగాలు.
- ఈ నిల్వలో నేరుగా సవరించదగిన తెలుగు TeX ముసాయిదాలు
  OLP-0001–OLP-0370 వరకు వరుసగా 370/722 ఉన్నాయి. ఇవన్నీ
  ప్రస్తుత PDF, EPUB లేదా వెబ్ పాఠ్యంలో ఉన్నాయని అర్థం కాదు.
  తదుపరి అనువదించాల్సినది OLP-0371; ఇంకా 352 ఫైళ్లు మిగిలాయి.
- [తాజా Zenodo సంచిక DOI](https://doi.org/10.5281/zenodo.22726674),
  [కొనసాగే సంచికల DOI](https://doi.org/10.5281/zenodo.22307937)
  మునుపటి Zenodo విడుదలను సూచిస్తాయి. ప్రస్తుత GitHub v0.4.0కు
  కొత్త Zenodo సంచిక సృష్టించలేదు.

## మూలం, అనువాదం, పరిమితులు

ఆంగ్ల మూలంలోని 722 ఫైళ్ల బైట్లు మారకుండా ఈ నిల్వలోని upstream/content
వృక్షంలో భద్రపరచబడ్డాయి. మూల రచయితలు, సహకారుల వివరాలు
[ఇక్కడ](https://openlogicproject.org/people/) ఉన్నాయి. తెలుగు
సంచికకు మూల రచయితల ఆమోదం ఉందని చెప్పడం లేదు. గణిత నిర్వచనలు,
సూత్రాలు, లేబుళ్లు, ఉదాహరణలు, సాధనలు, సూచనలు నిలిపి,
అవసరమైన మూలపాఠ దోషాలను తెలుగు వాక్యం పక్కనే ప్రకటిస్తున్నాం.
మూల ఆంగ్ల ఫైళ్లను సరిచేయడం లేదు.

స్థానిక ఆంధ్రప్రదేశ్, తెలంగాణ, ఉమ్మడి ఆంధ్రప్రదేశ్ తెలుగు గ్రంథాల
నిజమైన పేజీలను చూసి పదజాలం, శైలికి ఆధారాలు నమోదు చేశాం.
వాటి [మూలాల సూచీ](evidence/CANON_SOURCES.jsonl),
[పేజీల సూచీ](evidence/CANON_PASSAGES.jsonl) ఉన్నాయి.
పేజీని చూసినంత మాత్రాన ప్రత్యేక లాంబ్డా కలనశాస్త్ర పదానికి
నేరుగా సాక్ష్యం దొరికిందని చెప్పడం లేదు; ఆ భావానికి స్థిర
మూలపాఠ నిర్వచనమే ఆధారం. కాపీరైట్ పరిమితులున్న అసలు పుస్తకాలను,
వాటి పేజీ చిత్రాలను ఇక్కడ పంచడం లేదు.

ప్రస్తుత [పదజాల నిర్ణయాలు](evidence/TERM_DECISIONS.jsonl) 91;
[ప్రకటిత మూల దోషాలు, సవరణలు](evidence/SOURCE_CORRECTIONS.jsonl) 330.
వాటిలో ఆల్ఫా-ప్రతిస్థాపన సిద్ధాంతపు రెండు, సమాంతర బీటా
ప్రతిస్థాపన ఉపసిద్ధాంతపు ఒకటి, బీటా సంకోచనం నుంచి
సమాంతర తగ్గింపుకు ఒక నిరూపణ ఖాళీ ఇంకా
పూర్తి నిరూపణ లేకుండానే స్పష్టంగా గుర్తించబడ్డాయి.
[తెలుగు నిర్ణయాల మార్గదర్శి](evidence/START_HERE.te.md)లో 421 నిర్ణయాలు,
793 అమలు స్థానాలు ఉన్నాయి. తుది పేజీ సంఖ్యలు సమగ్ర పాఠక
సంచిక ముద్రణ తరువాతే నిర్ణయించగలం; ఇప్పటికి ఫైలు, విభాగం,
పంక్తి, అనుసంధానిత ఖండం ద్వారా ఖచ్చితమైన స్థానాలు ఉన్నాయి.
[తాజా తెలుగు పరిశీలన](evidence/BATCH-051-SEMANTIC-REVIEW.md),
[మూల దోష పరిశీలన](evidence/source-audits/2026-09-25-lambda-beta-church-rosser-telugu/REVIEW.md)
బీటా-తగ్గింపు, చర్చ్--రోసర్ వాదన, వాటి నిరూపణలోని
పరిమితిని వివరిస్తాయి. మునుపటి నిర్ణయ
నమోదుల్లో ఆంగ్లం ఇంకా ఉంది; వాటి పూర్తి తెలుగు రూపం పనిలో ఉంది.

OLP-0001–OLP-0370 వరకు 370/370 ఫైళ్లు మూల-లక్ష్య ఖండాలు,
TeX నిర్మాణాలు, మూల పదసంకేతాలు, స్థిర గుర్తింపులు,
ప్రకటిత సవరణలను పరిగణనలోకి తీసుకున్న గణిత రూపాల
[నిర్మాణ తనిఖీ](evidence/CUMULATIVE-OLP0370-STRUCTURAL-QA.json)
దాటాయి. 5,721 అనుసంధానిత ఖండాల్లో 3,623 అనువాద
భాషా ఖండాలు; వాటికి చదివిన తెలుగు పేజీల సూచనలు ఉన్నాయి.
మిగిలిన 2,098 ఖండాలు నిర్మాణాత్మకమైనవి. పాత వర్గీకరణలో
పాఠకులకు కనిపించే 110 ఖండాలను పొరపాటున నిర్మాణాత్మకంగా
చూపిన విషయం [ఇక్కడ](evidence/SEGMENT-CLASSIFICATION-REPAIR-20260925.json)
సరిచేశాం; మూల లేదా అనువాద బైట్లు మారలేదు.

ఈ తనిఖీలు యంత్రం, ఇదే Codex ఏజెంట్ చేసినవి; స్వతంత్ర మానవ
భాషా లేదా గణిత నిపుణ ధృవీకరణ కాదు. కొన్ని ప్రత్యేక పదాలు
తాత్కాలిక ఎంపికలే. PDF ఇంకా యాక్సెసిబిలిటీ ట్యాగులతో
లేదు. ప్రస్తుత PDF/EPUBకు ప్రత్యేకంగా నాలుగు-పాస్ TeX నిర్మాణం,
గ్రంథసూచి/సూచనల తనిఖీ, అన్ని పేజీల చిత్రాల పరిశీలన చేశాం.
పూర్తి 722-భాగాల పాఠక సంచిక ఇంకా నిర్మించబడలేదు. నిర్వాహకుడి
వేరైన తెలుగు-మూలాధార సమీక్ష OLP-0004–OLP-0148 వరకే;
ఈ 370 ముసాయిదాలకు ఆ ధృవీకరణను విస్తరించి చెప్పడం లేదు.

## AI పని వెల్లడింపు, పునర్నిర్మాణం, హక్కులు

ఈ పనిలో OLP-0004–OLP-0355 తెలుగు అనువాదం, సవరణలు,
సంపాదక పనిని OpenAI Codex — GPT-5.6 Sol, Ultra effort చేసింది;
OLP-0001–OLP-0003, OLP-0356–OLP-0370పై అదే పనిని OpenAI Codex — GPT-6 Sol,
Ultra effort చేసింది. ఇవి మానవ సంపాదకత్వం లేదా సమీక్ష
అని అర్థం కాదు. ఖచ్చితమైన మోడల్, శ్రమ స్థాయి ఈ పనికి
చెందిన స్థానిక కార్య-సందర్భ నమోదుతో తనిఖీ చేశాం.

పూర్తి మూలం, నిర్మాణ సూచనలు విడుదలలో ఉన్నాయి.
ప్రస్తుత 276-భాగాల PDFను మళ్లీ నిర్మించాలంటే Windows,
PowerShell 7.4+, Node.js 22+, XeLaTeX/MiKTeX, అవసరమైన TeX
ప్యాకేజీలు కావాలి. నిల్వ మూలం నుంచి ఈ ఆదేశం నడుస్తుంది:

    pwsh -File scripts/build-cumulative-279.ps1

నిర్మాణం యంత్రవ్యాప్త TeX మ్యూటెక్స్‌ను పట్టుకుని నాలుగు
పాస్‌లు, వెంటనే జరిగే లాగ్ తనిఖీలన్నీ పూర్తయ్యాక విడుస్తుంది.
పునర్నిర్మాణంలో సాధనాల సంచిక వల్ల PDF బైట్లు మారవచ్చు.
ఈ పాఠ్యం, అనువాదం తగిన మేరకు
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) కింద;
Noto Serif Telugu ఫాంటుకు వేరుగా
[SIL OFL 1.1](fonts/OFL.txt) వర్తిస్తుంది.
[హక్కులు, భాగాల వివరాలు](ATTRIBUTION.md) చూడండి.

## Additional English information

The English account below is supplementary; the Telugu guide above gives
the access links, coverage, provenance, review status, AI attribution,
rebuild command, and licensing information without requiring English.

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

Three hundred seventy full-unit editable TeX drafts form the contiguous
OLP-0001--OLP-0370 range; editable coverage is 370/722 and the next manifest
cursor is OLP-0371. They cover the
opening front matter and corpus/part drivers, then the
Sets, Relations and Functions material, Propositional and First-Order Logic,
Model Theory, Computability and Turing Machines, plus the complete introductory
chapter of Incompleteness, the complete Arithmetization of Syntax chapter and
the complete Representability in Q, Theories and Computability, and
Incompleteness and Provability chapters, followed by the complete Second-order
Logic part: its driver and its Syntax and Semantics, Metatheory, and
Second-order Logic and Set Theory chapters, followed by the Lambda Calculus
part driver and its complete Introduction and Syntax chapters, plus the
Church--Rosser chapter driver and first three sections. All fifty-one batches have
source-aligned structural and same-agent semantic review records.

Format coverage is deliberately separate. The current cumulative PDF and EPUB
contain 276 editable units in OLP-0004--OLP-0279. The deployed semantic HTML
reader contains OLP-0004--OLP-0026 only: 23 units, the complete Sets, Relations
and Functions chapters. Thus 347 current editable drafts are not yet in that
23-unit HTML reader, and 94 are not yet in the cumulative PDF or
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

The correction ledger records 330 audited source issues, with repairs or
explicit disclosures beside the affected Telugu claims. Two gaps in the
source proof of alpha-safe substitution, one in parallel-beta substitution,
and one in the β-contraction-to-parallel proof
remain disclosed, not repaired. The frozen English
bytes remain unchanged. Each correction is bound to a bounded audit, an exact
source hash, target locator and declared mathematical delta. See
[SOURCE_CORRECTIONS.jsonl](evidence/SOURCE_CORRECTIONS.jsonl), the
[source-audit directory](evidence/source-audits/), and the current
[beta/Church--Rosser audit](evidence/source-audits/2026-09-25-lambda-beta-church-rosser-telugu/REVIEW.md).

The [canonical translation-decision index](evidence/START_HERE.md) exposes all
91 current terminology/sense decisions and 330 correction/disclosure records across 793
implementation occurrences, with exact
source/target locators, aligned segment hashes, authorities actually checked,
known evidence limits, alternatives, uncertainty, and concrete review
questions. Its status is explicitly partial (370/722); optional expert review
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

All 370 editable TeX drafts in OLP-0001--OLP-0370 pass correction-aware
blank-block, environment, source-token, protected-identifier and
mathematical-form checks. Fifty-one same-agent semantic reviews record
source-aligned reverse paraphrases and their limits. The cumulative structural
receipt is [CUMULATIVE-OLP0370-STRUCTURAL-QA.json](evidence/CUMULATIVE-OLP0370-STRUCTURAL-QA.json).
The [segment classification repair](evidence/SEGMENT-CLASSIFICATION-REPAIR-20260925.json)
reclassified 110 previously mislabelled reader-visible blocks without changing
source or translation bytes; all 5,721 current aligned blocks retain exact hashes.
Beyond the explicit reader boundaries stated above, source QA does not imply
PDF, EPUB, or HTML reader integration.

QA is machine/agent performed, not human or independent review. Several
technical terms remain provisional. The PDF is not tagged. Source caveats
and terminology uncertainty are retained in the public evidence directory.
Checks on this chapter do not establish completion or QA of the whole corpus.

In this task, OpenAI Codex — GPT-5.6 Sol, Ultra effort produced the editable
Telugu translation and corrections in OLP-0004--OLP-0355; OpenAI Codex — GPT-6 Sol,
Ultra effort produced OLP-0001--OLP-0003 and OLP-0356--OLP-0370. This is AI work, not human editing
or independent specialist review. The model/effort ranges were verified from
the local task context record.

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

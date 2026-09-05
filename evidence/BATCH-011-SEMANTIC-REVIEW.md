# Natural Deduction batch 011: source-aligned semantic review

Scope: OLP-0084 through OLP-0097, fourteen complete files and 237 aligned
blank-line blocks. The chapter is shared by the first-order and propositional
logic parts through its existing tag-controlled identities and imports; all
conditional routing is preserved. Same-agent review only; no human language or
subject-matter review is claimed. All fourteen frozen English originals were
read in full and compared against the Telugu drafts. Native pages TE-P002,
TE-P003 and TE-P004 were visually refreshed for logic, truth/falsity,
reasoning, proof, induction, deduction and theorem register. Natural-deduction
rule and discharge terminology remains explicitly provisional and
definition-controlled.

## Source-aligned checks and reverse paraphrases

- OLP-0084 retains both tag-controlled chapter identities and the exact import
  order for all thirteen component files. It preserves the Gentzen/Prawitz
  attribution and the `prfND` material tag. Reverse paraphrase: this driver
  assembles one natural-deduction chapter for first-order and propositional
  settings without adding a rule of its own.
- OLP-0085 preserves the informal-proof motivation, topmost assumptions,
  premise/conclusion distinction, paired introduction and elimination rules,
  discharge labels and the convention of retaining rules for defined
  operators. Reverse paraphrase: a natural-deduction proof is a labelled tree
  of sentences whose rules may consume selected temporary assumptions.
  OLTEND-001 repairs the copied word “sequents” where the defined node type is
  sentences.
- OLP-0086 preserves every propositional rule schema for conjunction,
  disjunction, the conditional, negation and falsehood, including branch
  discharge and the two classical falsehood rules. It retains the statement
  that discharge is permitted rather than required. Reverse paraphrase:
  introduction rules build a principal operator and elimination rules use it,
  while explicitly labelled assumptions may be discharged.
- OLP-0087 retains universal and existential introduction/elimination,
  closed-term substitution, both eigenvariable restrictions, their historical
  naming note, substitution explanation, unsound counterexample and the
  sentence-closure consequence. Reverse paraphrase: unrestricted instance
  rules use closed terms, while the two rules representing arbitrary witnesses
  require a fresh constant absent from every relevant open dependency.
- OLP-0088 preserves the inductive finite-tree definition, bottommost
  conclusion, discharged/open-assumption conditions and symbolic derivability.
  The examples retain all conjunction and conditional steps, switched roles
  and the legal vacuous discharge. Reverse paraphrase: a derivation is built
  from assumption leaves by correct rules, and only its undischarged leaves
  count as premises of the conclusion.
- OLP-0089 retains the three complete propositional proof-construction
  examples: conjunction projection, conditionalization by cases and excluded
  middle via classical contradiction, followed by all three exercise groups.
  Every displayed formula and discharge number is preserved. Reverse
  paraphrase: proof search alternates bottom-up connective introduction with
  top-down use of assumptions, and classical contradiction is the final tool
  when constructive rules cannot choose a disjunct. OLTEND-002 corrects one
  contradiction-step rule label; OLTEND-003 replaces an inapplicable
  sequent-calculus term by the natural-deduction conclusion.
- OLP-0090 preserves all three quantified worked derivations, their proof-search
  order, eigenvariable checks, retained open assumptions and both exercise
  groups. Reverse paraphrase: quantified proof search applies freshness-bound
  rules early in planning so that the finished tree's lower steps satisfy
  every dependency restriction.
- OLP-0091 retains theoremhood, derivability, consistency, reflexivity,
  monotonicity, transitivity and compactness. Its transitivity proof still
  composes derivations by conditional introduction and elimination, and its
  finite-premise notation is unchanged. Reverse paraphrase: derivability is
  controlled entirely by undischarged assumptions, is stable under premise
  enlargement and chaining, and every finite proof depends on finitely many
  premises.
- OLP-0092 preserves all four consistency/derivability propositions and their
  displayed proof compositions, including classical contradiction and
  negation rules. Reverse paraphrase: proving A is equivalent to inconsistency
  after adding not-A, and inconsistency cannot depend essentially on both
  opposite extensions of the same premise.
- OLP-0093 retains the derivability facts for conjunction, disjunction and the
  conditional, including modus ponens, both disjunction introductions and
  vacuous conditional discharge. Reverse paraphrase: the displayed natural-
  deduction rules recover the familiar consequence behavior of all
  propositional connectives needed by completeness.
- OLP-0094 preserves strong generalization, its freshness hypothesis and the
  two tagged quantifier-instance derivations. Reverse paraphrase: a constant
  absent from assumptions and the generalized formula may stand for an
  arbitrary object, while ordinary universal and existential instances follow
  directly from their rules.
- OLP-0095 retains the induction on the number of inferences for soundness,
  including the zero-inference basis, unary and multiple-premise cases,
  quantified structure-extension argument, deferred exercise cases and both
  corollaries. Reverse paraphrase: assumptions satisfy the base case and every
  introduction or elimination rule preserves semantic consequence from the
  open assumptions of its subderivations. OLTEND-004 repairs the propositional
  tag branch so that it names a valuation rather than a structure.
- OLP-0096 preserves reflexive identity introduction, both directions of
  identity elimination, substitutability, the symmetry/transitivity exercise,
  the uniqueness derivation and final exercises. Reverse paraphrase: equal
  closed terms may replace one another in formulas, which supports the usual
  symmetry, transitivity and uniqueness reasoning.
- OLP-0097 retains the identity soundness extension through equality of closed-
  term denotations and the formula-extension lemma. Reverse paraphrase: when
  two closed terms denote one object, substituting either into the same formula
  preserves satisfaction, so identity elimination is sound.

## Source audit and correction adoption

The bounded Telugu-lane audit is OLTEND-20260905, checked against frozen Open
Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0:

- REVIEW.md: SHA-256
  0d73706ca613546734655e2f7c45125d24454356d22c14d5febf4c45dfabe103;
- FINDINGS.json: SHA-256
  292074ba89d68a5de37f78bee0ecb43e88d3fd575d23fe23feadb42aa67bb865.

All four findings have adjacent Telugu notes and machine correction records
with `applied_qa_pass` status. OLTEND-001 and OLTEND-003 repair ordinary prose;
OLTEND-002 changes a proof-tree rule label outside delimited math; OLTEND-004
repairs tagged semantic-object wording while preserving both displayed
symbols. Their declared correction-aware math deltas are therefore empty. No
undeclared mathematical drift is accepted. Frozen English files remain
byte-identical and are never edited.

## Canon use and limits

TE-P002 supports native logic, mathematical-statement and truth/falsity
register. TE-P003 directly supplies reasoning, proof, induction and deduction
language. TE-P004 supports theorem, proof and uniqueness register. None of
these pages independently attests assumption discharge, undischarged
assumptions, introduction/elimination rule taxonomy, subderivation,
eigenvariable conditions, reductio, explosion, natural-deduction compactness
or identity substitutability. TE-T038 therefore records the grouped choices as
provisional; TE-T035--TE-T037 are reused only within their recorded scopes.
The formal senses are fixed by adjacent OpenLogic definitions and derivations,
not by overstated witness authority.

No current Top 10 ranking or treatment-effect evidence exists for this lane.
Catalog presence, source-token size, census language groups, PISA burden and
adjacent-compute results are not used as rank or effect evidence. No separate
prerequisite, diagnostic or worked-answer companion is claimed by this batch.

## Deterministic checks and limits

All fourteen units pass exact blank-block alignment, environment counts,
source token counts, protected identifiers/options/references/citations,
Unicode checks and correction-aware formula multiset comparison.
Formula- and macro-internal English, including `main operator`, remains
protected source text; multiword Latin residue otherwise occurs only in frozen
TeX comments. BATCH-011-STRUCTURAL-QA.json has SHA-256
d8289e439fe3f9a26b03835116f025adfe5754ab7f21d5342c4e8079ea5247e3.

The segment ledger adds 237 unique records: 141 translated linguistic
segments and 96 preserved structural/metadata segments. The cumulative ledger
now has 1,561 unique records across 94 units: 1,015 linguistic and 546
structural; its SHA-256 is
1c2df8f11dc18009365d607a0062a2f37b56939f67b207f36770a00963e15768.

No replacement characters, byte-order marks, zero-width spaces or unpaired
surrogates are accepted by the release gate. All fourteen current files are
NFC and free of trailing whitespace. This source tranche has not yet been
integrated into or visually checked in a new HTML or PDF reader. Completion is
therefore 94 of 722 source units, not a claim of a complete publication.

# Axiomatic Deduction batch 013: source-aligned semantic review

Scope: OLP-0112 through OLP-0125, fourteen complete files and 207 aligned
blank-line blocks. The chapter is shared by the first-order and propositional
logic parts through its existing tag-controlled identities and imports; all
conditional routing is preserved. Same-agent review only; no human language or
subject-matter review is claimed. All fourteen frozen English originals were
read in full and compared against the Telugu drafts. The existing visually
checked TE-P002, TE-P003 and TE-P004 evidence was reused for logic,
truth/falsity, reasoning, proof, induction, deduction and theorem register.
Axiomatic-deduction terminology remains explicitly provisional and
definition-controlled.

## Source-aligned checks and reverse paraphrases

- OLP-0112 retains both tag-controlled chapter identities, the editorial scope
  note and the exact order and conditions of all thirteen component imports.
  Reverse paraphrase: this driver assembles the axiomatic-derivation chapter
  for first-order and propositional settings, with quantifier and identity
  sections included only in the first-order branch.
- OLP-0113 preserves the finite-sequence definition of derivation, its three
  admissible kinds of step, the general inference-rule definition, the
  hypothesis and axiom cases, modus ponens, derivability notation and
  theoremhood. Reverse paraphrase: every line must be a premise, an axiom or
  licensed by earlier lines, and the last line is what the sequence derives.
- OLP-0114 retains all fourteen propositional axiom schemata, their labels,
  modus ponens and the MP abbreviation. Reverse paraphrase: fixed conditional
  schemata govern the connectives, while MP passes from a formula and its
  conditional consequence to that consequence.
- OLP-0115 preserves both quantifier axiom schemata for closed terms, both
  quantifier rules, their freshness restrictions relative to Gamma and the
  antecedent/consequent, and the QR abbreviation. Reverse paraphrase: a fresh
  constant licenses movement from an instance to a universal conclusion or
  from an existential antecedent to its consequence.
- OLP-0116 retains both worked implicational derivations, the chained-
  conditional example, the general chain proposition with its concatenation
  proof, and all three exercises. Reverse paraphrase: suitable axiom instances
  followed by MP derive identity and compose two conditionals without assuming
  either endpoint formula outright.
- OLP-0117 preserves every universal-instantiation, conjunction and QR step in
  the quantified example. Reverse paraphrase: each universal conjunct yields
  its fresh-constant instance, the two instances are conjoined, and QR restores
  the universal conclusion.
- OLP-0118 retains derivability, theoremhood, consistency, reflexivity,
  monotonicity, transitivity and compactness, including the concatenated
  finite derivations and finite-premise witness. Reverse paraphrase:
  axiomatic derivability contains hypotheses, persists when assumptions grow,
  composes by splicing derivations and depends on only finitely many premises.
  OLTEAXD-001 restores the formula marker on the indexed B-step.
- OLP-0119 preserves meta-level modus ponens, both directions of the deduction
  theorem, the length induction, identity base case, MP induction case and all
  five derived facts and exercises. Reverse paraphrase: derivability from
  Gamma together with A is equivalent to derivability of A-implies-B from
  Gamma, which packages a temporary premise into a conditional. OLTEAXD-002
  repairs the malformed membership statement and OLTEAXD-003 balances the
  first derived formula.
- OLP-0120 retains the quantified deduction theorem, the shared base and MP
  cases, the universal QR case with its eigenvariable restriction, the
  propositional reshaping steps and the existential exercise. Reverse
  paraphrase: freshness survives conjoining the discharged premise, so QR can
  be applied before the conjunction is converted back into a nested
  conditional. OLTEAXD-004 balances that meta-conditional and OLTEAXD-005
  restores the required A-implies-B conclusion.
- OLP-0121 preserves the four derivability/consistency propositions and the
  deductions connecting contradiction, explicit negation and exhaustive
  inconsistency. Reverse paraphrase: deriving A is equivalent to inconsistency
  after adding not-A, and deriving both sides of a contradiction yields false.
  OLTEAXD-006 explicitly supplies the reflexivity premise needed before two MP
  applications.
- OLP-0122 retains the conjunction, disjunction and conditional consequence
  facts, their axiom uses, the displayed MP derivation and the dependency on
  the deduction theorem. Reverse paraphrase: the axiom system recovers the
  ordinary introduction/elimination behavior needed in the completeness
  proof. OLTEAXD-007 uses the right-conjunction axiom for the second projection;
  OLTEAXD-008 uses the explosion axiom for not-A-implies-A-implies-false.
- OLP-0123 preserves strong generalization, its constant-freshness condition,
  both quantifier consequence facts and their deduction-theorem proofs.
  Reverse paraphrase: a constant absent from the premises and formula can be
  generalized, and closed-term existential introduction and universal
  instantiation follow from the quantifier axioms. OLTEAXD-009 replaces a
  wrongly named final rule with the top axiom and MP steps actually required.
- OLP-0124 retains axiom validity, the induction on derivation length, the MP
  case, the first-order QR model-modification argument, its exercise and all
  three soundness consequences. Reverse paraphrase: axioms are semantically
  valid and both inference rules preserve consequence, so derivability never
  outruns semantic entailment and satisfiability implies consistency.
  OLTEAXD-010 restores the formula marker in three B-occurrences.
- OLP-0125 preserves both closed-term identity schemata, their validity
  exercise, reflexive identity and substitutability by two MP applications.
  Reverse paraphrase: equal closed terms may be substituted inside a formula,
  and each closed term is provably identical with itself. OLTEAXD-011 restricts
  the reflexivity proposition to the closed terms licensed by its axiom.

## Source audit and correction adoption

The bounded Telugu-lane audit is OLTEAXD-20260905, checked against frozen Open
Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0:

- REVIEW.md: SHA-256
  cda0b0e084ac1cc0d9608f80f2b4727d8413af539a509803615c279dfde70e57;
- FINDINGS.json: SHA-256
  f2b3046c36663536978f3c0c43b4e92606cdce420c7f41496133d389acb52f19.

All eleven findings have adjacent Telugu notes and machine correction records
with `applied_qa_pass` status. Their declared correction-aware math deltas
cover two restored formula markers, two balanced conditional displays, one
reconstructed membership atom, one corrected deduction-theorem conclusion,
one explicit reflexivity premise, one explicit top-axiom premise and three
repaired B-atoms. The two corrected axiom citations and closed-term scope
repair have empty delimited-math deltas; the source's erroneous cross-reference
tokens remain traceable in the adjacent disclosure notes while the body names
the correct axioms. No undeclared mathematical drift is accepted. Frozen
English files remain byte-identical and are never edited.

## Canon, form and evidence limits

TE-P002 supports native logic, mathematical-statement and truth/falsity
register. TE-P003 directly supplies reasoning, proof, induction and deduction
language. TE-P004 supports theorem, proof and uniqueness register. None
independently attests axiom schema, axiom instance, axiomatic derivation, modus
ponens, quantifier rule, derivability relation, proof-theoretic notion,
consistency, compactness, strong generalization or identity-axiom terminology.
TE-T040 therefore records those grouped choices as provisional; modus ponens
is an explicit borrowing. TE-T032--T039 are reused only within their recorded
scopes. Formal senses are fixed by the adjacent OpenLogic definitions,
schemata and proofs, not by overstated witness authority.

The evidence-bounded edition-form assessment remains one standard formal
Telugu edition in Telugu script (`te-Telu-IN`), preserving Arabic decimal
digits, Latin metavariables, international logic notation and left-to-right
mathematics. Current Andhra Pradesh, Telangana and pre-bifurcation witnesses
do not establish a systematic difference warranting separate regional,
script, orthographic, numeral or register editions. This remains explicitly
open to native specialist evidence and is not an exhaustive sociolinguistic
claim.

No current Top 10 ranking or treatment-effect evidence exists for this lane.
Catalog presence, source-token size, census language groups, PISA burden and
adjacent-compute results are not used as rank or effect evidence. No separate
prerequisite, diagnostic or worked-answer companion is claimed by this batch;
any future companion must be separately authored or generated and manifested
and cannot replace or delay the faithful translation.

## Deterministic checks and limits

All fourteen units pass exact blank-block alignment, environment counts,
source token counts, protected identifiers/options/references/citations,
Unicode checks and correction-aware formula multiset comparison.
Formula- and macro-internal English remains protected source text; multiword
Latin residue otherwise occurs only in frozen TeX comments.
BATCH-013-STRUCTURAL-QA.json has SHA-256
cf01c81fe2cdb95b972f13dff9024b2364b99b2ad30523267e7dab8d3d509b5d.

The segment ledger adds 207 unique records: 120 translated linguistic
segments and 87 preserved structural/metadata segments. The cumulative ledger
now has 1,991 unique records across 122 units: 1,266 linguistic and 725
structural; its SHA-256 is
059c68ea7cae01acc583aabff8ab420e3a7d4f1006035c6f6db9c98100970078.

No replacement characters, byte-order marks, zero-width spaces or unpaired
surrogates are accepted by the release gate. All fourteen current files are
NFC and free of trailing whitespace. The unmanifested upstream
`provability.tex` is not one of the 722 frozen units, is not imported by the
driver and remains outside this batch. This source tranche has not yet been
integrated into or visually checked in a new HTML or PDF reader; no TeX
process was launched. Completion is therefore 122 of 722 source units, not a
claim of a complete publication.

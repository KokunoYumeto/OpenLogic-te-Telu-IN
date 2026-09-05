# Sequent Calculus batch 010: source-aligned semantic review

Scope: OLP-0069 through OLP-0083, fifteen complete files and 231 aligned
blank-line blocks. The chapter is shared by the first-order and propositional
logic parts through its existing tag-controlled identities and imports; all
conditional routing is preserved. Same-agent review only; no human language or
subject-matter review is claimed. All fifteen frozen English originals were
read in full and compared against the Telugu drafts. Native pages TE-P002,
TE-P003 and TE-P004 were visually refreshed before drafting for logic,
truth/falsity, reasoning, proof, induction, deduction and theorem register.
Sequent-specific rule names and proof-theoretic terminology remain explicitly
provisional and definition-controlled.

## Source-aligned checks and reverse paraphrases

- OLP-0069 retains both tag-controlled chapter identities and the exact import
  order for all fourteen component files. The editorial still identifies
  Gentzen's standard classical calculus LK, its propositional restriction when
  the FOL tag is absent and the chapter's progression from rules to soundness
  and identity. Reverse paraphrase: this driver assembles one sequent-calculus
  chapter for two logic settings without adding a rule of its own.
- OLP-0070 preserves sequents as ordered pairs of finite, possibly empty
  sentence sequences, together with the antecedent/succedent terminology,
  intuitive semantic reading and the special cases with an empty side. It
  retains validity, initial sequents, upper and lower sequents, and the
  logical-versus-structural rule distinction. Reverse paraphrase: a sequent
  says that simultaneous truth on its left forces truth of at least one
  formula on its right, while a calculus derives such objects by rules.
- OLP-0071 preserves the exact left and right LK rule schemata for negation,
  conjunction, disjunction and the conditional, including contexts, premise
  multiplicity and double inference lines. Reverse paraphrase: each
  propositional connective is introduced on either side by the displayed
  transformation of one or two premise sequents.
- OLP-0072 retains all four quantifier rules, the requirement that the
  substituting term be closed, the eigenconstant restriction on the two
  generalizing rules and its scope over the entire lower sequent. The
  substitution explanation and counterexample showing why the restriction is
  necessary remain intact. Reverse paraphrase: arbitrary closed instances may
  be used in the instantiating rules, whereas a fresh name is required when a
  premise must represent an arbitrary object.
- OLP-0073 preserves left/right weakening, contraction and exchange as well as
  cut, including the exact sequence order and double lines that mark
  structural rules. Reverse paraphrase: structural rules rearrange, duplicate,
  discard or connect contextual occurrences without analyzing their logical
  operators.
- OLP-0074 preserves the inductive definition of LK derivations and the roles
  of initial, premise and end sequents. Its worked construction still builds
  the target with conjunction-right after the required weakening and exchange
  steps, and the note about reversing premises remains. Reverse paraphrase: a
  derivation is a finite rule tree whose leaves are initial sequents and whose
  root is its end sequent.
- OLP-0075 retains all four propositional worked derivations, their
  construction commentary and both exercise groups. The order of every
  antecedent and succedent formula remains visible. Reverse paraphrase: the
  examples show how logical rules expose principal connectives while
  structural rules put formulas in the positions needed to finish a proof.
  OLTESEQ-001 repairs four repeated antecedent exchanges that were labelled as
  right exchanges; OLTESEQ-002 restores the missing negation on B in both
  prose candidates of the third example.
- OLP-0076 preserves the quantified worked derivation, including the witness
  instance, negation steps and the ordering needed to respect the
  eigenconstant condition, followed by the original exercises. Reverse
  paraphrase: a quantified sequent proof must choose its instance and fresh
  constant so that every subsequent generalization satisfies the rule's
  side-condition.
- OLP-0077 retains theoremhood, derivability from a set, nonderivability and
  syntactic consistency, together with the convention that necessary
  structural steps may be left tacit. It preserves the proofs of reflexivity,
  monotonicity and transitivity and the two directions of proof-theoretic
  compactness. Reverse paraphrase: consequence is insensitive to premise order
  and repetition, supports identity and cut-like chaining, and every actual
  finite derivation uses only finitely many premises. OLTESEQ-003 names the
  sequent calculus rather than natural deduction in the editorial scope note.
- OLP-0078 preserves both consistency lemmas, the cut and negation-rule
  constructions and the explicitly stated finite subsets used in each
  direction. Reverse paraphrase: adding A makes Gamma inconsistent exactly
  when Gamma proves not-A, and adding not-A makes it inconsistent exactly when
  Gamma proves A.
- OLP-0079 retains the propositional derivability facts for conjunction,
  disjunction and the conditional, including both directions where stated and
  the modus-ponens consequence. Its abbreviated right-conjunction example is
  read under OLP-0077's explicit convention permitting tacit structural steps.
  Reverse paraphrase: the LK rules validate the familiar introduction and
  elimination behavior of the propositional operators at the level of
  derivability.
- OLP-0080 preserves strong generalization and the listed universal and
  existential derivability principles, with every freshness condition and
  substitution instance unchanged. Reverse paraphrase: quantifier
  consequences may be generalized only when the generalized variable is not
  free in the assumptions that are meant to remain fixed.
- OLP-0081 retains the semantic definition of sequent validity and the
  induction-on-derivation proof of soundness, including initial, unary and
  binary rule cases, the deliberately deferred exercise cases and all three
  corollaries. Reverse paraphrase: each LK rule preserves validity from its
  premises to its conclusion, so no derivation can turn valid leaves into an
  invalid end sequent. OLTESEQ-004 restores the full lower sequent in the
  left-conjunction case, and OLTESEQ-005 replaces a spurious set-difference
  sign by the required residual sequent in the cut case.
- OLP-0082 preserves the additional initial sequents and inference rule for
  identity, substitutability of identical closed terms, the derived symmetry
  and transitivity sequents and both exercises. Reverse paraphrase: reflexive
  identity is available initially and equal terms may be substituted in a
  formula occurrence without changing what follows.
- OLP-0083 retains the extension of soundness to identity by term denotation,
  sentence satisfaction and the substitution lemma. Reverse paraphrase: if
  two closed terms denote the same object, replacing one by the other in the
  relevant formula preserves satisfaction, so the identity inference is
  sound.

## Source audit and correction adoption

The bounded Telugu-lane audit is OLTESEQ-20260905, checked against frozen Open
Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0:

- REVIEW.md: SHA-256
  71a103a4b2e5d7629cd6b91be8394e5172d1ef5f70577e72ac14871f477e4a08;
- FINDINGS.json: SHA-256
  6bff7201b98b4dfe5825f4a9dca7e4aae8a02570ebd938eac3916ece3d0fb354.

All five findings have adjacent Telugu notes and machine correction records
with `applied_qa_pass` status. The correction-aware checker records four exact
math-atom replacements: the two candidate premises repaired under
OLTESEQ-002, the full left-conjunction conclusion under OLTESEQ-004 and the
residual cut sequent under OLTESEQ-005. OLTESEQ-001 changes only four rule
labels inside proof-tree environments, and OLTESEQ-003 repairs ordinary
editorial prose; neither produces a delimited-math delta. No undeclared
mathematical drift is accepted. Frozen English files remain byte-identical and
are never edited.

## Canon use and limits

TE-P002 supports native logic, mathematical-statement and truth/falsity
register. TE-P003 directly supplies reasoning, proof, induction and deduction
language. TE-P004 supports theorem, proof and uniqueness register. TE-P010 is
reused only for the already recorded relation-theoretic senses of reflexivity
and transitivity. None of these pages independently attests antecedent,
succedent, initial or end sequent, eigenvariable, weakening, contraction,
exchange, cut, proof-theoretic monotonicity or compactness, sequent
satisfaction or LK soundness. TE-T036 and TE-T037 therefore record the grouped
choices as provisional. Sequent, eigen and cut are explicit borrowings; all
formal extensions are fixed by the adjacent OpenLogic definitions, rule
schemata and derivations rather than overstated witness authority.

No current Top 10 ranking or treatment-effect evidence exists for this lane.
Catalog presence, source-token size, census language groups, PISA burden and
adjacent-compute results are not used as rank or effect evidence. No separate
prerequisite, diagnostic or worked-answer companion is claimed by this batch,
and none substitutes for the faithful OpenLogic translation.

## Deterministic checks and limits

All fifteen units pass exact blank-block alignment, environment counts, source
token counts, protected identifiers/options/references/citations, Unicode
checks and correction-aware formula multiset comparison. The misspelled source
metadata identity `seqeunt-calculus` and compact protected macro spellings are
deliberately preserved. Formula- and macro-internal English, including
`main operator`, remains protected source text; the only multiword Latin match
in active prose is that token key, while the other matches are frozen TeX
comments. BATCH-010-STRUCTURAL-QA.json has SHA-256
8cf7917921b7d7a9699adc5bcc569eff3076a1d5f2b8c9713a7c5ae02fc3f63d.

The segment ledger adds 231 unique records: 130 translated linguistic
segments and 101 preserved structural/metadata segments. The cumulative
ledger now has 1,324 unique records across 80 units: 874 linguistic and 450
structural; its SHA-256 is
32c4a8ce99ad39325e925b7fda762135aaf5a16b45419b6b4028547f946cbd73.

No replacement characters, byte-order marks, zero-width spaces or unpaired
surrogates are accepted by the release gate. All fifteen current files are NFC.
This source tranche has not yet been integrated into or visually checked in a
new HTML or PDF reader. Completion is therefore 80 of 722 source units, not a
claim of a complete publication.

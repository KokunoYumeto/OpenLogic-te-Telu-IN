# First-Order Logic Introduction batch 015: source-aligned semantic review

Scope: OLP-0138 through OLP-0148, eleven complete reader-reachable files and
125 aligned blank-line blocks (48 linguistic and 77 structural/metadata). This
batch contains the First-Order Logic part driver and the complete Introduction
chapter. Same-agent review only; no human language or subject-matter review is
claimed. Every frozen English file and Telugu draft was read in full. The
choice-level manager revalidation subsequently covered this batch together
with OLP-0004--OLP-0137 and returned `COMPLETE_PASS`; its provisional and
contentious records remain open to optional specialist review.

## Source-aligned checks and reverse paraphrases

- OLP-0138 preserves the First-Order Logic part identity, editorial account of
  its relation to the propositional part, all chapter imports, all four
  proof-system tag branches and the part-end hook. Reverse paraphrase: the part
  develops first-order metatheory through completeness, reusing the same
  source machinery in propositional mode while acknowledging present
  duplication between the two reader routes.
- OLP-0139 preserves the Introduction chapter identity, all nine section
  imports in source order and the chapter-end hook. Reverse paraphrase: the
  chapter moves from motivation through syntax, formulas, satisfaction,
  sentences, semantic notions, substitution, models/theories and finally
  soundness/completeness.
- OLP-0140 retains the formal-language motivation, terms/formulas/sentences
  distinction, logical questions, structures and satisfaction, the
  ants-and-insects entailment, proof-system examples and the promised
  metalogical equivalence. Reverse paraphrase: structures make cases and
  truth-in-a-case precise; a syntactic derivation answers the same consequence
  question only after soundness and completeness connect the two notions.
  OLTEINT-001 repairs the first malformed entailment bracket, and OLTEINT-002
  makes the same bounded repair in the natural-deduction and metalogical
  restatements.
- OLP-0141 preserves the split between constants/predicates and logical
  symbols, the construction of complex sentences, the need for an inductive
  syntax and the three variable/substitution edge cases. Reverse paraphrase:
  a rigorous object language must specify exactly which strings count as
  sentences and define variable-sensitive operations without capture or
  ambiguity.
- OLP-0142 retains the formula-before-sentence strategy, free/bound-variable
  motivation, the simplified vocabulary, all inductive clauses, positive and
  negative examples, and the structural-induction explanation. Reverse
  paraphrase: atomic formulas generate exactly the formulas closed under the
  selected connectives and quantifier, and that inductive construction
  supports proofs about every formula.
- OLP-0143 preserves the three components of the simple structure, recursive
  satisfaction clauses, the concrete domain example, the need for variable
  assignments, assignment variation and existential satisfaction. Reverse
  paraphrase: a structure interprets nonlogical vocabulary, an assignment
  supplies values for variables, and an existential is satisfied when some
  one-variable variant of the assignment satisfies its matrix. OLTEINT-003
  names predicates, rather than constants, as potentially many-place symbols;
  OLTEINT-004 changes the illustrative assignment values from the out-of-domain
  list 1,2,3 to the declared domain values 0,1,2.
- OLP-0144 retains scope, free and bound occurrences, all four simplified
  inductive clauses and the closed-formula definition of sentence. Reverse
  paraphrase: a sentence is precisely a formula with no free variable
  occurrence, so quantifier binding removes the assignment-dependence relevant
  to open formulas.
- OLP-0145 preserves the free-variable dependence lemma, assignment-independent
  satisfaction of sentences, and the definitions of validity, entailment and
  satisfiability. Reverse paraphrase: once satisfaction for sentences is
  independent of assignments, validity quantifies over all structures,
  entailment over all structures satisfying the premises, and satisfiability
  asks for at least one common model.
- OLP-0146 retains universal instantiation, the distinction between naive and
  capture-avoiding substitution, the general inference-rule formulation and
  the substitution/value lemma needed for semantic soundness. Reverse
  paraphrase: deriving an instance from a universal sentence is legitimate
  only after substitution and admissibility are defined precisely and linked
  to changing an assignment by the value of the substituted term. OLTEINT-005
  restores the argument `\Obj v_0` inside the source's opening predicate atom.
- OLP-0147 preserves models and theories, the axiomatic method, the preorder
  example and both formulas for reflexivity/transitivity, followed by the
  expressibility limits concerning domain size. Reverse paraphrase: a theory's
  models are exactly the structures satisfying its axioms; first-order
  sentences can characterize preorders and each fixed finite cardinality, but
  compactness and Lowenheim--Skolem block definitions of finiteness and
  nonenumerability.
- OLP-0148 retains the derivability relation, finite proof objects, the two
  directions defining soundness and completeness, the consistency/model
  equivalence and the compactness and Lowenheim--Skolem consequences. Reverse
  paraphrase: soundness prevents syntactic proofs from exceeding semantic
  consequence, completeness prevents them from falling short, and together
  they identify consistent theories with satisfiable ones while exposing
  first-order expressive limits.

## Source audit and correction adoption

The bounded Telugu-lane audit is OLTEINT-20260906, checked against frozen Open
Logic revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`:

- `REVIEW.md`: SHA-256
  `a4d22f8d75cb4082410ae2659da3d0bf73352ca23c39eda10b3b673ea4c46c80`;
- `FINDINGS.json`: SHA-256
  `9ca52021a6e1ef8dced534346e1fc7d657077a0d2b934dddf7a82b7758ad1709`.

All five findings have adjacent Telugu disclosures and machine correction
records with `applied_qa_pass` status. Their declared mathematical deltas are
limited to repairing three bracket placements, replacing the out-of-domain
example value 3 with 0, and restoring the missing predicate argument. The
predicate/constant category repair changes controlling prose only. No
undeclared mathematical drift is accepted, and frozen English bytes remain
unchanged.

## Canon, terminology and token identity

TE-C005, Telugu Akademi's visually inspected 1986
*తర్కం-శాస్త్రీయ విధానం*, supplies direct formal-logic evidence at TE-P018--
TE-P033 for propositional and predicate logic, connectives, consequence,
derivation, consistency, quantifiers, first-order scope/domain, proposition,
deduction and inference. TE-P031 directly supports `ప్రతిజ్ఞావాక్యం`; TE-P018,
TE-P024 and TE-P029 directly support the repaired propositional-logic,
derivation and first-order predicate-logic register. Exact pages do not license
blanket attestation of later model-theoretic compounds: adjacent OpenLogic
definitions and formulas continue to control those senses.

Across the cumulative OLP-0004--OLP-0148 scope, all 2,060 OpenLogic `!!`
markers in 41 source-key families are preserved as the second argument of
`\tetoken{Telugu surface}{exact source key}`. Reader transforms emit only the
Telugu first argument. The idempotence audit reports zero changed units, zero
unused mappings and zero reader-visible unresolved markers. This is a source
configuration identity contract, not permission to expose English keys as
reader prose.

The evidence-bounded edition form remains one standard formal Telugu edition
in Telugu script (`te-Telu-IN`), preserving Arabic decimal digits, Latin
metavariables, international logic notation and left-to-right mathematics.
Current Andhra Pradesh, Telangana and pre-bifurcation witnesses do not
establish a systematic difference requiring separate regional, script,
orthographic, numeral or register editions. This remains reversible if later
native specialist evidence supports another form.

## Deterministic checks and limits

Correction-aware structural QA passes all 145 current units for blank-block
alignment, environment counts, source-token identity, protected identifiers,
Unicode/NFC constraints and mathematical-form comparison. The synchronized
`BATCH-015-STRUCTURAL-QA.json` is 1,640,194 bytes, SHA-256
`5100b249afce50a66ce41689aede157aadfb6a3ab667eaffef2b664956abe6e5`.
The current segment ledger has 2,343 records across 145 units: 1,467
linguistic and 876 structural, SHA-256
`0d54c45fd5f22d2a4d9099b4d30d0f60a3b40b2747ef19088956ff02a1e795a5`.

The central manager validator independently accepts all 2,343 choice rows with
zero blockers and warnings: 873 formal-invariant, 319 supported, 777
supported-provisional and 374 contentious-human-review. This batch has not yet
been integrated into or visually inspected in a new full reader. No TeX
process was launched. Local editable completion is therefore 145 of 722 units,
not a claim of a complete edition or reader publication.

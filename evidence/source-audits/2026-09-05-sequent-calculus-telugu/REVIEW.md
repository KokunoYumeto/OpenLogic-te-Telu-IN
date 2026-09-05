# Telugu source audit: Open Logic “The Sequent Calculus”

Audit ID: OLTESEQ-20260905

This is a bounded, deterministic audit of OLP-0069--OLP-0083 at frozen
Open Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0.
Authoritative bytes are the unit hashes recorded in SOURCE_MANIFEST.jsonl and
were rehash-verified before review. Findings are controlled by the chapter's
own rule schemata, adjacent displayed derivations, stable identifiers or the
semantic induction case itself. Ordinary English copy-editing is not elevated
into a mathematical finding.

## Confirmed findings

| ID | Unit | Deterministic defect | Required Telugu handling |
|---|---:|---|---|
| OLTESEQ-001 | OLP-0075 | Four steps change only antecedent order but carry the right-exchange label. | Use the left-exchange label on all four steps; retain every sequent; disclose the repeated label repair once. |
| OLTESEQ-002 | OLP-0075 | Both prose candidates drop the negation on the second disjunct, unlike the end-sequent and displayed inferences surrounding them. | Restore the negation on B in both candidates; disclose the repeated formula repair once. |
| OLTESEQ-003 | OLP-0077 | The editorial scope note names natural deduction although the section defines sequent-calculus notions through LK. | Name the sequent calculus; disclose the scope-label repair. |
| OLTESEQ-004 | OLP-0081 | The left-conjunction soundness case finally calls only Gamma entails Delta valid instead of its full lower sequent. | Name A-and-B,Gamma entails Delta; disclose the conclusion repair. |
| OLTESEQ-005 | OLP-0081 | The cut proof uses set difference between Pi and Lambda where it requires the residual sequent. | Restore the sequent symbol; disclose the formula repair. |

## Non-findings and scope limits

The source metadata spelling `seqeunt-calculus`, prose slips such as “if
suffices,” and sentence-level agreement issues are translated naturally but
are not mathematical correction records. The abbreviated right-conjunction
example in OLP-0079 relies on OLP-0077's explicit convention that necessary
weakening, exchange and contraction steps may be tacit; it is therefore not
treated as an invalid derivation. OLP-0078's first proof later states both
finite subsets' inclusions explicitly, so its compressed opening prose is
rendered unambiguously without altering a formula. The compact quantifier
macro spelling in two OLP-0076 tree nodes is retained. Soundness cases left as
exercises are deliberate proof obligations, not omissions in the source.

## Lane rule

Retain the frozen English identity. Apply only each determined repair in the
Telugu body, place a Telugu sourcecorrection note next to it, declare its exact
correction-aware math delta, and require blank-block, environment, token,
protected-identifier, Unicode and mathematical checks across the complete
fifteen-unit batch before counting any unit.

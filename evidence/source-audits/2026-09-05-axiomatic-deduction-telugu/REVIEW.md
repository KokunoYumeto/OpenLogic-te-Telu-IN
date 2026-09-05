# Telugu source audit: Open Logic “Axiomatic Deduction”

Audit ID: OLTEAXD-20260905

This is a bounded, deterministic audit of OLP-0112--OLP-0125 at frozen
Open Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0.
Authoritative bytes are the unit hashes recorded in SOURCE_MANIFEST.jsonl and
were rehash-verified before review. Findings are controlled by the chapter's
own axiom schemata, derivation definition, theorem statement, displayed
formulas, or adjacent proof obligations. Ordinary English copy-editing is not
elevated into a mathematical finding.

## Confirmed findings

| ID | Unit | Deterministic defect | Required Telugu handling |
|---|---:|---|---|
| OLTEAXD-001 | OLP-0118 | The transitivity proof omits the formula-metavariable marker in `B_i = !A`. | Use `!B_i = !A`; disclose the token repair. |
| OLTEAXD-002 | OLP-0119 | The induction basis strands the membership symbol in the malformed phrase “`!B` is either `\in Gamma union {!A}`.” | Write the well-formed membership statement; disclose the repair. |
| OLTEAXD-003 | OLP-0119 | Derived-facts item (a) omits the final parenthesis of its nested conditional. | Balance the formula; disclose the delimiter repair. |
| OLTEAXD-004 | OLP-0120 | The quantified deduction proof omits the final parenthesis of its second meta-conditional. | Balance the formula; disclose the delimiter repair. |
| OLTEAXD-005 | OLP-0120 | The same proof concludes `Gamma proves B` after deriving the theorem's required `Gamma proves A -> B`. | State the theorem's actual conclusion; disclose the repair. |
| OLTEAXD-006 | OLP-0121 | The explicit-inconsistency proof omits `Gamma proves not-A`, needed for its two modus-ponens applications. | Add the reflexivity step; disclose the completion. |
| OLTEAXD-007 | OLP-0122 | The conjunction-projection proof cites `ax:land1` for both projections. | Cite `ax:land2` second; disclose the reference repair. |
| OLTEAXD-008 | OLP-0122 | The disjunction-inconsistency proof attributes `not-A -> (A -> false)` to `ax:lnot1`. | Cite `ax:lnot2`; disclose the reference repair. |
| OLTEAXD-009 | OLP-0123 | Strong generalization invokes the deduction theorem for a step actually requiring the top axiom and modus ponens. | State those two steps; disclose the proof repair. |
| OLTEAXD-010 | OLP-0124 | Three formulas in the quantifier-soundness case omit the `!` formula-metavariable marker before `B`. | Restore all three markers; disclose the repeated repair. |
| OLTEAXD-011 | OLP-0125 | `prop:iden1` claims reflexive identity for any term although `ax:id1` permits only closed terms. | Say “closed term”; disclose the scope repair. |

## Non-findings and scope limits

The spelling “ponsens” is translated naturally but is not promoted to a
mathematical correction. The source comment naming `axiomatic-proofs` is
preserved byte-for-byte because comments are not reader-facing and it does not
alter the imported chapter identity. The quantifier-rule definition's direct
`item` commands are retained because the document class may supply the list
context. The unmanifested `provability.tex` file is neither one of the 722
frozen units nor imported by this chapter and is outside this batch. No source
repair is inferred merely from a preferred proof strategy when the formal
claim and cited rule remain valid.

## Lane rule

Retain the frozen English identity. Apply only each determined repair in the
Telugu body, place a Telugu sourcecorrection note next to it, declare its exact
correction-aware math delta, and require blank-block, environment, token,
protected-identifier, Unicode and mathematical checks across the complete
fourteen-unit batch before counting any unit.

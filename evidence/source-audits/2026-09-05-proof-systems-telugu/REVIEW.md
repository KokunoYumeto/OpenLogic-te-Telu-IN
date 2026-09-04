# Telugu source audit: Open Logic “Proof Systems” survey

Audit ID: OLTEPRF-20260905

This is a bounded, deterministic audit of OLP-0063–OLP-0068 at frozen
Open Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0.
Authoritative bytes are the unit hashes recorded in SOURCE_MANIFEST.jsonl,
rehash-verified before review. Each finding is fixed by the immediately stated
definition, the documented macro contract, or the displayed derivation itself.
Ordinary English copy-editing is not elevated into a mathematical finding.

## Confirmed findings

| ID | Unit | Deterministic defect | Required Telugu handling |
|---|---:|---|---|
| OLTEPRF-001 | OLP-0065 | The displayed general sequent gives both sides the same final index m, even though the next sentence treats them as independent sequences and says either one may be empty. | End the right sequence at B_n, retaining independent lengths; disclose the formula repair. |
| OLTEPRF-002 | OLP-0067 | The false-conjunction tableau rule passes the entire formula A-and-B as the operator argument of `TRule`, contrary to that macro's documented `TRule{Sign}{Op}` contract and every ordinary use. | Pass only the conjunction operator as the second argument; disclose the rule-label repair. |
| OLTEPRF-003 | OLP-0067 | The example expands the true conjunction on line 2 but labels both added nodes with the true-conditional rule. | Label both nodes with the true-conjunction rule, retaining the line reference 2; disclose the derivation-label repair. |
| OLTEPRF-004 | OLP-0067 | The inconsistency definition requires a closed tableau for assumptions B_1 through B_n but states only that “some B_i” belongs to Gamma. One member does not make the displayed finite assumption set a subset of Gamma. | Require every B_i (1 through n) to belong to Gamma; disclose the quantifier repair. |

## Non-findings and scope limits

The misspelled source metadata comment `seqeunt-calculus`, the prose typo
“unsatisfiablity,” and agreement/style infelicities are retained or translated
without being misclassified as mathematical defects. Repeated use of m on both
sides of a particular sequent is legitimate; OLTEPRF-001 applies only to the
purported general form whose adjacent prose explicitly permits independent
empty sides. The example's tableau nodes and formulas are already correct;
OLTEPRF-003 changes only their two rule labels.

## Lane rule

Retain the frozen English identity. Apply only each determined repair in the
Telugu body, place a Telugu sourcecorrection note next to it, declare its exact
correction-aware math delta, and require block, environment, token,
protected-identifier, Unicode, and math checks to pass before counting the
unit.

# Telugu source audit: Open Logic “Tableaux”

Audit ID: OLTETAB-20260905

This is a bounded, deterministic audit of OLP-0098--OLP-0111 at frozen
Open Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0.
Authoritative bytes are the unit hashes recorded in SOURCE_MANIFEST.jsonl and
were rehash-verified before review. Findings are controlled by the chapter's
own signed-formula definition, displayed rule schemata, line-numbered trees,
metatheoretic definitions, or adjacent proofs. Ordinary English copy-editing
is not elevated into a mathematical finding.

## Confirmed findings

| ID | Unit | Deterministic defect | Required Telugu handling |
|---|---:|---|---|
| OLTETAB-001 | OLP-0098 | The Tableaux chapter's `prfTab` editorial note mistakenly calls its subject “natural deduction.” | Name tableaux; disclose the chapter-scope repair. |
| OLTETAB-002 | OLP-0103 | A problem places the comma-separated formulas `A or B` and `not B` inside one true-signed-formula argument. | Split them into two true-signed assumptions; retain false `A`; disclose the arity repair. |
| OLTETAB-003 | OLP-0104 | The final quantified example says the reusable signed formulas are on lines 1 and 3, although line 3 is already checked and the needed false existential is line 4. | Refer to lines 1 and 4; disclose the line repair. |
| OLTETAB-004 | OLP-0105 | The transitivity proof says the individual formulas `D_1, ..., D_m` are a subset of `Gamma`, omitting the braces needed for a set. | Use `{D_1, ..., D_m} subseteq Gamma`; disclose the typing repair. |
| OLTETAB-005 | OLP-0106 | `Gamma_1` is defined with final index `n`, then immediately used with final index `m`; the two finite witnesses need independent sizes. | Define `Gamma_1={C_1,...,C_m}`; disclose the index repair. |
| OLTETAB-006 | OLP-0106 | The explicit-inconsistency proof says true-negation is applied to false `A`, gives the inserted conclusion a wrong fixed line number, and includes a stray TeX backslash. | Apply true-negation to true `not A`, refer to the newly inserted line without a false line number, and remove the stray character; disclose the repair. |
| OLTETAB-007 | OLP-0107 | Eight tree nodes put the formula inside the `True` or `False` argument of `sFmla`, leaving the required formula argument missing. | Restore `sFmla{Sign}{Formula}` at all eight nodes; retain signs, formulas and closures; disclose the repeated repair. |
| OLTETAB-008 | OLP-0109 | The two universal-quantifier soundness cases start with metavariable `B` but derive and reason throughout with `A`. | Use `A` consistently in those two cases; disclose the metavariable repair. |
| OLTETAB-009 | OLP-0110 | The symmetry explanation calls line 3 an instance of true `A(s_2)`, although the shown premise and following substitution make it true `A(s_1)`. | Use `A(s_1)`; disclose the premise-instance repair. |
| OLTETAB-010 | OLP-0110 | The transitivity explanation identifies line 2 as `eq(t_1,t_2)`, but under the stated assignment that generic form is line 3; line 2 is `eq(s_1,s_2)`. | Name the actual line-2 formula; disclose the instance repair. |
| OLTETAB-011 | OLP-0111 | The true-equality soundness case says it adds a signed formula with generic sign `S`, although both its premises and the proof are explicitly the true case. | Use the true sign; leave the false case to the stated analogous argument; disclose the sign repair. |
| OLTETAB-012 | OLP-0108 | The second quantifier-provability example has a dangling comma inside the math span after its two signed assumptions. | Remove only the dangling comma; disclose the punctuation repair. |

## Non-findings and scope limits

The duplicated word in “left left side,” ordinary agreement slips, and comment
typos are translated naturally but are not mathematical correction records.
The historical word “eigenvariable” is retained even though its witness is a
constant because the source explicitly explains that convention. A checkmark
is only a construction aid, as the chapter says, and is not normalized into a
new formal token. Soundness cases left as exercises are deliberate proof
obligations, not omissions in the source. No source repair is inferred merely
from a preferred proof strategy when the displayed tableau remains correct.

## Lane rule

Retain the frozen English identity. Apply only each determined repair in the
Telugu body, place a Telugu sourcecorrection note next to it, declare its exact
correction-aware math delta, and require blank-block, environment, token,
protected-identifier, Unicode and mathematical checks across the complete
fourteen-unit batch before counting any unit.

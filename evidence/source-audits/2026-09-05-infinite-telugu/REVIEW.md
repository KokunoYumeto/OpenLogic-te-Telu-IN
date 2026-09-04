# Telugu source audit: Open Logic “Infinite Sets”

Audit ID: `OLTEINF-20260905`

This is a bounded, deterministic audit of `OLP-0049`–`OLP-0054` at frozen
Open Logic revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`.
Authoritative bytes are the unit hashes recorded in `SOURCE_MANIFEST.jsonl`,
rehash-verified before review. Each finding is fixed by an immediately
controlling definition, type, formula, or proof obligation. Ordinary English
copy-editing is not elevated into a mathematical finding.

## Confirmed findings

| ID | Unit | Deterministic defect | Required Telugu handling |
|---|---:|---|---|
| OLTEINF-001 | OLP-0051 | Condition 3-prime calls the naturals merely the smallest successor-closed set; without the required `0` membership, the empty set is smaller. | Add “containing 0,” as fixed by the repeated-application clause and the closure definition; disclose it. |
| OLTEINF-002 | OLP-0051 | The closure definition ranges over “any function” and the lemma refers to an unbound `A`; `f(x)` and the claimed closed witness need an ambient self-map. | Bind `f:A→A`, `o∈A`, and intersect `f`-closed subsets of `A`; disclose the typing repair. |
| OLTEINF-003 | OLP-0052 | The induction theorem allows arbitrary `X`, but the proof invokes the closure-minimality result directly on `X`, which need not be a subset of `N`. | Apply minimality to `N∩X`, which contains `o` and is `s`-closed; disclose the proof repair. |
| OLTEINF-004 | OLP-0054 | The set-closure definition again leaves the self-map ambient set unbound. | Bind an ambient `U`, with `f:U→U`, `B⊆U`, and `X⊆U`; disclose it. |
| OLTEINF-005 | OLP-0054 | The helper conclusion contains a nested cardinal-equality expression where the sandwich theorem requires `B≈C`. | State `cardeq(B,C)` and disclose the formula repair. |
| OLTEINF-006 | OLP-0054 | The helper proof says it remains to prove `ran(g)=B` but proves only `B⊆ran(g)`. | Add the missing `ran(g)⊆B` argument before the existing converse and disclose it. |

## Non-findings and scope limits

The source's ordinary grammatical slips are translated idiomatically without
finding IDs. Dedekind's two quoted passages remain attributed source excerpts;
the translation does not certify the philosophical argument. No missing
general set-existence axiom is silently supplied: the chapter itself marks
the surrounding set theory as naive and later raises that limitation.

## Lane rule

Retain the frozen English identity. Apply only the determined repair in the
Telugu body, place a Telugu `sourcecorrection` note next to it, declare its
exact correction-aware math delta, and require block, environment, token,
protected-identifier, Unicode, and math checks to pass before counting the
unit.

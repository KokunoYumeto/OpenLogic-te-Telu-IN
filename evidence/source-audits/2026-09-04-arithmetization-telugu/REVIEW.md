# Telugu source audit: Open Logic “Arithmetization”

Audit ID: `OLTEARITH-20260904`

This is a bounded, deterministic source audit of the eight reader units
`OLP-0041`–`OLP-0048` at frozen Open Logic revision
`9620cc73f9c8e0ad003c514a5d3748f29611c4c0`. The authoritative source bytes
are those named by `SOURCE_MANIFEST.jsonl`; their identities were rehashed
before review. The review compares each suspect phrase or symbol with its
immediately controlling definition, formula, or type. It does not use a
current checkout or a translated paraphrase as source authority.

## Confirmed findings

| ID | Unit | Deterministic defect | Telugu handling |
|---|---:|---|---|
| OLTEARITH-001 | OLP-0043 | The order explanation first correctly invokes `s-r`, then reverses it to `r-s`; the displayed definition again uses `s-r`. | Keep `s-r` throughout and disclose the sign-order repair adjacently. |
| OLTEARITH-002 | OLP-0044 | A stray literal `<` follows the element token in the upper-bound paragraph. | Remove only that stray character and disclose the typographical repair. |
| OLTEARITH-003 | OLP-0045 | The positive-cut multiplication formula unions with `0^R`, while the chapter’s rational embedding and later zero-cut notation use `0_R`. | Use `0_Real` in the translated formula and disclose the notation repair. |
| OLTEARITH-004 | OLP-0045 | The completeness proof attributes existence of a member of `S` to having an upper bound, although it follows from the separately stated non-emptiness of `S`. | Attribute the step to non-emptiness and disclose the premise repair. |
| OLTEARITH-005 | OLP-0048 | The prose says that real numbers are identified with equivalence relations; the next sentence and the construction identify them with equivalence classes under the relation. | Say “equivalence classes” and disclose the type repair. |
| OLTEARITH-006 | OLP-0048 | Positivity of a constructed real is compared with `0_Rat`, although the left side is an equivalence class representing a real and the chapter has already embedded rationals as `q_Real`. | Compare with `0_Real` and disclose the sort repair. |
| OLTEARITH-007 | OLP-0048 | The ordered-field theorem and exercise say raw Cauchy sequences form a field, while equality and operations were defined on their equivalence classes. | State both for the equivalence classes and disclose the type repair. |
| OLTEARITH-008 | OLP-0048 | The completeness theorem/proof calls `S` a set of sequences but sometimes orders its members as reals and elsewhere orders their equivalence classes. | State the result for the represented classes, keep `S` as a family of representative sequences in the proof, and make every comparison explicitly class-typed. |

## Non-findings and scope limits

Ordinary English infelicities such as duplicated words are translated
idiomatically but do not receive finding IDs because they neither alter a
formal object nor create a source-versus-target mathematical delta. The
source also leaves some routine field-operation details to the reader; this
audit does not silently invent missing constructions. Commented-out TeX is
kept commented and is not promoted into reader text.

## Lane rule

For every finding, the Telugu file must retain the frozen source identity,
repair only the determined defect in reader-visible content, place a Telugu
`sourcecorrection` note next to the repair, and declare the exact expected
math delta in `SOURCE_CORRECTIONS.jsonl`. Structural, protected-identifier,
token, Unicode, paragraph-alignment, and correction-aware math checks must
all pass before the tranche is counted.

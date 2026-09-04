# Shared source audit: Open Logic “Size of Sets”

Audit ID: `OLSIZ-20260904`

This is a deterministic source audit of ten defects in the frozen Open Logic revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`. The authority bytes are in `OpenLogic-upstream-raw.zip` (SHA-256 `80b484b1a87076fbdb207d69f97930ca946ce1716dbd905906b29e4a74077357`). Each finding was checked against the immediately controlling formula, table, variable scope, or construction. No current checkout and no translated paraphrase was treated as source authority.

## Confirmed findings

| ID | Unit | Deterministic defect | Required handling in every lane |
|---|---:|---|---|
| OLSIZ-001 | OLP-0029 | The table includes `f(7)` and its formula `-ceil(6/2)`, but the value row omits `-3`. | Add `-3`; disclose the repair adjacently and in the machine correction ledger. |
| OLSIZ-002 | OLP-0031 | “complement of a finite set Nat” is malformed. The next equivalence fixes the meaning. | Say “complement in Nat of a finite subset of Nat” or its exact language-equivalent; disclose the repair. |
| OLSIZ-003 | OLP-0032 | Successive pairing families are written `(2,m), (2,m)` although the table proceeds through `(3,m)`. | Change the second family to `(3,m)` and disclose it. |
| OLSIZ-004 | OLP-0034 | `s_k` is used in the primary characteristic-sequence definition with no bound `k`. | Use a bound output name consistently and disclose it. |
| OLSIZ-005 | OLP-0034 | A finite string of `n` zeros is declared to lie in the set of infinite binary sequences. | Supply an actual infinite output, such as `n` zeros followed by infinitely many ones, and disclose it. |
| OLSIZ-006 | OLP-0035 | Two branches use `g(x)=y` before `g` exists; the bijection in scope is `f`. | Use `f(x)=y` in both places and disclose it. |
| OLSIZ-007 | OLP-0036 | The diagonal proof concludes over `x in overline(A)` after choosing arbitrary `x in A`. | Restore the conclusion to every `x in A` and disclose it. |
| OLSIZ-008 | OLP-0039 | The alternate diagonal proof reverses the roles of the indices in `s_n(m)`. | Describe the `m`th digit of the `n`th string, as fixed by the array, and disclose it. |
| OLSIZ-009 | OLP-0039 | The intuitive diagonal instruction says `1→0` twice. | Restore the complementary `0→1` case and disclose it. |
| OLSIZ-010 | OLP-0040 | The alternate characteristic-sequence definition again uses an unbound `s_k`. | Use a bound output name consistently and disclose it. |

## Bengali rotating-control result

The exact public 39-unit Bengali source checkpoint is commit `1ec7fa885f6cf8cd2f01bc07cd051d63f79216ba`. Its bounded archive is `bn-Beng-IN-source39-1ec7fa8.zip` (344,283 bytes; SHA-256 `502142dd917f43747d54bda37cea2beeeb3bd9c337a3379ab5fcd651ebec09db`).

Its provenance machinery is real: all 537 segment rows replayed against exact English and Bengali bytes; all 479 translated segments cite canon; all 27 used canon passages resolve to rehashed original evidence; there were zero hash, range, or locator failures. The source/canon traceability gate therefore passes at this checkpoint.

The semantic source audit is separate. Bengali already repaired and disclosed OLSIZ-006 through OLSIZ-010 under local IDs BN-SRC-001 through BN-SRC-005, except that BN-SRC-005 keeps the defective formula and clarifies its meaning. OLSIZ-001, OLSIZ-003, OLSIZ-004, and OLSIZ-005 remain inherited in the target. OLSIZ-002 is translated with the intended meaning but lacks an adjacent keyed note and machine correction record. Those five items must be repaired and re-receipted before this 39-unit checkpoint can be accepted as source-correction-complete.

This does not invalidate the lane’s 39-unit source coverage or its canon-use replay. It prevents a stronger claim that the checkpoint has completed source-level QA. The released Bengali reader remains the earlier 18-unit release; the 39-unit source checkpoint is not itself a reader release.

## Lane rule

Every lane that reaches these units must compare its target against `FINDINGS.json`, not merely copy another translation. It must preserve the frozen English hash, repair the body, add an adjacent localized note keyed by the shared finding ID, emit a machine-readable correction record, and rerun segment/formula/structure checks. Silent repair is not adequate provenance, and literal inheritance of a deterministic source defect is not source-faithful translation.

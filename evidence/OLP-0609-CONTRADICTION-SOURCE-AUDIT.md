# OLP-0609 — proof-by-contradiction source-error audit

Frozen source: `upstream/content/methods/proofs/proof-by-contradiction.tex`, SHA-256 `3eda384520d99069031c01f168564f639980118e7fd145ca105e8092fbe438dd`. The source is unchanged.

- **OLTEMTHPRFCON-001:** The claim that `p` and `¬¬p` are unconditionally equivalent, and the use of contradiction under `¬p` to establish positive `p`, require classical double-negation elimination. The target names that scope. Refuting a positive claim to prove its negation is not thereby restricted; the qualification applies specifically to the later positive indirect proof. No formula is altered.
- **OLTEMTHPRFCON-002:** In the example for `A⊆A∪B`, the source's existential counterexample says “not in C,” though no `C` belongs to that example. The target writes “not in A∪B,” consistent with the immediately adjacent negated subset claim, and discloses the exact math-atom change.

The target keeps all worked contradiction proofs and the distinction between the hypotheses not under challenge and the temporary negated conclusion. Structural QA does not independently verify formal derivability or page rendering.

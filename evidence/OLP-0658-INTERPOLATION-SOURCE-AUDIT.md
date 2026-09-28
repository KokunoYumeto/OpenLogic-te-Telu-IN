# OLP-0658 — interpolation source-error audit

Frozen source: `upstream/content/proof-theory/cut-elimination/interpolation.tex`, SHA-256 `e2b64e1d701f79c2cb40f57cee8ace532bd2fe6f6f9ec597c0ecbc77fda9104e`. The source is unchanged.

- **OLTEPTCUTITP-001:** The Beth proof invokes undefined `L_1`, `L_2` and states equality of the interpolant language. Maehara's lemma gives inclusion; after abstracting fresh constants, inclusion in the common non-`R` language suffices. The target states and discloses this bound.
- **OLTEPTCUTITP-002:** The Beth conclusion calls the defined predicate `!R` rather than `R`. The target uses `R` and discloses the symbol repair.
- **OLTEPTCUTITP-003:** The sufficient condition for joint consistency allows a complete theory only in a sublanguage of the shared language, but the next paragraph applies completeness to every sentence in the entire shared language. This is false in general. The target requires equality with the shared language and discloses the strengthened hypothesis.
- **OLTEPTCUTITP-004:** The complete-theory argument reverses entailment from an extension to its base and concludes with a non-entailment about the wrong theory. The target uses completeness to rule out the negative alternative via consistency of the first extension, then obtains a contradiction in the second extension. The revised argument is disclosed.
- **OLTEPTCUTITP-005:** The absence of function symbols still permits variable terms. The target separates that harmless case from the constant-symbol case and discloses the source omission.
- **OLTEPTCUTITP-006:** The Beth proof equates the language symbols actually occurring in the primed theory with all symbols of the ambient primed language, without an exhaustive-symbol assumption. The target only defines the ambient language and discloses the distinction.

Maehara's proof cases, display trees, references and theorem structure otherwise remain source-controlled. Structural QA verifies the declared math differences, not every logical step or visual layout.

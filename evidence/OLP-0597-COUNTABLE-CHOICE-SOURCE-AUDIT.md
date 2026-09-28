# OLP-0597 — source-error audit

Frozen source: `upstream/content/set-theory/choice/countablechoice.tex`, SHA-256 `37ed80e497f07f2c96db1a56b8573d90a6d8421e119f0bc7a2865fa2f534b994`. The source is unchanged.

**OLTESTCHOICECOUNT-001:** In the finite-choice proof, the notation `a={b_1,...,b_n}` need not by itself preclude repeated entries. If one repeated set receives different chosen values, the displayed set of pairs is not a function. The target explicitly takes a repetition-free enumeration of the finite set. This is a local clarification; it changes no core mathematics.

**OLTESTCHOICECOUNT-002:** The source's calculation uses `bigcup_{i<n} A_n` with an index `i` that never occurs in the summand. The intended union is of the preceding sets `A_i`, as the right-hand bound and definition of `B_n` confirm. The target changes the displayed union to `bigcup_{i<n} A_i` and discloses the repair. The exact displayed-math atom delta is recorded in the findings JSON.

The two uses of Countable Choice and the historical examples remain as in the frozen source. Structural QA is not an independent historical or full TeX-rendering check.

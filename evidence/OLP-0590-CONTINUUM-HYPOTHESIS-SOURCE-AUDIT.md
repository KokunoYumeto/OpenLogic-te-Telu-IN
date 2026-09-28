# OLP-0590 — source-error audit

Frozen source: `upstream/content/set-theory/card-arithmetic/ch.tex`, SHA-256 `b1bdee185ce2a21eeba54cce52ebec13154b54b77a6652820ad4f7ac61e8b212`. The source is unchanged.

**OLTESTCARDCH-001:** After defining the aleph and beth sequences, the source says that transfinite recursion completes the definition of the fixed cardinal `a`. The target identifies the two sequences as what recursion defines, retaining the intended mathematics and disclosing the prose correction.

**OLTESTCARDCH-002:** The source's proof that every infinite cardinal has an aleph index assumes *every* smaller cardinal already has an aleph index. Finite smaller cardinals do not. The limit-case union similarly indexes finite predecessors by undefined `gamma_b`, and the source does not explain uniqueness. The target states the omega base case, restricts the induction claim and indexed unions to infinite predecessor cardinals, and notes strict growth/limit continuity for uniqueness. Only the two union-formula atoms change; their exact deltas are in the findings JSON.

**OLTESTCARDCH-003:** The GCH-based bound `a <= a^b <= a^+` is stated for `b<a` without excluding zero (or explicitly requiring infinite base). For zero exponent and infinite base, `a^0=1<a`. The target qualifies the discussion to infinite `a` and nonzero `b<a`, with adjacent disclosure. No core-math delta is needed.

These are local source-scope repairs; they do not change the independence claims for CH/GCH. Structural QA does not substitute for an independent proof audit or full TeX rendering.

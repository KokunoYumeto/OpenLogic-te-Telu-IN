# OLP-0527 — source-error audit

Frozen source: `upstream/content/counterfactuals/minimal-change-semantics/transitivity.tex`, SHA-256 `e5b649b07980ba0ec35bc7b18cfa27c1b9bf28553363ab8a10736c3cc182ee0a`. The source is unchanged.

**OLTECNTTRA-001:** In the three-world sphere counterexample, the source prose says `q → r` is true throughout the sphere `{w,w₁}`, which is correct under the supplied `V(q)={w₁,w₂}` and `V(r)={w₁}`. Its accompanying mathematical macro nonetheless says `\mSat/{M}{q \lif r}` (non-satisfaction). The Telugu target replaces it with `\mSat{M}{q \lif r}` and discloses the sign correction immediately. No valuation, sphere, or other formula changes.

The historical example's obvious “would have been be” grammar slip is rendered by the intended conditional phrase without altering its argument. This is a same-agent mathematical audit, not independent historical fact-checking or TeX compilation.

# OLP-0588 — source-error audit

Frozen source: `upstream/content/set-theory/card-arithmetic/simp.tex`, SHA-256 `a606bab065a11c689b655ff8053e3e77894decb42b88e70605a981c129148da0`. The source is unchanged.

**OLTESTCARDSIMP-001:** The proof of `alphatimesalpha` bounds the canonical-order initial segment only when the largest coordinate is infinite, then immediately concludes a bound for every pair. For finite largest coordinate the segment is finite, hence smaller than the infinite cardinal `alpha`; the Telugu proof adds this omitted case in prose and discloses the repair. No core-math or protected-identifier delta is needed.

This closes the local case split; it does not claim an independent re-proof of all surrounding results. Structural QA and full TeX rendering are distinct checks.

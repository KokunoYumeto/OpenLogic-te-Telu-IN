# OLP-0466 — source-error audit

Frozen source: `upstream/content/normal-modal-logic/tableaux/more-soundness.tex`, SHA-256 `8c68f92959ba86967753495c186b9f49a3da00247457511f5527e72e5a9eb936`. The source file is not edited. The Telugu target discloses both interventions in the affected 4r rule cases.

1. **OLTENMLTABMSN-001 (source lines 189–200):** The `4r Box` proof starts from `T Box B` at prefix `\sigma.n` and correctly establishes the edge from `f(\sigma.n)` to each `w` accessible from `f(\sigma)`. Its premise is then cited at `f(\sigma).n`, an ill-formed application of a prefix extension to a world. The target cites the already stated premise at `f(\sigma.n)`. No accessibility or satisfaction direction changes.
2. **OLTENMLTABMSN-002 (source lines 201–212):** The `4r Diamond` proof starts from `F Diamond B` at `\sigma.n`, but says its new conclusion is `T Box B` at `\sigma`. The rule table in the immediately preceding unit and the rest of this proof require `F Diamond B` at `\sigma`. The target restores that conclusion. The same proof repeats `f(\sigma).n` for the modal premise; the target cites `f(\sigma.n)` as in finding 001. The Euclidean edge argument and final negative-Diamond conclusion are retained.

The conditional `probBox` and `probDiamond` exercise branches and the five explicit “complete the proof” problems are retained. This is same-agent textual/mathematical review; no external mathematical referee or visual TeX QA is claimed.

# OLP-0635 — limits source-error audit

Frozen source: `upstream/content/history/set-theory/limits.tex`, SHA-256 `df5d36d65e7abafe7503527229866dfc618527177e567b16ce33ec01c683783d`. The source is unchanged.

- **OLTEHISSETLIM-001:** At fixed `c`, the derivative `f'(c)` is not the beta-varying value. The target identifies the difference quotient as the varying expression approaching that fixed derivative, without changing math atoms.
- **OLTEHISSETLIM-002:** The source's general epsilon-delta formula includes `x=c`. Ordinary limits require a punctured neighborhood; the target adds `0<|x-c|` to the antecedent, the sole core math delta.
- **OLTEHISSETLIM-003:** The absolute-value graph's source x-tick list has unpaired entries and a repeated positive tick. The target supplies four paired ticks at minus two, minus one, one and two, without changing displayed math atoms.

The derivative and continuity examples remain otherwise source-controlled. Bounded structural QA is not a rendered TeX or independent historical audit.

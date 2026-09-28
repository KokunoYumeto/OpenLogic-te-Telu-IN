# OLP-0600 — Vitali source-error audit

Frozen source: `upstream/content/set-theory/choice/vitali.tex`, SHA-256 `e9ae48138df4af723de80b69d70d43e2a77f3cc9c0ec680eded3a333c0892b32`. The upstream source is unchanged.

- **OLTESTCHOICEVITALI-001:** Rational-valued radian angles are not a group modulo a full turn: the sum of two rational radian values can cross a full turn, and subtracting that irrational full-turn value is not rational. The target specifies rational multiples of a full turn at both occurrences. This is a mathematical correction, not a stylistic translation choice.
- **OLTESTCHOICEVITALI-002:** The inverse-angle expression `2π-r` gives the excluded right endpoint at `r=0`. The target separates the identity case and retains the formula otherwise.
- **OLTESTCHOICEVITALI-003:** `R_1` is undefined in the proof of the two-part circle decomposition. The target uses the defined first subset of the rotation group. The exact math-atom delta is in the findings JSON.
- **OLTESTCHOICEVITALI-004:** The assertion about *any* free group incorrectly includes rank one, an infinite cyclic group. The target limits the claim to at least two generators. The source's sphere-action sketch also omits the points fixed by nonidentity rotations. The target identifies that proof gap explicitly; it does not claim to supply the omitted construction. The stated theorem and citations remain source-controlled.
- **OLTESTCHOICEVITALI-005:** In the measure argument, two quantifiers range rotation `ρ` over the point-representative set `C`. Both are corrected to the rotation group. The exact two-for-two math-atom delta is in the findings JSON.

The target preserves the countable-versus-finite partition distinction, the role of Choice, the circle/sphere distinction, and the measure contradiction. Structural QA cannot independently establish the omitted fixed-point construction or the historical theorem.

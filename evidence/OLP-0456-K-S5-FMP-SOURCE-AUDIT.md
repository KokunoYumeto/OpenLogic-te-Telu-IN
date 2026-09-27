# OLP-0456 — frozen-source mathematical audit

- Source: `upstream/content/normal-modal-logic/filtrations/S5-fmp.tex`, revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`, SHA-256 `73dfbf706b0e5593dd2a012581fac25f80499260b6f0ac17001235860f4e356e`.
- Scope: direct reading of the finite-model-property definition, K and S5 proofs, prior quotient-world theorem and referenced universal-frame proposition. Same-agent audit, not independent expert validation.

## OLTENMLFILFMP-001 — quotient world missing brackets in K proof

Source line 27 says that $M^*$ satisfies $!A$ at $w$. But the filtration theorem `thm:filtrations` (OLP-0453) says it satisfies $!A$ at $[w]$, and $W^*$ consists of equivalence classes, not the original worlds. The same source unit correctly writes $[w]$ in its universal-model proof at line 58. The target repairs the single occurrence to $\mSat{M^*}{!A}[{[w]}]$ and discloses that notation correction adjacent to the K proof. No claim about an additional world is introduced.

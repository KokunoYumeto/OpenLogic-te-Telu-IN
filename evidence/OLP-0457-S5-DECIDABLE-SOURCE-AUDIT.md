# OLP-0457 — frozen-source mathematical audit

- Source: `upstream/content/normal-modal-logic/filtrations/S5-decidable.tex`, revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`, SHA-256 `f6f07c518a0df3bdcff427979834a918256085715f1353b5b35cc6dafe75d1b1`.
- Scope: direct inspection of the simultaneous proof/countermodel search, the preceding S5 finite-model-property proof and the referenced determination theorem. Same-agent audit, not independent expert validation.

## OLTENMLFILDEC-001 — countermodel enumeration must respect the S5 class

Source lines 24–28 say to enumerate “all the models” on $1,2,\ldots$ worlds while searching for a world where $!A$ fails. Searching arbitrary finite Kripke models would be unsound for $S5$: a theorem of $S5$ can fail on a non-universal frame. The same proof's line 31 identifies the intended refuting witness as a *finite universal model*, and the immediately preceding `cor:S5fmp` establishes the needed finite universal witness via its proof. The target narrows both count and enumeration to finite universal models and discloses the repair in the proof. This does not change the theorem or the proof-enumeration branch.

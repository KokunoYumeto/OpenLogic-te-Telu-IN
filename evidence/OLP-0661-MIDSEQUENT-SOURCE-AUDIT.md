# OLP-0661 — midsequent and Herbrand source-error audit

Frozen source: `upstream/content/proof-theory/cut-elimination/midsequent.tex`, SHA-256 `e070f69fe844339b3b9b3a4e53468aaf331a24b2596eb36a28f909fa3387aa99`. The source is unchanged.

- **OLTEPTCUTMID-001:** The Herbrand extraction refers to `pi_1-prime`, although the preceding tree labels the subproof `pi_1`. The target uses the defined label and discloses the repair.
- **OLTEPTCUTMID-002:** Order zero permits no quantifier inferences at all; the source assumes a topmost one exists. The target handles the empty case by taking the end sequent as midsequent and discloses it.
- **OLTEPTCUTMID-003:** The existential-right permutation diagram contains `!Gamma-prime` in one sequent, whereas the surrounding context is `Gamma-prime`. The target removes the stray marker and discloses the repair.

Other prenex, order, permutation and Herbrand-disjunction arguments remain source-controlled. The structural audit verifies the two declared symbolic changes; it is not an independent complete proof or visual layout check.

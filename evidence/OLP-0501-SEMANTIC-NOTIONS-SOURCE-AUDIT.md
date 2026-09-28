# OLP-0501 — source-error audit

Frozen source: `upstream/content/intuitionistic-logic/semantics/semantic-notions.tex`, SHA-256 `e181f2cc2add672ac76ae6cf3e011d3242479e1a1ff5f8e0f679eb1eda8f62fb`. The source is unchanged.

**OLTEINTSEMNOT-001 (source lines 33–36):** The proof's first item purports to establish the proposition from local truth of `Γ` at `w`, but starts instead by assuming global truth of `Γ` in the model and then invokes truth at every world. That stronger assumption proves the second item, not the first. The Telugu proof uses precisely the first item's local premise `M ⊨ Γ` at `w`; semantic entailment then yields `A` at `w`. The second item remains an immediate consequence of the first. The omitted global-all-world detour is disclosed beside the corrected proof.

This is a same-agent direct use of the definition of entailment, not a TeX-build confirmation.

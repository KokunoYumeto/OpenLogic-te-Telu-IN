# OLP-0514 — source-error audit

Frozen source: upstream/content/intuitionistic-logic/tableaux/proofs.tex, SHA-256 9745506f871e091339606542e34049c03d2baffd71bd7de389c0d69468846e73. The source is unchanged.

**OLTEINTTABPRF-001 (source lines 32 and 34):** The two branches F A and F B result from applying the false-conjunction rule to the F(A∧B) node, which is line 7 of the displayed tableau. The source cites line 4, the earlier F(B→C) node, in both branch justifications. The Telugu tableau changes only those two rule-source indices to 7 and discloses the repair immediately after the diagram.

The tableau's formulas, prefixes, branch topology and closure marks are otherwise unchanged. This is a same-agent rule-tree audit, not TeX-build confirmation.

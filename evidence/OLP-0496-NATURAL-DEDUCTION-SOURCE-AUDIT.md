# OLP-0496 — source-error audit

Frozen source: `upstream/content/intuitionistic-logic/introduction/natural-deduction.tex`, SHA-256 `3fc69e5ddaa3c9273ab2fa9c4a9e5c7826c3044aa9945152d4f710f8cf62afd3`. The source is unchanged.

**OLTEINTND-001 (source line 59):** The conjunction-elimination explanation calls the pair `\tuple{N_1,N_2}` a construction of `$!A_1 \land !A_1$`, then immediately assigns `N_1` to `$!A_1$` and `N_2` to `$!A_2$`; the preceding introduction explanation also constructs `$!A_1 \land !A_2$`. The Telugu sentence uses `$!A_1 \land !A_2$` and discloses the correction adjacent to it. No inference rule or proof tree changes.

This is a same-agent local consistency check, not a full independent soundness proof or TeX-build confirmation.

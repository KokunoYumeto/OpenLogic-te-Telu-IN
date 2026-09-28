# OLP-0591 — source-error audit

Frozen source: `upstream/content/set-theory/card-arithmetic/fix.tex`, SHA-256 `cc111d7d7472b0e7ef940196977faef0f1b2867feaab0a74843e9d39077f5074`. The source is unchanged.

**OLTESTCARDFIX-001:** The source starts `tau` at `card(A)` and then says `card(A)<tau(A)` trivially. If `card(A)` is already a beth fixed point, every iterate equals the start, so the strict inequality fails. The target starts at the successor cardinal of `card(A)`; iterating beth and taking the omega supremum still yields a beth fixed point, now strictly above the input cardinal. The adjacent disclosure explains the repair.

**OLTESTCARDFIX-002:** The source starts `W` at zero but calls `W` an injection from *all* ordinals into beth fixed points and says the stage-width equality holds for every index. Zero is not a beth fixed point. The target starts `W` at `tau(0)`, a positive beth fixed point, and states the successor-growth and limit-union preservation needed for the all-index claim. It discloses this repair adjacent to the aligned recurrence.

Both recurrence repairs occur in one displayed `align*` math atom; the findings JSON records the combined source/target atom once under OLTESTCARDFIX-001 to avoid double-counting. OLTESTCARDFIX-002 records no additional atom delta. Structural QA cannot itself prove the fixed-point argument or full TeX rendering.

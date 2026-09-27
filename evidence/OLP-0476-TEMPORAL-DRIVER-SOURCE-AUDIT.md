# OLP-0476 — source-error audit

Frozen source: `upstream/content/applied-modal-logic/temporal-logic/temporal-logic.tex`, SHA-256 `002d60bc4f9fd0b84f7d062f1cf8a325563ce8f343c5d070e124e4f05c4115e4`. The source is unchanged.

**OLTEAMLTLDRV-001 (source line 20):** This file declares `\olchapter` but ends with `\OLEndPartHook`. The enclosing applied-modal-logic part uses `\OLEndPartHook`, while normal-modal-logic chapter drivers use `\OLEndChapterHook`; the style defines these as separate hooks. The Telugu chapter driver uses `\OLEndChapterHook`, preserving imports and chapter identity, and discloses the repair immediately before that hook. The same pattern in the separate epistemic-logic chapter driver is outside this unit and not silently changed here.

This is a same-agent source/role comparison, not TeX-build confirmation.

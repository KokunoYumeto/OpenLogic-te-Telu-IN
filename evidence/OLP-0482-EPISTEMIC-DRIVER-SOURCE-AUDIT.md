# OLP-0482 — source-error audit

Frozen source: `upstream/content/applied-modal-logic/epistemic-logic/epistemic-logic.tex`, SHA-256 `12674717c3c51628c4a275e5c34b38b66e2ec1eb7bbffea7bf08629d68489834`. The source is unchanged.

**OLTEAMLELDRV-001 (source line 24):** This file declares `\olchapter` but ends with `\OLEndPartHook`. The enclosing applied-modal-logic part uses the part hook, whereas chapter drivers use `\OLEndChapterHook`; the style defines separate hooks. The Telugu driver uses the chapter hook and discloses this adjacent to the change, preserving all eight imports and the chapter identity. The same pattern in the temporal-logic chapter was audited separately as OLTEAMLTLDRV-001.

This is a same-agent source/role comparison, not TeX-build confirmation.

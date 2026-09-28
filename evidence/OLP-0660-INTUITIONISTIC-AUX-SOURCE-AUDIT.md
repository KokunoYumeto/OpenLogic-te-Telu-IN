# OLP-0660 — auxiliary intuitionistic cut fragment source audit

Frozen source: `upstream/content/proof-theory/cut-elimination/intuitionistic.tex`, SHA-256 `4fc53ce7b95d519d63b400945ad34012779aee9d48404b74cfbfee829a0c9b26`. This is a detached one-block auxiliary fragment without a document wrapper; the English source is unchanged.

- **OLTEPTCUTAUX-001:** The third tree writes `B!` where the surrounding cut formula is `!B`. The target repairs the two-character order and discloses it.
- **OLTEPTCUTAUX-002:** The last rank bound uses undefined `cutr` rather than the chapter's `cutrank`. The target repairs and discloses the macro.
- **OLTEPTCUTAUX-003:** The last two cut-tree conclusions and subsequent copied-context counts are mutually inconsistent under the ordinary `Cut` rule. The target retains those trees and explicitly warns that this fragment has not been repaired into a complete derivation.

The fragment is translated as an auxiliary unit, not represented as a standalone verified proof or reader chapter. Structural QA verifies the two declared symbolic edits; it does not establish validity of the retained proof trees.

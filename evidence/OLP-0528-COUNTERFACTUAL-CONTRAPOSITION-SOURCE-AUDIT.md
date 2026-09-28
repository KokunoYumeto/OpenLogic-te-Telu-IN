# OLP-0528 — source-error audit

Frozen source: `upstream/content/counterfactuals/minimal-change-semantics/contraposition.tex`, SHA-256 `bf3efbdee2ef7ffb044355a15128b37a9632a2c2a3fe3337d38c42644ab9a2bc`. The source is unchanged.

**OLTECNTCPO-001:** The sphere-model definition in OLP-0524 makes `O` a function from worlds to sphere systems, with `O_w` the system around a particular world `w`. The source countermodel instead assigns the three listed spheres directly to `O`, despite also declaring `M₁=⟨W,O,V⟩`. Since this example evaluates only at `w`, the Telugu target makes the local assignment `O_w={...}` and discloses the subscript correction. It does not assert how `O` acts at other worlds.

The Goethe example, valuation, figure commands and counterexample inference remain unchanged. The picture has not been separately rendered; this is same-agent source checking, not a TeX-build confirmation.

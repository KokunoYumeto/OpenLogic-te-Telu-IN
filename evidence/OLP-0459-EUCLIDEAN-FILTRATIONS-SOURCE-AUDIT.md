# OLP-0459 — frozen-source mathematical audit

- Source: `upstream/content/normal-modal-logic/filtrations/euclidean-filtrations.tex`, revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`, SHA-256 `904eebe3b14b5f58fcac9db524e0546c9cdd6f1a07b00f1ef097fba80b0664db`.
- Scope: direct examination of both diagrams, the modal-closure definition, theorem statement and proof order; same-agent audit, not independent expert validation.

## OLTENMLFILEUC-001 — missing self-loop at $w_2$

The first figure (source lines 25–56) calls its model serial and Euclidean, yet $w_2$ has no drawn outgoing edge. Seriality requires one; Euclideanness together with $w_1 R w_2$ also requires $w_2 R w_2$. The second figure inherits the same absent loop at $[w_2]$ despite the filtration R1 condition. The target adds the self-loop in both diagrams and discloses the repair next to the example. The loop preserves the displayed $p$ and $\Box p$ truth labels at $w_2$ and $[w_2]$, since $p$ is true there. The non-Euclidean quotient obstruction (the forbidden edge from $[w_2]$ toward $[w_5]$) remains.

## OLTENMLFILEUC-002 — empty modally closed set is finite

Source lines 88–93 say modally closed sets are infinite. By the source definition in OLP-0452, $\varnothing$ is vacuously subformula- and modally closed, so the universal assertion needs the qualifier “nonempty.” A nonempty modally closed set contains infinitely many iterated Box/Diamond formulas. The target makes that qualification and discloses it adjacent to the claim; the point that such closure does not immediately yield a finite-model bound remains.

## OLTENMLFILEUC-003 — proof items do not match theorem item order

The theorem lists (1) symmetry, (2) transitivity, (3) Euclideanness at source lines 99–103. Its proof at lines 108–125 instead gives (1) the worked transitivity argument, (2) the Euclidean exercise using axiom 5, and (3) the symmetry exercise using axiom B. A reader following item numbers would attach the wrong argument to each claim. The target reorders proof cases to match the theorem: symmetry exercise, transitivity worked proof, Euclidean exercise. The worked mathematical derivation and both exercise prompts are preserved, with an adjacent disclosure. No new proof is asserted for either exercise.

## OLTENMLFILEUC-004 — quotient-edge endpoints lose brackets

Source lines 20–23 correctly describe first adding quotient arrows between $[w_2]$ and $[w_4]$, but call the next forced quotient endpoints $w_2$ and $w_5$. Those are original worlds, not the worlds of the depicted filtration. The target names the second arrows $[w_2]$ and $[w_5]$, while preserving the subsequent original-world truth test $M,w_2\models\Box p$ and $M,w_5\not\models p$. The correction is disclosed beside the discussion.

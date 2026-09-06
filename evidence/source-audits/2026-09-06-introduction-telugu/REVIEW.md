# First-Order Introduction source audit for the Telugu edition

Audit ID: `OLTEINT-20260906`

Scope: the eleven reader-reachable frozen units OLP-0138--OLP-0148 at
OpenLogic revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`.

Authority: the pristine English bytes under `upstream/`, individually checked
against `SOURCE_MANIFEST.jsonl`, the frozen 1,806,644-byte source archive
(SHA-256
`80b484b1a87076fbdb207d69f97930ca946ce1716dbd905906b29e4a74077357`),
and the frozen manifest (SHA-256
`5a6fef5c16c15a5b2f90f874c268512cfd6ed2e846bdfa850a67304a4c05a155`).
No current checkout or translated paraphrase was treated as source authority.

## Findings

1. `OLTEINT-001` — the first ants-and-insects entailment closes the universal
   premise only after the conclusion. The immediately following natural-language
   argument fixes the intended two premises and one conclusion. The Telugu
   formula closes the universal premise before the comma.
2. `OLTEINT-002` — two later derivation examples repeat the same misplaced
   bracket pattern. Their own premise/conclusion descriptions and the correctly
   delimited intervening formulas fix the intended scopes. The Telugu formulas
   move both brackets to the ends of the universal premises.
3. `OLTEINT-003` — the structure overview says constants may have more than one
   place, although the simple example and first-order arity definitions assign
   multiple places to predicates (and functions), not individual constants.
   The Telugu text names predicates.
4. `OLTEINT-004` — the assignment example lists 1, 2, and 3 after declaring the
   domain to be {0,1,2}. The Telugu list is 0, 1, and 2, matching both that
   domain and the continuation's assignment of 0.
5. `OLTEINT-005` — the opening substitution example puts `v_0` outside the
   atom `P`, although its immediate general form is universal instantiation
   from `forall x A(x)` to `A(t)`. The Telugu formula restores `P(v_0)` inside
   the universal scope.

Each finding was checked against its exact frozen source span and immediate
controlling definitions or explanations. The corrections were also compared
as normalized TeX math multisets: the only differences are the five declared
repairs. No unrelated mathematical atom was removed, added, or changed.

The frozen English files are unchanged. Every repair is disclosed by an
adjacent Telugu `\sourcecorrection` note and is to be recorded in the
machine-readable source-correction ledger with exact source and target math
deltas.

This review is a bounded same-agent source audit. It is not human or
independent certification and does not establish adoption, ranking, or
language-policy claims.

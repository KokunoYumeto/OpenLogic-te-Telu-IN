# Size of Sets batch 004: source-aligned semantic review

Scope: `OLP-0027` through `OLP-0032`, six complete files and 106 aligned
blank-line blocks. Same-agent review only; no human language review is
claimed. All six frozen English originals were read in full. Native Telugu
pages TE-P016 and TE-P017 were visually read at full-page resolution before
drafting, alongside the already indexed set, number, pair and function pages.

## Source-aligned checks and reverse paraphrases

- OLP-0027 retains the complete chapter's thirteen imports in exact order,
  including all three alternative sections. The editorial distinction is
  explicit: the elementary route uses lists or surjections from positive
  integers, while the abstract route uses bijections with the naturals or an
  initial segment. Reverse paraphrase: these are labelled alternative
  definitions, not two independent chapters and not interchangeable formulas.
- OLP-0028 retains Cantor's historical motivation, the finite three-versus-two
  comparison and the claim that not all infinite sets have the same size.
  Enumeration is introduced as an infinite list whose every member appears at
  a finite position; the later theorem that some infinite sets cannot be so
  listed is not weakened to mere practical difficulty.
- OLP-0029 keeps the informal and formal definitions separate. Lists must have
  a first position; redundancy and order are allowed; the empty list handles
  the empty set. A nonempty set's formal enumeration is a surjection from
  positive integers. Both directions between lists and functions, the shift
  between positive and natural indices, finite/empty cases, removal of
  repetitions, and the finite-initial-segment versus infinite-domain
  bijection result remain. Reverse paraphrase: enumerability permits repeated
  outputs, but an enumeration without repetitions needs a finite initial
  domain when the set is finite. The displayed integer enumeration now has
  values 0, 1, -1, 2, -2, 3, -3 beneath f(1) through f(7).
- OLP-0030 retains both arrays and the exact diagonal order of pairs. The
  construction sends every natural index to the unique row/column pair at
  that position and extends by treating the enumeration of the square as one
  axis for the cube. Reverse paraphrase: a two-dimensional array is not itself
  a one-dimensional enumeration until the finite-position traversal is given.
  The statements for natural powers, positive-integer powers and finite
  strings are unchanged.
- OLP-0031 retains the inverse zig-zag formula and its value at (1,2), while
  correcting the prose to the sum through k, which is k(k+1)/2. A pairing
  function remains an injection into the naturals; encoding and decoding are
  kept distinct. Every exercise on rationals, finite subsets, cofinite sets,
  countable unions, truth functions and triples remains. Reverse paraphrase:
  the inverse of an arbitrary injective pairing function is a bijection only
  on its range; it is an enumeration with all naturals as domain only when the
  pairing function is also onto the naturals.
- OLP-0032 retains the alternate placement algorithm, all four arrays and the
  factorization formula `2^n(2m+1)-1`. The first-coordinate families advance
  through `(0,m)`, `(1,m)`, `(2,m)`, `(3,m)`. Unique factorization makes the
  displayed `h` a pairing function; `j(n,m)=2^n3^m` remains injective without
  a surjectivity claim, so its inverse is only partial on the naturals.

## Source corrections and audit adoption

The manager-owned shared audit `OLSIZ-20260904` is adopted from exact files:

- `REVIEW.md`: SHA-256
  `26913176baacbda5ae8a47bcc82ccf0366b0763313e6eeeb45df59e64249a1f9`;
- `FINDINGS.json`: 12,592 bytes, SHA-256
  `9b6e836c8432eb75d331913983603796d6557da6ec3ad71b846b2a248374cd07`.

Three shared findings fall in this batch and are applied with adjacent Telugu
notes and machine records: OLSIZ-001 adds the omitted -3 below f(7);
OLSIZ-002 makes the cofinite definition say complement in the naturals of a
finite subset; OLSIZ-003 changes the duplicated `(2,m)` family to `(3,m)`.

The same-agent Telugu supplement `OLTESIZ-20260904` records four additional
deterministic repairs. Its `REVIEW.md` hash is
`f1ee573732445735a841dd79df1f402e0cf46a44ab38a1cdf1df2e6cd63ef405`;
its `FINDINGS.json` hash is
`e060de0fd61aa2af1917e59e895464377d90f82d8294a32f6d16e25f9b213e0d`.
They repair “difference/different,” the triangular-number bound, the domain of
an arbitrary pairing inverse, and the mistyped second pair `(0,2)`/`(0,1)`.
The frozen English bytes are never edited.

## Deterministic checks and limits

All six units pass exact blank-block alignment, environment counts, source
token counts, protected identifiers/options/imports/references and formula
multiset checks. The seven correction deltas are declared exactly and their
notes are removed before core-body comparison. `BATCH-004-STRUCTURAL-QA.json`
has SHA-256 `9b1d9e14056d02c482b6cc2db66a2c7c62bc6017cf94f6b0fbdbaf64b498e4c3`.
The segment ledger records 106 segments: 65 translated linguistic segments
and 41 preserved structural/metadata segments. Every linguistic segment has
resolved canon-page links; this linkage records consultation, not false
attestation of every advanced term.

No replacement characters or unpaired surrogates were found. English words
left visible are source-token identifiers, TeX commands, stable metadata, or
the cited English title “Open Set Theory,” not untranslated reader prose.
This batch has not yet been integrated into or visually checked in the HTML or
PDF reader, and it is only a six-unit advance within the 722-unit objective.

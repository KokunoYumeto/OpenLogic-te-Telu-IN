# Functions batch: source-aligned semantic review

Scope: OLP-0020 through OLP-0026, all seven files and 125 aligned blocks.
Same-agent review only; no independent or human review claimed. All seven
English originals were read directly, all translated blocks drafted and
rechecked, and native pages were actually visually consulted before drafting.

## Source-aligned checks and reverse paraphrases

- OLP-0020: exact driver/import order, the commented isomorphic-functions
  import and chapter hook retained; only visible chapter title translated.
- OLP-0021: a function pairs every input with exactly one output, independent
  of computation method. Domain, codomain and range remain three distinct
  notions. Multiplication's pair input, grade/parent examples, successor
  range, equal mappings with different defining formulas and exhaustive,
  exclusive piecewise cases are retained. Reverse paraphrase: equal formulas
  are not required for equal functions; equal values on common domain with
  common codomain are. The successor misses zero in its range although its
  codomain contains zero.
- OLP-0022: surjection is at least one preimage for each codomain element;
  injection is at most one. Restricting the codomain to the range gives a
  surjection without changing values. All four examples retain the exact
  injective/surjective classification and the three diagram captions remain.
  Bijection combines both properties. Reverse paraphrase: every codomain
  element has exactly one preimage in a bijection.
- OLP-0023: graph is the pair relation f(x)=y. The two numbered conditions
  separately require single-valuedness and totality. The proof, both
  conditional-reference branches and the philosophical caveat are translated.
  Identifying function with graph is presented as a convenient treatment,
  not metaphysical identity. Restriction changes the domain, whereas image
  is a set of output values; range is image of the entire domain.
- OLP-0024: two-sided, left and right inverses keep their direction:
  g(f(x))=x versus f(h(y))=y. Domain/codomain caveat, construction by cases,
  all exercises, the full Axiom of Choice footnote and both alternatives of
  its cross-reference are retained. Reverse paraphrase: a surjection permits
  choosing one preimage for each codomain point, potentially using Choice;
  in the bijective case every preimage is unique and no choice is involved.
  At-most-one inverse, equality of left/right inverses when both exist and
  the range-restricted inverse convention remain distinct claims.
- OLP-0025: composition means first f, then g; comp{f}{g} is g composed with f.
  Range/domain compatibility, diagram caption, 2(x+1) example and all three
  exercises are retained. Reverse paraphrase: the graph of this composition
  is the source's relative product R_f | R_g, not its reversed product.
- OLP-0026: a partial function assigns at most one value; its actual domain is
  the subset where defined, not necessarily the displayed source set A.
  The 1/x example, partial inverse exercise, graph, seriality and proof
  remain. Reverse paraphrase: single-valued relations yield partial functions;
  adding seriality over A makes the function total.

## Inherited source issues, not silently repaired

1. Basics calls the selected square root positive despite Nat containing
   zero; at zero the principal root is zero, not positive. The source wording
   and formula are preserved. A separately labelled reader note is warranted.
2. The g example introduces n then describes successors of x. Both symbols
   remain exactly as in the frozen source; no silent variable normalization.
3. The graph discussion says relation on A times B while the definition is
   a subset of A times B (a relation between A and B). Definition is clear;
   the imprecise surrounding source wording is retained.
4. The left-inverse proposition omits the nonempty-domain hypothesis used by
   its proof when it chooses a in A. Counterexample: the empty injection
   from emptyset to a nonempty B admits no map B to emptyset. If both are
   empty, the empty map is its own inverse. Faithful translation retains
   the statement/proof; a separate editorial erratum must accompany its
   eventual reader integration. This is not a claim that the proposition
   is correct without qualification.
5. The later prose invokes the bijection proposition for a unique inverse
   before the uniqueness result appears. Preserve the source ordering.
6. Native TE-C004 page308 states range is a subset of codomain and then gives
   an apparent equality slip. Only the Telugu labels/definitional distinction
   are used, not that formula. Page319 also has a malformed later example.
   Canon mathematics never overrides OpenLogic.

## Deterministic checks and limits

All seven pass exact blank-block alignment, environment counts, original
text-token identities, protected identifiers/options/import/asset/citation
parity and mathematical-form multiset parity. Initial failures were explicit
f/y mentions translated as pronouns; original symbols were restored at the
same semantic places rather than weakening the check.

Source text inside math was manually reviewed as above; masking that text in
the structural checker is not semantic proof. Source-only Exercise proofs
remain translated as exercise instructions, not falsely counted as missing
proofs or translator placeholders. English code/path/ID comments are stable
metadata, not untranslated reader prose.

Functions has not yet been integrated into or visually verified in the
reader. No PDF or whole-edition completion is claimed by this batch record.

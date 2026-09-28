# Full-reader language corrections for v1.0.1

The first public 722-unit release, v1.0.0, passed the then-current long-prose
triage but still displayed short English connectives in two Telugu units.
It remains an immutable historical release. The corrected v1.0.1 is the edition
to read and cite. This erratum does not assert independent expert review.

| Unit and source path | Corrected target block | Correction |
| --- | --- | --- |
| OLP-0052, `content/sets-functions-relations/infinite/dedekind-induction.tex` | B006 | The displayed induction condition now uses Telugu `మరియు` and `అయితే` instead of `if`, `and`, `{then}`. |
| OLP-0052, same path | B010 | The corollary's displayed formula condition now uses Telugu `మరియు` and `అయితే` instead of the same English connectives. |
| OLP-0469, `content/normal-modal-logic/tableaux/countermodels.tex` | B006 | Both conditional conjunction branches between tableau rules now use Telugu `మరియు` instead of `and`. |

The source formulas, identifiers, labels, citations, and the TeX conditional
structure remain unchanged. The existing inspected-canon evidence and its
stated limitations for these segments are preserved; target file and segment
hashes are refreshed against the corrected bytes. All 722 source/target units
still pass exact structural parity.

The reader parser also now consumes TeX's optional vertical skip following a
line break, for example `\\[2ex]`, instead of printing `[2ex]` as prose. The
full-language triage now flags short English logical connectives and leaked
line-break dimensions in addition to longer Latin-only passages. It examines
the Telugu face of every reader unit while excluding formulas, source-English
disclosures, citations and code where appropriate. Passing this heuristic
still does not prove every semantic choice correct.

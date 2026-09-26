# Telugu source audit: multiple designation

Audit ID: OLTEMVLMUL-20260926. Frozen OpenLogic revision
9620cc73f9c8e0ad003c514a5d3748f29611c4c0.
OLP-0397 is 8,320 bytes, SHA-256
4345be8f1da0718c7667fcae18709d7e2688c5e576f07e3e043f36e7eb99216f.
The English source remains unchanged.

The LP and Hallden matrix definitions both call their language standard
L_0 but omit the previously defined falsity constant and its truth
function. Their four listed connectives are inherited respectively
from strong and weak Kleene logic, whose no-tautology proof in OLP-0395
requires a variable-generated four-connective fragment. The Telugu
definitions make that shared fragment explicit. Hallden additionally
has its printed unary plus connective. These scope decisions are
OLTEMVLMUL-001 and OLTEMVLMUL-002.

The LP proposition and the later statement that both systems have the
same tautologies as classical logic must be read in the common
four-connective language. Classical L_0 also has a falsity constant,
and Hallden has an extra plus connective. The source proof and
exercises compare formulas in the common fragment, not literally all
formulas from different languages. OLTEMVLMUL-003 and
OLTEMVLMUL-006 qualify these claims without changing the theorem in
its intended shared language.

The LP proof defines v-prime by mapping both True and Undef to True.
Its induction base nevertheless claims that a variable has equal
values under v and v-prime for every assignment. That fails when the
original value is Undef. OLTEMVLMUL-004 replaces the false equality
with the two correct assignment equations and verifies only the
required False-preservation and True-preservation implications.

In the conjunction case, the source repeats the B subformula in the
second disjunct of the False case and in the second conjunct of the
True case. Strong Kleene conjunction and the following induction
conclusions require C in those positions. OLTEMVLMUL-005 repairs both
occurrences, with adjacent disclosure. No truth-table entries, source
identifiers, exercises or English files are silently altered.

This is a bounded translation source audit, not independent human
review. The Gödel/R-Mingle designated-value argument remains an
exercise in the source and is not presented here as a newly proved
result.

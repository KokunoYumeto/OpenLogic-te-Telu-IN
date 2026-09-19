# Recursive-functions source audit for the Telugu edition

Audit ID: `OLTECMPREC-20260919`.

Scope: the four correction-bearing frozen units OLP-0211--OLP-0213 and
OLP-0216 at
OpenLogic revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`.

The pristine English files under `upstream/` and the frozen source manifest
are authoritative. This is a bounded same-agent source and translation
review, not an independent certification. Full source reading found six
local defects. The Telugu target restores the forward dependency in the
primitive-recursion motivation, uses the declared n arguments of the
composed function, gives the section its primitive-recursive-function sense,
and makes the stage construction cumulative so it actually yields the class
closed under composition and primitive recursion. It also restores the
projection's n arity in its naming sentence and uses the required constant-2
function in the doubling example. Every repair is disclosed next to the
affected passage and recorded in the correction ledger; no upstream byte is
changed.

All nine Batch 025 source and target units were read in full, including the
chapter wrappers, definitions, examples, equations, exercises, labels,
references, and protected token identities. The consulted native witnesses
support the edition's established Telugu register for natural numbers,
functions, sets, proof, induction, and formal logic. The function witness
directly supports `సంయుక్త ప్రమేయం` for a composite function. The witnesses
do not directly attest primitive recursion, primitive recursive functions,
computability, projection functions, or arity. Those specialized senses
therefore remain definition- and formula-controlled, with `అరిటీ` disclosed
parenthetically rather than represented as canon-attested terminology.

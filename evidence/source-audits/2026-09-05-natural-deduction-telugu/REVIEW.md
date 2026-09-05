# Telugu source audit: Open Logic “Natural Deduction”

Audit ID: OLTEND-20260905

This is a bounded, deterministic audit of OLP-0084--OLP-0097 at frozen
Open Logic revision 9620cc73f9c8e0ad003c514a5d3748f29611c4c0.
Authoritative bytes are the unit hashes recorded in SOURCE_MANIFEST.jsonl and
were rehash-verified before review. Findings are controlled by the chapter's
own sentence-tree definition, defined rule schemata, adjacent completed
derivations or the two tag-rendered branches. Ordinary English copy-editing is
not elevated into a mathematical finding.

## Confirmed findings

| ID | Unit | Deterministic defect | Required Telugu handling |
|---|---:|---|---|
| OLTEND-001 | OLP-0085 | A natural-deduction sentence is said to stand below one, two or three “sequents,” although the paragraph defines a tree whose nodes and rule premises are sentences. | Say “sentences”; disclose the node-type repair. |
| OLTEND-002 | OLP-0089 | An intermediate contradiction step from not-A and A is labelled as false-introduction, a rule not defined here; the adjacent prose and later completed tree use negation-elimination. | Use negation-elimination; retain the entire tree; disclose the label repair. |
| OLTEND-003 | OLP-0089 | The principal connective is said to occur in a sentence “in the end-sequent,” although natural deduction has a conclusion sentence and no sequent object. | Say “the sentence in the conclusion”; disclose the system-specific terminology repair. |
| OLTEND-004 | OLP-0095 | A “structure” token sits outside an FOL/propositional tag whose second branch supplies a valuation symbol, so the propositional rendering says “a structure v.” | Put structure in the FOL branch and native valuation wording in the propositional branch; disclose the branch repair. |

## Non-findings and scope limits

The missing “of” in one editorial sentence, ordinary agreement slips and
comment typos are translated naturally but are not mathematical correction
records. The compact `\Elim{\exists}` and `\Elim{\forall}` spellings are
retained because their rendered operator is unambiguous in context. The
duplicate-looking `\RightLabel{\FalseCl}` followed by
`\DischargeRule{\FalseCl}{1}` is retained rather than altered without a build
or macro-level basis. Soundness cases left as exercises are deliberate proof
obligations, not omissions in the source.

## Lane rule

Retain the frozen English identity. Apply only each determined repair in the
Telugu body, place a Telugu sourcecorrection note next to it, declare its exact
correction-aware math delta, and require blank-block, environment, token,
protected-identifier, Unicode and mathematical checks across the complete
fourteen-unit batch before counting any unit.

# OLP-0688 — proof terms source audit

Three local defects are disclosed: the conjunction constructor uses lowercase m instead of the declared premise M; the disjunction constructor omits its premise argument N; the inductive injection clause uses an undeclared !M instead of the declared N. The target repairs only these displayed terms. The surrounding discharge/binding account and correct-term distinction are retained.

# OLP-0691 — typed reduction source audit

Four repairs are disclosed: pair macro arity, injection macro signature, the injection's annotation for the other summand, and a repeated reduction-sequence index. The frozen rules-tN2 and rules-tN3 explicitly annotate injections by the unchosen summand, so the case reduction uses A_(3-i), not A_i. Gather/multline diagrams were compared directly in addition to parser QA; the current parser does not report that gather-environment annotation delta. No proof claim is expanded.

# OLP-0694 — sequent natural deduction source audit

Two source repairs are required. The opening conjunction-elimination explanation repeats A where the immediately following rule diagrams use A and B. The final double-negated-excluded-middle derivation contains stray opening parentheses in contexts and a stray implication symbol after B. With B abbreviating the negation of excluded middle, the corrected derivation assumes B, derives negation of A from an assumed A, introduces the right disjunct, derives falsity using B, then discharges B. All other rules are retained.

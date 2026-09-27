# OLP-0454 — frozen-source mathematical audit

- Source: `upstream/content/normal-modal-logic/filtrations/examples-of-filtrations.tex`, revision `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`, SHA-256 `8a20bbfcc005772b9166800bca81278de3b28c4b47f51d01dc07f69777c8a484`.
- Scope: direct inspection of the finest/coarsest definitions, both examples, formulas, diagrams and branches before translating; same-agent audit, not independent mathematical validation.

## OLTENMLFILEXF-001 — exercise valuation not a subset of the world set

Source lines 170–175 define $W=\{0\sigma:\sigma\in\Bin^*\}$, but $V(p)=\{\sigma0:\sigma\in\Bin^*\}$ and $V(q)=\{\sigma1:\sigma\in\Bin^*\setminus\{1\}\}$ are not guaranteed to be subsets of $W$. For example, the latter set can contain binary strings beginning with $1$ although no such string is a world; the former can too. A Kripke valuation must map variables to subsets of $W$ (and the pictured labels concern only worlds in $W$). The minimally scoped repair is to intersect both displayed valuation sets with $W$, retaining the source's $\{1\}$ exclusion even though it has no effect on the resulting $W$-restricted $q$ set. The translated problem will disclose the repair next to the model definition. This changes no edge relation or pictured truth assignment.

In the first example, $[1]\notin V^*(p)$ is justified by the fact that *every* member of $[1]$ is odd, not by the single instance $1\notin V(p)$ alone; the translation makes that inferential context explicit without altering a formula. No formulas outside the two recorded valuation repairs are changed.

## OLTENMLFILEXF-002 — first example valuation includes zero

Source lines 101–106 take $W=\PosInt$ and $V(p)=\{2n:n\in\Nat\}$. This OpenLogic revision explicitly defines $\Nat=\{0,1,2,\ldots\}$ in `upstream/content/sets-functions-relations/sets/important-sets.tex` line 17 (SHA-256 `ec2115fa48ea6c6684a65bdf2f504102ca0a74b40cf88293dfc12f4ab97ada02`). Hence $0\in V(p)$ but $0\notin W$, so this too fails to give a valuation into subsets of the world set. The target intersects $V(p)$ with $W$ and discloses this beside the example. All pictured positive even worlds retain $p$, and all pictured positive odd worlds lack it.

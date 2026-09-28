# OLP-0589 — source-error audit

Frozen source: `upstream/content/set-theory/card-arithmetic/expotough.tex`, SHA-256 `3c24595966608c406bd3b8f2eec62edc0476017588fee15ec14ba64798b208ec`. The source is unchanged.

**OLTESTCARDEXPO-001:** The source maps a function on a disjoint sum to `f_b × f_c` but names a Cartesian product of function sets as codomain. Its elements are ordered pairs of functions, not products of functions. The target writes `(f_b, f_c)` and discloses the change.

**OLTESTCARDEXPO-002:** The source constructs `f*` on the Cartesian product `b × c`, then claims it directly belongs to the function set whose domain is the cardinal product `b cardtimes c`. Those domains have equal cardinality but are not literally the same set. The target gives the direct bijection into functions on `b × c`, then uses the cardinality of that product to obtain the proposition, with adjacent disclosure.

**OLTESTCARDEXPO-003:** The source claims `a^n = a` for every natural `n` when `a` is infinite. At `n=0`, `a^0=1`, so the target restricts the proposition to nonzero finite exponents and discloses the exception. Its displayed repeated-product proof then has its intended domain.

The two changed core-math atoms are recorded exactly in the findings JSON. The zero-exponent repair is prose-only. Strict structural QA remains separate from semantic and full TeX rendering checks.

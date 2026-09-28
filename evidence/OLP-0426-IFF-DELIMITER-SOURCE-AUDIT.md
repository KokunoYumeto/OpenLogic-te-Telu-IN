# OLP-0426 — tagged biconditional delimiter audit

The frozen English `prvIff` branch closes the third `\indcase` argument before the inline mathematics closes. That places the closing `$` outside the argument, leaving the branch's TeX grouping malformed. The preceding `prvIf` and following `prvBox` branches put both math delimiters inside the third argument. The Telugu target moves only the closing `$` inside that argument and discloses the repair; the standard-translation identity and immutable English source are unchanged.

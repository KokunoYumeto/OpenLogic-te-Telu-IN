# Start here: Telugu translation decisions

Status: **partial — 122 of 722 source units drafted**. The canonical register currently contains **113 decisions** (40 terminology/sense decisions and 73 source-correction decisions) with **213 concrete occurrences**.

Use these views:

- [Full readable register](TRANSLATION_DECISIONS_FULL.md)
- [Priority review](PRIORITY_REVIEW.md)
- [Per-occurrence CSV](DECISION_OCCURRENCES.csv)
- [Canonical machine register](DECISIONS.json)
- [Canonical JSON Schema](translation-decision.schema.json)
- [Deterministic validation record](TRANSLATION_DECISION_QA.json)

The edition recommendation is one standard formal Telugu edition in Telugu script: **te-Telu-IN / Telu**. It preserves Arabic decimal digits, Latin metavariables, logic notation, and left-to-right mathematics. The evidence spans Telangana, Andhra Pradesh, and pre-bifurcation witnesses but is not an exhaustive regional survey; it does not currently justify a second Roman-script, AP/TS-split, Telugu-digit, or colloquial edition. This recommendation is reversible if later specialist evidence warrants a separate form.

No inspected source establishes a current Top 10 language ranking or a quantified adoption effect. Census, PISA, catalogue, and token-size evidence must not be presented as ranking evidence. Any future script, notation, pronunciation, or accessibility companion must be separately authored or deterministically generated and separately manifested; it neither replaces nor delays the faithful Telugu translation.

Every judgment-dependent item records its source-controlled sense, chosen rendering or treatment, rationale, checked authority, alternatives, confidence, provisional status, and a plain “Please double-check” question. Every occurrence binds a unit and semantic-unit identifier to source and target files, lines, byte spans, and SHA-256 hashes. Reader/PDF pages are explicitly pending until coherent-reader pagination exists; no page is guessed. Optional expert review remains useful and creates no translation hold.

The older `EXPERT_REVIEW_*` files remain as compatibility views. The canonical schema is copied byte-for-byte from OpenLogic-translations commit `811091d54be4989918864732073279a588340e6f`; its expected SHA-256 is `50e7fa407b62c711f92f8b93be591d3b4a6e1c4adb1386c398bb5f76844d9f90`.

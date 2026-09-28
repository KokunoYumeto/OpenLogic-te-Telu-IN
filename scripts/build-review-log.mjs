import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const dataArg=process.argv.find(a=>a.startsWith('--data-dir='));
if(process.argv.some(a=>a.startsWith('--')&&!a.startsWith('--data-dir=')))throw new Error('Unknown option');
const dataDir=dataArg?path.resolve(dataArg.slice(11)):path.join(root,'evidence');
const jsonl=name=>fs.readFileSync(path.join(dataDir,name),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const terms=jsonl('TERM_DECISIONS.jsonl'),passages=Object.fromEntries(jsonl('CANON_PASSAGES.jsonl').map(x=>[x.passage_id,x]));
const corrections=jsonl('SOURCE_CORRECTIONS.jsonl').filter(c=>c.status.startsWith('applied')||c.status==='source_proof_gap_disclosed_structural_qa_pass'),ledger=jsonl('SEGMENT_CANON_USE.jsonl');
const sourceManifest=jsonl('SOURCE_MANIFEST.jsonl');
const sourceUnitTotal=sourceManifest.length;
const draftedSourceUnits=sourceManifest.filter(item=>fs.existsSync(path.join(root,'translation',...item.source_path.replaceAll('\\','/').split('/')))).length;
const L=(path,source_start,source_end,target_start,target_end,source_needle,target_needle)=>({path,source_start,source_end,target_start,target_end,source_needle,target_needle});
const locations={
 'TE-T001':[L('content/sets-functions-relations/sets/basics.tex',12,14,12,16,'\\emph{set}','సమితి')],
 'TE-T002':[L('content/sets-functions-relations/sets/basics.tex',13,14,14,16,'elements','మూలకాలు')],
 'TE-T003':[L('content/sets-functions-relations/sets/basics.tex',10,10,10,10,'Extensionality','మూలకాధారిత సమానత్వం')],
 'TE-T004':[L('content/sets-functions-relations/sets/subsets.tex',24,24,25,25,'proper subset','నిజ ఉపసమితి')],
 'TE-T005':[L('content/sets-functions-relations/sets/subsets.tex',75,77,78,80,'Power Set','ఘాత సమితి')],
 'TE-T006':[L('content/sets-functions-relations/sets/russells-paradox.tex',56,56,59,59,'this proof','ఈ నిరూపణ')],
 'TE-T007':[L('content/sets-functions-relations/relations/trees.tex',13,20,12,19,'logic','తర్కశాస్త్ర')],
 'TE-T008':[L('content/sets-functions-relations/sets/important-sets.tex',18,18,17,17,'natural numbers','సహజ సంఖ్యల'),L('content/sets-functions-relations/sets/important-sets.tex',20,20,19,19,'integers','పూర్ణ సంఖ్యల'),L('content/sets-functions-relations/sets/important-sets.tex',40,42,41,42,'positive integers','ధన పూర్ణ సంఖ్యల')],
 'TE-T009':[L('content/sets-functions-relations/sets/unions-and-intersections.tex',34,36,35,37,'Union','సమ్మేళనం'),L('content/sets-functions-relations/sets/unions-and-intersections.tex',71,73,74,76,'Intersection','ఛేదనం'),L('content/sets-functions-relations/sets/unions-and-intersections.tex',77,78,80,80,'disjoint','వియుక్త'),L('content/sets-functions-relations/sets/unions-and-intersections.tex',162,164,165,167,'Difference','భేదం')],
 'TE-T010':[L('content/sets-functions-relations/sets/important-sets.tex',22,24,21,23,'rationals','కరణీయ సంఖ్యల'),L('content/sets-functions-relations/sets/important-sets.tex',24,24,23,23,'real numbers','వాస్తవ సంఖ్యల')],
 'TE-T011':[L('content/sets-functions-relations/sets/important-sets.tex',46,50,46,51,'Strings','సంకేతమాలలు'),L('content/sets-functions-relations/sets/important-sets.tex',62,65,63,66,'Infinite sequences','అనంత క్రమాలు')],
 'TE-T012':[L('content/sets-functions-relations/sets/pairs-and-products.tex',14,17,14,17,'ordered','క్రమిత జత'),L('content/sets-functions-relations/sets/pairs-and-products.tex',47,49,48,51,'ordered $n$-tuples','క్రమిత $n$-బహుళకాలు'),L('content/sets-functions-relations/sets/pairs-and-products.tex',52,54,55,57,'Cartesian product','కార్టీజియన్ లబ్ధం')],
 'TE-T013':[L('content/sets-functions-relations/sets/russells-paradox.tex',21,25,22,26,'comprehension','ధర్మసంగ్రహం'),L('content/sets-functions-relations/sets/russells-paradox.tex',24,25,25,26,"Russell's",'రసెల్ వైరుధ్యం'),L('content/sets-functions-relations/sets/russells-paradox.tex',76,76,82,82,'axioms','స్వీకృతాలను')],
 'TE-T014':[L('content/sets-functions-relations/sets/basics.tex',75,79,78,83,'perfect','పరిపూర్ణ'),L('content/sets-functions-relations/sets/basics.tex',76,78,78,82,'proper divisors','నిజ భాజకాల')],
 'TE-T015':[L('content/sets-functions-relations/relations/relations-as-sets.tex',55,58,54,58,'Binary relation','ద్విస్థానిక సంబంధం'),L('content/sets-functions-relations/functions/function-basics.tex',29,39,29,39,'function','ప్రమేయం'),L('content/sets-functions-relations/functions/inverses.tex',28,30,29,31,'inverse','విలోమం'),L('content/sets-functions-relations/functions/composition.tex',41,42,40,42,'composition','సంయుక్తం')],
 'TE-T016':[L('content/sets-functions-relations/relations/special-properties.tex',23,25,23,25,'Reflexivity','స్వావర్తనత్వం'),L('content/sets-functions-relations/relations/special-properties.tex',28,30,28,31,'Transitivity','సంక్రామకత్వం'),L('content/sets-functions-relations/relations/special-properties.tex',33,35,34,37,'Symmetry','సౌష్ఠవం'),L('content/sets-functions-relations/relations/special-properties.tex',38,41,40,44,'Anti-symmetry','ప్రతిసౌష్ఠవం'),L('content/sets-functions-relations/relations/special-properties.tex',57,59,59,62,'Connectivity','సంయుక్తత్వం'),L('content/sets-functions-relations/relations/special-properties.tex',69,71,74,76,'Irreflexivity','అస్వావర్తనత్వం'),L('content/sets-functions-relations/relations/special-properties.tex',74,77,79,81,'asymmetric','ఏకదిశ')],
 'TE-T017':[L('content/sets-functions-relations/relations/equivalence-relations.tex',16,20,16,20,'Equivalence relation','తుల్యతా సంబంధం'),L('content/sets-functions-relations/relations/equivalence-relations.tex',31,36,30,36,'equivalence class','తుల్యతా వర్గం'),L('content/sets-functions-relations/relations/orders.tex',22,24,23,25,'Preorder','పూర్వక్రమం'),L('content/sets-functions-relations/relations/orders.tex',27,29,28,30,'Partial order','పాక్షిక క్రమం'),L('content/sets-functions-relations/relations/orders.tex',32,34,33,35,'Linear order','రేఖీయ క్రమం'),L('content/sets-functions-relations/relations/orders.tex',82,84,88,90,'Strict order','కఠిన క్రమం'),L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',23,25,26,30,'equivalence relation','తుల్యతా సంబంధం'),L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',77,79,85,89,'equivalence class','తుల్యతా వర్గం')],
 'TE-T018':[L('content/sets-functions-relations/relations/reflections.tex',15,18,14,18,'metaphysical identity','అధిభౌతిక తాదాత్మ్య'),L('content/sets-functions-relations/relations/reflections.tex',37,39,37,42,'set-theoretic reductionism','సమితి-సిద్ధాంత సంక్షేపణ'),L('content/sets-functions-relations/relations/reflections.tex',59,64,63,68,'predicate','విధేయంగా')],
 'TE-T019':[L('content/sets-functions-relations/relations/graphs.tex',12,26,12,26,'graph','గ్రాఫు'),L('content/sets-functions-relations/relations/trees.tex',37,53,36,57,'root','వృక్షమూలం'),L('content/sets-functions-relations/relations/trees.tex',56,59,60,68,'successor','ఉత్తరవర్తి')],
 'TE-T020':[L('content/sets-functions-relations/relations/trees.tex',14,20,14,19,'!!{formula}','!!{formula}'),L('content/sets-functions-relations/relations/trees.tex',126,128,135,137,'computability','గణనీయతా')],
 'TE-T021':[L('content/sets-functions-relations/relations/operations.tex',25,26,25,27,'relative product','సాపేక్ష లబ్ధం'),L('content/sets-functions-relations/relations/operations.tex',28,29,28,29,'restriction','పరిమితం చేసిన సంబంధం'),L('content/sets-functions-relations/relations/operations.tex',31,33,31,33,'image','వర్తింపజేసిన ఫలితం'),L('content/sets-functions-relations/relations/operations.tex',50,57,51,59,'closure','సంవృతం')],
 'TE-T022':[L('content/sets-functions-relations/functions/function-basics.tex',29,39,29,39,'codomain','సహప్రవేశం')],
 'TE-T023':[L('content/sets-functions-relations/functions/function-kinds.tex',29,36,28,36,'surjective','surjective'),L('content/sets-functions-relations/functions/function-kinds.tex',64,67,63,66,'injective','injective'),L('content/sets-functions-relations/functions/function-kinds.tex',99,115,96,113,'bijective','bijective')],
 'TE-T024':[L('content/sets-functions-relations/functions/partial-functions.tex',12,34,11,35,'Partial Functions','పాక్షిక ప్రమేయాలు'),L('content/sets-functions-relations/functions/partial-functions.tex',63,72,65,74,'serial','సీరియల్'),L('content/sets-functions-relations/functions/inverses.tex',57,59,57,59,'left inverse','ఎడమ విలోమం'),L('content/sets-functions-relations/functions/inverses.tex',110,110,121,121,'Axiom of Choice','ఎంపిక స్వీకృతం')],
 'TE-T025':[L('content/sets-functions-relations/functions/function-kinds.tex',77,80,75,78,'constant function','స్థిర ప్రమేయం')],
 'TE-T026':[L('content/sets-functions-relations/size-of-sets/enumerability.tex',27,32,27,32,'enumeration','లెక్కింపు'),L('content/sets-functions-relations/size-of-sets/enumerability-alt.tex',39,43,39,43,'\\emph{enumeration}','\\emph{లెక్కింపు}')],
 'TE-T027':[L('content/sets-functions-relations/size-of-sets/introduction.tex',13,19,13,19,'size','పరిమాణం'),L('content/sets-functions-relations/size-of-sets/equinumerous-sets.tex',29,32,28,31,'\\emph{equinumerous}','\\emph{సమసంఖ్యాకం}')],
 'TE-T028':[L('content/sets-functions-relations/size-of-sets/zig-zag.tex',59,64,59,64,'zig-zag method','జిగ్‌జాగ్ పద్ధతి'),L('content/sets-functions-relations/size-of-sets/pairing.tex',51,56,53,58,'pairing function','జతీకరణ ప్రమేయం'),L('content/sets-functions-relations/size-of-sets/non-enumerability.tex',39,41,38,40,'diagonal method','వికర్ణ పద్ధతి'),L('content/sets-functions-relations/size-of-sets/reduction.tex',27,31,27,31,'\\emph{reducing}','\\emph{తగ్గించడం}'),L('content/sets-functions-relations/size-of-sets/schroder-bernstein.tex',11,11,11,11,'Schr\\"oder-Bernstein','ష్రోడర్--బెర్న్‌స్టైన్')],
 'TE-T029':[L('content/sets-functions-relations/arithmetization/arithmetization.tex',8,8,8,8,'Arithmetization','అంకగణితీకరణ'),L('content/sets-functions-relations/arithmetization/checking-details.tex',24,24,23,25,'commutative ring','వినిమయ వలయం'),L('content/sets-functions-relations/arithmetization/checking-details.tex',131,135,135,139,'ordered field','క్రమిత క్షేత్రం')],
 'TE-T030':[L('content/sets-functions-relations/arithmetization/reals.tex',74,74,76,81,'Completeness Property','సంపూర్ణతా ధర్మం'),L('content/sets-functions-relations/arithmetization/cuts.tex',26,29,26,29,'\\emph{cut}','\\emph{కోత}'),L('content/sets-functions-relations/arithmetization/cauchy.tex',83,87,78,82,'\\emph{Cauchy sequence}','\\emph{కౌషీ క్రమం}')],
 'TE-T031':[L('content/sets-functions-relations/infinite/dedekind-algebra.tex',82,88,94,101,'Dedekind algebra','డెడెకిండ్ బీజగణితం'),L('content/sets-functions-relations/infinite/dedekind-algebra.tex',91,96,104,109,'Dedekind infinite','డెడెకిండ్ అనంత'),L('content/sets-functions-relations/infinite/dedekind-algebra.tex',41,50,45,61,'$f$-\\emph{closed}','$f$-\\emph{సంవృతం}'),L('content/sets-functions-relations/infinite/dedekind-induction.tex',16,20,16,21,'Arithmetical induction','అంకగణిత ఆగమనం'),L('content/sets-functions-relations/infinite/dedekinds-proof.tex',36,39,32,36,'isomorphic','సమరూపాలు')],
 'TE-T032':[L('content/propositional-logic/syntax-and-semantics/syntax-and-semantics.tex',8,8,8,8,'Syntax and Semantics','వాక్యనిర్మాణం మరియు అర్థవిచారం'),L('content/propositional-logic/syntax-and-semantics/formulas.tex',15,31,14,30,'logical connectives','తార్కిక సంయోజకాలు'),L('content/propositional-logic/syntax-and-semantics/formulas.tex',167,180,177,189,'Syntactic identity','వాక్యనిర్మాణ తాదాత్మ్యం'),L('content/propositional-logic/syntax-and-semantics/formation-sequences.tex',15,26,14,24,'formation sequence','నిర్మాణ క్రమం'),L('content/propositional-logic/syntax-and-semantics/preliminaries.tex',91,98,96,104,'Uniform Substitution','ఏకరీతి ప్రతిస్థాపన')],
 'TE-T033':[L('content/propositional-logic/syntax-and-semantics/valuations-sat.tex',11,23,11,24,'truth values','సత్యమూల్యాల'),L('content/propositional-logic/syntax-and-semantics/valuations-sat.tex',133,149,134,157,'Local Determination','స్థానిక నిర్ణయితత్వం'),L('content/propositional-logic/syntax-and-semantics/semantic-notions.tex',13,30,13,32,'tautology','సర్వసత్యం'),L('content/propositional-logic/syntax-and-semantics/semantic-notions.tex',83,85,85,87,'Semantic Deduction Theorem','అర్థపర నిగమన సిద్ధాంతం')],
 'TE-T034':[L('content/first-order-logic/proof-systems/introduction.tex',64,70,67,76,'\\emph{soundness}','\\emph{నిర్దుష్టత}'),L('content/first-order-logic/proof-systems/introduction.tex',72,80,78,84,'\\emph{completeness}','\\emph{సంపూర్ణత}'),L('content/first-order-logic/proof-systems/introduction.tex',81,99,86,103,'\\emph{consistency}','\\emph{అవైరుధ్యం}')],
 'TE-T035':[L('content/first-order-logic/proof-systems/sequent-calculus.tex',13,23,13,27,'Sequent Calculus','సీక్వెంట్ కలనం'),L('content/first-order-logic/proof-systems/natural-deduction.tex',13,30,13,30,'Natural Deduction','సహజ నిగమనం'),L('content/first-order-logic/proof-systems/natural-deduction.tex',45,58,43,55,'discharge','ఉపసంహరించడానికి'),L('content/first-order-logic/proof-systems/tableaux.tex',15,23,15,23,'signed formula','చిహ్నిత సూత్రాలతో'),L('content/first-order-logic/proof-systems/axiomatic-deduction.tex',13,32,13,37,'Axiomatic','స్వీకృతాధారిత'),L('content/first-order-logic/proof-systems/axiomatic-deduction.tex',39,46,39,45,'Modus\nponens','మోడస్ పోనెన్స్')],
 'TE-T036':[L('content/first-order-logic/sequent-calculus/rules-and-proofs.tex',23,25,23,25,'antecedent','పూర్వాంగం'),L('content/first-order-logic/sequent-calculus/rules-and-proofs.tex',52,60,52,61,'Initial Sequent','ప్రారంభ సీక్వెంట్'),L('content/first-order-logic/sequent-calculus/rules-and-proofs.tex',63,72,64,72,'logical','తార్కిక'),L('content/first-order-logic/sequent-calculus/derivations.tex',23,34,23,34,'end-sequent','అంత్య సీక్వెంట్'),L('content/first-order-logic/sequent-calculus/quantifier-rules.tex',28,32,28,32,'eigenvariable','ఐగెన్ చరరాశి'),L('content/first-order-logic/sequent-calculus/structural-rules.tex',23,23,23,23,'Weakening','బలహీనీకరణ'),L('content/first-order-logic/sequent-calculus/structural-rules.tex',37,37,37,37,'Contraction','సంకోచనం'),L('content/first-order-logic/sequent-calculus/structural-rules.tex',51,51,51,51,'Exchange','మార్పిడి'),L('content/first-order-logic/sequent-calculus/structural-rules.tex',68,74,68,74,'cut','కట్')],
 'TE-T037':[L('content/first-order-logic/sequent-calculus/proof-theoretic-notions.tex',78,84,84,90,'Reflexivity','స్వావర్తనత్వం'),L('content/first-order-logic/sequent-calculus/proof-theoretic-notions.tex',88,101,94,107,'Monotonicity','ఏకదిశత'),L('content/first-order-logic/sequent-calculus/proof-theoretic-notions.tex',102,126,108,132,'Transitivity','సంక్రామకత్వం'),L('content/first-order-logic/sequent-calculus/proof-theoretic-notions.tex',147,167,153,173,'Compactness','సంహతత్వం')],
 'TE-T038':[L('content/first-order-logic/natural-deduction/rules-and-proofs.tex',16,43,16,45,'Assumption','పరికల్పన'),L('content/first-order-logic/natural-deduction/derivations.tex',23,42,23,41,'undischarged','!!{undischarged}'),L('content/first-order-logic/natural-deduction/soundness.tex',52,59,52,58,'sub-!!{derivation}s','ఉప-!!{derivation}s')],
 'TE-T039':[L('content/first-order-logic/tableaux/rules-and-proofs.tex',15,25,15,25,'tableau','టాబ్లో'),L('content/first-order-logic/tableaux/rules-and-proofs.tex',15,25,15,25,'signed formula','సత్యమూల్య'),L('content/first-order-logic/tableaux/rules-and-proofs.tex',44,50,44,49,'branch is \\emph{closed}','\\emph{సంవృతమైనది}'),L('content/first-order-logic/tableaux/derivations.tex',34,39,35,40,'\\emph{open}','\\emph{వివృతమైనది}'),L('content/first-order-logic/tableaux/proving-things.tex',39,47,39,47,'checkmark','తనిఖీ గుర్తు'),L('content/first-order-logic/tableaux/quantifier-rules.tex',27,55,27,56,'eigenvariable condition','ఐగెన్ చరరాశి షరతు'),L('content/first-order-logic/tableaux/propositional-rules.tex',77,91,77,91,'The Cut Rule','కట్ నియమం')],
 'TE-T040':[L('content/first-order-logic/axiomatic-deduction/rules-and-proofs.tex',16,21,16,21,'Axiomatic','స్వీకృతాధారిత'),L('content/first-order-logic/axiomatic-deduction/rules-and-proofs.tex',37,41,37,41,'inference rule','నిగమన నియమం'),L('content/first-order-logic/axiomatic-deduction/axioms-rules-propositional.tex',15,17,15,17,'\\emph{axioms}','\\emph{స్వీకృతాల}'),L('content/first-order-logic/axiomatic-deduction/axioms-rules-propositional.tex',36,41,36,41,'Modus ponens','మోడస్ పోనెన్స్'),L('content/first-order-logic/axiomatic-deduction/axioms-rules-quantifiers.tex',23,32,23,32,'Rules for quantifiers','పరిమాణీకరణికాల నియమాలు'),L('content/first-order-logic/axiomatic-deduction/proof-theoretic-notions.tex',13,23,13,24,'Proof-Theoretic Notions','నిరూపణ-సిద్ధాంత భావనలు'),L('content/first-order-logic/axiomatic-deduction/provability-consistency.tex',14,17,14,17,'relation','సంబంధపు'),L('content/first-order-logic/axiomatic-deduction/deduction-theorem.tex',49,51,48,50,'Deduction Theorem','నిగమన సిద్ధాంతం')],
 'TE-T041':[L('content/first-order-logic/completeness/complete-consistent-sets.tex',19,22,19,22,'Complete set','సంపూర్ణ సమితి'),L('content/first-order-logic/completeness/henkin-expansions.tex',11,11,11,11,'Henkin Expansion','హెన్కిన్ విస్తరణ'),L('content/first-order-logic/completeness/henkin-expansions.tex',39,46,40,48,'Saturated set','సంతృప్తీకృత సమితి'),L('content/first-order-logic/completeness/lindenbaums-lemma.tex',13,13,13,13,"Lindenbaum's Lemma",'లిండెన్‌బామ్ ఉపసిద్ధాంతం'),L('content/first-order-logic/completeness/construction-of-model.tex',37,43,38,44,'Term model','పద నమూనా'),L('content/first-order-logic/completeness/construction-of-model.tex',163,166,174,178,'Truth Lemma','సత్య ఉపసిద్ధాంతం'),L('content/first-order-logic/completeness/identity.tex',22,23,21,21,'factoring','వర్గీకరణ'),L('content/first-order-logic/completeness/compactness.tex',29,31,28,32,'finitely satisfiable','పరిమితంగా సంతృప్తిపరచదగినది'),L('content/first-order-logic/completeness/compactness.tex',13,18,13,18,'Compactness Theorem','సంహతత్వ సిద్ధాంతం'),L('content/first-order-logic/completeness/downward-ls.tex',10,15,10,15,'L\\"owenheim--Skolem Theorem','లొవెన్‌హైమ్--స్కోలెమ్ సిద్ధాంతం'),L('content/first-order-logic/completeness/downward-ls.tex',48,48,47,47,"Skolem's Paradox",'స్కోలెమ్ విరోధాభాసం')]
};
locations['TE-T042']=[L('content/sets-functions-relations/sets/basics.tex',14,14,14,16,'!!a{element}','\\tetoken')];
locations['TE-T043']=[
 L('content/first-order-logic/syntax-and-semantics/intro-syntax.tex',13,18,13,20,'syntax and semantics','వాక్యనిర్మాణాన్నీ'),
 L('content/first-order-logic/syntax-and-semantics/first-order-languages.tex',14,19,14,19,'Expressions of first-order logic','మొదటిస్థాయి విధేయ తర్కపు'),
 L('content/first-order-logic/syntax-and-semantics/terms-formulas.tex',13,20,13,20,'expressions built up','ప్రాథమిక పదజాలం నుంచి'),
 L('content/first-order-logic/syntax-and-semantics/unique-readability.tex',14,18,14,18,'unique reading','ఏకార్థ పఠనం'),
 L('content/first-order-logic/syntax-and-semantics/main-operator.tex',14,18,14,18,'main operator','ప్రధాన సంయోజకం'),
 L('content/first-order-logic/syntax-and-semantics/subformulas.tex',14,17,14,17,'subformula','ఉపసూత్రాలు'),
 L('content/first-order-logic/syntax-and-semantics/formation-sequences.tex',13,18,13,17,'formation sequence','నిర్మాణ క్రమం'),
 L('content/first-order-logic/syntax-and-semantics/free-vars-sentences.tex',15,16,15,16,'free','స్వేచ్ఛా'),
 L('content/first-order-logic/syntax-and-semantics/substitution.tex',14,15,14,16,'substituting','ప్రతిస్థాపించిన')
];
locations['TE-T044']=[
 L('content/first-order-logic/syntax-and-semantics/intro-semantics.tex',13,20,13,20,'central concept','సంతృప్తి'),
 L('content/first-order-logic/syntax-and-semantics/covered-structures.tex',30,34,31,34,'\\emph{covered}','ఆవృతమైనది')
];
locations['TE-T045']=[L('content/first-order-logic/syntax-and-semantics/satisfaction.tex',74,79,70,76,'$x$-Variant','$x$-భేదరూపం')];
locations['TE-T046']=[L('content/first-order-logic/syntax-and-semantics/extensionality.tex',11,19,11,18,'Extensionality','విస్తారత')];
locations['TE-T047']=[
 L('content/first-order-logic/models-theories/introduction.tex',29,34,28,35,'\\emph{closed}','\\emph{సంవృతం}'),
 L('content/first-order-logic/models-theories/expressing-props-of-structures.tex',39,42,36,40,'\\emph{is a model of}','\\emph{ఒక నమూనా}'),
 L('content/first-order-logic/models-theories/expressing-relations.tex',70,78,71,79,'\\emph{define}','\\emph{నిర్వచించగలం}')
];
locations['TE-T048']=[
 L('content/first-order-logic/models-theories/theories.tex',63,99,62,99,'pure sets','శుద్ధ సమితుల'),
 L('content/first-order-logic/models-theories/set-theory.tex',13,24,13,24,'Zermelo--Fraenkel','జెర్మెలో--ఫ్రెంకెల్'),
 L('content/first-order-logic/models-theories/set-theory.tex',150,169,147,169,'comprehension principle','ధర్మసంగ్రహ సూత్రం')
];
locations['TE-T049']=[L('content/first-order-logic/models-theories/theories.tex',103,141,102,139,'\\emph{mereology}','\\emph{భాగతత్త్వం}')];
locations['TE-T050']=[L('content/first-order-logic/beyond/many-sorted-logic.tex',13,26,13,26,'Many-sorted logic','బహు-రక తర్కం')];
locations['TE-T051']=[
 L('content/first-order-logic/beyond/second-order-logic.tex',13,24,13,23,'language of second-order logic','ద్వితీయ-స్థాయి తర్కపు భాష'),
 L('content/first-order-logic/beyond/higher-order-logic.tex',21,38,22,40,'higher-order logic','ఉన్నత-స్థాయి తర్కాన్ని')
];
locations['TE-T052']=[
 L('content/first-order-logic/beyond/intuitionistic-logic.tex',13,17,13,17,'intuitionistic','అంతఃప్రజ్ఞావాద'),
 L('content/first-order-logic/beyond/intuitionistic-logic.tex',97,112,91,104,'constructive interpretation','నిర్మాణాత్మక అర్థనిర్దేశం')
];
locations['TE-T053']=[
 L('content/first-order-logic/beyond/modal-logics.tex',31,39,29,36,'Modal logic was designed','మోడల్ తర్కాన్ని రూపొందించారు'),
 L('content/first-order-logic/beyond/modal-logics.tex',41,48,38,45,'accessibility','ప్రాప్యత')
];
locations['TE-T054']=[L('content/first-order-logic/beyond/other-logics.tex',22,35,22,35,'Fuzzy logic','ఫజీ తర్కాన్ని')];
locations['TE-T055']=[
 L('content/model-theory/basics/reducts-and-expansions.tex',24,31,24,31,'\\emph{reduct}','\\emph{సంకుచిత రూపం}'),
 L('content/model-theory/basics/substructures.tex',20,28,20,28,'sub!!{structure}','ఉప\\tetoken{నిర్మాణం')
];
locations['TE-T056']=[
 L('content/model-theory/basics/isomorphism.tex',12,32,12,33,'elementarily equivalent','మొదటిస్థాయి-వాక్య తుల్యాలు'),
 L('content/model-theory/basics/partial-iso.tex',13,17,13,19,'partial isomorphism','పాక్షిక సమరూపత')
];
locations['TE-T057']=[
 L('content/model-theory/basics/overspill.tex',9,15,9,15,'\\olsection{Overspill}','అధిప్రసరణ'),
 L('content/model-theory/basics/partial-iso.tex',113,120,120,128,'quantifier rank','పరిమాణక ర్యాంకు'),
 L('content/model-theory/basics/dlo.tex',12,15,12,17,'dense linear ordering without endpoints','అంత్యబిందువులు లేని సాంద్ర రేఖీయ క్రమం')
];
locations['TE-T058']=[
 L('content/model-theory/models-of-arithmetic/introduction.tex',12,17,12,17,'standard model','ప్రామాణిక నమూనా'),
 L('content/model-theory/models-of-arithmetic/non-standard-models.tex',18,23,19,25,'non-standard','అప్రామాణికం')
];
locations['TE-T059']=[
 L('content/model-theory/models-of-arithmetic/models-of-pa.tex',60,67,64,77,'predecessor','పూర్వాధికారి'),
 L('content/model-theory/models-of-arithmetic/models-of-pa.tex',97,108,110,122,'block of','ఖండం')
];
locations['TE-T060']=[
 L('content/model-theory/models-of-arithmetic/computable-models.tex',35,40,38,44,'\\emph{computable}','\\emph{గణనీయం}'),
 L('content/model-theory/models-of-arithmetic/computable-models.tex',119,121,135,144,"Tennenbaum's Theorem",'టెన్నెన్‌బామ్ సిద్ధాంతం')
];
locations['TE-T061']=[
 L('content/model-theory/interpolation/introduction.tex',13,18,13,20,'\\emph{interpolant}','\\emph{అంతర్వేశకం (ఇంటర్‌పోలంట్)}'),
 L('content/model-theory/interpolation/introduction.tex',20,25,22,27,'joint consistency','ఉమ్మడి అవైరుధ్య'),
 L('content/model-theory/interpolation/separation.tex',23,28,25,30,'\\emph{inseparable}','\\emph{వేరుపరచలేనివి}'),
 L('content/model-theory/interpolation/interpolation-proof.tex',39,44,42,55,'maximally inseparable','గరిష్ఠంగా వేరుపరచలేని')
];
locations['TE-T062']=[
 L('content/model-theory/interpolation/definability.tex',13,18,13,19,"Beth's",'బెత్ నిర్వచనీయతా'),
 L('content/model-theory/interpolation/definability.tex',34,44,36,48,'\\emph{explicitly defines}','\\emph{స్పష్టంగా నిర్వచిస్తుంది}'),
 L('content/model-theory/interpolation/definability.tex',46,57,50,62,'\\emph{implicitly defines}','\\emph{అవ్యక్తంగా నిర్వచిస్తుంది}')
];
locations['TE-T063']=[
 L('content/model-theory/lindstrom/abstract-logics.tex',13,21,13,30,'\\emph{abstract logic}','\\emph{నైరూప్య తర్కం}'),
 L('content/model-theory/lindstrom/abstract-logics.tex',49,71,62,99,'\\emph{normal}','\\emph{సాధారణం}')
];
locations['TE-T064']=[
 L('content/computability/recursive-functions/primitive-recursion.tex',10,10,10,10,'\\olsection{Primitive Recursion}','\\olsection{ఆదిమ పునరావృత్తి}'),
 L('content/computability/recursive-functions/composition.tex',10,14,10,14,'\\olsection{Composition}','\\olsection{సంయుక్తం}'),
 L('content/computability/recursive-functions/composition.tex',68,70,70,72,'\\emph{arity}','\\emph{స్థానసంఖ్య (అరిటీ)}'),
 L('content/computability/recursive-functions/pr-functions.tex',45,58,47,60,'primitive recursive functions','ఆదిమ పునరావృత్త ప్రమేయాల'),
 L('content/computability/recursive-functions/pr-functions-computable.tex',32,40,33,39,'computable','గణనీయ')
];
locations['TE-T065']=[
 L('content/computability/recursive-functions/pr-relations.tex',10,10,10,10,'\\olsection{Primitive Recursive Relations}','\\olsection{ఆదిమ పునరావృత్త సంబంధాలు}'),
 L('content/computability/recursive-functions/bounded-minimization.tex',10,10,10,10,'\\olsection{Bounded Minimization}','\\olsection{పరిమిత కనిష్ఠీకరణ}'),
 L('content/computability/recursive-functions/primes.tex',10,10,10,10,'\\olsection{Primes}','\\olsection{ప్రధాన సంఖ్యలు}'),
 L('content/computability/recursive-functions/sequences.tex',27,36,26,35,'coding of sequences','క్రమాల ఈ సంకేతీకరణ'),
 L('content/computability/recursive-functions/other-recursions.tex',12,46,12,46,'simultaneous recursion','సమకాల పునరావృత్తి'),
 L('content/computability/recursive-functions/partial-functions.tex',10,10,10,10,'\\olsection{Partial Recursive Functions}','\\olsection{పాక్షిక పునరావృత్త ప్రమేయాలు}'),
 L('content/computability/recursive-functions/normal-form.tex',12,20,12,21,"Kleene's Normal Form Theorem",'క్లీనీ నియత రూప సిద్ధాంతం'),
 L('content/computability/recursive-functions/halting-problem.tex',10,10,10,10,'\\olsection{The Halting Problem}','\\olsection{నిలుపు సమస్య (హాల్టింగ్ సమస్య)}'),
 L('content/computability/recursive-functions/general-recursive-functions.tex',10,10,10,10,'\\olsection{General Recursive Functions}','\\olsection{సామాన్య పునరావృత్త ప్రమేయాలు}')
];
locations['TE-T066']=[
 L('content/computability/computability-theory/computability-theory.tex',8,8,8,8,'\\olchapter{cmp}{thy}{Computability Theory}','\\olchapter{cmp}{thy}{గణనీయతా సిద్ధాంతం}'),
 L('content/computability/computability-theory/introduction.tex',17,21,17,20,'\\emph{partial\n  computable}','\\emph{పాక్షిక గణనీయ ప్రమేయం}'),
 L('content/computability/computability-theory/s-m-n.tex',10,10,10,10,'\\olsection{The $s$-$m$-$n$ Theorem}','\\olsection{$s$-$m$-$n$ సిద్ధాంతం}'),
 L('content/computability/computability-theory/universal-part-function.tex',10,18,10,18,'\\olsection{The Universal Partial Computable Function}','\\olsection{సార్వత్రిక పాక్షిక గణనీయ ప్రమేయం}'),
 L('content/computability/computability-theory/ce-sets.tex',10,15,10,15,'\\olsection{Computably Enumerable Sets}','\\olsection{గణనీయంగా లెక్కించదగిన సమితులు}'),
 L('content/computability/computability-theory/equiv-ce-defs.tex',38,43,38,43,'\\emph{semi-decidable}','\\emph{అర్ధ-నిర్ణయించదగినవి}')
];
locations['TE-T067']=[
 L('content/computability/computability-theory/non-comp-set.tex',10,18,10,18,'There Are Non-Computable Sets','గణనీయంకాని సమితులు ఉన్నాయి'),
 L('content/computability/computability-theory/ce-closed-cup-cap.tex',11,15,11,15,'Closed under Union and Intersection','సంయోగం, ఛేదనం కింద సంవృతాలు'),
 L('content/computability/computability-theory/complement-ce.tex',10,15,10,15,'not Closed under Complement','పూరకం కింద సంవృతాలు కావు'),
 L('content/computability/computability-theory/reducibility.tex',50,60,52,62,'many-one reduction','అనేకం-ఒకటి తగ్గింపు'),
 L('content/computability/computability-theory/complete-ce-sets.tex',10,18,10,18,'Complete Computably Enumerable Sets','సంపూర్ణ గణనీయంగా లెక్కించదగిన సమితులు'),
 L('content/computability/computability-theory/k-1.tex',30,44,29,42,'oracles','ఒరాకిళ్లు'),
 L('content/computability/computability-theory/total.tex',10,16,10,16,'Totality is Undecidable','సర్వనిర్వచితత్వం అనిర్ణయనీయం'),
 L('content/computability/computability-theory/rice-theorem.tex',23,35,23,33,"Rice's Theorem",'రైస్ సిద్ధాంతం'),
 L('content/computability/computability-theory/rice-theorem.tex',30,35,29,33,'index set','సూచిక సమితి'),
 L('content/computability/computability-theory/fixed-point-thm.tex',10,16,10,16,'The Fixed-Point Theorem','స్థిరబిందు సిద్ధాంతం'),
 L('content/computability/computability-theory/def-functions-self-reference.tex',10,15,10,15,'Self-Reference','స్వీయ-సూచన')
];
locations['TE-T068']=[
 L('content/turing-machines/machines-computations/introduction.tex',12,25,12,25,'\\emph{a model of computation}','\\emph{గణనా నమూనా}'),
 L('content/turing-machines/machines-computations/representing-tms.tex',13,19,13,18,'\\emph{state diagrams}','\\emph{స్థితి రేఖాచిత్రాల}'),
 L('content/turing-machines/machines-computations/turing-machines.tex',22,34,21,32,'\\emph{instruction set}','\\emph{నిర్దేశ సమితి}'),
 L('content/turing-machines/machines-computations/configuration.tex',24,38,24,36,'\\emph{configuration}','\\emph{స్థితివిన్యాసం}'),
 L('content/turing-machines/machines-computations/configuration.tex',84,95,82,95,'\\emph{run of $M$ on input~$I$}','\\emph{ఇన్‌పుట్~$I$పై $M$ యొక్క నడక}'),
 L('content/turing-machines/machines-computations/unary-numbers.tex',10,21,10,20,'Unary Representation of Numbers','సంఖ్యలకు ఏకాంక ప్రాతినిధ్యం'),
 L('content/turing-machines/machines-computations/halting-states.tex',12,22,12,21,'\\emph{halting state}','\\emph{ఆగే స్థితి}'),
 L('content/turing-machines/machines-computations/disciplined-machines.tex',27,35,25,34,'\\emph{disciplined}','\\emph{క్రమశిక్షితమైనది}'),
 L('content/turing-machines/machines-computations/combining-machines.tex',25,50,23,48,"machine $M \\frown M'$","యంత్రం $M \\frown M'$"),
 L('content/turing-machines/machines-computations/variants.tex',29,39,27,36,'\\emph{non-deterministic}','\\emph{అనిర్ణీత}'),
 L('content/turing-machines/machines-computations/church-turing-thesis.tex',12,33,12,30,'\\emph{Church--Turing thesis}','\\emph{చర్చ్--ట్యూరింగ్ సిద్ధాంతప్రతిపాదన}')
];
locations['TE-T069']=[
 L('content/turing-machines/undecidability/enumerating-tms.tex',10,15,10,15,'Enumerating Turing Machines','ట్యూరింగ్ యంత్రాలను లెక్కించడం'),
 L('content/turing-machines/undecidability/universal-tm.tex',24,27,24,26,'\\emph{index}','\\emph{సూచిక}'),
 L('content/turing-machines/undecidability/universal-tm.tex',59,64,55,61,'\\emph{universal','\\emph{సార్వత్రిక'),
 L('content/turing-machines/undecidability/halting-problem.tex',37,43,35,41,'\\emph{Halting Problem}','\\emph{ఆగే సమస్య}'),
 L('content/turing-machines/undecidability/decision-problem.tex',10,15,10,15,'The Decision Problem','నిర్ణయ సమస్య'),
 L('content/turing-machines/undecidability/representing-tms.tex',10,18,10,18,'Representing Turing Machines','ట్యూరింగ్ యంత్రాల గణనకు ప్రాతినిధ్యం'),
 L('content/turing-machines/undecidability/unsolvability-decision-problem.tex',70,76,71,77,'semi-decidable','అర్ధ-నిర్ణయించదగినది'),
 L('content/turing-machines/undecidability/trakhtenbrot.tex',223,229,220,228,"Trakhtenbrot's Theorem",'ట్రాఖ్టెన్‌బ్రోట్ సిద్ధాంతం')
];
locations['TE-T070']=[
 L('content/incompleteness/introduction/historical-background.tex',209,209,176,176,"Hilbert's original program",'హిల్బర్ట్ అసలు కార్యక్రమానికి'),
 L('content/incompleteness/introduction/definitions.tex',35,35,32,34,'\\emph{theory}','\\emph{సిద్ధాంతం}'),
 L('content/incompleteness/introduction/definitions.tex',46,47,44,45,'standard model of arithmetic','అంకగణితపు ప్రామాణిక నమూనా'),
 L('content/incompleteness/introduction/definitions.tex',104,105,100,101,"Robinson's",'రాబిన్సన్'),
 L('content/incompleteness/introduction/definitions.tex',123,134,121,134,'induction schema','ఆగమన పథక'),
 L('content/incompleteness/introduction/definitions.tex',201,203,200,202,'!!{axiomatizable}','!!{axiomatizable}'),
 L('content/incompleteness/introduction/definitions.tex',269,277,263,273,'!!{represents}','!!{represents}'),
 L('content/incompleteness/introduction/overview.tex',45,48,46,49,'G\\"odel sentence','గ్యోడెల్ వాక్యం'),
 L('content/incompleteness/introduction/overview.tex',53,65,54,65,'arithmetization of syntax','వాక్యనిర్మాణపు అంకగణితీకరణ'),
 L('content/incompleteness/introduction/overview.tex',84,90,85,90,'provability','నిరూప్యతా విధేయం'),
 L('content/incompleteness/introduction/undecidability.tex',131,134,152,155,'Presburger arithmetic','ప్రెస్‌బర్గర్ అంకగణితం')
];
locations['TE-T071']=[
 L('content/incompleteness/arithmetization-syntax/arithmetization-syntax.tex',8,8,8,8,'Arithmetization of Syntax','వాక్యనిర్మాణపు అంకగణితీకరణ'),
 L('content/incompleteness/arithmetization-syntax/introduction.tex',39,42,37,41,'G\\"odel numbering','గ్యోడెల్ సంఖ్యీకరణ'),
 L('content/incompleteness/arithmetization-syntax/coding-symbols.tex',10,10,10,10,'Coding Symbols','సంకేతాల సంకేతీకరణ'),
 L('content/incompleteness/arithmetization-syntax/coding-terms.tex',45,48,43,47,'formation rules','నిర్మాణ నియమాలు'),
 L('content/incompleteness/arithmetization-syntax/coding-formulas.tex',10,10,10,10,'Coding \\printtoken{P}{formula}','సంకేతీకరణ'),
 L('content/incompleteness/arithmetization-syntax/substitution.tex',10,10,10,10,'Substitution','ప్రతిస్థాపన'),
 L('content/incompleteness/arithmetization-syntax/proofs-in-lk.tex',17,19,18,20,'end-sequent','అంత్య-సీక్వెంట్'),
 L('content/incompleteness/arithmetization-syntax/proofs-in-lk.tex',251,255,258,262,'the relation $\\Prf[\\Gamma](x, y)$','సంబంధం'),
 L('content/incompleteness/arithmetization-syntax/proofs-in-nd.tex',10,10,10,10,'Natural Deduction','సహజ నిగమనం'),
 L('content/incompleteness/arithmetization-syntax/proofs-in-nd.tex',17,21,18,23,'immediate sub-!!{derivation}s','తక్షణ ఉప-'),
 L('content/incompleteness/arithmetization-syntax/proofs-in-nd.tex',20,21,21,22,'discharge label','ఉపసంహరణ చీటీ'),
 L('content/incompleteness/arithmetization-syntax/proofs-in-ax.tex',10,10,10,10,'Axiomatic \\usetoken{P}{derivation}','స్వీకృతాధారిత')
];
locations['TE-T072']=[
 L('content/incompleteness/representability-in-q/representability-in-q.tex',8,8,8,8,'Representability in','ప్రాతినిధ్యయోగ్యత'),
 L('content/incompleteness/representability-in-q/beta-function.tex',10,10,10,10,'The Beta Function Lemma','బీటా ప్రమేయ ఉపపత్తి'),
 L('content/incompleteness/representability-in-q/beta-function.tex',43,50,42,49,"Sunzi's Theorem",'సున్‌జి సిద్ధాంతం'),
 L('content/incompleteness/representability-in-q/minimization-representable.tex',10,10,10,10,'Regular Minimization is Representable','సక్రమ కనిష్ఠీకరణ'),
 L('content/incompleteness/representability-in-q/representing-relations.tex',11,18,11,19,'Representing Relations','సంబంధాలకు ప్రాతినిధ్యం'),
 L('content/incompleteness/representability-in-q/sigma1-completeness.tex',10,29,10,29,'completeness','సంపూర్ణత')
];
locations['TE-T073']=[
 L('content/incompleteness/theories-computability/theories-computability.tex',15,15,14,14,'Theories and Computability','సిద్ధాంతాలు మరియు గణనీయత'),
 L('content/incompleteness/theories-computability/q-is-ce.tex',11,11,11,11,'c.e.}-Complete','c.e.}-సంపూర్ణం'),
 L('content/incompleteness/theories-computability/oconsis-ext-of-q-undec.tex',11,11,11,11,'\\omega$-Consistent','\\omega$-అవైరుధ్య'),
 L('content/incompleteness/theories-computability/extensions-of-q-not-decidable.tex',23,26,23,26,'universal computable relation','సార్వత్రిక గణనీయ'),
 L('content/incompleteness/theories-computability/computably-axiomatizable.tex',13,18,13,17,'\\emph{!!{axiomatizable}}','\\emph{\\tetoken{స్వీకృతీకరించదగినది}'),
 L('content/incompleteness/theories-computability/inseparability.tex',11,12,11,12,'Inseparable','వేరుపరచలేనివి'),
 L('content/incompleteness/theories-computability/interpretability.tex',11,11,11,11,'Interpretable','అర్థనిర్దేశం చేయగల')
];
locations['TE-T074']=[
 L('content/incompleteness/incompleteness-provability/incompleteness-provability.tex',8,8,8,8,'Incompleteness and Provability','అసంపూర్ణత మరియు నిరూపణీయత'),
 L('content/incompleteness/incompleteness-provability/introduction.tex',61,63,56,58,'fixed-point lemma','స్థిరబిందు ఉపసిద్ధాంతం'),
 L('content/incompleteness/incompleteness-provability/fixed-point-lemma.tex',11,11,11,11,'The Fixed-Point Lemma','స్థిరబిందు ఉపసిద్ధాంతం'),
 L('content/incompleteness/incompleteness-provability/first-incompleteness-thm.tex',11,11,11,11,'The First Incompleteness Theorem','మొదటి అసంపూర్ణతా సిద్ధాంతం'),
 L('content/incompleteness/incompleteness-provability/rosser-thm.tex',11,11,11,11,"Rosser's Theorem",'రాసర్ సిద్ధాంతం'),
 L('content/incompleteness/incompleteness-provability/godels-paper.tex',11,11,11,11,'Comparison with G\\"odel\'s Original Paper','గ్యోడెల్ అసలు పరిశోధనపత్రంతో పోలిక'),
 L('content/incompleteness/incompleteness-provability/provability-conditions.tex',11,11,11,11,'The \\usetoken{S}{derivability} Conditions for','\\usetoken{S}{derivability} షరతులు'),
 L('content/incompleteness/incompleteness-provability/second-incompleteness-thm.tex',11,11,11,11,'The Second Incompleteness Theorem','రెండవ అసంపూర్ణతా సిద్ధాంతం'),
 L('content/incompleteness/incompleteness-provability/lob-thm.tex',11,11,11,11,'L\\"ob\'s Theorem','లోబ్ సిద్ధాంతం'),
 L('content/incompleteness/incompleteness-provability/tarski-thm.tex',11,11,11,11,'The Undefinability of Truth','సత్యపు నిర్వచనాతీతత')
];
locations['TE-T075']=[
 L('content/second-order-logic/second-order-logic.tex',7,7,7,7,'Second-order Logic','ద్వితీయ-స్థాయి తర్కం'),
 L('content/second-order-logic/syntax-and-semantics/syntax-and-semantics.tex',8,8,8,8,'Syntax and Semantics','వాక్యనిర్మాణం మరియు అర్థవిచారం'),
 L('content/second-order-logic/syntax-and-semantics/introduction.tex',38,41,36,39,'\\emph{standard} semantics','\\emph{ప్రామాణిక} అర్థవిచారం'),
 L('content/second-order-logic/syntax-and-semantics/terms-formulas.tex',50,55,50,56,'Second-order Terms','ద్వితీయ-స్థాయి పదాలు'),
 L('content/second-order-logic/syntax-and-semantics/satisfaction.tex',90,99,96,107,'Satisfaction','సంతృప్తి'),
 L('content/second-order-logic/syntax-and-semantics/semantic-notions.tex',21,24,21,24,'Validity','చెల్లుబాటుతనం'),
 L('content/second-order-logic/syntax-and-semantics/expressive-power.tex',68,74,69,75,'transitive closure','సంక్రమణ సంవృతి'),
 L('content/second-order-logic/syntax-and-semantics/inf-count.tex',14,19,14,19,'(Dedekind) infinite','(డెడెకిండ్) అనంతం')
];
locations['TE-T076']=[
 L('content/second-order-logic/metatheory/metatheory.tex',8,8,8,8,'Metatheory of Second-order Logic','ద్వితీయ-స్థాయి తర్కపు అధిసిద్ధాంతం'),
 L('content/second-order-logic/metatheory/second-order-arithmetic.tex',11,11,11,11,'Second-order Arithmetic','ద్వితీయ-స్థాయి అంకగణితం'),
 L('content/second-order-logic/metatheory/second-order-arithmetic.tex',31,34,31,33,'induction axiom','ఆగమన స్వీకృతం'),
 L('content/second-order-logic/metatheory/second-order-arithmetic.tex',81,84,81,84,'isomorphic','సమరూపమైనవి'),
 L('content/second-order-logic/metatheory/undecidability-and-axiomatizability.tex',11,11,11,11,'not Axiomatizable','స్వీకృతీకరించదగినది కాదు'),
 L('content/second-order-logic/metatheory/compactness.tex',13,18,13,18,'finitely satisfiable','పరిమితంగా సంతృప్తిపరచదగినది'),
 L('content/second-order-logic/metatheory/compactness.tex',33,36,33,37,'not compact','సంహతమైనది కాదు'),
 L('content/second-order-logic/metatheory/loewenheim-skolem.tex',13,18,13,19,'Downward','అధోముఖ'),
 L('content/second-order-logic/metatheory/loewenheim-skolem.tex',19,21,19,23,'Upward','ఊర్ధ్వముఖ')
];
locations['TE-T077']=[
 L('content/second-order-logic/sol-and-set-theory/sol-and-set-theory.tex',8,8,8,8,'Second-order Logic and Set Theory','ద్వితీయ-స్థాయి తర్కం మరియు సమితి సిద్ధాంతం'),
 L('content/second-order-logic/sol-and-set-theory/comparing-sets.tex',11,11,11,11,'Comparing Sets','సమితులను పోల్చడం'),
 L('content/second-order-logic/sol-and-set-theory/cardinalities.tex',11,11,11,11,'Cardinalities of Sets','సమితుల పరిమాణాలు'),
 L('content/second-order-logic/sol-and-set-theory/cardinalities.tex',42,57,48,69,"Cantor's Theorem",'కాంటర్ సిద్ధాంతం'),
 L('content/second-order-logic/sol-and-set-theory/power-of-continuum.tex',11,11,11,11,'The Power of the Continuum','అవిచ్ఛిన్న సమితి పరిమాణం'),
 L('content/second-order-logic/sol-and-set-theory/power-of-continuum.tex',45,49,49,56,'$R$-code','సంకేతీకరించగలదు'),
 L('content/second-order-logic/sol-and-set-theory/power-of-continuum.tex',88,98,97,110,'The size of','అవిచ్ఛిన్న సమితి పరిమాణం'),
 L('content/second-order-logic/sol-and-set-theory/power-of-continuum.tex',131,139,147,156,'Continuum Hypothesis','అవిచ్ఛిన్న సమితి పరికల్పన')
];
locations['TE-T078']=[
 L('content/lambda-calculus/lambda-calculus.tex',7,7,7,7,'The Lambda Calculus','లాంబ్డా కలనశాస్త్రం'),
 L('content/lambda-calculus/introduction/overview.tex',34,35,32,35,'lambda abstraction','లాంబ్డా అమూర్తీకరణ'),
 L('content/lambda-calculus/introduction/overview.tex',55,58,53,56,'untyped','టైపులేని'),
 L('content/lambda-calculus/introduction/syntax.tex',22,27,21,27,'applications','ప్రయోగాలు'),
 L('content/lambda-calculus/introduction/syntax.tex',59,64,57,62,'alpha','తుల్యమైనవి'),
 L('content/lambda-calculus/introduction/reduction.tex',13,23,12,24,'substituting','ప్రతిస్థాపన'),
 L('content/lambda-calculus/introduction/reduction.tex',26,37,26,38,'\\beta$-contraction','\\beta$-సంకోచనం'),
 L('content/lambda-calculus/introduction/church-rosser.tex',10,10,10,10,'Church--Rosser Property','చర్చ్--రోసర్ లక్షణం'),
 L('content/lambda-calculus/introduction/church-rosser.tex',29,38,29,36,'equivalent','తుల్యమైనవి'),
 L('content/lambda-calculus/introduction/currying.tex',10,18,10,18,'Currying','కరీకరణ')
];
locations['TE-T079']=[
 L('content/lambda-calculus/introduction/lambda-definability.tex',18,27,17,26,'Church numeral','చర్చ్ సంఖ్యాంకం'),
 L('content/lambda-calculus/introduction/lambda-definability.tex',29,45,28,47,'!!{lambda define}s','!!{lambda define}s'),
 L('content/lambda-calculus/introduction/basic-pr-lambda.tex',12,29,12,29,'successor function','ఉత్తరగామి ప్రమేయం'),
 L('content/lambda-calculus/introduction/composition.tex',12,27,12,27,'closed under composition','సంయుక్తం కింద సంవృతమైనవి'),
 L('content/lambda-calculus/introduction/primitive-recursion.tex',74,140,77,144,'closed under primitive recursion','ఆదిమ పునరావృత్తి కింద సంవృతమైనవి'),
 L('content/lambda-calculus/introduction/fixed-point-combinator.tex',28,38,27,37,"Curry's combinator",'కరీ సంయోజకం'),
 L('content/lambda-calculus/introduction/minimization.tex',10,18,10,18,'Closed under Minimization','కనిష్ఠీకరణ కింద సంవృతమైనవి')
];
locations['TE-T080']=[
 L('content/lambda-calculus/syntax/syntax.tex',8,8,8,8,'Syntax','వాక్యనిర్మాణం'),
 L('content/lambda-calculus/syntax/terms.tex',10,18,10,20,'Terms','పదాలు'),
 L('content/lambda-calculus/syntax/terms.tex',29,33,29,33,'!!{parameter}','పరామితి'),
 L('content/lambda-calculus/syntax/unique-readability.tex',10,16,10,16,'Unique Readability','ఏకార్థ పఠనీయత'),
 L('content/lambda-calculus/syntax/abbreviated-syntax.tex',12,16,12,17,'abbreviated terms','సంక్షిప్త పదాలు'),
 L('content/lambda-calculus/syntax/free-variables.tex',22,25,22,26,'scope','పరిధి'),
 L('content/lambda-calculus/syntax/free-variables.tex',51,62,52,64,'free variables','స్వేచ్ఛా చరాల'),
 L('content/lambda-calculus/syntax/free-variables.tex',75,92,79,94,'environment','పరిసర'),
 L('content/lambda-calculus/syntax/free-variables.tex',94,97,96,99,'combinator','సంయోజకం')
];
locations['TE-T081']=[
 L('content/lambda-calculus/syntax/substitution.tex',10,10,10,10,'Substitution','ప్రతిస్థాపన'),
 L('content/lambda-calculus/syntax/substitution.tex',21,30,21,35,'Substitution','ప్రతిస్థాపన'),
 L('content/lambda-calculus/syntax/substitution.tex',68,76,77,88,'induction on the formation','ఆగమన పద్ధతిలో నిరూపిస్తాం'),
 L('content/lambda-calculus/syntax/substitution.tex',95,101,107,115,'\\FV{\\Subst{M}{N}{x}}','\\FV{\\Subst{M}{N}{x}}')
];
locations['TE-T082']=[
 L('content/lambda-calculus/syntax/alpha.tex',10,10,10,10,'Conversion','పరివర్తనం'),
 L('content/lambda-calculus/syntax/alpha.tex',29,31,29,31,'Compatibility of relation','సంబంధపు అనుకూలత్వం'),
 L('content/lambda-calculus/syntax/alpha.tex',72,75,73,76,'reflexitive','స్వప్రావర్తక'),
 L('content/lambda-calculus/syntax/alpha.tex',116,118,120,123,'!!{derivation}','వ్యుత్పత్తి')
];
locations['TE-T083']=[
 L('content/lambda-calculus/syntax/de-bruijn.tex',11,11,11,11,'De Bruijn Index','డి బ్రూయిన్ సూచిక'),
 L('content/lambda-calculus/syntax/de-bruijn.tex',31,37,33,40,'De Bruijn terms','డి బ్రూయిన్ పదాలను'),
 L('content/lambda-calculus/syntax/de-bruijn.tex',48,51,50,56,'\\Gamma(x)','\\Gamma(x)'),
 L('content/lambda-calculus/syntax/de-bruijn.tex',61,69,65,74,'G_\\Gamma(n)','G_\\Gamma(n)')
];
locations['TE-T084']=[
 L('content/open-logic-about.tex',5,9,5,10,'formal meta-logic','ఆచారబద్ధ అధితర్కం'),
 L('content/open-logic-about.tex',5,9,5,10,'formal methods','ఆచారబద్ధ పద్ధతులపై')
];
locations['TE-T085']=[
 L('content/sets-functions-relations/sets-functions-relations-complete.tex',7,7,7,7,'Na\\"ive Set Theory','అనౌపచారిక సమితి సిద్ధాంతం'),
 L('content/sets-functions-relations/sets-functions-relations-complete.tex',9,14,9,14,'basic naive set','ప్రాథమిక అనౌపచారిక సమితి సిద్ధాంతానికి')
];
locations['TE-T086']=[
 L('content/lambda-calculus/syntax/term-revisited.tex',10,10,10,10,'Equivalence Classes','తుల్యతా వర్గాలుగా'),
 L('content/lambda-calculus/syntax/term-revisited.tex',23,25,24,26,'\\rep{M}','\\rep{M}'),
 L('content/lambda-calculus/syntax/term-revisited.tex',27,35,28,36,'class containing','కలిగి ఉన్న'),
 L('content/lambda-calculus/syntax/term-revisited.tex',48,55,49,60,'substitution','ప్రతిస్థాపించడం'),
 L('content/lambda-calculus/syntax/term-revisited.tex',83,92,87,96,'projected','దింపాలి')
];
locations['TE-T087']=[
 L('content/lambda-calculus/syntax/beta.tex',91,97,94,100,'natural strategy','సహజ వ్యూహం'),
 L('content/lambda-calculus/syntax/beta.tex',92,93,95,97,'left-most','అత్యంత ఎడమవైపు'),
 L('content/lambda-calculus/syntax/beta.tex',94,96,97,100,'normal form','నియత రూపానికి')
];
locations['TE-T088']=[
 L('content/lambda-calculus/syntax/eta.tex',10,10,10,10,'$\\eta$-conversion','$\\eta$-పరివర్తనం'),
 L('content/lambda-calculus/syntax/eta.tex',18,24,19,25,'$\\eta$-contraction','$\\eta$-సంకోచనం'),
 L('content/lambda-calculus/syntax/eta.tex',27,35,28,35,'$\\beta\\eta$-reduction','$\\beta\\eta$-తగ్గింపు'),
 L('content/lambda-calculus/syntax/eta.tex',47,55,51,60,'extensionality','విస్తారత'),
 L('content/lambda-calculus/syntax/eta.tex',62,66,65,70,'extensionality','విస్తారతను')
];
locations['TE-T089']=[
 L('content/lambda-calculus/church-rosser/church-rosser.tex',8,8,8,8,'Church--Rosser Property','చర్చ్--రోసర్ లక్షణం'),
 L('content/lambda-calculus/church-rosser/definitions-and-properties.tex',16,19,16,22,'Church--Rosser property','చర్చ్--రోసర్ లక్షణం'),
 L('content/lambda-calculus/church-rosser/definitions-and-properties.tex',35,43,38,46,'normal form','నియత రూపం'),
 L('content/lambda-calculus/church-rosser/definitions-and-properties.tex',63,65,67,70,'grid','జాలకాన్ని')
];
locations['TE-T090']=[
 L('content/lambda-calculus/church-rosser/parallel-beta-reduction.tex',11,11,11,11,'Parallel $\\beta$-reduction','సమాంతర $\\beta$-తగ్గింపు'),
 L('content/lambda-calculus/church-rosser/parallel-beta-reduction.tex',16,20,16,21,'Parallel reduction','సమాంతర తగ్గింపును'),
 L('content/lambda-calculus/church-rosser/parallel-beta-reduction.tex',51,53,55,57,'$\\beta$-complete development','$\\beta$-సంపూర్ణ వికాసం'),
 L('content/lambda-calculus/church-rosser/parallel-beta-reduction.tex',79,80,85,87,'!!{derivation}','!!{derivation}'),
 L('content/lambda-calculus/church-rosser/parallel-beta-reduction.tex',107,110,118,125,'!!{derivation}','!!{derivation}')
];
locations['TE-T091']=[
 L('content/lambda-calculus/church-rosser/beta-reduction.tex',11,11,11,11,'$\\beta$-reduction','$\\beta$-తగ్గింపు'),
 L('content/lambda-calculus/church-rosser/beta-reduction.tex',13,20,13,24,'If $M \\bredone M\'$','మూల నిరూపణ'),
 L('content/lambda-calculus/church-rosser/beta-reduction.tex',51,53,65,67,'smallest transitive relation','కనిష్ఠ సంక్రమణ సంబంధం'),
 L('content/lambda-calculus/church-rosser/beta-reduction.tex',70,72,89,91,'Church--Rosser property','చర్చ్--రోసర్ లక్షణాన్ని')
];
locations['TE-T092']=[
 L('content/lambda-calculus/church-rosser/parallel-beta-eta-reduction.tex',11,11,11,11,'Parallel $\\beta\\eta$-reduction','సమాంతర $\\beta\\eta$-తగ్గింపు'),
 L('content/lambda-calculus/church-rosser/parallel-beta-eta-reduction.tex',45,46,45,46,'$\\beta\\eta$-complete development','$\\beta\\eta$-సంపూర్ణ వికాసం'),
 L('content/lambda-calculus/church-rosser/beta-eta-reduction.tex',16,18,15,18,'$M \\beredone M\'$','$M \\beredone M\'$'),
 L('content/lambda-calculus/church-rosser/beta-eta-reduction.tex',43,45,48,50,'smallest transitive relation','కనిష్ఠ సంక్రమణ సంబంధం')
];
locations['TE-T093']=[
 L('content/lambda-calculus/lambda-definability/lambda-definability.tex',8,8,8,8,'Lambda Definability','లాంబ్డాతో నిర్వచనీయత'),
 L('content/lambda-calculus/lambda-definability/introduction.tex',23,25,23,26,'Church numeral','చర్చ్ సంఖ్యాంకం'),
 L('content/lambda-calculus/lambda-definability/introduction.tex',55,59,59,64,'!!{lambda definable}','లాంబ్డాతో నిర్వచించదగిన'),
 L('content/lambda-calculus/lambda-definability/arithmetical-functions.tex',12,15,12,15,'successor function','ఉత్తరగామి ప్రమేయం'),
 L('content/lambda-calculus/lambda-definability/arithmetical-functions.tex',56,59,60,63,'addition function','సంకలన ప్రమేయం'),
 L('content/lambda-calculus/lambda-definability/arithmetical-functions.tex',89,94,96,101,'Multiplication','గుణకారం'),
 L('content/lambda-calculus/lambda-definability/arithmetical-functions.tex',125,127,137,140,'exponentiation','ఘాతాంకనాన్ని')
];
locations['TE-T094']=[
 L('content/lambda-calculus/lambda-definability/pairs.tex',10,10,10,10,'Pairs and Predecessor','క్రమయుగ్మాలు మరియు పూర్వవర్తి'),
 L('content/lambda-calculus/lambda-definability/pairs.tex',13,14,13,14,'The pair of','క్రమయుగ్మాన్ని'),
 L('content/lambda-calculus/lambda-definability/pairs.tex',38,39,40,41,'predecessor function','పూర్వవర్తి ప్రమేయాన్ని'),
 L('content/lambda-calculus/lambda-definability/pairs.tex',49,50,53,54,'Subtraction can be defined','తీసివేతను')
];
locations['TE-T095']=[
 L('content/lambda-calculus/lambda-definability/truth-values.tex',10,10,10,10,'Truth Values and Relations','సత్యమూల్యాలు మరియు సంబంధాలు'),
 L('content/lambda-calculus/lambda-definability/truth-values.tex',18,20,19,21,'\\emph{selectors}','\\emph{ఎంపిక ప్రమేయాలు}'),
 L('content/lambda-calculus/lambda-definability/truth-values.tex',25,26,27,28,'R \\subseteq \\Nat^n','R \\subseteq \\Nat^k'),
 L('content/lambda-calculus/lambda-definability/truth-values.tex',48,51,53,55,'negation and conjunction','నిషేధం, సంయోగం'),
 L('content/lambda-calculus/lambda-definability/truth-values.tex',73,75,81,84,'inclusive and exclusive disjunction','బహిష్కార వికల్పం')
];
locations['TE-T096']=[
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',10,10,10,10,'Primitive Recursive Functions','ఆదిమ పునరావృత్త ప్రమేయాలు'),
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',12,14,12,14,'primitive recursive functions','ఆదిమ పునరావృత్త ప్రమేయాలు'),
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',17,19,17,20,'projections','ప్రక్షేప ప్రమేయాలు'),
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',32,36,32,39,'composition','సంయుక్తం'),
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',63,70,62,82,'primitive','ఆదిమ పునరావృత్తి'),
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',84,89,93,99,'iteration state','క్రమయుగ్మాన్ని స్థితిగా'),
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',91,94,101,105,'induction','ఆగమనంతో'),
 L('content/lambda-calculus/lambda-definability/primitive-recursive-functions.tex',142,148,153,164,'closed under composition and primitive recursion','సంవృతమైనవి')
];
locations['TE-T097']=[
 L('content/lambda-calculus/lambda-definability/fixpoints.tex',11,11,11,11,'Fixpoints','స్థిరబిందువులు'),
 L('content/lambda-calculus/lambda-definability/fixpoints.tex',13,20,13,20,'factorial function','క్రమగుణిత ప్రమేయాన్ని'),
 L('content/lambda-calculus/lambda-definability/fixpoints.tex',21,22,21,22,'self-reference','స్వీయ-సూచన'),
 L('content/lambda-calculus/lambda-definability/fixpoints.tex',56,59,59,65,'fixpoint','స్థిరబిందువు'),
 L('content/lambda-calculus/lambda-definability/fixpoints.tex',67,69,73,76,'Y-combinator','Y-సంయోజకం'),
 L('content/lambda-calculus/lambda-definability/fixpoints.tex',102,107,113,118,'normal form','నియత రూపంలో'),
 L('content/lambda-calculus/lambda-definability/fixpoints.tex',157,164,168,178,"Church's combinator",'చర్చ్ సంయోజకం')
];
locations['TE-T098']=[
 L('content/lambda-calculus/lambda-definability/minimization.tex',10,10,10,10,'Minimization','కనిష్ఠీకరణ'),
 L('content/lambda-calculus/lambda-definability/minimization.tex',12,17,12,21,'regular minimization','సక్రమ ప్రమేయాలపై కనిష్ఠీకరణ'),
 L('content/lambda-calculus/lambda-definability/minimization.tex',19,25,23,31,'regular','సక్రమమై'),
 L('content/lambda-calculus/lambda-definability/partial-recursive-functions.tex',10,10,10,10,'Partial Recursive Functions','పాక్షిక పునరావృత్త ప్రమేయాలు'),
 L('content/lambda-calculus/lambda-definability/partial-recursive-functions.tex',12,17,12,18,'unbounded','అపరిమిత'),
 L('content/lambda-calculus/lambda-definability/partial-recursive-functions.tex',25,29,29,35,'normal form','నియత రూపం')
];
locations['TE-T099']=[
 L('content/lambda-calculus/lambda-definability/lambda-definable-recursive.tex',10,10,11,11,'Functions are Recursive','ప్రమేయాలు పునరావృత్తమైనవి'),
 L('content/lambda-calculus/lambda-definability/lambda-definable-recursive.tex',22,24,26,29,'arithmetize','అంకీకరిస్తాం'),
 L('content/lambda-calculus/lambda-definability/lambda-definable-recursive.tex',22,24,26,29,'power-of-primes','ప్రధాన సంఖ్యల'),
 L('content/lambda-calculus/lambda-definability/lambda-definable-recursive.tex',25,30,29,36,'\\fn{normalize}(t)','\\fn{normalize}(t)'),
 L('content/lambda-calculus/lambda-definability/lambda-definable-recursive.tex',28,30,33,36,'\\fn{toChurch}','\\fn{toChurch}'),
 L('content/lambda-calculus/lambda-definability/lambda-definable-recursive.tex',32,43,38,52,'\\fn{fromChurch}','\\fn{fromChurch}')
];
locations['TE-T100']=[
 L('content/many-valued-logic/many-valued-logic.tex',7,7,7,7,'Many-valued Logic','బహుమూల్య తర్కం'),
 L('content/many-valued-logic/many-valued-logic.tex',9,11,9,11,'propositional many-valued logics','ప్రతిజ్ఞావాక్యాత్మక బహుమూల్య తర్కాలపై'),
 L('content/many-valued-logic/syntax-and-semantics/syntax-and-semantics.tex',8,8,8,8,'Syntax and Semantics','వాక్యనిర్మాణం, అర్థవిచారం'),
 L('content/many-valued-logic/syntax-and-semantics/introduction.tex',11,11,11,11,'Introduction','పరిచయం'),
 L('content/many-valued-logic/syntax-and-semantics/introduction.tex',14,23,14,28,'two truth values','రెండు సత్యమూల్యాలను'),
 L('content/many-valued-logic/syntax-and-semantics/introduction.tex',25,32,30,39,'two-valued logic','ద్విమూల్య తర్కానికి'),
 L('content/many-valued-logic/syntax-and-semantics/introduction.tex',34,42,41,51,'truth functions','సత్యమూల్య ప్రమేయాలు'),
 L('content/many-valued-logic/syntax-and-semantics/introduction.tex',44,61,53,81,'rational numbers','కరణీయ సంఖ్యలను'),
 L('content/many-valued-logic/syntax-and-semantics/introduction.tex',53,56,65,70,'designated values','నిర్దేశిత సత్యమూల్యాల'),
 L('content/many-valued-logic/syntax-and-semantics/introduction.tex',57,61,72,81,'tautology','సర్వసత్యం')
];
locations['TE-T101']=[
 L('content/many-valued-logic/syntax-and-semantics/connectives.tex',11,11,11,11,'Languages and Connectives','భాషలు, సంయోజకాలు'),
 L('content/many-valued-logic/syntax-and-semantics/connectives.tex',47,52,51,57,'propositional language','ప్రతిజ్ఞావాక్య భాష'),
 L('content/many-valued-logic/syntax-and-semantics/connectives.tex',48,52,53,57,'arity','స్థానసంఖ్య'),
 L('content/many-valued-logic/syntax-and-semantics/connectives.tex',64,67,69,72,'product logic','గుణిత తర్కం'),
 L('content/many-valued-logic/syntax-and-semantics/connectives.tex',65,67,70,72,'determinateness operator','నిర్ణీతత్వ సంచాలకం'),
 L('content/many-valued-logic/syntax-and-semantics/formulas.tex',13,16,13,17,'Formula','సూత్రం'),
 L('content/many-valued-logic/syntax-and-semantics/matrices.tex',11,11,11,11,'Matrices','మాత్రికలు'),
 L('content/many-valued-logic/syntax-and-semantics/matrices.tex',18,27,18,29,'matrix','మాత్రిక'),
 L('content/many-valued-logic/syntax-and-semantics/matrices.tex',24,27,24,28,'truth','సత్యమూల్య ప్రమేయం')
];
locations['TE-T102']=[
 L('content/many-valued-logic/syntax-and-semantics/valuations-sat.tex',11,11,11,11,'Satisfaction','సంతృప్తి'),
 L('content/many-valued-logic/syntax-and-semantics/valuations-sat.tex',13,17,13,18,'valuation','సత్యమూల్య కేటాయింపు'),
 L('content/many-valued-logic/syntax-and-semantics/valuations-sat.tex',21,24,22,27,'evaluation function','మూల్యాంకన ప్రమేయం'),
 L('content/many-valued-logic/syntax-and-semantics/valuations-sat.tex',36,40,40,45,'satisfied','సంతృప్తమవడం'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',11,11,11,11,'Semantic Notions','అర్థపర భావనలు'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',18,20,18,21,'satisfiable','సంతృప్తిపరచదగినది'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',21,22,22,24,'tautology','సర్వసత్యం'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',23,25,25,29,'entails','అనుగమిస్తుంది'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',43,45,47,49,'Monotonicity','ఏకదిశత'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',46,49,50,53,'Transitivity','సంక్రమణశీలత'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',61,64,65,69,'modus ponens','మోడస్ పోనెన్స్'),
 L('content/many-valued-logic/syntax-and-semantics/semantic-notions.tex',65,68,69,73,'semantic deduction theorem','అర్థపర నిగమన సిద్ధాంతం'),
 L('content/many-valued-logic/syntax-and-semantics/sublogics.tex',11,11,11,11,'sublogics','ఉపతర్కాలుగా'),
 L('content/many-valued-logic/syntax-and-semantics/sublogics.tex',36,38,37,42,'for any valuation','ఏ సత్యమూల్య కేటాయింపు'),
 L('content/many-valued-logic/syntax-and-semantics/sublogics.tex',70,75,83,91,'every tautology','ప్రతి సర్వసత్యమూ')
];
locations['TE-T103']=[
 L('content/many-valued-logic/three-valued-logics/three-valued-logics.tex',8,8,8,8,'Three-valued Logics','మూడు-విలువల తర్కాలు'),
 L('content/many-valued-logic/three-valued-logics/introduction.tex',13,18,13,20,'three-valued logic','మూడు-విలువల తర్కం'),
 L('content/many-valued-logic/three-valued-logics/introduction.tex',17,18,17,20,'designated','నిర్దేశిత విలువ'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',11,11,11,11,'logic','తర్కం'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',13,20,13,20,'future contingent','భవిష్యత్తుపై ఆధారపడిన'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',22,40,21,43,'possible, but not necessary','సాధ్యమే, కాని తప్పనిసరి కాదు'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',41,57,45,65,'truth functions','సత్యమూల్య ప్రమేయాలను'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',59,75,67,84,'tautology','సర్వసత్యం'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',77,84,86,96,'matrix','మాత్రికతో'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',82,84,92,95,'designated value','నిర్దేశిత విలువ'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',121,126,139,146,'classical tautologies','సాంప్రదాయిక సర్వసత్యాలు'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',190,199,224,233,'relations hold','సంబంధాల్లో ఏవి'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',201,204,235,242,'logic of possibility','సంభావ్యత తర్కాన్ని'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',222,223,258,260,'possible','సాధ్యం'),
 L('content/many-valued-logic/three-valued-logics/lukasiewicz.tex',231,240,270,283,'modal logic','మోడల్ తర్కపు')
];
locations['TE-T104']=[
 L('content/many-valued-logic/three-valued-logics/kleene.tex',11,11,11,11,'Kleene logics','క్లీని తర్కాలు'),
 L('content/many-valued-logic/three-valued-logics/kleene.tex',15,17,13,18,'undefined','నిర్వచితం కాదు'),
 L('content/many-valued-logic/three-valued-logics/kleene.tex',31,35,35,40,'in parallel','సమాంతరంగా'),
 L('content/many-valued-logic/three-valued-logics/kleene.tex',46,46,53,54,'Strong Kleene logic','బలమైన క్లీని తర్కం'),
 L('content/many-valued-logic/three-valued-logics/kleene.tex',90,90,107,108,'Weak Kleene logic','బలహీనమైన క్లీని తర్కం'),
 L('content/many-valued-logic/three-valued-logics/goedel.tex',11,11,11,11,'G\\"odel logics','గోడెల్ తర్కాలు'),
 L('content/many-valued-logic/three-valued-logics/goedel.tex',13,15,13,18,'intuitionistic logic','అంతర్బోధవాద తర్కంలో'),
 L('content/many-valued-logic/three-valued-logics/multiple-designation.tex',20,20,22,23,'logic of paradox','వైరుధ్యాభాస తర్కం'),
 L('content/many-valued-logic/three-valued-logics/multiple-designation.tex',31,31,43,44,'logic of nonsense','అర్థరహిత తర్కం'),
 L('content/many-valued-logic/three-valued-logics/multiple-designation.tex',141,142,220,223,'paraconsistent','విస్ఫోటనరహిత'),
 L('content/many-valued-logic/three-valued-logics/multiple-designation.tex',162,162,251,255,'R-Mingle','ఆర్-మింగిల్'),
 L('content/many-valued-logic/three-valued-logics/multiple-designation.tex',22,23,25,28,'standard propositional language','ఉపభాష')
];
locations['TE-T105']=[
 L('content/many-valued-logic/infinite-valued-logics/infinite-valued-logics.tex',8,8,8,8,'Infinite-valued Logics','అనంత-విలువల తర్కాలు'),
 L('content/many-valued-logic/infinite-valued-logics/introduction.tex',14,16,14,17,'rational numbers','కరణీయ సంఖ్యల'),
 L('content/many-valued-logic/infinite-valued-logics/introduction.tex',19,21,20,23,'subsets','ఉపసమితులనూ'),
 L('content/many-valued-logic/infinite-valued-logics/introduction.tex',30,32,47,52,'\\emph{real}','\\emph{వాస్తవ}'),
 L('content/many-valued-logic/infinite-valued-logics/introduction.tex',32,32,50,52,'fuzzy','ఫజీ'),
 L('content/many-valued-logic/infinite-valued-logics/lukasiewicz.tex',18,19,18,21,'Infinite-valued','అనంత-విలువల'),
 L('content/many-valued-logic/infinite-valued-logics/lukasiewicz.tex',30,33,37,40,'\\tf{\\lif}[\\LogLuk]','\\tf{\\lif}[\\LogLuk]'),
 L('content/many-valued-logic/infinite-valued-logics/goedel.tex',17,18,18,21,'Infinite-valued','అనంత-విలువల'),
 L('content/many-valued-logic/infinite-valued-logics/goedel.tex',33,36,39,43,'\\tf{\\lif}[\\LogGod]','\\tf{\\lif}[\\LogGod]'),
 L('content/many-valued-logic/infinite-valued-logics/goedel.tex',112,115,137,144,'schema','పథకాన్ని'),
 L('content/many-valued-logic/infinite-valued-logics/goedel.tex',114,115,140,144,'Dummett','డమ్మెట్')
];
locations['TE-T106']=[
 L('content/many-valued-logic/sequent-calculus/sequent-calculus.tex',8,8,8,8,'Sequent Calculus','సీక్వెంట్ కలనం'),
 L('content/many-valued-logic/sequent-calculus/introduction.tex',13,18,13,18,'sequent calculus','సీక్వెంట్ కలనం'),
 L('content/many-valued-logic/sequent-calculus/rules-and-proofs.tex',16,22,16,23,'n$-sided sequent','వైపుల సీక్వెంట్'),
 L('content/many-valued-logic/sequent-calculus/rules-and-proofs.tex',36,42,46,57,'logical rule','తార్కిక నియమం'),
 L('content/many-valued-logic/sequent-calculus/structural-rules.tex',11,11,11,11,'Structural Rules','నిర్మాణాత్మక నియమాలు'),
 L('content/many-valued-logic/sequent-calculus/propositional-rules.tex',11,11,11,11,'Propositional Rules','ప్రతిజ్ఞావాక్య నియమాలు'),
 L('content/many-valued-logic/sequent-calculus/propositional-rules.tex',141,141,149,150,'strong Kleene logic','బలమైన క్లీని తర్కంలో'),
 L('content/many-valued-logic/sequent-calculus/propositional-rules.tex',232,232,242,243,'Example','ఉదాహరణ')
];
locations['TE-T107']=[
 L('content/normal-modal-logic/normal-modal-logic.tex',7,7,7,7,'Normal Modal Logics','నార్మల్ మోడల్ తర్కాలు'),
 L('content/normal-modal-logic/syntax-and-semantics/introduction.tex',13,14,13,14,'modal propositions','మోడల్ ప్రతిజ్ఞావాక్యాలను'),
 L('content/normal-modal-logic/syntax-and-semantics/introduction.tex',66,66,88,88,'accessibility relation','ప్రాప్యత సంబంధం'),
 L('content/normal-modal-logic/syntax-and-semantics/introduction.tex',86,86,120,120,'correspondence theory','అనురూపతా సిద్ధాంతం'),
 L('content/normal-modal-logic/syntax-and-semantics/language-modal-logic.tex',11,11,11,11,'Basic Modal Logic','మౌలిక మోడల్ తర్కపు భాష'),
 L('content/normal-modal-logic/syntax-and-semantics/language-modal-logic.tex',105,105,141,141,'modal-free','మోడల్-రహిత సూత్రం')
];
locations['TE-T108']=[
 L('content/normal-modal-logic/syntax-and-semantics/substitution.tex',11,11,11,11,'Simultaneous Substitution','ఏకకాల ప్రతిస్థాపన'),
 L('content/normal-modal-logic/syntax-and-semantics/substitution.tex',71,71,96,96,'substitution instance','ప్రతిస్థాపన నిదర్శనం'),
 L('content/normal-modal-logic/syntax-and-semantics/relational-models.tex',11,11,11,11,'Relational Models','సంబంధాత్మక నమూనాలు'),
 L('content/normal-modal-logic/syntax-and-semantics/relational-models.tex',15,15,16,16,'accessibility relation','ప్రాప్యత సంబంధం'),
 L('content/normal-modal-logic/syntax-and-semantics/truth-at-w.tex',11,11,11,11,'Truth at a World','ఒక లోకంలో సత్యం'),
 L('content/normal-modal-logic/syntax-and-semantics/truth-at-w.tex',48,48,75,75,'vacuously','శూన్యసందర్భ సత్యం'),
 L('content/normal-modal-logic/syntax-and-semantics/truth-in-model.tex',9,9,9,9,'Truth in a Model','ఒక నమూనాలో సత్యం')
];
locations['TE-T109']=[
 L('content/normal-modal-logic/syntax-and-semantics/modal-validity.tex',11,11,11,11,'Validity','చెల్లుబాటుతనం'),
 L('content/normal-modal-logic/syntax-and-semantics/modal-validity.tex',29,30,31,31,'reflexive','స్వావర్తనమైన'),
 L('content/normal-modal-logic/syntax-and-semantics/modal-validity.tex',36,36,39,40,'\\emph{valid}','చెల్లుబాటవుతుంది'),
 L('content/normal-modal-logic/syntax-and-semantics/modal-validity.tex',50,50,55,55,'then so is','కూడా చెల్లుబాటవుతుంది')
];
locations['TE-T110']=[
 L('content/normal-modal-logic/syntax-and-semantics/tautological-instances.tex',11,11,11,11,'Tautological Instances','సర్వసత్య ప్రతిస్థాపన నిదర్శనాలు'),
 L('content/normal-modal-logic/syntax-and-semantics/tautological-instances.tex',14,15,14,15,'modal-free formula','మోడల్ సంచాలకాలు లేని సూత్రం'),
 L('content/normal-modal-logic/syntax-and-semantics/tautological-instances.tex',27,28,32,36,'tautological instance','సర్వసత్య ప్రతిస్థాపన నిదర్శనం'),
 L('content/normal-modal-logic/syntax-and-semantics/tautological-instances.tex',37,37,50,50,'assignment','కేటాయింపు'),
 L('content/normal-modal-logic/syntax-and-semantics/tautological-instances.tex',46,46,61,61,'By induction','ఆగమనంతో'),
 L('content/normal-modal-logic/syntax-and-semantics/tautological-instances.tex',147,147,176,176,'All tautological instances','ప్రతి సర్వసత్య ప్రతిస్థాపన నిదర్శనం')
];
locations['TE-T111']=[
 L('content/normal-modal-logic/syntax-and-semantics/schemas.tex',11,11,11,11,'Schemas and Validity','పథకాలు మరియు చెల్లుబాటుతనం'),
 L('content/normal-modal-logic/syntax-and-semantics/schemas.tex',14,15,14,17,'schema','పథకం'),
 L('content/normal-modal-logic/syntax-and-semantics/schemas.tex',20,22,22,27,'characteristic','లక్షణ సూత్రం'),
 L('content/normal-modal-logic/syntax-and-semantics/schemas.tex',35,36,41,44,'true','సత్యం'),
 L('content/normal-modal-logic/syntax-and-semantics/schemas.tex',41,43,48,50,'K','K'),
 L('content/normal-modal-logic/syntax-and-semantics/schemas.tex',77,78,91,93,'modus ponens','మోడస్ పోనెన్స్')
];
locations['TE-T112']=[
 L('content/normal-modal-logic/syntax-and-semantics/entailment.tex',11,11,11,11,'Entailment','అర్థపర అనుగమనం'),
 L('content/normal-modal-logic/syntax-and-semantics/entailment.tex',14,16,14,18,'entailment','అర్థపర అనుగమన'),
 L('content/normal-modal-logic/syntax-and-semantics/entailment.tex',22,27,23,30,'entails','అర్థపరంగా అనుగమిస్తుంది'),
 L('content/normal-modal-logic/syntax-and-semantics/entailment.tex',45,48,53,57,'counterexample','ప్రతిదృష్టాంతం'),
 L('content/normal-modal-logic/syntax-and-semantics/entailment.tex',68,73,81,99,'counterexamples','ప్రతిదృష్టాంతాలు')
];
locations['TE-T113']=[
 L('content/normal-modal-logic/frame-definability/frame-definability.tex',8,8,8,8,'Frame Definability','చట్రాల నిర్వచనీయత'),
 L('content/normal-modal-logic/frame-definability/introduction.tex',13,16,13,17,'accessibility relation','ప్రాప్యత సంబంధం'),
 L('content/normal-modal-logic/frame-definability/introduction.tex',25,30,28,37,'non-reflexive','స్వావర్తనం కాని'),
 L('content/normal-modal-logic/frame-definability/introduction.tex',44,48,58,64,'frames','చట్రాలు'),
 L('content/normal-modal-logic/frame-definability/introduction.tex',49,53,64,72,'based on','ఆధారపడే'),
 L('content/normal-modal-logic/frame-definability/introduction.tex',55,57,74,78,'correspondence','అనురూపతా'),
 L('content/normal-modal-logic/frame-definability/frames.tex',14,17,14,19,'frame','చట్రం'),
 L('content/normal-modal-logic/frame-definability/frames.tex',21,23,23,26,'valid in','చెల్లుబాటు'),
 L('content/normal-modal-logic/frame-definability/frames.tex',25,27,28,31,'valid in','చెల్లుబాటు')
];
locations['TE-T114']=[
 L('content/normal-modal-logic/frame-definability/properties-accessibility.tex',11,11,11,11,'Properties of Accessibility Relations','ప్రాప్యత సంబంధాల ధర్మాలు'),
 L('content/normal-modal-logic/frame-definability/properties-accessibility.tex',31,31,33,33,'serial','సీరియల్'),
 L('content/normal-modal-logic/frame-definability/properties-accessibility.tex',38,38,40,40,'symmetric','సౌష్ఠవ'),
 L('content/normal-modal-logic/frame-definability/properties-accessibility.tex',128,132,150,155,'partially functional','పాక్షిక ప్రమేయాత్మక'),
 L('content/normal-modal-logic/frame-definability/properties-accessibility.tex',134,135,157,160,'weakly dense','బలహీన సాంద్ర'),
 L('content/normal-modal-logic/frame-definability/properties-accessibility.tex',140,143,165,169,'weakly directed','బలహీన సహగమ్య')
];
locations['TE-T115']=[
 L('content/normal-modal-logic/frame-definability/definability.tex',11,11,11,11,'Frame Definability','చట్రాల నిర్వచనీయత'),
 L('content/normal-modal-logic/frame-definability/definability.tex',22,24,23,27,'defines','నిర్వచిస్తుంది'),
 L('content/normal-modal-logic/frame-definability/definability.tex',30,34,33,37,'tab:five','tab:five'),
 L('content/normal-modal-logic/frame-definability/definability.tex',95,98,131,139,'serial','సీరియల్'),
 L('content/normal-modal-logic/frame-definability/definability.tex',135,140,185,194,'S4','S4'),
 L('content/normal-modal-logic/frame-definability/definability.tex',143,148,195,205,'entailment','అనుగమనం')
 ,L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',89,92,98,104,'logic of universal frames','సార్వత్రిక చట్రాల')
];
locations['TE-T116']=[
 L('content/normal-modal-logic/frame-definability/first-order-definability.tex',11,11,11,11,'First-order Definability','మొదటిస్థాయి నిర్వచనీయత'),
 L('content/normal-modal-logic/frame-definability/first-order-definability.tex',25,29,28,36,'first-order definable','మొదటిస్థాయి'),
 L('content/normal-modal-logic/frame-definability/first-order-definability.tex',38,43,46,53,'formula:','లొబ్ సూత్రం'),
 L('content/normal-modal-logic/frame-definability/first-order-definability.tex',42,47,50,58,'well-founded','సుస్థాపిత'),
 L('content/normal-modal-logic/frame-definability/first-order-definability.tex',68,68,86,86,'Compactness Theorem','సంహతత్వ సిద్ధాంతం'),
 L('content/normal-modal-logic/frame-definability/first-order-definability.tex',76,78,95,99,'universality','సార్వత్రికత')
];
locations['TE-T117']=[
 L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',11,11,11,11,'Equivalence Relations','తుల్యతా సంబంధాలు'),
 L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',23,26,26,30,'equivalence relation','తుల్యతా సంబంధం'),
 L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',38,45,43,50,'equivalent','సమానార్థకాలు'),
 L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',70,74,76,82,'universal','సార్వత్రిక'),
 L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',77,84,85,94,'equivalence class','తుల్యతా వర్గం'),
 L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',89,92,97,104,'valid in all frames','అన్ని చట్రాలు'),
 L('content/normal-modal-logic/frame-definability/equivalence-S5.tex',99,115,112,135,'contrapositively','వ్యతిరేక ప్రతిజ్ఞను')
];
locations['TE-T118']=[
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',11,11,11,11,'Second-order Definability','ద్వితీయ-స్థాయి నిర్వచనీయత'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',14,16,14,16,'monadic second-order quantification','ఏకస్థానిక ద్వితీయ-స్థాయి పరిమాణీకరణను'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',18,23,20,28,'standard translation','ప్రామాణిక అనువాదం'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',26,26,30,31,'standard translation','ప్రామాణిక అనువాదం'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',56,58,65,68,'satisfaction','సంతృప్తి'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',73,89,84,101,'second-order formula','ద్వితీయ-స్థాయి సూత్రం'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',100,109,116,127,'second-order definable','ద్వితీయ-స్థాయి'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',117,127,140,152,'monadic second-order','ఏకస్థానిక ద్వితీయ-స్థాయి'),
 L('content/normal-modal-logic/frame-definability/second-order-definability.tex',150,153,184,191,'no effective method','ప్రభావవంతమైన')
];
locations['TE-T119']=[
 L('content/normal-modal-logic/axioms-systems/axioms-systems.tex',8,8,8,8,'Axiomatic','స్వీకృతాధారిత'),
 L('content/normal-modal-logic/axioms-systems/introduction.tex',23,24,27,29,'Hilbert-type','హిల్బర్ట్-రకం'),
 L('content/normal-modal-logic/axioms-systems/introduction.tex',17,20,20,24,'derivability','వ్యుత్పాద్యత'),
 L('content/normal-modal-logic/axioms-systems/introduction.tex',37,40,44,46,'modus','మోడస్ పోనెన్స్'),
 L('content/normal-modal-logic/axioms-systems/introduction.tex',59,66,68,76,'necessitation','అవశ్యకీకరణ'),
 L('content/normal-modal-logic/axioms-systems/introduction.tex',70,78,80,91,'derivation','వ్యుత్పత్తి'),
 L('content/normal-modal-logic/axioms-systems/introduction.tex',85,88,97,102,'soundness','నిర్దుష్టత')
];
locations['TE-T120']=[
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',11,11,11,11,'Normal Modal Logics','నార్మల్ మోడల్ తర్కాలు'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',24,27,26,30,'modal logic','మోడల్ తర్కం'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',27,31,30,34,'substitution','ప్రతిస్థాపన'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',37,43,39,51,'normal','నార్మల్'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',47,54,53,61,'necessitation','అవశ్యకీకరణ'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',63,68,70,76,'rule \\RK','\\RK'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',101,105,110,114,'smallest modal logic','అతి చిన్న మోడల్'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',108,113,117,131,'intersection of all normal','అన్ని మోడల్ తర్కాల'),
 L('content/normal-modal-logic/axioms-systems/normal-logics.tex',116,118,135,138,'modal system','మోడల్ వ్యవస్థ')
];
locations['TE-T121']=[
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',11,11,11,11,'Modal Systems','మోడల్ వ్యవస్థలు'),
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',13,18,13,21,'derivation','వ్యుత్పత్తి'),
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',23,32,25,38,'derivable','వ్యుత్పాదించదగినది'),
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',35,38,41,42,'derivation','వ్యుత్పత్తి'),
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',43,45,49,51,'induction','ఆగమనం'),
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',55,64,62,74,'modus ponens','మోడస్ పోనెన్స్'),
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',78,86,92,101,'uniform substitution','ఏకరీతి ప్రతిస్థాపన'),
 L('content/normal-modal-logic/axioms-systems/logics-proofs.tex',87,87,102,105,'$K \\in \\Sigma$','కనుక $\\Ax{K} \\in \\Sigma$')
];
locations['TE-T122']=[
 L('content/normal-modal-logic/axioms-systems/proofs-in-K.tex',11,11,11,11,'Proofs in','నిరూపణలు'),
 L('content/normal-modal-logic/axioms-systems/proofs-in-K.tex',13,16,13,16,'smallest modal system','అతి చిన్న మోడల్ వ్యవస్థలో'),
 L('content/normal-modal-logic/axioms-systems/proofs-in-K.tex',55,56,55,56,'instance of the tautology','ప్రతిస్థాపన నిదర్శనమని'),
 L('content/normal-modal-logic/axioms-systems/proofs-in-K.tex',82,84,83,85,'instances of the tautologies','ప్రతిస్థాపన నిదర్శనాలు'),
 L('content/normal-modal-logic/axioms-systems/proofs-in-K.tex',112,114,114,116,'instances of the tautologies','ప్రతిస్థాపన నిదర్శనాలు'),
 L('content/normal-modal-logic/axioms-systems/proofs-in-K.tex',127,129,130,133,'is defined as','నిర్వచించాం'),
 L('content/normal-modal-logic/axioms-systems/proofs-in-K.tex',151,151,154,156,'derivation','వ్యుత్పత్తులను')
];
locations['TE-T123']=[
 L('content/normal-modal-logic/axioms-systems/derived-rules.tex',11,11,11,11,'Derived Rules','వ్యుత్పన్న నియమాలు'),
 L('content/normal-modal-logic/axioms-systems/derived-rules.tex',13,16,13,18,'Finding and writing','కనుగొని రాయడం'),
 L('content/normal-modal-logic/axioms-systems/derived-rules.tex',32,40,37,45,'propositional logic','ప్రతిజ్ఞావాక్య తర్కం'),
 L('content/normal-modal-logic/axioms-systems/derived-rules.tex',55,55,61,61,'induction on','ఆగమనం ద్వారా'),
 L('content/normal-modal-logic/axioms-systems/derived-rules.tex',73,75,81,85,'\\Subst{!C}{B}{q}','\\Subst{!C}{!B}{q}'),
 L('content/normal-modal-logic/axioms-systems/derived-rules.tex',88,99,100,114,'whenever we re-write','తిరిగి రాసినప్పుడు'),
 L('content/normal-modal-logic/axioms-systems/derived-rules.tex',149,161,167,186,'substitution instance of','ప్రతిస్థాపన నిదర్శనమై')
];
locations['TE-T124']=[
 L('content/normal-modal-logic/axioms-systems/more-proofs-in-K.tex',11,11,11,11,'More Proofs','మరిన్ని నిరూపణలు'),
 L('content/normal-modal-logic/axioms-systems/more-proofs-in-K.tex',13,14,13,15,'more examples','మరికొన్ని ఉదాహరణలను'),
 L('content/normal-modal-logic/axioms-systems/more-proofs-in-K.tex',29,29,30,30,'\\Diamond$ for','స్థానంలో $\\Diamond$'),
 L('content/normal-modal-logic/axioms-systems/more-proofs-in-K.tex',62,62,63,63,'similarly','అదే విధంగా'),
 L('content/normal-modal-logic/axioms-systems/more-proofs-in-K.tex',85,85,86,86,'\\PL, 6','\\PL, 6'),
 L('content/normal-modal-logic/axioms-systems/more-proofs-in-K.tex',90,90,95,97,'derivability','వ్యుత్పాద్యత')
];
locations['TE-T125']=[
 L('content/normal-modal-logic/axioms-systems/duals.tex',11,11,11,11,'Dual','ద్వంద్వ'),
 L('content/normal-modal-logic/axioms-systems/duals.tex',14,16,13,16,'\\emph{dual}','\\emph{ద్వంద్వ సూత్రం}'),
 L('content/normal-modal-logic/axioms-systems/duals.tex',25,29,25,29,'contraposing','ప్రతిలోమం'),
 L('content/normal-modal-logic/axioms-systems/duals.tex',28,29,29,30,'its own dual','తనకుతానే ద్వంద్వం'),
 L('content/normal-modal-logic/axioms-systems/duals.tex',32,34,32,35,'For each','ప్రతి'),
 L('content/normal-modal-logic/axioms-systems/duals.tex',39,39,41,41,'Prove','నిరూపించండి')
];
locations['TE-T126']=[
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',11,11,11,11,'Proofs in Modal Systems','మోడల్ వ్యవస్థల్లో నిరూపణలు'),
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',13,13,13,14,'other than','కాకుండా'),
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',16,16,17,17,'provability results','నిరూపణీయత ఫలితాలు'),
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',39,39,40,40,'with $\\Box!A$ for $p$','$p$ స్థానంలో $\\Box!A$ను'),
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',85,86,86,87,'Following tradition','సాంప్రదాయాన్ని అనుసరించి'),
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',89,92,90,93,'equivalent axiomatizations','తుల్య స్వీకృతీకరణలు'),
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',91,92,92,93,'equivalence relations','తుల్యతా సంబంధాలనే'),
 L('content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex',103,103,104,104,'Prove','నిరూపించండి')
];
locations['TE-T127']=[
 L('content/normal-modal-logic/axioms-systems/soundness.tex',11,11,11,11,'Soundness','నిర్దుష్టత'),
 L('content/normal-modal-logic/axioms-systems/soundness.tex',13,14,13,15,'system is called sound','నిర్దుష్టమైనదని'),
 L('content/normal-modal-logic/axioms-systems/soundness.tex',20,20,22,22,'Soundness Theorem','నిర్దుష్టతా సిద్ధాంతం'),
 L('content/normal-modal-logic/axioms-systems/soundness.tex',28,30,31,32,'induction on length of proofs','నిరూపణల పొడవుపై ఆగమనం'),
 L('content/normal-modal-logic/axioms-systems/soundness.tex',51,53,60,70,'\\Nec{}','\\Nec{}')
];
locations['TE-T128']=[
 L('content/normal-modal-logic/axioms-systems/systems-distinct.tex',11,11,11,11,'Systems are Distinct','వ్యవస్థలు భిన్నమైనవని'),
 L('content/normal-modal-logic/axioms-systems/systems-distinct.tex',13,17,13,17,'are distinct','భిన్నమైనవని'),
 L('content/normal-modal-logic/axioms-systems/systems-distinct.tex',29,33,32,36,'inclusion is proper','చేరిక నిజమైనదని'),
 L('content/normal-modal-logic/axioms-systems/systems-distinct.tex',41,43,44,47,'symmetric model','సౌష్ఠవ నమూనాను'),
 L('content/normal-modal-logic/axioms-systems/systems-distinct.tex',65,66,69,70,'\\Log{4}','\\Ax{4}'),
 L('content/normal-modal-logic/axioms-systems/systems-distinct.tex',139,139,147,147,'The model for','కోసం ఉపయోగించిన నమూనా'),
 L('content/normal-modal-logic/axioms-systems/systems-distinct.tex',149,150,157,158,'reflexive transitive model','స్వావర్తన, సంక్రామక నమూనాను')
];
locations['TE-T129']=[
 L('content/normal-modal-logic/axioms-systems/provability-from-set.tex',11,11,11,11,'from a Set of','సమితి నుంచి'),
 L('content/normal-modal-logic/axioms-systems/provability-from-set.tex',13,15,13,17,'provability','నిరూపణీయతను'),
 L('content/normal-modal-logic/axioms-systems/provability-from-set.tex',17,22,19,27,'!!{derivable}','వ్యుత్పాదించదగినది'),
 L('content/normal-modal-logic/axioms-systems/provability-from-set.tex',19,22,23,26,'\\Gamma \\Proves[\\Sigma] !A','\\Gamma \\Proves[\\Sigma] !A')
];
locations['TE-T130']=[
 L('content/normal-modal-logic/axioms-systems/provability-properties.tex',11,11,11,11,'Properties of','లక్షణాలు'),
 L('content/normal-modal-logic/axioms-systems/provability-properties.tex',17,19,17,19,'Monotonicity','ఏకదిశత'),
 L('content/normal-modal-logic/axioms-systems/provability-properties.tex',20,22,20,22,'Reflexivity','స్వావర్తనత్వం'),
 L('content/normal-modal-logic/axioms-systems/provability-properties.tex',23,25,23,25,'Cut','కట్'),
 L('content/normal-modal-logic/axioms-systems/provability-properties.tex',26,28,26,28,'Deduction theorem','నిగమన సిద్ధాంతం'),
 L('content/normal-modal-logic/axioms-systems/provability-properties.tex',29,33,29,33,'tautological instance','సర్వసత్య నిదర్శనమైతే'),
 L('content/normal-modal-logic/axioms-systems/provability-properties.tex',44,48,45,49,'deductively closed','నిగమన పరంగా సంవృతం')
];
locations['TE-T131']=[
 L('content/normal-modal-logic/axioms-systems/consistency.tex',11,11,11,11,'Consistency','అవైరుధ్యం'),
 L('content/normal-modal-logic/axioms-systems/consistency.tex',13,19,13,25,'inconsistent','విరుద్ధం'),
 L('content/normal-modal-logic/axioms-systems/consistency.tex',17,19,23,25,'canonical','కానానికల్'),
 L('content/normal-modal-logic/axioms-systems/consistency.tex',21,25,27,31,'consistent','అవిరుద్ధం'),
 L('content/normal-modal-logic/axioms-systems/consistency.tex',27,30,33,36,'consistent relatively to propositional logic','ప్రతిజ్ఞావాక్య తర్కానికి సాపేక్షంగా అవిరుద్ధం'),
 L('content/normal-modal-logic/axioms-systems/consistency.tex',32,47,38,53,'some !!{formula}','సూత్రం'),
 L('content/normal-modal-logic/axioms-systems/consistency.tex',49,62,55,73,'contrapositively','విపర్యయంగా')
];
locations['TE-T132']=[
 L('content/normal-modal-logic/completeness/completeness.tex',8,8,8,8,'Completeness and Canonical Models','సంపూర్ణత మరియు కానానికల్ నమూనాలు'),
 L('content/normal-modal-logic/completeness/introduction.tex',13,19,13,21,'soundness theorem','నిర్దుష్టతా సిద్ధాంతం'),
 L('content/normal-modal-logic/completeness/introduction.tex',21,36,23,39,'countermodel','ప్రతినమూనా'),
 L('content/normal-modal-logic/completeness/introduction.tex',38,47,41,51,'\\Proves/[\\Sigma] \\lnot !A','\\Proves/[\\Sigma] \\lnot !A'),
 L('content/normal-modal-logic/completeness/introduction.tex',49,62,53,66,'complete','సంపూర్ణ'),
 L('content/normal-modal-logic/completeness/introduction.tex',64,71,68,77,'canonical','కానానికల్')
];
locations['TE-T133']=[
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',11,11,11,11,'Complete','సంపూర్ణ'),
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',13,22,13,24,'maximally so','గరిష్ఠ'),
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',24,28,26,30,'complete','సంపూర్ణ'),
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',30,36,32,39,'deductively closed','నిగమన పరంగా సంవృతం'),
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',49,60,52,67,'if and only if','అయితే, అప్పుడు మాత్రమే'),
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',83,85,89,97,'$!A \\in \\Gamma$','$\\lnot!A \\in \\Gamma$'),
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',96,102,107,120,'tautological instance','సర్వసత్య నిదర్శనం'),
 L('content/normal-modal-logic/completeness/complete-consistent-sets.tex',122,129,140,165,'$!A \\lif !B \\notin \\Gamma$','$!A \\liff !B \\notin \\Gamma$')
];
locations['TE-T134']=[
 L('content/normal-modal-logic/completeness/lindenbaums-lemma.tex',11,11,11,11,"Lindenbaum's Lemma",'లిండెన్‌బామ్ ఉపసిద్ధాంతం'),
 L('content/normal-modal-logic/completeness/lindenbaums-lemma.tex',13,19,13,21,'canonical model','కానానికల్ నమూనా'),
 L('content/normal-modal-logic/completeness/lindenbaums-lemma.tex',21,24,23,26,'extending','విస్తరించే'),
 L('content/normal-modal-logic/completeness/lindenbaums-lemma.tex',27,43,29,53,'exhaustive listing','సమగ్ర జాబితా'),
 L('content/normal-modal-logic/completeness/lindenbaums-lemma.tex',49,59,59,71,'complete by','సంపూర్ణం'),
 L('content/normal-modal-logic/completeness/lindenbaums-lemma.tex',66,73,78,86,'largest of','అతి పెద్దదాన్ని'),
 L('content/normal-modal-logic/completeness/lindenbaums-lemma.tex',87,104,102,122,'if and only if','అయితే, అప్పుడు మాత్రమే')
];
locations['TE-T135']=[
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',11,11,11,11,'Modalities','మోడల్ సంయోజకాలు'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',13,20,13,21,'accessibility relation','ప్రాప్యత సంబంధం'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',22,59,23,67,'truth at','సత్యం'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',63,85,71,95,'\\Box\\Gamma','\\Box\\Gamma'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',87,100,97,115,'by rule \\RK','\\RK{} నియమం'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',102,112,116,131,'\\Box\\Box^{-1}\\Gamma','\\Box\\Box^{-1}\\Gamma'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',117,139,136,161,'complete','సంపూర్ణ'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',144,175,164,201,'\\Diamond\\Delta','\\Diamond\\Delta'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',179,201,204,230,'if and','అయితే, అప్పుడు మాత్రమే'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',209,231,236,264,'by \\Dual','\\Dual{}'),
 L('content/normal-modal-logic/completeness/modalities-ccs.tex',235,244,267,278,'Do this without using','ఉపయోగించవద్దు')
];
locations['TE-T136']=[
 L('content/normal-modal-logic/completeness/canonical-models.tex',11,11,11,11,'Canonical Models','కానానికల్ నమూనాలు'),
 L('content/normal-modal-logic/completeness/canonical-models.tex',13,18,13,19,'canonical model','కానానికల్ నమూనా'),
 L('content/normal-modal-logic/completeness/canonical-models.tex',20,32,21,33,'\\tuple{W^\\Sigma','\\tuple{W^\\Sigma'),
 L('content/normal-modal-logic/completeness/canonical-models.tex',24,30,26,31,'\\Box^{-1}\\Delta','\\Box^{-1}\\Delta')
];
locations['TE-T137']=[
 L('content/normal-modal-logic/completeness/truth-lemma.tex',11,11,11,11,'The Truth Lemma','సత్య ఉపసిద్ధాంతం'),
 L('content/normal-modal-logic/completeness/truth-lemma.tex',13,20,13,25,'induction','ఆగమనంతో'),
 L('content/normal-modal-logic/completeness/truth-lemma.tex',22,27,27,32,'\\mSat{M^\\Sigma}{!A}','\\mSat{M^\\Sigma}{!A}'),
 L('content/normal-modal-logic/completeness/truth-lemma.tex',28,90,34,104,'inductive hypothesis','ఆగమన పరికల్పన'),
 L('content/normal-modal-logic/completeness/truth-lemma.tex',91,113,105,130,'\\olref[mod]{prop:box}','\\olref[mod]{prop:box}'),
 L('content/normal-modal-logic/completeness/truth-lemma.tex',114,139,131,173,'\\olref[mod]{lem:box-iff-diamond}','\\olref[mod]{lem:box-iff-diamond}'),
 L('content/normal-modal-logic/completeness/truth-lemma.tex',143,145,175,180,'proband','probAnd')
];
locations['TE-T138']=[
 L('content/normal-modal-logic/completeness/completeness-K.tex',11,11,11,11,'Determination','నిర్ణాయకత్వం'),
 L('content/normal-modal-logic/completeness/completeness-K.tex',13,17,13,18,'determine','నిర్ణయిస్తాయి'),
 L('content/normal-modal-logic/completeness/completeness-K.tex',19,23,20,25,'determines','నిర్ణయిస్తుంది'),
 L('content/normal-modal-logic/completeness/completeness-K.tex',25,42,27,47,'\\mSat{M^\\Sigma}{!A}','\\mSat{M^\\Sigma}{!A}'),
 L('content/normal-modal-logic/completeness/completeness-K.tex',44,56,49,62,'complete','సంపూర్ణ'),
 L('content/normal-modal-logic/completeness/completeness-K.tex',58,63,64,70,'class of models','నమూనా వర్గానికి')
];
locations['TE-T139']=[
 L('content/normal-modal-logic/completeness/frame-completeness.tex',11,11,11,11,'Frame Completeness','ఫ్రేమ్ సంపూర్ణత'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',13,22,13,22,'frame property','ఫ్రేమ్ ధర్మం'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',24,44,24,44,'euclidean','యూక్లిడియన్'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',49,64,49,66,'\\Box^{-1}\\Delta','\\Box^{-1}\\Delta'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',66,110,68,122,'\\Ax{5}','\\Ax{5}'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',117,127,129,140,'class of models','నమూనాల వర్గం'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',129,141,142,155,'partially functional','పాక్షిక ప్రమేయాత్మకమైనది'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',166,225,180,251,'weakly dense','బలహీన సాంద్రత గలదని'),
 L('content/normal-modal-logic/completeness/frame-completeness.tex',227,231,253,257,'not complete','సంపూర్ణం కాని')
];
locations['TE-T140']=[
 L('content/normal-modal-logic/filtrations/filtrations.tex',8,8,8,8,'Filtrations and Decidability','వడపోతలు మరియు నిర్ణేయత')
];
locations['TE-T141']=[
 L('content/normal-modal-logic/filtrations/introduction.tex',11,11,11,11,'Introduction','పరిచయం'),
 L('content/normal-modal-logic/filtrations/introduction.tex',13,31,13,35,'decidable','నిర్ణయించదగినదేనా'),
 L('content/normal-modal-logic/filtrations/introduction.tex',33,42,37,47,'finite frames','పరిమిత ఫ్రేమ్‌లను'),
 L('content/normal-modal-logic/filtrations/introduction.tex',44,51,49,58,'finite model property','పరిమిత నమూనా ధర్మం'),
 L('content/normal-modal-logic/filtrations/introduction.tex',53,67,60,75,'maximum size','గరిష్ఠ'),
 L('content/normal-modal-logic/filtrations/introduction.tex',69,85,77,100,'partitions','విభాగాల'),
 L('content/normal-modal-logic/filtrations/introduction.tex',87,108,102,152,'equivalent','తుల్యమని'),
 L('content/normal-modal-logic/filtrations/introduction.tex',110,126,154,174,'filtration','వడపోత')
];
locations['TE-T142']=[
 L('content/normal-modal-logic/filtrations/preliminaries.tex',11,11,11,11,'Preliminaries','ప్రాథమిక విషయాలు'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',13,18,13,20,'finite model','పరిమిత నమూనా'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',20,26,22,30,'modally closed','మోడల్ సంయోజకాల పరంగా సంవృతం'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',28,32,32,40,'sub-!!{formula}s','ఉపసూత్రాల'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',34,36,42,44,'equivalence classes','తుల్యతా వర్గాల'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',38,51,46,63,'u \\equiv v','u \\equiv v'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',53,57,65,69,'equivalence relation','తుల్యతా సంబంధం'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',59,66,71,84,'transitive','సంక్రామకం'),
 L('content/normal-modal-logic/filtrations/preliminaries.tex',68,74,86,95,'pairwise disjoint','జతలవారీగా వియుక్తం')
];
locations['TE-T143']=[
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',11,11,11,11,'Filtrations','వడపోతలు'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',13,21,13,23,'different filtrations','వేర్వేరు వడపోతల్లో'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',23,43,25,48,'filtration','వడపోత'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',45,53,50,59,'not necessarily','తప్పనిసరి కాదు'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',55,59,61,67,'for every','ప్రతి'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',61,79,69,95,'induction hypothesis','ఆగమన పరికల్పన'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',81,119,97,151,'Exercise.','వ్యాయామం.'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',121,148,153,182,'Conversely','తిరిగి'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',152,154,186,188,'Complete the proof','నిరూపణను పూర్తి చేయండి'),
 L('content/normal-modal-logic/filtrations/filtrations-def.tex',156,170,190,209,'class of models','నమూనాల వర్గం')
];
locations['TE-T144']=[
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',11,11,11,11,'Examples of Filtrations','వడపోతల ఉదాహరణలు'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',13,20,13,23,'finest','అత్యంత సూక్ష్మ'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',22,29,25,33,'finest','అత్యంత సూక్ష్మ'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',31,62,35,80,'three conditions','మూడు షరతులనూ'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',64,66,82,84,'Complete the proof','నిరూపణను పూర్తి చేయండి'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',68,99,86,118,'coarsest','అత్యంత స్థూల'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',101,106,120,135,'even numbers','సరి సంఖ్యల'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',108,136,136,164,'An infinite model and its filtrations.','అనంత నమూనా మరియు దాని వడపోతలు.'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',138,165,166,207,'two possible filtrations','రెండు వడపోతలు'),
 L('content/normal-modal-logic/filtrations/examples-of-filtrations.tex',169,226,210,280,'finest filtration','అత్యంత సూక్ష్మ వడపోత')
];
locations['TE-T145']=[
 L('content/normal-modal-logic/filtrations/finite.tex',11,11,11,11,'Filtrations are Finite','వడపోతల పరిమితత్వం'),
 L('content/normal-modal-logic/filtrations/finite.tex',13,18,13,22,'finite','పరిమితమే'),
 L('content/normal-modal-logic/filtrations/finite.tex',20,23,24,28,'finite','పరిమితమే'),
 L('content/normal-modal-logic/filtrations/finite.tex',25,41,30,54,'injective','ఒకటి-ఒకటి')
];
locations['TE-T146']=[
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',11,11,11,11,'Finite Model Property','పరిమిత నమూనా ధర్మం'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',13,18,13,19,'finite','పరిమిత'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',20,22,21,23,'finite model property','పరిమిత నమూనా ధర్మం'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',24,34,25,47,'filtration','వడపోత'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',36,40,49,54,'essential','అత్యవసరం'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',42,48,56,64,'universal models','సార్వత్రిక నమూనాల'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',50,63,66,84,'right-to left','కుడి నుంచి ఎడమకు'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',65,77,86,102,'reflexive and euclidean','స్వావర్తన, యూక్లిడియన్'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',79,82,104,107,'serial or reflexive','సీరియల్ లేదా స్వావర్తన'),
 L('content/normal-modal-logic/filtrations/S5-fmp.tex',84,87,109,113,'non-symmetric','సౌష్ఠవం లేని')
];
locations['TE-T147']=[
 L('content/normal-modal-logic/filtrations/S5-decidable.tex',11,15,11,17,'Decidable','నిర్ణయించదగినది'),
 L('content/normal-modal-logic/filtrations/S5-decidable.tex',17,19,19,21,'decidable','నిర్ణయించదగినది'),
 L('content/normal-modal-logic/filtrations/S5-decidable.tex',21,32,23,48,'in parallel','సమాంతరంగా'),
 L('content/normal-modal-logic/filtrations/S5-decidable.tex',34,36,50,53,'universal','సార్వత్రిక')
];
locations['TE-T148']=[
 L('content/normal-modal-logic/filtrations/more-filtrations.tex',11,11,11,11,'Properties of Accessibility','ప్రాప్యత ధర్మాలు'),
 L('content/normal-modal-logic/filtrations/more-filtrations.tex',13,28,13,36,'finer','సూక్ష్మమైనది'),
 L('content/normal-modal-logic/filtrations/more-filtrations.tex',30,70,38,77,'Conditions on possible worlds','లోకాలపై షరతులు'),
 L('content/normal-modal-logic/filtrations/more-filtrations.tex',72,93,79,108,'symmetric and transitive','సౌష్ఠవమూ సంక్రామకమూ'),
 L('content/normal-modal-logic/filtrations/more-filtrations.tex',95,111,110,129,'symmetric','సౌష్ఠవమని'),
 L('content/normal-modal-logic/filtrations/more-filtrations.tex',113,129,131,149,'Exercise.','వ్యాయామం.'),
 L('content/normal-modal-logic/filtrations/more-filtrations.tex',131,133,151,154,'Complete the proof','నిరూపణను')
];
locations['TE-T149']=[
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',11,11,11,11,'Filtrations of Euclidean Models','యూక్లిడియన్ నమూనాల వడపోతలు'),
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',13,23,13,33,'euclidean','యూక్లిడియన్'),
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',25,56,35,67,'A serial and euclidean model.','సీరియల్, యూక్లిడియన్ నమూనా.'),
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',58,86,69,106,'filtration of the model','నమూనా వడపోత'),
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',88,93,108,121,'modally closed','మోడల్ సంయోజకాల పరంగా సంవృతమైన'),
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',95,104,123,136,'coarsest filtration','అత్యంత స్థూల వడపోత'),
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',106,127,138,174,'transitivity','సంక్రామకత్వం'),
 L('content/normal-modal-logic/filtrations/euclidean-filtrations.tex',129,131,176,179,'Complete the proof','నిరూపణను పూర్తి చేయండి')
];
locations['TE-T150']=[
 L('content/normal-modal-logic/tableaux/tableaux.tex',8,8,8,8,'Modal \\usetoken{P}{tableau}','మోడల్ \\usetoken{P}{tableau}'),
 L('content/normal-modal-logic/tableaux/tableaux.tex',10,14,10,17,'Draft chapter on prefixed tableaux','పూర్వసూచికలతో కూడిన టాబ్లోలపై')
];
locations['TE-T151']=[
 L('content/normal-modal-logic/tableaux/introduction.tex',13,18,13,20,'trees of','వృక్షాలు'),
 L('content/normal-modal-logic/tableaux/introduction.tex',25,35,30,44,'closed','సంవృతమైనది'),
 L('content/normal-modal-logic/tableaux/introduction.tex',38,54,46,65,'prefixes','పూర్వసూచికలు'),
 L('content/normal-modal-logic/tableaux/introduction.tex',56,59,67,71,'names a world','లోకానికి')
];
locations['TE-T152']=[
 L('content/normal-modal-logic/tableaux/rules-for-K.tex',11,20,11,26,'regular propositional connectives','సాధారణ ప్రతిజ్ఞావాక్య సంయోజకాల'),
 L('content/normal-modal-logic/tableaux/rules-for-K.tex',84,90,90,97,'prefixes must match','పూర్వసూచికలు కూడా ఒకటే'),
 L('content/normal-modal-logic/tableaux/rules-for-K.tex',105,109,114,118,'which $n$ is allowed','ఏ~$n$ను అనుమతిస్తామనేది'),
 L('content/normal-modal-logic/tableaux/rules-for-K.tex',111,130,120,140,'already','ఇప్పటికే'),
 L('content/normal-modal-logic/tableaux/rules-for-K.tex',134,169,144,179,'is used','ఉపయోగించినది'),
 L('content/normal-modal-logic/tableaux/rules-for-K.tex',171,220,181,230,'closed','సంవృత'),
 L('content/normal-modal-logic/tableaux/rules-for-K.tex',222,271,232,289,'unsound','నిర్దుష్టం కాదు')
];
locations['TE-T153']=[
 L('content/normal-modal-logic/tableaux/proofs-in-K.tex',11,11,11,11,'for \\Log{K}','\\Log{K} కోసం'),
 L('content/normal-modal-logic/tableaux/proofs-in-K.tex',15,47,15,47,'We give a closed tableau','సంవృత టాబ్లోను ఇస్తున్నాం'),
 L('content/normal-modal-logic/tableaux/proofs-in-K.tex',51,83,51,83,'We give a closed tableau','సంవృత టాబ్లోను ఇస్తున్నాం'),
 L('content/normal-modal-logic/tableaux/proofs-in-K.tex',87,95,87,95,'Find closed','కనుగొనండి')
];
locations['TE-T154']=[
 L('content/normal-modal-logic/tableaux/soundness.tex',11,20,11,21,'Soundness','నిర్దుష్టత'),
 L('content/normal-modal-logic/tableaux/soundness.tex',22,43,23,52,'contrapositive','వ్యతిరేకావర్తనాన్ని'),
 L('content/normal-modal-logic/tableaux/soundness.tex',45,59,54,68,'interpretation','అర్థనిర్దేశం'),
 L('content/normal-modal-logic/tableaux/soundness.tex',61,87,70,100,'satisfiable','సంతృప్తిపరచదగినది'),
 L('content/normal-modal-logic/tableaux/soundness.tex',89,118,102,139,'satisfiable branch','సంతృప్తిపరచదగిన శాఖ'),
 L('content/normal-modal-logic/tableaux/soundness.tex',119,185,140,222,'new prefix','కొత్త పూర్వసూచిక'),
 L('content/normal-modal-logic/tableaux/soundness.tex',188,220,224,272,'Diamond','Diamond'),
 L('content/normal-modal-logic/tableaux/soundness.tex',222,239,276,301,'two premises','రెండుగా విడగొట్టే'),
 L('content/normal-modal-logic/tableaux/soundness.tex',242,267,304,339,'\\Gamma \\Entails !A','\\Gamma \\Entails !A')
];
locations['TE-T155']=[
 L('content/normal-modal-logic/tableaux/more-rules.tex',11,14,11,15,'Other Accessibility Relations','ఇతర ప్రాప్యత సంబంధాల'),
 L('content/normal-modal-logic/tableaux/more-rules.tex',16,96,17,97,'is used','ఉపయోగించినది'),
 L('content/normal-modal-logic/tableaux/more-rules.tex',98,99,99,100,'sound and complete','నిర్దుష్టమైన, సంపూర్ణమైన'),
 L('content/normal-modal-logic/tableaux/more-rules.tex',101,157,102,158,'Logic','తర్కం'),
 L('content/normal-modal-logic/tableaux/more-rules.tex',160,184,161,194,'closed tableau','సంవృత'),
 L('content/normal-modal-logic/tableaux/more-rules.tex',186,196,196,206,'Give closed','ఇవ్వండి')
];
locations['TE-T156']=[
 L('content/normal-modal-logic/tableaux/more-soundness.tex',11,16,11,17,'Soundness for Additional Rules','అదనపు నియమాల నిర్దుష్టత'),
 L('content/normal-modal-logic/tableaux/more-soundness.tex',18,46,19,50,'reflexive models','స్వావర్తన నమూనాలకు'),
 L('content/normal-modal-logic/tableaux/more-soundness.tex',54,84,58,91,'serial models','సీరియల్ నమూనాలకు'),
 L('content/normal-modal-logic/tableaux/more-soundness.tex',92,126,99,134,'symmetric models','సౌష్ఠవ నమూనాలకు'),
 L('content/normal-modal-logic/tableaux/more-soundness.tex',134,170,142,183,'transitive models','సంక్రామక నమూనాలకు'),
 L('content/normal-modal-logic/tableaux/more-soundness.tex',178,214,191,246,'euclidean models','యూక్లిడియన్ నమూనాలకు'),
 L('content/normal-modal-logic/tableaux/more-soundness.tex',222,226,254,258,'respective classes','సంబంధిత నమూనా')
];
locations['TE-T157']=[
 L('content/normal-modal-logic/tableaux/simple-S5.tex',11,11,11,11,'Simple \\usetoken{P}{tableau}','సరళ \\usetoken{P}{tableau}'),
 L('content/normal-modal-logic/tableaux/simple-S5.tex',13,26,13,30,'universal models','సార్వత్రిక నమూనాల'),
 L('content/normal-modal-logic/tableaux/simple-S5.tex',28,63,32,67,'is used','ఉపయోగించినది'),
 L('content/normal-modal-logic/tableaux/simple-S5.tex',65,86,69,91,'simplified closed tableau','సరళీకృత')
];
locations['TE-T158']=[
 L('content/normal-modal-logic/tableaux/completeness.tex',11,11,11,11,'Completeness for \\Log{K}','సంపూర్ణత'),
 L('content/normal-modal-logic/tableaux/completeness.tex',30,44,31,47,'A branch in','సంపూర్ణమైనది'),
 L('content/normal-modal-logic/tableaux/completeness.tex',48,62,50,74,'\\sFmla{\\True}{!B \\lor !C}','\\sFmla{\\True}{!B \\lor !C}'),
 L('content/normal-modal-logic/tableaux/completeness.tex',64,80,76,104,'every branch is closed','ప్రతి శాఖ సంపూర్ణంగా ఉంటుంది'),
 L('content/normal-modal-logic/tableaux/completeness.tex',83,93,106,126,'If $\\Gamma$ has no closed','పరిమితమైన~$\\Gamma$'),
 L('content/normal-modal-logic/tableaux/completeness.tex',95,109,128,149,'R\\sigma\\sigma\'','తాదాత్మ్య అర్థనిర్దేశం'),
 L('content/normal-modal-logic/tableaux/completeness.tex',141,179,182,237,'\\mSat/{M(\\Delta)}{!B}[\\sigma]','\\mSat/{M(\\Delta)}{!C}[\\sigma]'),
 L('content/normal-modal-logic/tableaux/completeness.tex',213,227,277,293,'\\mSat{M(\\Delta)}{\\Gamma}','\\mSat{M(\\Delta)}{\\Gamma}[f]')
];
locations['TE-T159']=[
 L('content/normal-modal-logic/tableaux/countermodels.tex',11,11,11,11,'Countermodels from \\usetoken{P}{tableau}','ప్రతినమూనాలు'),
 L('content/normal-modal-logic/tableaux/countermodels.tex',13,34,13,42,'decision','నిర్ణయ విధానం'),
 L('content/normal-modal-logic/tableaux/countermodels.tex',36,43,44,54,'construct a countermodel','ప్రతినమూనానూ నిర్మించగలం'),
 L('content/normal-modal-logic/tableaux/countermodels.tex',149,157,166,181,'V(p)','V(p)'),
 L('content/normal-modal-logic/tableaux/countermodels.tex',203,209,228,243,'\\sFmla{\\True}{\\Diamond(p \\land q)}[1]','\\sFmla{\\False}{\\Diamond(p \\land q)}[1]'),
 L('content/normal-modal-logic/tableaux/countermodels.tex',279,287,317,332,'V(q)','V(q)')
];
locations['TE-T160']=[
 L('content/normal-modal-logic/sequent-calculus/sequent-calculus.tex',8,8,8,8,'Modal Sequent Calculus','మోడల్ సీక్వెంట్ కలనశాస్త్రం'),
 L('content/normal-modal-logic/sequent-calculus/sequent-calculus.tex',10,13,10,13,'Draft chapter','ముసాయిదా అధ్యాయం'),
 L('content/normal-modal-logic/sequent-calculus/sequent-calculus.tex',15,23,15,23,'\\olimport{introduction}','\\olimport{introduction}')
];
locations['TE-T161']=[
 L('content/normal-modal-logic/sequent-calculus/introduction.tex',11,16,11,17,'sequent calculus','సీక్వెంట్ కలనశాస్త్రాన్ని'),
 L('content/normal-modal-logic/sequent-calculus/introduction.tex',18,40,18,40,'\\Axiom','\\Axiom'),
 L('content/normal-modal-logic/sequent-calculus/introduction.tex',44,49,44,50,'hypersequent','హైపర్ సీక్వెంట్')
];
locations['TE-T162']=[
 L('content/normal-modal-logic/sequent-calculus/rules-for-K.tex',11,15,11,15,'Rules for \\Log{K}','\\Log{K} కోసం నియమాలు'),
 L('content/normal-modal-logic/sequent-calculus/rules-for-K.tex',17,42,17,42,'additional','అదనపు'),
 L('content/normal-modal-logic/sequent-calculus/rules-for-K.tex',43,56,43,61,'\\Box\\Gamma','\\Box\\Gamma'),
 L('content/normal-modal-logic/sequent-calculus/rules-for-K.tex',58,92,63,99,'restriction','పరిమితి'),
 L('content/normal-modal-logic/sequent-calculus/rules-for-K.tex',94,127,101,136,'side formulas','ఇతర సూత్రాలను')
];
locations['TE-T163']=[
 L('content/normal-modal-logic/sequent-calculus/proofs-in-K.tex',11,17,11,18,'Sequent \\usetoken{P}{derivation}','సీక్వెంట్ \\usetoken{P}{derivation}'),
 L('content/normal-modal-logic/sequent-calculus/proofs-in-K.tex',47,50,49,52,'\\Diamond(!A','\\Diamond(!A'),
 L('content/normal-modal-logic/sequent-calculus/proofs-in-K.tex',81,108,83,115,'Here is','వ్యుత్పత్తి'),
 L('content/normal-modal-logic/sequent-calculus/proofs-in-K.tex',117,125,124,132,'Find sequent','సీక్వెంట్ కలనశాస్త్ర')
];
locations['TE-T164']=[
 L('content/normal-modal-logic/sequent-calculus/more-rules.tex',11,14,11,15,'Other Accessibility Relations','ఇతర ప్రాప్యత సంబంధాల'),
 L('content/normal-modal-logic/sequent-calculus/more-rules.tex',16,79,16,80,'More modal rules','మరికొన్ని మోడల్ నియమాలు'),
 L('content/normal-modal-logic/sequent-calculus/more-rules.tex',165,166,165,167,'sound and complete','నిర్దుష్టమైన, సంపూర్ణమైన'),
 L('content/normal-modal-logic/sequent-calculus/more-rules.tex',168,220,169,221,'reflexive','స్వావర్తనం'),
 L('content/normal-modal-logic/sequent-calculus/more-rules.tex',222,246,223,249,'\\Log{K4} \\Proves \\Ax{4}','\\Log{K4} \\Proves \\Ax{4}'),
 L('content/normal-modal-logic/sequent-calculus/more-rules.tex',293,350,299,356,'not complete without','లేకుండా సంపూర్ణం కాదు'),
 L('content/normal-modal-logic/sequent-calculus/more-rules.tex',352,362,358,368,'Give sequent','వ్యుత్పత్తులను')
];
locations['TE-T165']=[
 L('content/applied-modal-logic/applied-modal-logic.tex',7,7,7,7,'Applied Modal Logic','అనువర్తిత మోడల్ తర్కం'),
 L('content/applied-modal-logic/applied-modal-logic.tex',9,12,9,12,'experimental draft','ప్రయోగాత్మక ముసాయిదా'),
 L('content/applied-modal-logic/applied-modal-logic.tex',14,18,14,18,'\\olimport[temporal-logic]','\\olimport[temporal-logic]')
];
locations['TE-T166']=[
 L('content/applied-modal-logic/temporal-logic/temporal-logic.tex',8,12,8,12,'Temporal Logics','కాలిక తర్కాలు'),
 L('content/applied-modal-logic/temporal-logic/temporal-logic.tex',14,18,14,18,'\\olimport{possible-histories}','\\olimport{possible-histories}'),
 L('content/applied-modal-logic/temporal-logic/temporal-logic.tex',20,20,20,24,'\\OLEndPartHook','\\OLEndChapterHook')
];
locations['TE-T167']=[
 L('content/applied-modal-logic/temporal-logic/introduction.tex',11,11,11,11,'Introduction','పరిచయం'),
 L('content/applied-modal-logic/temporal-logic/introduction.tex',13,19,13,20,'Arthur Prior','ఆర్థర్ ప్రైయర్'),
 L('content/applied-modal-logic/temporal-logic/introduction.tex',21,29,22,31,'Beezie','బీజీ'),
 L('content/applied-modal-logic/temporal-logic/introduction.tex',31,43,33,46,'future contingent','భవిష్యత్ అనిశ్చిత వాక్యం'),
 L('content/applied-modal-logic/temporal-logic/introduction.tex',45,51,48,54,'linear, branching','రేఖీయంగా, శాఖలుగా')
];
locations['TE-T168']=[
 L('content/applied-modal-logic/temporal-logic/temporal-logic-semantics.tex',11,11,11,11,'Semantics for Temporal Logic','కాలిక తర్క అర్థవిజ్ఞానం'),
 L('content/applied-modal-logic/temporal-logic/temporal-logic-semantics.tex',13,28,13,29,'Past operators','గతకాల కారకాలు'),
 L('content/applied-modal-logic/temporal-logic/temporal-logic-semantics.tex',33,63,33,71,'$F !A$','$\\Ftemp !A$'),
 L('content/applied-modal-logic/temporal-logic/temporal-logic-semantics.tex',67,78,76,92,'\\tuple{T, \\prec, V}','\\tuple{T, \\prec, V}'),
 L('content/applied-modal-logic/temporal-logic/temporal-logic-semantics.tex',89,120,108,149,'\\mSat{M}{!A}[t]','\\mSat{M}{!A}[t]'),
 L('content/applied-modal-logic/temporal-logic/temporal-logic-semantics.tex',122,123,151,155,'duals','ద్వంద్వ')
];
locations['TE-T169']=[
 L('content/applied-modal-logic/temporal-logic/properties-accessibility.tex',11,19,11,20,'Properties of Temporal Frames','కాలిక చట్రాల ధర్మాలు'),
 L('content/applied-modal-logic/temporal-logic/properties-accessibility.tex',25,53,25,54,'transitive','సంక్రామకం'),
 L('content/applied-modal-logic/temporal-logic/properties-accessibility.tex',55,62,56,63,'irreflexivity','అస్వావర్తనత్వం')
];
locations['TE-T170']=[
 L('content/applied-modal-logic/temporal-logic/extra-temporal-operators.tex',11,17,11,19,'Additional Operators','అదనపు కారకాలు'),
 L('content/applied-modal-logic/temporal-logic/extra-temporal-operators.tex',19,22,21,25,'\\Since','\\Since'),
 L('content/applied-modal-logic/temporal-logic/extra-temporal-operators.tex',26,38,29,44,'\\prec s \\prec','\\prec s \\prec'),
 L('content/applied-modal-logic/temporal-logic/extra-temporal-operators.tex',40,42,46,49,'intuitive reading','సహజ పఠనం')
];
locations['TE-T171']=[
 L('content/applied-modal-logic/temporal-logic/possible-histories.tex',11,22,11,22,'Possible Histories','సాధ్య చరిత్రలు'),
 L('content/applied-modal-logic/temporal-logic/possible-histories.tex',24,42,24,48,'\\tuple{T, C, V}','\\tuple{T, C, V}'),
 L('content/applied-modal-logic/temporal-logic/possible-histories.tex',44,52,50,60,'relative to a history','చరిత్ర'),
 L('content/applied-modal-logic/temporal-logic/possible-histories.tex',54,65,62,76,'\\prec_\\sigma','\\prec_\\sigma'),
 L('content/applied-modal-logic/temporal-logic/possible-histories.tex',67,73,78,86,'\\lnot \\Ftemp p \\land \\Diamond \\Ftemp p','\\lnot \\Ftemp p \\land \\Diamond \\Ftemp p')
];
locations['TE-T172']=[
 L('content/applied-modal-logic/epistemic-logic/epistemic-logic.tex',8,8,8,8,'Epistemic Logics','జ్ఞానసంబంధ తర్కాలు'),
 L('content/applied-modal-logic/epistemic-logic/epistemic-logic.tex',10,12,10,12,'bisimulation','ద్విసమానుకరణ'),
 L('content/applied-modal-logic/epistemic-logic/epistemic-logic.tex',24,24,24,25,'\\OLEndPartHook','\\OLEndChapterHook')
];
locations['TE-T173']=[
 L('content/applied-modal-logic/epistemic-logic/introduction.tex',13,13,13,13,'epistemic or doxastic','జ్ఞానసంబంధ లేదా విశ్వాససంబంధ'),
 L('content/applied-modal-logic/epistemic-logic/introduction.tex',21,21,21,21,'accessibility relation','ప్రాప్యత సంబంధం'),
 L('content/applied-modal-logic/epistemic-logic/introduction.tex',21,21,21,21,'multi-agent logics','బహు-కర్త తర్కాలు')
];
locations['TE-T174']=[
 L('content/applied-modal-logic/epistemic-logic/language-epistemic-logic.tex',13,28,13,28,'agent-symbols','కర్త-సంకేతాల'),
 L('content/applied-modal-logic/epistemic-logic/language-epistemic-logic.tex',67,68,68,69,'modal-free','మోడల్-రహితం'),
 L('content/applied-modal-logic/epistemic-logic/language-epistemic-logic.tex',71,74,72,77,'group knowledge','సమూహ జ్ఞానాన్ని'),
 L('content/applied-modal-logic/epistemic-logic/language-epistemic-logic.tex',77,85,79,88,'common knowledge','సామాన్య జ్ఞానాన్ని')
];
locations['TE-T175']=[
 L('content/applied-modal-logic/epistemic-logic/relational-models.tex',11,11,11,11,'Relational Models','సంబంధ నమూనాలు'),
 L('content/applied-modal-logic/epistemic-logic/relational-models.tex',22,25,23,27,'relational model','సంబంధ నమూనా'),
 L('content/applied-modal-logic/epistemic-logic/relational-models.tex',27,38,29,45,'$a \\in G$','$a \\in G$'),
 L('content/applied-modal-logic/epistemic-logic/relational-models.tex',41,48,47,55,'informational states','సమాచార స్థితిని')
];
locations['TE-T176']=[
 L('content/applied-modal-logic/epistemic-logic/truth-at-w.tex',11,11,11,11,'Truth at a World','ఒక లోకం వద్ద సత్యం'),
 L('content/applied-modal-logic/epistemic-logic/truth-at-w.tex',36,38,42,45,'\\Knows_a !B','\\Knows_a !B'),
 L('content/applied-modal-logic/epistemic-logic/truth-at-w.tex',97,108,106,119,'transitive closure','సంక్రామక సంవృతం'),
 L('content/applied-modal-logic/epistemic-logic/truth-at-w.tex',110,113,122,125,'\\CKnows_{G\'} !A','\\CKnows_{G\'} !A')
];
locations['TE-T177']=[
 L('content/applied-modal-logic/epistemic-logic/properties-accessibility.tex',11,11,11,11,'Accessibility Relations and Epistemic Principles','ప్రాప్యత సంబంధాలు, జ్ఞానసంబంధ సూత్రాలు'),
 L('content/applied-modal-logic/epistemic-logic/properties-accessibility.tex',31,35,33,37,'Closure','మూసుకుపోవడం'),
 L('content/applied-modal-logic/epistemic-logic/properties-accessibility.tex',36,43,38,47,'Positive Introspection','సకారాత్మక స్వపరిశీలన'),
 L('content/applied-modal-logic/epistemic-logic/properties-accessibility.tex',42,48,44,50,'euclidean','యూక్లిడియన్')
];
locations['TE-T178']=[
 L('content/applied-modal-logic/epistemic-logic/bisimulations.tex',11,11,11,11,'Bisimulations','ద్విసమానుకరణలు'),
 L('content/applied-modal-logic/epistemic-logic/bisimulations.tex',29,46,31,51,'$a \\in A$','$a \\in G$'),
 L('content/applied-modal-logic/epistemic-logic/bisimulations.tex',55,60,60,67,'forth','ముందుకు'),
 L('content/applied-modal-logic/epistemic-logic/bisimulations.tex',62,67,69,74,'\\leftrightarroweq','\\leftrightarroweq')
];
locations['TE-T179']=[
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-lang.tex',11,11,11,11,'Public Announcement Logic','బహిరంగ ప్రకటన తర్కం'),
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-lang.tex',13,20,13,22,'Dynamic epistemic logics','గతి జ్ఞానసంబంధ తర్కాలు'),
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-lang.tex',35,35,38,38,'public announcement operator','బహిరంగ ప్రకటన కారకం'),
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-lang.tex',71,71,74,75,'$[!A] !B$','$[!A] !B$')
];
locations['TE-T180']=[
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-semantics.tex',11,11,11,11,'Semantics of Public Announcement Logic','బహిరంగ ప్రకటన తర్కపు అర్థవిజ్ఞానం'),
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-semantics.tex',43,54,44,57,"$W' =","$W' ="),
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-semantics.tex',64,67,69,75,'$[!A]B$','$[!A]!B$'),
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-semantics.tex',103,110,116,123,'common knowledge','సామాన్య జ్ఞానం'),
 L('content/applied-modal-logic/epistemic-logic/public-announcement-logic-semantics.tex',112,124,125,149,'$p \\land \\lnot \\Knows_b p$','$p \\land \\lnot \\Knows_b p$')
];
locations['TE-T181']=[
 L('content/intuitionistic-logic/intuitionistic-logic.tex',7,7,7,7,'Intuitionistic Logic','అంతఃప్రజ్ఞావాద తర్కం')
];
locations['TE-T182']=[
 L('content/intuitionistic-logic/introduction/introduction.tex',9,9,9,9,'Introduction','పరిచయం'),
 L('content/intuitionistic-logic/introduction/introduction.tex',11,19,11,19,'\\olimport{bhk-interpretation}','\\olimport{bhk-interpretation}')
];
locations['TE-T183']=[
 L('content/intuitionistic-logic/introduction/constructive-reasoning.tex',11,18,11,22,'Constructive Reasoning','నిర్మాణాత్మక హేతుచింతన'),
 L('content/intuitionistic-logic/introduction/constructive-reasoning.tex',20,34,24,40,'if $n$ is even','$n$ సరి సంఖ్య'),
 L('content/intuitionistic-logic/introduction/constructive-reasoning.tex',47,59,54,69,'$a = b = \\sqrt{2}$','$a = b = \\sqrt{2}$'),
 L('content/intuitionistic-logic/introduction/constructive-reasoning.tex',62,78,71,91,'$a = \\sqrt{3}$','$a = \\sqrt{3}$'),
 L('content/intuitionistic-logic/introduction/constructive-reasoning.tex',81,100,93,116,'!!a{derivation}','!!a{derivation}')
];
locations['TE-T184']=[
 L('content/intuitionistic-logic/introduction/syntax.tex',11,11,11,11,'Syntax of Intuitionistic Logic','అంతఃప్రజ్ఞావాద తర్కపు వాక్యనిర్మాణం'),
 L('content/intuitionistic-logic/introduction/syntax.tex',13,24,13,26,'$!A \\lif \\lfalse$','$!A \\lif \\lfalse$'),
 L('content/intuitionistic-logic/introduction/syntax.tex',28,60,29,66,'\\Frm[L_0]','\\Frm[L_0]'),
 L('content/intuitionistic-logic/introduction/syntax.tex',62,72,68,79,'defined','నిర్వచిత')
];
locations['TE-T185']=[
 L('content/intuitionistic-logic/introduction/bhk-interpretation.tex',11,11,11,11,'The Brouwer--Heyting--Kolmogorov Interpretation','బ్రౌవర్--హైటింగ్--కొల్మొగొరోవ్ అర్థనిర్దేశం'),
 L('content/intuitionistic-logic/introduction/bhk-interpretation.tex',18,42,17,49,'construction','నిర్మాణం'),
 L('content/intuitionistic-logic/introduction/bhk-interpretation.tex',92,98,111,121,'$C$','$!C$'),
 L('content/intuitionistic-logic/introduction/bhk-interpretation.tex',130,138,162,177,'\\tuple{1, M_2}','\\tuple{1, M_1}'),
 L('content/intuitionistic-logic/introduction/bhk-interpretation.tex',140,151,178,192,'\\comp{h_1}{g}','\\comp{h_1}{g}')
];
locations['TE-T186']=[
 L('content/intuitionistic-logic/introduction/natural-deduction.tex',11,16,11,19,'Natural Deduction','సహజ నిగమనం'),
 L('content/intuitionistic-logic/introduction/natural-deduction.tex',18,38,21,49,'undischarged assumptions','ఉపసంహరించని'),
 L('content/intuitionistic-logic/introduction/natural-deduction.tex',59,62,68,73,'$!A_1 \\land !A_1$','$!A_1 \\land !A_2$'),
 L('content/intuitionistic-logic/introduction/natural-deduction.tex',235,247,256,271,'classical theorem','సాంప్రదాయిక')
];
locations['TE-T187']=[
 L('content/intuitionistic-logic/introduction/axiomatic-derivations.tex',11,14,11,17,'Axiomatic','స్వీకృతాధారిత'),
 L('content/intuitionistic-logic/introduction/axiomatic-derivations.tex',18,27,19,35,'finite sequence','పరిమిత క్రమం'),
 L('content/intuitionistic-logic/introduction/axiomatic-derivations.tex',30,43,37,51,'\\PAx','\\PAx'),
 L('content/intuitionistic-logic/introduction/axiomatic-derivations.tex',46,56,54,68,'derivable','వ్యుత్పాద్యం')
];
locations['TE-T188']=[
 L('content/intuitionistic-logic/semantics/semantics.tex',8,8,8,8,'Semantics','అర్థవిజ్ఞానం'),
 L('content/intuitionistic-logic/semantics/semantics.tex',10,15,10,17,'only Kripke and topological semantics','క్రిప్కె అర్థవిజ్ఞానం, స్థలవిజ్ఞాన అర్థవిజ్ఞానం'),
 L('content/intuitionistic-logic/semantics/semantics.tex',17,22,19,24,'\\OLEndChapterHook','\\OLEndChapterHook')
];
locations['TE-T189']=[
 L('content/intuitionistic-logic/semantics/introduction.tex',21,26,24,31,'partial order','పాక్షిక క్రమం'),
 L('content/intuitionistic-logic/semantics/introduction.tex',28,34,33,42,'monotonic','ఏకదిశగా పెరుగుతుంది'),
 L('content/intuitionistic-logic/semantics/introduction.tex',45,51,59,68,'conditional','సోపాధికానికి'),
 L('content/intuitionistic-logic/semantics/introduction.tex',67,71,91,98,'topological semantics','స్థలవిజ్ఞాన అర్థవిజ్ఞానం')
];
locations['TE-T190']=[
 L('content/intuitionistic-logic/semantics/relational-models.tex',20,31,22,39,'relational model','సంబంధ నమూనా'),
 L('content/intuitionistic-logic/semantics/relational-models.tex',26,29,31,37,'monotone','ఏకదిశగా పెరుగుతుంది'),
 L('content/intuitionistic-logic/semantics/relational-models.tex',33,51,41,63,'\\mSat/{M}{!A}[w]','\\mSat/{M}{!A}[w]')
];
locations['TE-T191']=[
 L('content/intuitionistic-logic/semantics/semantic-notions.tex',13,20,13,26,'true in the model','నమూనా~$\\mModel{M} = \\tuple{W,R,V}$లో'),
 L('content/intuitionistic-logic/semantics/semantic-notions.tex',31,38,37,45,'Suppose $\\mSat{M}{\\Gamma}$.','$\\mSat{M}{\\Gamma}[w]$ అనుకుందాం'),
 L('content/intuitionistic-logic/semantics/semantic-notions.tex',42,50,48,58,'restriction','పరిమితి')
];
locations['TE-T192']=[
 L('content/intuitionistic-logic/semantics/topological-semantics.tex',16,30,16,38,'open sets','వివృత సమితులు'),
 L('content/intuitionistic-logic/semantics/topological-semantics.tex',43,58,55,73,'\\Interior{V}','\\Interior{V}'),
 L('content/intuitionistic-logic/semantics/topological-semantics.tex',88,93,116,125,'greatest open set','అతి పెద్ద వివృత')
];
locations['TE-T193']=[
 L('content/intuitionistic-logic/soundness-completeness/soundness-completeness.tex',8,8,8,8,'Soundness and Completeness','నిర్దుష్టత, సంపూర్ణత'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-completeness.tex',10,16,10,18,'provability','వ్యుత్పాద్యతకు'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-completeness.tex',18,28,20,30,'\\olimport{decidability}','\\olimport{decidability}')
];
locations['TE-T194']=[
 L('content/intuitionistic-logic/soundness-completeness/soundness-axd.tex',11,11,11,11,'Soundness of Axiomatic','స్వీకృతాధారిత'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-axd.tex',13,17,13,18,'all axioms are','అన్ని స్వీకృతాలు'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-axd.tex',40,42,46,50,'\\mSat{M}{\\Gamma}{!A_n}[w]','\\mSat{M}{!A_n}[w]'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-axd.tex',43,55,51,70,'reflexive','స్వావర్తనం')
];
locations['TE-T195']=[
 L('content/intuitionistic-logic/soundness-completeness/soundness-nd.tex',11,11,11,11,'Soundness of Natural Deduction','సహజ నిగమనం నిర్దుష్టత'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-nd.tex',33,44,36,58,'\\Gamma \\cup \\Delta \\Entails !A \\land !B','\\Gamma \\cup \\Delta \\Entails !B \\land !C'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-nd.tex',78,86,113,129,'\\mSat{M}{!B}$[w]','\\mSat{M}{!B}[w]'),
 L('content/intuitionistic-logic/soundness-completeness/soundness-nd.tex',95,100,142,149,'prop:true-monotonic','prop:true-monotonic')
];
locations['TE-T196']=[
 L('content/intuitionistic-logic/soundness-completeness/lindenbaum.tex',11,11,11,11,"Lindenbaum's Lemma",'లిండెన్‌బామ్ ఉపప్రమేయం'),
 L('content/intuitionistic-logic/soundness-completeness/lindenbaum.tex',34,42,44,55,'prime','ప్రధానం'),
 L('content/intuitionistic-logic/soundness-completeness/lindenbaum.tex',99,104,139,153,'largest','అతి పెద్దదాన్ని'),
 L('content/intuitionistic-logic/soundness-completeness/lindenbaum.tex',120,126,178,189,'at least one fewer','పరిమిత సంఖ్యలోనే')
];
locations['TE-T197']=[
 L('content/intuitionistic-logic/soundness-completeness/canonical-model.tex',11,11,11,11,'The Canonical Model','కానానికల్ నమూనా'),
 L('content/intuitionistic-logic/soundness-completeness/canonical-model.tex',13,24,13,29,'finite sequences','పరిమిత క్రమాలు'),
 L('content/intuitionistic-logic/soundness-completeness/canonical-model.tex',47,56,63,78,'initial segment','ప్రారంభ భాగం'),
 L('content/intuitionistic-logic/soundness-completeness/canonical-model.tex',59,63,80,91,'by induction','ఆగమన పద్ధతిలో')
];
locations['TE-T198']=[
 L('content/intuitionistic-logic/soundness-completeness/truth-lemma.tex',11,11,11,11,'The Truth Lemma','సత్య ఉపప్రమేయం'),
 L('content/intuitionistic-logic/soundness-completeness/truth-lemma.tex',16,19,18,21,'prime','ప్రధానమైతే'),
 L('content/intuitionistic-logic/soundness-completeness/truth-lemma.tex',30,30,36,36,'\\indcase!{!A}{\\lnot !B}{}','\\indcase!{!A}{\\lnot !B}{}'),
 L('content/intuitionistic-logic/soundness-completeness/truth-lemma.tex',56,57,79,80,'R\\sigma(\\sigma.n)','R\\sigma(\\sigma.n)')
];
locations['TE-T199']=[
 L('content/intuitionistic-logic/soundness-completeness/completeness-thm.tex',11,11,11,11,'The Completeness Theorem','సంపూర్ణతా సిద్ధాంతం'),
 L('content/intuitionistic-logic/soundness-completeness/completeness-thm.tex',13,15,13,15,'\\Gamma \\Entails !A','\\Gamma \\Entails !A'),
 L('content/intuitionistic-logic/soundness-completeness/completeness-thm.tex',17,29,17,37,'lem:truth','lem:truth'),
 L('content/intuitionistic-logic/soundness-completeness/completeness-thm.tex',37,45,47,55,'\\Proves !A \\lor !B','\\Proves !A \\lor !B')
];
locations['TE-T200']=[
 L('content/intuitionistic-logic/soundness-completeness/decidability.tex',11,11,11,11,'Decidability','నిర్ణేయత'),
 L('content/intuitionistic-logic/soundness-completeness/decidability.tex',19,21,22,25,'finite model','పరిమిత నమూనా'),
 L('content/intuitionistic-logic/soundness-completeness/decidability.tex',23,29,27,42,'[w] = \\Setabs{p \\in P}{w \\in V(p)}','[w] = \\Setabs{!B \\in S}{\\mSat{M}{!B}[w]}'),
 L('content/intuitionistic-logic/soundness-completeness/decidability.tex',31,36,44,54,'for all !!{formula}s','అన్ని')
];
locations['TE-T201']=[
 L('content/intuitionistic-logic/tableaux/tableaux.tex',8,8,8,8,'Intuitionistic','అంతఃప్రజ్ఞావాద'),
 L('content/intuitionistic-logic/tableaux/tableaux.tex',10,14,10,17,'prefixed tableaux','పూర్వసూచికలతో'),
 L('content/intuitionistic-logic/tableaux/tableaux.tex',11,13,11,16,'countermodels','ప్రతినమూనాలను'),
 L('content/intuitionistic-logic/tableaux/tableaux.tex',16,23,19,26,'%\\olimport{countermodels}','%\\olimport{countermodels}')
];
locations['TE-T202']=[
 L('content/intuitionistic-logic/tableaux/introduction.tex',11,11,11,11,'Introduction','పరిచయం'),
 L('content/intuitionistic-logic/tableaux/introduction.tex',13,19,13,23,'signed','చిహ్నిత'),
 L('content/intuitionistic-logic/tableaux/introduction.tex',40,48,64,79,'\\sigma \\in','\\sigma \\in'),
 L('content/intuitionistic-logic/tableaux/introduction.tex',59,68,100,111,'\\sigma.*','\\sigma.*')
];
locations['TE-T203']=[
 L('content/intuitionistic-logic/tableaux/rules.tex',11,11,11,11,'Rules for Intuitionistic Logic','అంతఃప్రజ్ఞావాద తర్క నియమాలు'),
 L('content/intuitionistic-logic/tableaux/rules.tex',22,55,29,62,'tab:prop-rules','tab:prop-rules'),
 L('content/intuitionistic-logic/tableaux/rules.tex',89,98,111,133,'\\TRule{\\lif}{\\True}','\\TRule{\\True}{\\lif}'),
 L('content/intuitionistic-logic/tableaux/rules.tex',100,103,134,142,'\\TRule{\\lif}{\\False}','\\TRule{\\False}{\\lif}'),
 L('content/intuitionistic-logic/tableaux/rules.tex',110,143,148,181,'tab:rules-lif-lnot','tab:rules-lif-lnot')
];
locations['TE-T204']=[
 L('content/intuitionistic-logic/tableaux/proofs.tex',11,11,11,11,'for Intuitionistic Logic','అంతఃప్రజ్ఞావాద తర్కానికి'),
 L('content/intuitionistic-logic/tableaux/proofs.tex',14,16,14,17,'closed tableau','సంవృత టాబ్లోను'),
 L('content/intuitionistic-logic/tableaux/proofs.tex',29,36,30,44,'\\TRule{\\False}{\\land}[4]','\\TRule{\\False}{\\land}[7]'),
 L('content/intuitionistic-logic/tableaux/proofs.tex',47,55,49,58,'Find closed','కనుగొనండి')
];
locations['TE-T205']=[
 L('content/intuitionistic-logic/tableaux/soundness.tex',11,11,11,11,'Soundness for Intuitionistic','అంతఃప్రజ్ఞావాద'),
 L('content/intuitionistic-logic/tableaux/soundness.tex',36,41,54,61,'interpretation of','అర్థనిర్దేశం'),
 L('content/intuitionistic-logic/tableaux/soundness.tex',85,87,127,130,'Soundness','నిర్దుష్టత'),
 L('content/intuitionistic-logic/tableaux/soundness.tex',91,96,133,146,'satisfiable','సంతృప్తిపరచదగిన')
];
locations['TE-T206']=[
 L('content/counterfactuals/counterfactuals.tex',7,7,7,7,'Counter\\-factuals','ప్రతివాస్తవ సోపాధికాలు')
];
locations['TE-T207']=[
 L('content/counterfactuals/introduction/introduction.tex',8,8,8,8,'Introduction','పరిచయం')
];
locations['TE-T208']=[
 L('content/counterfactuals/introduction/material-conditional.tex',11,11,11,11,'Material Conditional','భౌతిక సోపాధికం'),
 L('content/counterfactuals/introduction/material-conditional.tex',21,23,24,28,'truth-functional','సత్యమూల్యాధారితం'),
 L('content/counterfactuals/introduction/material-conditional.tex',38,44,49,59,'antecedent','పూర్వపక్షం')
];
locations['TE-T209']=[
 L('content/counterfactuals/introduction/paradoxes-material.tex',11,11,11,11,'Paradoxes of the Material Conditional','భౌతిక సోపాధికం యొక్క వైరుధ్యాభాసాలు'),
 L('content/counterfactuals/introduction/paradoxes-material.tex',23,25,30,34,'entailment','తార్కిక పర్యవసానం'),
 L('content/counterfactuals/introduction/paradoxes-material.tex',52,56,75,84,'indicative','సూచనాత్మక')
];
locations['TE-T210']=[
 L('content/counterfactuals/introduction/strict-conditional.tex',11,11,11,11,'Strict Conditional','కఠిన సోపాధికం'),
 L('content/counterfactuals/introduction/strict-conditional.tex',13,17,13,20,'strict conditional','కఠిన సోపాధికం'),
 L('content/counterfactuals/introduction/strict-conditional.tex',78,84,92,100,'necessarily','అనివార్యంగా')
];
locations['TE-T211']=[
 L('content/counterfactuals/introduction/counterfactuals.tex',17,22,18,30,'counterfactual','ప్రతివాస్తవ'),
 L('content/counterfactuals/introduction/counterfactuals.tex',24,29,32,42,"If Oswald didn't kill Kennedy",'ఓస్వాల్డ్ కెన్నెడీని చంపకపోతే'),
 L('content/counterfactuals/introduction/counterfactuals.tex',52,56,79,88,'causal','కారణాత్మక'),
 L('content/counterfactuals/introduction/counterfactuals.tex',68,70,107,113,'closest','సమీపంగా')
];
locations['TE-T212']=[
 L('content/counterfactuals/minimal-change-semantics/minimal-change-semantics.tex',8,8,8,8,'Minimal Change Semantics','కనిష్ఠ మార్పు అర్థవిచారం')
];
locations['TE-T213']=[
 L('content/counterfactuals/minimal-change-semantics/introduction.tex',15,20,19,26,'minimally different','కనిష్ఠంగా'),
 L('content/counterfactuals/minimal-change-semantics/introduction.tex',33,38,49,61,'\\boxright','\\boxright'),
 L('content/counterfactuals/minimal-change-semantics/introduction.tex',46,51,75,86,'nested spheres','గోళాల'),
 L('content/counterfactuals/minimal-change-semantics/introduction.tex',63,66,99,108,'closest','సమీప')
];
locations['TE-T214']=[
 L('content/counterfactuals/minimal-change-semantics/sphere-models.tex',11,11,11,11,'Sphere Models','గోళ నమూనాలు'),
 L('content/counterfactuals/minimal-change-semantics/sphere-models.tex',20,29,25,44,'sphere model','గోళ నమూనా'),
 L('content/counterfactuals/minimal-change-semantics/sphere-models.tex',60,61,88,89,'Diagram of a sphere model','గోళ నమూనా చిత్రం'),
 L('content/counterfactuals/minimal-change-semantics/sphere-models.tex',95,103,146,166,'admitting','కలిగిన')
];
locations['TE-T215']=[
 L('content/counterfactuals/minimal-change-semantics/true-false.tex',11,11,11,11,'Truth and Falsity','సత్యం, అసత్యం'),
 L('content/counterfactuals/minimal-change-semantics/true-false.tex',26,27,29,30,'Non-vacuously true','శూన్యసత్యం కాని'),
 L('content/counterfactuals/minimal-change-semantics/true-false.tex',44,45,49,50,'Vacuously true','శూన్యసత్య'),
 L('content/counterfactuals/minimal-change-semantics/true-false.tex',63,64,74,75,'False counterfactual, false opposite','అసత్య ప్రతివాస్తవం; వ్యతిరేకమూ అసత్యం'),
 L('content/counterfactuals/minimal-change-semantics/true-false.tex',109,110,132,133,'Contingent counterfactual','స్థితిని బట్టి సత్యం మారే')
];
locations['TE-T216']=[
 L('content/counterfactuals/minimal-change-semantics/antecedent-strengthening.tex',11,14,11,15,'Antecedent Strengthening','పూర్వపక్షాన్ని బలపరచడం'),
 L('content/counterfactuals/minimal-change-semantics/antecedent-strengthening.tex',18,24,20,33,'outer space','బాహ్య అంతరిక్షంలో'),
 L('content/counterfactuals/minimal-change-semantics/antecedent-strengthening.tex',34,43,49,72,'sphere semantics','గోళ అర్థవిచారంలో'),
 L('content/counterfactuals/minimal-change-semantics/antecedent-strengthening.tex',64,65,96,97,'Counterexample to antecedent strengthening','పూర్వపక్ష బలపరచడానికి ప్రతిదృష్టాంతం')
];
locations['TE-T217']=[
 L('content/counterfactuals/minimal-change-semantics/transitivity.tex',11,14,11,15,'Transitivity','సంక్రామకత్వం'),
 L('content/counterfactuals/minimal-change-semantics/transitivity.tex',18,24,20,29,'Hoover','హూవర్'),
 L('content/counterfactuals/minimal-change-semantics/transitivity.tex',53,63,79,114,'sphere semantics','గోళ అర్థవిచారంలో')
];
locations['TE-T218']=[
 L('content/counterfactuals/minimal-change-semantics/contraposition.tex',11,15,11,16,'Contraposition','ప్రతివిపర్యయం'),
 L('content/counterfactuals/minimal-change-semantics/contraposition.tex',17,23,18,32,'Goethe','గోథె'),
 L('content/counterfactuals/minimal-change-semantics/contraposition.tex',26,34,35,59,'sphere semantics','గోళ అర్థవిచారంలో'),
 L('content/counterfactuals/minimal-change-semantics/contraposition.tex',53,54,78,79,'Counterexample to contraposition','ప్రతివిపర్యయానికి ప్రతిదృష్టాంతం')
];
locations['TE-T219']=[
 L('content/set-theory/set-theory.tex',7,7,7,7,'Set Theory','సమితి సిద్ధాంతం')
];
locations['TE-T220']=[
 L('content/set-theory/story/story.tex',7,7,7,7,'The Iterative Conception','దశలవారీ భావన')
];
locations['TE-T221']=[
 L('content/set-theory/story/extensionality.tex',6,6,6,6,'Extensionality','సమితుల సమానత్వ సూత్రం'),
 L('content/set-theory/story/extensionality.tex',8,13,8,17,'individuated','గుర్తింపు'),
 L('content/set-theory/story/extensionality.tex',20,24,22,29,'Axiom of Extensionality','సమితుల సమానత్వ స్వీకృతం')
];
locations['TE-T222']=[
 L('content/set-theory/story/russells-paradox-again.tex',6,6,6,6,"Russell's Paradox",'రసెల్ వైరుధ్యం'),
 L('content/set-theory/story/russells-paradox-again.tex',14,14,17,19,'Comprehension','ధర్మసంగ్రహం'),
 L('content/set-theory/story/russells-paradox-again.tex',19,22,31,41,"Russell's Paradox",'రసెల్ వైరుధ్యం'),
 L('content/set-theory/story/russells-paradox-again.tex',38,45,74,93,'non-self-membered','తమలో తాము మూలకాలుగా')
];
locations['TE-T223']=[
 L('content/set-theory/story/predicativity.tex',7,7,7,7,'Predicative and Impredicative','స్వవర్గానవలంబిత, స్వవర్గావలంబిత'),
 L('content/set-theory/story/predicativity.tex',15,17,22,28,'impredicative','స్వవర్గావలంబిత'),
 L('content/set-theory/story/predicativity.tex',34,40,55,71,'vicious-circle','దుష్టవలయ'),
 L('content/set-theory/story/predicativity.tex',44,47,74,82,'Predicative Comprehension','స్వవర్గానవలంబిత ధర్మసంగ్రహం'),
 L('content/set-theory/story/predicativity.tex',70,77,128,146,'Ramsey','రామ్సే'),
 L('content/set-theory/story/predicativity.tex',102,107,193,211,'cumulative-iterative','సంచిత-దశలవారీ')
];
locations['TE-T224']=[
 L('content/set-theory/story/cumulative-approach.tex',6,6,6,6,'Cumulative-Iterative Approach','సంచిత-దశలవారీ పద్ధతి'),
 L('content/set-theory/story/cumulative-approach.tex',11,15,11,23,'stages','దశలలో'),
 L('content/set-theory/story/cumulative-approach.tex',23,36,34,71,'stage $0$','దశ $0$'),
 L('content/set-theory/story/cumulative-approach.tex',68,83,112,145,'Russell set','రసెల్')
];
locations['TE-T225']=[
 L('content/set-theory/story/urelements.tex',6,6,6,6,'Urelements or Not?','సమితి కాని మూలకాలు ఉండాలా?'),
 L('content/set-theory/story/urelements.tex',9,10,10,14,'urelements','సమితి కాని మూలకాల'),
 L('content/set-theory/story/urelements.tex',13,18,17,43,'non-sets','సమితులు కాని'),
 L('content/set-theory/story/urelements.tex',43,55,64,93,'applicable','అన్వయించగలిగేలా'),
 L('content/set-theory/story/urelements.tex',69,72,117,125,'applicability','అన్వయయోగ్యత')
];
locations['TE-T226']=[
 L('content/set-theory/story/grundgesetze.tex',7,7,7,7,'Basic Law V','ప్రాథమిక నియమం V'),
 L('content/set-theory/story/grundgesetze.tex',17,19,24,27,'extension of a concept','భావన'),
 L('content/set-theory/story/grundgesetze.tex',20,23,29,35,'value-range','విలువల'),
 L('content/set-theory/story/grundgesetze.tex',31,34,55,57,'Basic Law V','ప్రాథమిక')
];
locations['TE-T227']=[
 L('content/set-theory/z/z.tex',8,8,8,8,'Steps towards','వైపు అడుగులు')
];
locations['TE-T228']=[
 L('content/set-theory/z/story.tex',13,13,16,16,'Every set is formed','ప్రతి సమితీ'),
 L('content/set-theory/z/story.tex',14,20,17,30,'well-ordered','సుక్రమితంగా'),
 L('content/set-theory/z/story.tex',21,25,31,38,'For any stage','ఏ దశ')
];
locations['TE-T229']=[
 L('content/set-theory/z/separation.tex',6,6,6,6,'Separation','వేరుచేయడం'),
 L('content/set-theory/z/separation.tex',10,13,12,14,'Scheme of Separation','వేరుచేయడం స్వీకృత పథకం'),
 L('content/set-theory/z/separation.tex',49,53,85,88,'universal','విశ్వవ్యాప్త'),
 L('content/set-theory/z/separation.tex',93,97,158,166,'arbitrary intersections','సర్వసామాన్య ఛేదనలు')
];
locations['TE-T230']=[
 L('content/set-theory/z/union.tex',6,6,6,6,'Union','సమ్మేళనం'),
 L('content/set-theory/z/union.tex',12,16,15,21,'Union','సమ్మేళనం')
];
locations['TE-T231']=[
 L('content/set-theory/z/pairs.tex',6,6,6,6,'Pairs','జంటలు'),
 L('content/set-theory/z/pairs.tex',19,22,34,45,'no last stage','చివరి దశ లేదు'),
 L('content/set-theory/z/pairs.tex',31,38,67,76,'tuples','క్రమయుగ్మ')
];
locations['TE-T232']=[
 L('content/set-theory/z/powerset.tex',6,6,6,6,'Powersets','ఘాత సమితులు'),
 L('content/set-theory/z/powerset.tex',10,14,11,17,'Powersets','ఘాత సమితులు'),
 L('content/set-theory/z/powerset.tex',28,29,42,47,'Cartesian product','కార్టీజియన్ లబ్ధం'),
 L('content/set-theory/z/powerset.tex',57,60,95,103,'equivalence classes','సమానతా వర్గాల')
];
locations['TE-T233']=[
 L('content/set-theory/z/infinity-again.tex',6,6,6,6,'Infinity','అనంతత్వం'),
 L('content/set-theory/z/infinity-again.tex',47,51,78,83,'Infinity','అనంతత్వ స్వీకృతం'),
 L('content/set-theory/z/infinity-again.tex',70,72,124,126,'Dedekind infinite','డెడెకిండ్'),
 L('content/set-theory/z/infinity-again.tex',104,109,189,199,'infinite stage','అనంత దశ')
];
locations['TE-T234']=[
 L('content/set-theory/z/milestone.tex',6,6,6,6,'Milestone','మైలురాయి'),
 L('content/set-theory/z/milestone.tex',12,14,18,26,'Extensionality','సమితుల సమానత్వ సూత్రం'),
 L('content/set-theory/z/milestone.tex',16,20,29,38,'Zermelo','సెర్మెలో')
];
locations['TE-T235']=[
 L('content/set-theory/z/nat.tex',6,6,6,6,'Selecting our Natural Numbers','మన సహజ సంఖ్యల ఎంపిక'),
 L('content/set-theory/z/nat.tex',14,16,15,23,'metaphysical claim','తాత్త్వికంగా'),
 L('content/set-theory/z/nat.tex',29,37,46,65,'Zermelo','సెర్మెలో'),
 L('content/set-theory/z/nat.tex',47,55,87,91,'Benacerraf','Benacerraf1965')
];
locations['TE-T236']=[
 L('content/set-theory/z/arbintersections.tex',6,6,6,6,'Closure, Comprehension, and Intersection','సంవృతత, ధర్మసంగ్రహం, ఛేదనం'),
 L('content/set-theory/z/arbintersections.tex',32,43,53,70,'Separation','వేరుచేయడం'),
 L('content/set-theory/z/arbintersections.tex',51,62,85,108,'closureofunder','closureofunder')
];
locations['TE-T237']=[
 L('content/set-theory/ordinals/ordinals.tex',7,7,7,7,'Ordinals','క్రమసంఖ్యలు')
];
locations['TE-T238']=[
 L('content/set-theory/ordinals/introduction.tex',13,20,13,31,'infinite-th stage','అనంతవ దశ'),
 L('content/set-theory/ordinals/introduction.tex',23,27,38,48,'transfinite ordinal','అతిపరిమిత')
];
locations['TE-T239']=[
 L('content/set-theory/ordinals/idea.tex',6,6,6,6,'Ordinal','క్రమసంఖ్య'),
 L('content/set-theory/ordinals/idea.tex',19,22,21,25,'sequence','అనుక్రమం'),
 L('content/set-theory/ordinals/idea.tex',38,39,52,56,'omega+1','omega+1'),
 L('content/set-theory/ordinals/idea.tex',61,62,82,84,'\\omega+\\omega','\\omega+\\omega')
];
locations['TE-T240']=[
 L('content/set-theory/ordinals/wo.tex',6,6,6,6,'Well-Orderings','సుక్రమాలు'),
 L('content/set-theory/ordinals/wo.tex',11,18,10,23,'well-orders','సుక్రమితం'),
 L('content/set-theory/ordinals/wo.tex',32,36,43,52,'least member','అత్యల్ప'),
 L('content/set-theory/ordinals/wo.tex',47,52,86,96,'formula','సూత్రానికైనా')
];
locations['TE-T241']=[
 L('content/set-theory/ordinals/iso.tex',6,6,6,6,'Order-Isomorphisms','క్రమ-సమరూపతలు'),
 L('content/set-theory/ordinals/iso.tex',13,17,18,31,'order-isomorphic','క్రమ-సమరూపమైనవి'),
 L('content/set-theory/ordinals/iso.tex',63,66,118,127,'initial segment','ఆరంభ ఖండం'),
 L('content/set-theory/ordinals/iso.tex',138,141,252,261,'initial segment','ఆరంభ ఖండంతో')
];
locations['TE-T242']=[
 L('content/set-theory/ordinals/vn.tex',6,6,6,6,'Von Neumann','వాన్ న్యూమన్'),
 L('content/set-theory/ordinals/vn.tex',9,13,10,20,'order','క్రమరకాలు'),
 L('content/set-theory/ordinals/vn.tex',26,30,43,50,'transitive','సంక్రామకం'),
 L('content/set-theory/ordinals/vn.tex',45,49,74,86,'natural numbers','సహజ సంఖ్యలను')
];
locations['TE-T243']=[
 L('content/set-theory/ordinals/basic.tex',6,6,6,6,'Basic Properties','ప్రాథమిక ధర్మాలు'),
 L('content/set-theory/ordinals/basic.tex',43,49,75,84,'Transfinite Induction','అతిపరిమిత ఆగమనం'),
 L('content/set-theory/ordinals/basic.tex',74,77,128,134,'Trichotomy','త్రివిధత'),
 L('content/set-theory/ordinals/basic.tex',146,148,276,280,'Burali-Forti Paradox','బురాలి-ఫోర్టీ వైరుధ్యం')
];
locations['TE-T244']=[
 L('content/set-theory/ordinals/replacement.tex',6,6,6,6,'Replacement','ప్రతిస్థాపన'),
 L('content/set-theory/ordinals/replacement.tex',20,26,33,45,'Scheme of Replacement','ప్రతిస్థాపన స్వీకృత పథకం'),
 L('content/set-theory/ordinals/replacement.tex',43,47,85,95,'term','పదం'),
 L('content/set-theory/ordinals/replacement.tex',61,68,120,138,'function','ప్రమేయానికి')
];
locations['TE-T245']=[
 L('content/set-theory/ordinals/milestone.tex',5,5,5,5,'milestone','మైలురాయి'),
 L('content/set-theory/ordinals/milestone.tex',13,17,21,34,'ZFminus','ZFminus'),
 L('content/set-theory/ordinals/milestone.tex',20,24,36,49,'Zermelo--Fraenkel','సెర్మెలో--ఫ్రెంకెల్')
];
locations['TE-T246']=[
 L('content/set-theory/ordinals/ordtype.tex',6,6,6,6,'Ordinals as Order-Types','క్రమరకాలుగా క్రమసంఖ్యలు'),
 L('content/set-theory/ordinals/ordtype.tex',10,12,15,19,'Every well-ordering','ప్రతి సుక్రమమూ'),
 L('content/set-theory/ordinals/ordtype.tex',48,53,102,111,'order type','క్రమరకం'),
 L('content/set-theory/ordinals/ordtype.tex',56,63,116,127,'ordtypesworklikeyouwant','ordtypesworklikeyouwant')
];
locations['TE-T247']=[
 L('content/set-theory/ordinals/opps.tex',6,6,6,6,'Successor and Limit Ordinals','ఉత్తరవర్తి, సీమా క్రమసంఖ్యలు'),
 L('content/set-theory/ordinals/opps.tex',11,18,14,31,'limit','సీమా'),
 L('content/set-theory/ordinals/opps.tex',43,53,67,79,'Simple Transfinite Induction','సరళ అతిపరిమిత ఆగమనం'),
 L('content/set-theory/ordinals/opps.tex',70,77,110,132,'least strict upper bound','కనిష్ఠ కఠిన పై')
];
locations['TE-T248']=[
 L('content/set-theory/spine/spine.tex',8,8,8,8,'Stages and Ranks','దశలు, స్థాయిలు')
];
locations['TE-T249']=[
 L('content/set-theory/spine/idea.tex',7,7,7,7,'Defining the Stages','దశలను'),
 L('content/set-theory/spine/idea.tex',26,29,35,40,'transfinite recursion','అతిపరిమిత పునరావృత్తి'),
 L('content/set-theory/spine/idea.tex',37,41,62,70,'internal','అంతర్గత')
];
locations['TE-T250']=[
 L('content/set-theory/spine/recursion.tex',6,6,6,6,'Transfinite Recursion','అతిపరిమిత పునరావృత్తి'),
 L('content/set-theory/spine/recursion.tex',18,20,33,49,'approximation','ఉజ్జాయింపు'),
 L('content/set-theory/spine/recursion.tex',88,98,180,195,'Simple Recursion','సరళ పునరావృత్తి')
];
locations['TE-T251']=[
 L('content/set-theory/spine/stagesbasics.tex',6,6,6,6,'Basic Properties of Stages','దశల ప్రాథమిక ధర్మాలు'),
 L('content/set-theory/spine/stagesbasics.tex',8,11,8,11,'potent','సమర్థమైనది'),
 L('content/set-theory/spine/stagesbasics.tex',83,87,55,55,'cumulative','సంచితమైనది')
];
locations['TE-T252']=[
 L('content/set-theory/spine/foundation.tex',7,7,7,7,'Foundation','పునాది'),
 L('content/set-theory/spine/foundation.tex',26,26,16,16,'Regularity','నియమితత్వం'),
 L('content/set-theory/spine/foundation.tex',45,45,33,33,'transitive closure','సంక్రమణ ఆవరణ')
];
locations['TE-T253']=[
 L('content/set-theory/spine/zf.tex',6,6,6,6,'Milestone','మైలురాయి'),
 L('content/set-theory/spine/zf.tex',14,16,11,11,'Foundation','పునాది'),
 L('content/set-theory/spine/zf.tex',18,19,13,13,'Replacement','ప్రతిస్థాపన')
];
locations['TE-T254']=[
 L('content/set-theory/spine/rank.tex',6,6,6,6,'Rank','స్థాయి'),
 L('content/set-theory/spine/rank.tex',9,11,8,8,'rank','స్థాయి'),
 L('content/set-theory/spine/rank.tex',53,53,48,48,'Induction Scheme','ఆగమన పథకం')
];
locations['TE-T255']=[
 L('content/set-theory/replacement/replacement.tex',8,8,8,8,'Replacement','ప్రతిస్థాపన')
];
locations['TE-T256']=[
 L('content/set-theory/replacement/introduction.tex',8,11,8,8,'Replacement','ప్రతిస్థాపన'),
 L('content/set-theory/replacement/introduction.tex',16,16,12,12,'extrinsic','బాహ్య'),
 L('content/set-theory/replacement/introduction.tex',16,16,12,12,'intrinsic','అంతర్గత')
];
locations['TE-T257']=[
 L('content/set-theory/replacement/strength.tex',6,6,6,6,'Strength of Replacement','ప్రతిస్థాపన బలం'),
 L('content/set-theory/replacement/strength.tex',13,13,10,10,'relativization','పరిధికి పరిమితం చేయడం'),
 L('content/set-theory/replacement/strength.tex',45,45,24,24,'very tall','చాలా ఎత్తుగా')
];
locations['TE-T258']=[
 L('content/set-theory/replacement/extrinsic.tex',6,6,6,6,'Extrinsic Considerations','బాహ్య పరిశీలనలు'),
 L('content/set-theory/replacement/extrinsic.tex',39,39,19,19,'Level Theory','స్థర సిద్ధాంతం'),
 L('content/set-theory/replacement/extrinsic.tex',39,39,19,19,'rank','స్థాయి'),
 L('content/set-theory/replacement/extrinsic.tex',89,90,34,34,'intrinsic','అంతర్గత')
];
locations['TE-T259']=[
 L('content/set-theory/replacement/limofsize.tex',6,6,6,6,'Limitation-of-size','పరిమాణ పరిమితి'),
 L('content/set-theory/replacement/limofsize.tex',11,12,10,10,'not too many','మరీ ఎక్కువగా లేకపోతే')
];
locations['TE-T260']=[
 L('content/set-theory/replacement/absinf.tex',6,6,6,6,'Absolute Infinity','సంపూర్ణ అనంతత్వం'),
 L('content/set-theory/replacement/absinf.tex',66,66,26,26,'cofinal','సహాంత్యమైనది')
];
locations['TE-T261']=[
 L('content/set-theory/replacement/ref.tex',6,6,6,6,'Reflection','ప్రతిబింబనం'),
 L('content/set-theory/replacement/ref.tex',11,11,11,11,'Reflection Schema','ప్రతిబింబన పథకం'),
 L('content/set-theory/replacement/ref.tex',22,22,19,19,'initial segments','ఆరంభ ఖండాల్లో')
];
locations['TE-T262']=[
 L('content/set-theory/replacement/refproofs.tex',15,15,10,10,'overlining','పైగీత'),
 L('content/set-theory/replacement/refproofs.tex',103,103,74,74,'Weak-Reflection','బలహీన ప్రతిబింబనం'),
 L('content/set-theory/replacement/refproofs.tex',126,126,90,90,'absolute','నిరపేక్షాలు')
];
locations['TE-T263']=[
 L('content/set-theory/replacement/finiteaxiomatizability.tex',6,6,6,6,'Finite axiomatizability','పరిమిత స్వయంసిద్ధీకరణ'),
 L('content/set-theory/replacement/finiteaxiomatizability.tex',9,9,9,9,'finitely axiomatizable','పరిమిత సంఖ్యలో స్వయంసిద్ధ సూత్రాలతో'),
 L('content/set-theory/replacement/finiteaxiomatizability.tex',20,20,20,20,'transitive model','సంక్రమణ నమూనా')
];
locations['TE-T264']=[
 L('content/set-theory/ord-arithmetic/ord-arithmetic.tex',8,8,8,8,'Ordinal Arithmetic','క్రమసంఖ్య అంకగణితం')
];
locations['TE-T265']=[
 L('content/set-theory/ord-arithmetic/introduction.tex',9,10,8,8,'spine','వెన్నెముక'),
 L('content/set-theory/ord-arithmetic/introduction.tex',12,12,8,8,'ordinal arithmetic','క్రమసంఖ్య అంకగణితం')
];
locations['TE-T266']=[
 L('content/set-theory/ord-arithmetic/addition.tex',6,6,6,6,'Ordinal Addition','క్రమసంఖ్య కూడిక'),
 L('content/set-theory/ord-arithmetic/addition.tex',26,27,14,15,'disjoint sum','విచ్ఛిన్న సమ్మేళనం'),
 L('content/set-theory/ord-arithmetic/addition.tex',41,42,29,29,'reverse lexicographic','విలోమ నిఘంటు క్రమం'),
 L('content/set-theory/ord-arithmetic/addition.tex',185,186,147,148,'not','క్రమమార్పిడి ధర్మం లేదు')
];
locations['TE-T267']=[
 L('content/set-theory/ord-arithmetic/using-addition.tex',6,6,6,6,'Using Ordinal Addition','క్రమసంఖ్య కూడిక వినియోగం'),
 L('content/set-theory/ord-arithmetic/using-addition.tex',77,77,62,62,'equinumerous','సమసంఖ్యకాలు'),
 L('content/set-theory/ord-arithmetic/using-addition.tex',78,78,63,63,'Dedekind infinite','డెడెకిండ్ అనంతం')
];
locations['TE-T268']=[
 L('content/set-theory/ord-arithmetic/multiplication.tex',7,7,7,7,'Ordinal Multiplication','క్రమసంఖ్య గుణకారం'),
 L('content/set-theory/ord-arithmetic/multiplication.tex',18,19,11,11,'reverse lexicographic','విలోమ నిఘంటు క్రమాన్ని')
];
locations['TE-T269']=[
 L('content/set-theory/ord-arithmetic/exponentiation.tex',6,6,6,6,'Ordinal Exponentiation','క్రమసంఖ్య ఘాతాంకం'),
 L('content/set-theory/ord-arithmetic/exponentiation.tex',11,11,10,10,'synthetic definitions','నిర్మాణాత్మక నిర్వచనాలు'),
 L('content/set-theory/ord-arithmetic/exponentiation.tex',32,32,20,20,'transfinite','అతిపరిమిత పునరావృత్తి')
];
locations['TE-T270']=[
 L('content/set-theory/cardinals/cardinals.tex',8,8,8,8,'Cardinals','కార్డినల్ సంఖ్యలు')
];
locations['TE-T271']=[
 L('content/set-theory/cardinals/cp.tex',6,6,6,6,"Cantor's Principle",'కాంటర్ సూత్రం'),
 L('content/set-theory/cardinals/cp.tex',33,34,18,18,'cardinality','కార్డినాలిటీని'),
 L('content/set-theory/cardinals/cp.tex',36,36,20,20,'iff','అప్పుడూ అప్పుడే')
];
locations['TE-T272']=[
 L('content/set-theory/cardinals/cardsasords.tex',6,6,6,6,'Cardinals as Ordinals','క్రమసంఖ్యలుగా కార్డినల్ సంఖ్యలు'),
 L('content/set-theory/cardinals/cardsasords.tex',36,38,19,21,'Well-Ordering','సుక్రమపరచడం')
];
locations['TE-T273']=[
 L('content/set-theory/cardinals/milestone.tex',6,6,6,6,'A Milestone','ఒక మైలురాయి'),
 L('content/set-theory/cardinals/milestone.tex',11,17,10,12,'Well-Ordering','సుక్రమపరచడం')
];
locations['TE-T274']=[
 L('content/set-theory/cardinals/classing.tex',8,10,8,8,'enumerable','లెక్కించదగిన'),
 L('content/set-theory/cardinals/classing.tex',99,101,69,69,'nonenumerable','లెక్కించలేని')
];
locations['TE-T275']=[
 L('content/set-theory/cardinals/hp.tex',6,6,6,6,"Hume's Principle",'హ్యూమ్ సూత్రం'),
 L('content/set-theory/cardinals/hp.tex',64,69,33,33,'impredicatively','స్వవర్గావలంబితంగా')
];
locations['TE-T276']=[
 L('content/set-theory/card-arithmetic/card-arithmetic.tex',8,8,8,8,'Cardinal Arithmetic','కార్డినల్ అంకగణితం')
];
locations['TE-T277']=[
 L('content/set-theory/card-arithmetic/opps.tex',6,6,6,6,'Defining the Basic Operations','ప్రాథమిక క్రియల నిర్వచనం'),
 L('content/set-theory/card-arithmetic/opps.tex',8,8,8,8,'cardinal arithmetic','కార్డినల్ అంకగణితాన్ని'),
 L('content/set-theory/card-arithmetic/opps.tex',48,48,30,30,'commutative and associative','క్రమమార్పిడి, సహచర్య ధర్మాలు')
];
locations['TE-T278']=[
 L('content/set-theory/card-arithmetic/simp.tex',6,6,6,6,'Simplifying Addition and Multiplication','కూడిక, గుణకారాల సరళీకరణ'),
 L('content/set-theory/card-arithmetic/simp.tex',15,16,11,11,'canonical ordering','ప్రామాణిక క్రమం')
];
locations['TE-T279']=[
 L('content/set-theory/card-arithmetic/expotough.tex',6,6,6,6,'Cardinal Exponentiation','కార్డినల్ ఘాతాంకంలో'),
 L('content/set-theory/card-arithmetic/expotough.tex',40,42,28,29,'bijection','ద్వైజెక్షన్')
];
locations['TE-T280']=[
 L('content/set-theory/card-arithmetic/ch.tex',7,7,7,7,'Continuum Hypothesis','సాతత్య పరికల్పన'),
 L('content/set-theory/card-arithmetic/ch.tex',90,90,61,61,'Generalized Continuum Hypothesis','సాధారణీకృత సాతత్య పరికల్పన')
];
locations['TE-T281']=[
 L('content/set-theory/card-arithmetic/fix.tex',6,6,6,6,'Fixed Points','స్థిర బిందువులు'),
 L('content/set-theory/card-arithmetic/fix.tex',136,136,91,91,'wide as it is tall','వెడల్పు దాని ఎత్తుతో సమానం')
];
locations['TE-T282']=[
 L('content/set-theory/choice/choice.tex',8,8,8,8,'Choice','ఎంపిక')
];
locations['TE-T283']=[
 L('content/set-theory/choice/introduction.tex',11,13,9,9,'Axiom of Well-Ordering','సుక్రమపరచడం స్వయంసిద్ధం'),
 L('content/set-theory/choice/introduction.tex',12,13,9,9,'Axiom of','ఎంపిక స్వయంసిద్ధం')
];
locations['TE-T284']=[
 L('content/set-theory/choice/tarskiscott.tex',6,6,6,6,'Tarski--Scott Trick','టార్స్కీ--స్కాట్ యుక్తి'),
 L('content/set-theory/choice/tarskiscott.tex',35,38,20,22,'least possible rank','అత్యల్ప స్థాయి')
];
locations['TE-T285']=[
 L('content/set-theory/choice/hartogs.tex',6,6,6,6,"Hartogs' Lemma",'హార్టోగ్స్ లెమ్మా'),
 L('content/set-theory/choice/hartogs.tex',77,83,59,59,'incomparable','పోల్చలేం')
];
locations['TE-T286']=[
 L('content/set-theory/choice/wellorderingproblem.tex',6,6,6,6,'Well-Ordering Problem','సుక్రమపరచడం సమస్య'),
 L('content/set-theory/choice/wellorderingproblem.tex',25,25,15,15,'choice function','ఎంపిక ప్రమేయం'),
 L('content/set-theory/choice/wellorderingproblem.tex',39,39,27,27,'Well-Ordering and Choice','సుక్రమపరచడం, ఎంపిక')
];
locations['TE-T287']=[
 L('content/set-theory/choice/countablechoice.tex',6,6,6,6,'Countable Choice','లెక్కించదగిన ఎంపిక'),
 L('content/set-theory/choice/countablechoice.tex',88,89,66,66,'countable union','లెక్కించదగిన సమితుల లెక్కించదగిన సమ్మేళనం')
];
locations['TE-T288']=[
 L('content/set-theory/choice/justifications.tex',6,6,6,6,'Intrinsic Considerations','అంతర్గత సమర్థనపై పరిశీలనలు'),
 L('content/set-theory/choice/justifications.tex',32,32,20,20,'choice set','ఎంపిక సమితి')
];
locations['TE-T289']=[
 L('content/set-theory/choice/banach.tex',6,6,6,6,'Banach--Tarski Paradox','బనాక్--టార్స్కీ వైరుధ్యాభాసం'),
 L('content/set-theory/choice/banach.tex',65,65,34,34,'measurable','కొలవదగినవి')
];
locations['TE-T290']=[
 L('content/set-theory/choice/vitali.tex',6,6,6,6,"Vitali's Paradox",'విటాలి వైరుధ్యాభాసం'),
 L('content/set-theory/choice/vitali.tex',35,37,16,17,'rational','పరిమేయ')
];
locations['TE-T291']=[
 L('content/methods/methods.tex',7,7,7,7,'Methods','పద్ధతులు'),
 L('content/methods/methods.tex',10,12,10,12,'proof methods','నిరూపణ పద్ధతులను')
];
locations['TE-T292']=[
 L('content/methods/proofs/proofs.tex',8,8,8,8,'Proofs','నిరూపణలు')
];
locations['TE-T293']=[
 L('content/methods/proofs/introduction.tex',13,16,13,13,'derivation','వ్యుత్పత్తి'),
 L('content/methods/proofs/introduction.tex',43,55,19,19,'A lemma','ఉపప్రమేయం'),
 L('content/methods/proofs/introduction.tex',57,67,21,21,'hypotheses','పరికల్పనలు')
];
locations['TE-T294']=[
 L('content/methods/proofs/starting-proofs.tex',11,11,11,11,'Starting a Proof','నిరూపణను ప్రారంభించడం'),
 L('content/methods/proofs/starting-proofs.tex',21,25,17,17,'assumptions','పరికల్పనలు')
];
locations['TE-T295']=[
 L('content/methods/proofs/using-definitions.tex',17,20,13,13,'definiendum','నిర్వచ్యపదం'),
 L('content/methods/proofs/using-definitions.tex',70,80,34,37,'unpacking the definition','నిర్వచనాన్ని విప్పితే')
];
locations['TE-T296']=[
 L('content/methods/proofs/inference-patterns.tex',11,11,11,11,'Inference Patterns','నిగమన నమూనాలు'),
 L('content/methods/proofs/inference-patterns.tex',96,96,38,38,'Conditional Proof','సోపాధిక నిరూపణ'),
 L('content/methods/proofs/inference-patterns.tex',166,166,66,66,'Proof by Cases','సందర్భాలవారీ నిరూపణ'),
 L('content/methods/proofs/inference-patterns.tex',230,230,96,96,'Proving an Existence Claim','అస్తిత్వ వాదనను నిరూపించడం')
];
locations['TE-T297']=[
 L('content/methods/proofs/example-1.tex',11,11,11,11,'An Example','ఒక ఉదాహరణ'),
 L('content/methods/proofs/example-1.tex',18,19,16,17,'For any sets','ఏ సమితులు')
];
locations['TE-T298']=[
 L('content/methods/proofs/example-2.tex',11,11,11,11,'Another Example','మరో ఉదాహరణ'),
 L('content/methods/proofs/example-2.tex',86,91,53,55,'excluded middle','బహిష్కృత మధ్యమ సూత్రం')
];
locations['TE-T299']=[
 L('content/methods/proofs/proof-by-contradiction.tex',11,11,11,11,'Proof by Contradiction','వైరుధ్యం ద్వారా నిరూపణ'),
 L('content/methods/proofs/proof-by-contradiction.tex',81,86,44,45,'Every positive claim','ప్రతి సానుకూల వాదన')
];
locations['TE-T300']=[
 L('content/methods/proofs/reading-proofs.tex',10,10,10,10,'Reading Proofs','నిరూపణలను చదవడం'),
 L('content/methods/proofs/reading-proofs.tex',21,21,14,14,'Absorption','శోషణ')
];
locations['TE-T301']=[
 L('content/methods/proofs/cant-do-it.tex',11,11,11,11,"I Can't Do It",'నా వల్ల కావడం లేదు'),
 L('content/methods/proofs/cant-do-it.tex',21,22,17,17,'Start as far in advance as possible','సాధ్యమైనంత ముందుగానే మొదలుపెట్టండి')
];
locations['TE-T302']=[
 L('content/methods/proofs/resources.tex',11,11,11,11,'Other Resources','ఇతర వనరులు'),
 L('content/methods/proofs/resources.tex',34,34,17,17,'Motivational Videos','ప్రేరణనిచ్చే వీడియోలు')
];
locations['TE-T303']=[
 L('content/methods/induction/induction.tex',8,8,8,8,'Induction','ఆగమనం')
];
locations['TE-T304']=[
 L('content/methods/induction/introduction.tex',23,24,15,15,'Mathematical','గణిత'),
 L('content/methods/induction/introduction.tex',47,48,24,24,'Structural induction','నిర్మాణాత్మక ఆగమనం')
];
locations['TE-T305']=[
 L('content/methods/induction/induction-on-N.tex',11,11,11,11,'Induction on','ఆగమనం'),
 L('content/methods/induction/induction-on-N.tex',60,61,31,31,'induction basis','ఆగమన ఆధారం'),
 L('content/methods/induction/induction-on-N.tex',71,72,39,39,'inductive hypothesis','ఆగమన పరికల్పన')
];
locations['TE-T306']=[
 L('content/methods/induction/strong-induction.tex',11,11,11,11,'Strong Induction','బలమైన ఆగమనం'),
 L('content/methods/induction/strong-induction.tex',21,27,16,17,'all numbers smaller','చిన్న అన్ని సంఖ్యలకూ')
];
locations['TE-T307']=[
 L('content/methods/induction/inductive-definitions.tex',11,11,11,11,'Inductive Definitions','ఆగమనాత్మక నిర్వచనాలు'),
 L('content/methods/induction/inductive-definitions.tex',41,42,18,19,'Nice terms','చక్కని పదాలు'),
 L('content/methods/induction/inductive-definitions.tex',141,141,76,76,'supernice terms','అత్యంత చక్కని పదాల')
];
locations['TE-T308']=[
 L('content/methods/induction/structural-induction.tex',11,11,11,11,'Structural Induction','నిర్మాణాత్మక ఆగమనం'),
 L('content/methods/induction/structural-induction.tex',68,71,44,44,'proper initial','నిజ ప్రారంభ భాగం')
];
locations['TE-T309']=[
 L('content/methods/induction/relations.tex',16,18,13,13,'subterm','ఉపపదం'),
 L('content/methods/induction/relations.tex',55,55,34,34,'bracketless terms','బ్రాకెట్లు లేని పదాలను'),
 L('content/methods/induction/relations.tex',84,85,59,59,'unique readability','ఏకైక పఠనీయత'),
 L('content/methods/induction/relations.tex',115,115,75,75,'depth','లోతు')
];
locations['TE-T310']=[
 L('content/history/history.tex',7,7,7,7,'History','చరిత్ర')
];
locations['TE-T311']=[
 L('content/history/biographies/biographies.tex',8,8,8,8,'Biographies','జీవిత చరిత్రలు')
];
locations['TE-T312']=[
 L('content/history/biographies/georg-cantor.tex',11,11,11,11,'Georg Cantor','గెయోర్గ్ కాంటర్'),
 L('content/history/biographies/georg-cantor.tex',22,23,17,17,'set theory','సమితి సిద్ధాంతం'),
 L('content/history/biographies/georg-cantor.tex',29,29,19,19,'transfinite numbers','అతిపరిమిత సంఖ్యల')
];
locations['TE-T313']=[
 L('content/history/biographies/alonzo-church.tex',11,11,11,11,'Alonzo Church','అలోంజో చర్చ్'),
 L('content/history/biographies/alonzo-church.tex',32,32,17,17,'Church--Turing Thesis','చర్చ్--ట్యూరింగ్ సిద్ధాంతప్రతిపాదన'),
 L('content/history/biographies/alonzo-church.tex',35,35,17,17,"Church's Theorem",'చర్చ్ సిద్ధాంతం')
];
locations['TE-T314']=[
 L('content/history/biographies/gerhard-gentzen.tex',11,11,11,11,'Gerhard Gentzen','గెర్హార్డ్ గెంట్సెన్'),
 L('content/history/biographies/gerhard-gentzen.tex',16,17,15,15,'natural deduction','సహజ నిగమనం'),
 L('content/history/biographies/gerhard-gentzen.tex',16,17,15,15,'sequent calculus','సీక్వెంట్ కలనశాస్త్ర'),
 L('content/history/biographies/gerhard-gentzen.tex',34,34,18,18,'consistency','అవిరోధత్వం')
];
locations['TE-T315']=[
 L('content/history/biographies/kurt-goedel.tex',11,11,11,11,'Kurt G','కుర్ట్ గ్యోడెల్'),
 L('content/history/biographies/kurt-goedel.tex',32,33,17,17,'completeness theorem','సంపూర్ణత సిద్ధాంతాన్ని'),
 L('content/history/biographies/kurt-goedel.tex',34,35,17,17,'incompleteness theorems','అసంపూర్ణత సిద్ధాంతాలు')
];
locations['TE-T316']=[
 L('content/history/biographies/emmy-noether.tex',11,11,11,11,'Emmy Noether','ఎమ్మీ నోయెథర్'),
 L('content/history/biographies/emmy-noether.tex',42,42,19,19,'ascending chain condition','ఆరోహణ శ్రేణి షరతు'),
 L('content/history/biographies/emmy-noether.tex',49,51,20,20,'descending chain condition','అవరోహణ శ్రేణి షరతు'),
 L('content/history/biographies/emmy-noether.tex',55,55,20,20,'Noetherian induction','నోయెథరియన్ ఆగమనం')
];
locations['TE-T317']=[
 L('content/history/biographies/rozsa-peter.tex',11,11,11,11,'P','రోజా పీటర్'),
 L('content/history/biographies/rozsa-peter.tex',17,18,15,15,'recursion theory','పునరావృత్త సిద్ధాంతం'),
 L('content/history/biographies/rozsa-peter.tex',45,45,20,20,'not primitive recursive','ఆదిమ పునరావృత్తం కాదని'),
 L('content/history/biographies/rozsa-peter.tex',48,48,20,20,'Ackermann--P','ఆకెర్మాన్--పీటర్ ప్రమేయం')
];
locations['TE-T318']=[
 L('content/history/biographies/julia-robinson.tex',10,10,10,10,'Julia Robinson','జూలియా రాబిన్సన్'),
 L('content/history/biographies/julia-robinson.tex',16,16,14,14,"Hilbert's tenth problem",'హిల్బర్ట్ పదవ సమస్య'),
 L('content/history/biographies/julia-robinson.tex',56,56,20,20,'Diophantine problems','డయోఫాంటైన్ సమస్యలు'),
 L('content/history/biographies/julia-robinson.tex',67,67,20,20,'MRDP theorem','ఎంఆర్‌డీపీ సిద్ధాంతం')
];
locations['TE-T319']=[
 L('content/history/biographies/bertrand-russell.tex',11,11,11,11,'Bertrand Russell','బెర్‌ట్రాండ్ రసెల్'),
 L('content/history/biographies/bertrand-russell.tex',15,16,15,15,'analytic','విశ్లేషణాత్మక తత్వశాస్త్ర'),
 L('content/history/biographies/bertrand-russell.tex',34,35,19,19,'Principia Mathematica','Principia Mathematica')
];
locations['TE-T320']=[
 L('content/history/biographies/alfred-tarski.tex',11,11,11,11,'Alfred Tarski','ఆల్ఫ్రెడ్ టార్స్కీ'),
 L('content/history/biographies/alfred-tarski.tex',34,34,19,19,'logical consequence','తార్కిక అనుగమనం'),
 L('content/history/biographies/alfred-tarski.tex',34,34,19,19,'logical truth','తార్కిక సత్యం')
];
locations['TE-T321']=[
 L('content/history/biographies/alan-turing.tex',11,11,11,11,'Alan Turing','అలన్ ట్యూరింగ్'),
 L('content/history/biographies/alan-turing.tex',25,25,17,17,'Turing machine','ట్యూరింగ్ యంత్రం'),
 L('content/history/biographies/alan-turing.tex',36,37,19,19,'Enigma','ఎనిగ్మా'),
 L('content/history/biographies/alan-turing.tex',41,42,19,19,'Colossus','కొలోసస్')
];
locations['TE-T322']=[
 L('content/history/biographies/ernst-zermelo.tex',11,11,11,11,'Ernst Zermelo','ఎర్న్‌స్ట్ సెర్మెలో'),
 L('content/history/biographies/ernst-zermelo.tex',21,22,15,15,'axiom of','ఎంపిక స్వయంసిద్ధాన్ని'),
 L('content/history/biographies/ernst-zermelo.tex',22,22,15,15,'axiomatization','స్వయంసిద్ధీకరించడం')
];
locations['TE-T323']=[
 L('content/history/set-theory/set-theory.tex',8,8,8,8,'History and Mythology of Set Theory','సమితి సిద్ధాంతపు చరిత్ర మరియు పురాణాలు'),
 L('content/history/set-theory/set-theory.tex',11,12,11,11,'historical prelude','చారిత్రక ఉపోద్ఘాతం')
];
locations['TE-T324']=[
 L('content/history/set-theory/infinitesimals.tex',6,6,6,6,'Infinitesimals','అనంతసూక్ష్మాలు'),
 L('content/history/set-theory/infinitesimals.tex',10,11,8,8,'differentiation','అవకలనం'),
 L('content/history/set-theory/infinitesimals.tex',51,53,35,36,'derivative','వ్యుత్పన్నానికి')
];
locations['TE-T325']=[
 L('content/history/set-theory/limits.tex',11,11,11,11,'Limits','పరిమితుల'),
 L('content/history/set-theory/limits.tex',73,73,54,54,'differentiable','అవకలనీయమైనది'),
 L('content/history/set-theory/limits.tex',83,85,56,56,'continuous','అవిచ్ఛిన్నం')
];
locations['TE-T326']=[
 L('content/history/set-theory/pathologies.tex',6,6,6,6,'Pathologies','విచిత్ర నిర్మాణాలు'),
 L('content/history/set-theory/pathologies.tex',11,11,10,10,'continuous everywhere','ప్రతిచోటా అవిచ్ఛిన్నం'),
 L('content/history/set-theory/pathologies.tex',53,55,20,20,'curve which fills space','స్థలాన్ని నింపే వక్రరేఖ')
];
locations['TE-T327']=[
 L('content/history/set-theory/mythology.tex',7,7,7,7,'Myth','పురాణమే'),
 L('content/history/set-theory/mythology.tex',13,13,9,9,'geometric intuition','జ్యామితీయ అంతఃప్రజ్ఞ'),
 L('content/history/set-theory/mythology.tex',17,17,12,12,'out of context','సందర్భం నుంచి')
];
locations['TE-T328']=[
 L('content/history/set-theory/cantor-plane.tex',6,6,6,6,'Cantor on the Line and the Plane','రేఖ, తలంపై కాంటర్'),
 L('content/history/set-theory/cantor-plane.tex',24,36,17,27,'injection','అంతఃక్షేపణ'),
 L('content/history/set-theory/cantor-plane.tex',53,57,40,40,'surjection','అధిక్షేపణ'),
 L('content/history/set-theory/cantor-plane.tex',62,69,44,47,'Schr','ష్రోడర్--బెర్న్‌స్టైన్')
];
locations['TE-T329']=[
 L('content/history/set-theory/hilbert-curve.tex',7,7,7,7,'Space-filling Curves','స్థలాన్ని నింపే వక్రరేఖలు'),
 L('content/history/set-theory/hilbert-curve.tex',83,89,74,78,'point-by-point limit','బిందువువారీ పరిమితి'),
 L('content/history/set-theory/hilbert-curve.tex',90,105,79,88,'grid-location','గడి'),
 L('content/history/set-theory/hilbert-curve.tex',109,121,90,96,'continuous','అవిచ్ఛిన్న')
];
locations['TE-T330']=[
 L('content/reference/reference.tex',7,7,7,7,'Reference','సూచిక'),
 L('content/reference/reference.tex',10,12,10,11,'various lists','వివిధ వర్ణమాలలు')
];
locations['TE-T331']=[
 L('content/reference/greek-alphabet/greek-alphabet.tex',8,8,8,8,'Greek Alphabet','గ్రీకు వర్ణమాల'),
 L('content/reference/greek-alphabet/greek-alphabet.tex',12,12,12,12,'Alpha','ఆల్ఫా'),
 L('content/reference/greek-alphabet/greek-alphabet.tex',35,35,35,35,'Omega','ఒమేగా')
];
locations['TE-T332']=[
 L('content/reference/fraktur-alphabet/fraktur-alphabet.tex',8,8,8,8,'Fraktur Alphabet','ఫ్రాక్టూర్ వర్ణమాల')
];
locations['TE-T333']=[
 L('content/first-order-logic/axiomatic-deduction/provability.tex',16,16,16,16,'Properties of','ధర్మాలు'),
 L('content/first-order-logic/axiomatic-deduction/provability.tex',18,18,18,18,'Monotonicity','ఏకదిశత్వం'),
 L('content/first-order-logic/axiomatic-deduction/provability.tex',187,190,173,175,'Weak Generalization','బలహీన సామాన్యీకరణ'),
 L('content/first-order-logic/axiomatic-deduction/provability.tex',234,237,198,201,'Change of Bound Variable','బంధిత చరరాశి మార్పు'),
 L('content/first-order-logic/axiomatic-deduction/provability.tex',262,267,215,218,'Strong Generalization','బలమైన సామాన్యీకరణ')
];
locations['TE-T334']=[
 L('content/first-order-logic/completeness/maximally-consistent-sets.tex',14,14,14,14,'Maximally Consistent Sets','గరిష్ఠ అవైరుధ్య సమితులు'),
 L('content/first-order-logic/completeness/maximally-consistent-sets.tex',16,23,16,23,'Maximally consistent set','గరిష్ఠ అవైరుధ్య సమితి'),
 L('content/first-order-logic/completeness/maximally-consistent-sets.tex',38,47,35,38,'completeness proof','సంపూర్ణత నిరూపణలో'),
 L('content/first-order-logic/completeness/maximally-consistent-sets.tex',54,70,40,56,'maximally consistent','గరిష్ఠ అవైరుధ్యమైనది')
];
locations['TE-T335']=[
 L('content/first-order-logic/syntax-and-semantics/introduction.tex',11,11,11,11,'Introduction','పరిచయం'),
 L('content/first-order-logic/syntax-and-semantics/introduction.tex',13,30,13,13,'syntax and semantics','వాక్యనిర్మాణం, అర్థవిచారాన్ని'),
 L('content/first-order-logic/syntax-and-semantics/introduction.tex',33,53,15,15,'satisfaction','సంతృప్తి'),
 L('content/first-order-logic/syntax-and-semantics/introduction.tex',55,65,17,17,'validity, entailment','చెల్లుబాటు, అనుగమనం')
];
locations['TE-T336']=[
 L('content/first-order-logic/syntax-and-semantics/syntax-and-semantics.tex',8,8,8,8,'Syntax and Semantics','వాక్యనిర్మాణం మరియు అర్థవిచారం')
];
locations['TE-T337']=[
 L('content/incompleteness/representability-in-q/c-representable.tex',10,10,10,10,'Representable','ప్రతినిధీకరించవచ్చు'),
 L('content/incompleteness/representability-in-q/c-representable.tex',79,90,53,64,'composition','సంయోజనం'),
 L('content/incompleteness/representability-in-q/c-representable.tex',94,103,66,74,'unbounded search','అపరిమిత శోధన'),
 L('content/incompleteness/representability-in-q/c-representable.tex',172,187,126,126,'computable functions','గణనీయ ప్రమేయాల')
];
locations['TE-T338']=[
 L('content/incompleteness/representability-in-q/c.tex',10,10,10,10,'Functions','ప్రమేయాలు'),
 L('content/incompleteness/representability-in-q/c.tex',24,26,24,26,'unbounded search','అపరిమిత శోధన'),
 L('content/incompleteness/representability-in-q/c.tex',30,36,26,28,'primitive recursion','ఆదిమ పునరావృతాన్ని')
];
locations['TE-T339']=[
 L('content/intuitionistic-logic/semantics/propositions.tex',11,11,11,11,'Propositions','ప్రతిపాదనలు'),
 L('content/intuitionistic-logic/semantics/propositions.tex',13,16,13,13,'relational model','సంబంధ నమూనా'),
 L('content/intuitionistic-logic/semantics/propositions.tex',18,35,16,33,'inductively','ఆగమనాత్మకంగా')
];
locations['TE-T340']=[
 L('content/lambda-calculus/lambda-definability/lists.tex',10,10,10,10,'Lists','జాబితాలు'),
 L('content/lambda-calculus/lambda-definability/lists.tex',12,21,12,16,'accumulator','సంచయక'),
 L('content/lambda-calculus/lambda-definability/lists.tex',23,27,18,20,'right fold','కుడివైపు మడత'),
 L('content/lambda-calculus/lambda-definability/lists.tex',30,43,22,30,'Sum','Sum')
];
locations['TE-T341']=[
 L('content/lambda-calculus/syntax/conversion.tex',10,10,10,10,'Conversion and Reduction','సమానరూప మార్పు మరియు సంక్షేపణం'),
 L('content/lambda-calculus/syntax/conversion.tex',16,20,13,14,'conversion','సమానరూప మార్పు')
];
locations['TE-T342']=[
 L('content/many-valued-logic/sequent-calculus/proof-theoretic-notions.tex',11,11,11,11,'Proof-Theoretic Notions','నిరూపణ-సిద్ధాంత భావనలు'),
 L('content/many-valued-logic/sequent-calculus/proof-theoretic-notions.tex',81,85,82,86,'Monotonicity','ఏకదిశత'),
 L('content/many-valued-logic/sequent-calculus/proof-theoretic-notions.tex',140,149,141,150,'Compactness','సంహతత్వం')
];
locations['TE-T343']=[
 L('content/model-theory/basics/nonstandard-arithmetic.tex',10,10,10,10,'Non-standard Models','అప్రమాణ నమూనాలు'),
 L('content/model-theory/basics/nonstandard-arithmetic.tex',17,24,15,19,'standard model','ప్రమాణ నమూనా'),
 L('content/model-theory/basics/nonstandard-arithmetic.tex',92,97,57,57,'standard part','ప్రమాణ భాగం'),
 L('content/model-theory/basics/nonstandard-arithmetic.tex',110,128,65,76,'block','బ్లాక్'),
 L('content/model-theory/basics/nonstandard-arithmetic.tex',152,168,89,98,'dense','సాంద్రమైనది')
];
locations['TE-T344']=[
 L('content/normal-modal-logic/syntax-and-semantics/normal-modal-logics.tex',11,11,11,11,'Normal Modal Logics','సాధారణ మోడల్ తర్కాలు'),
 L('content/normal-modal-logic/syntax-and-semantics/normal-modal-logics.tex',20,27,16,26,'uniform substitution','ఏకరీతి ప్రతిస్థాపన'),
 L('content/normal-modal-logic/syntax-and-semantics/normal-modal-logics.tex',40,49,34,43,'necessitation','అనివార్యతీకరణ')
];
locations['TE-T345']=[
 L('content/proof-theory/cut-elimination/ce-largest.tex',11,11,11,11,'Removing Largest Cuts','అత్యధిక స్థాయి కట్‌ల తొలగింపు'),
 L('content/proof-theory/cut-elimination/ce-largest.tex',20,21,16,16,'cut rank','కట్ స్థాయి'),
 L('content/proof-theory/cut-elimination/ce-largest.tex',97,101,56,57,'rank','స్థాయి'),
 L('content/proof-theory/cut-elimination/ce-largest.tex',225,246,139,145,'marked occurrences','గుర్తించిన')
];
locations['TE-T346']=[
 L('content/proof-theory/cut-elimination/ce-topmost.tex',11,11,11,11,'Removing Topmost Cuts','అత్యున్నత కట్‌ల తొలగింపు'),
 L('content/proof-theory/cut-elimination/ce-topmost.tex',26,28,26,26,'cut height','కట్ ఎత్తు'),
 L('content/proof-theory/cut-elimination/ce-topmost.tex',26,28,26,26,'cut rank','కట్ స్థాయి'),
 L('content/proof-theory/cut-elimination/ce-topmost.tex',173,180,100,100,'permuting a cut','కట్‌ను పైకి స్థానమార్చడం')
];
locations['TE-T347']=[
 L('content/proof-theory/cut-elimination/cut-elimination.tex',8,8,8,8,'Cut Elimination','కట్ తొలగింపు')
];
locations['TE-T348']=[
 L('content/proof-theory/cut-elimination/interpolation.tex',11,11,11,11,"Maehara's Lemma",'మహేరా లెమ్మా'),
 L('content/proof-theory/cut-elimination/interpolation.tex',14,18,14,14,'interpolant','మధ్యవర్తి వాక్యం'),
 L('content/proof-theory/cut-elimination/interpolation.tex',496,503,372,379,'implicitly defines','పరోక్షంగా నిర్వచిస్తుంది'),
 L('content/proof-theory/cut-elimination/interpolation.tex',572,575,428,431,'Joint Consistency','సంయుక్త అవైరుధ్య')
];
locations['TE-T349']=[
 L('content/proof-theory/cut-elimination/introduction.tex',11,11,11,11,'Introduction','పరిచయం'),
 L('content/proof-theory/cut-elimination/introduction.tex',31,32,23,23,'admissible rule','అనుమతిత నియమమా'),
 L('content/proof-theory/cut-elimination/introduction.tex',94,94,35,35,'context-sharing cut','సందర్భాన్ని పంచుకునే కట్')
];
locations['TE-T350']=[
 L('content/proof-theory/cut-elimination/intuitionistic.tex',1,1,1,1,'If','అయితే'),
 L('content/proof-theory/cut-elimination/intuitionistic.tex',35,38,38,40,'cut','కట్')
];
locations['TE-T351']=[
 L('content/proof-theory/cut-elimination/midsequent.tex',11,11,11,11,'Midsequent Theorem','మధ్యసీక్వెంట్ ప్రమేయం'),
 L('content/proof-theory/cut-elimination/midsequent.tex',14,23,13,15,'prenex','ప్రీనెక్స్'),
 L('content/proof-theory/cut-elimination/midsequent.tex',36,39,22,22,'Herbrand disjunction','హెర్బ్రాండ్ వియోజనం')
];
locations['TE-T352']=[
 L('content/proof-theory/natural-deduction/grafting.tex',11,11,11,11,'Grafting','అంటుకట్టడం'),
 L('content/proof-theory/natural-deduction/grafting.tex',38,40,30,30,'grafting','అంటుకట్టడం'),
 L('content/proof-theory/natural-deduction/grafting.tex',43,45,33,33,'open assumption','తెరిచి ఉన్న ఉపపత్తి'),
 L('content/proof-theory/natural-deduction/grafting.tex',50,59,36,37,'eigenvariable','ఐగెన్ చరరాశి')
];
locations['TE-T353']=[
 L('content/proof-theory/natural-deduction/introduction.tex',13,20,13,13,'Natural deduction','సహజ నిగమనం'),
 L('content/proof-theory/natural-deduction/introduction.tex',13,20,13,13,'introduction','ప్రవేశ'),
 L('content/proof-theory/natural-deduction/introduction.tex',31,43,17,18,'discharge','విసర్జన')
];
locations['TE-T354']=[
 L('content/proof-theory/natural-deduction/natural-deduction.tex',8,8,8,8,'Natural Deduction','సహజ నిగమనం')
];
locations['TE-T355']=[
 L('content/proof-theory/natural-deduction/quantifiers.tex',11,11,11,11,'Regular','క్రమబద్ధమైన'),
 L('content/proof-theory/natural-deduction/quantifiers.tex',13,16,13,13,'eigenvariable conditions','ఐగెన్ చరరాశి షరతులు'),
 L('content/proof-theory/natural-deduction/quantifiers.tex',136,145,103,103,'clean','శుభ్రమైనది')
];
locations['TE-T356']=[
 L('content/proof-theory/natural-deduction/rules-N1.tex',128,132,128,131,'Rules of','నియమాలు'),
 L('content/proof-theory/natural-deduction/rules-N1.tex',128,132,128,131,'must not occur','ఉండకూడదు')
];
locations['TE-T357']=[
 L('content/proof-theory/natural-deduction/rules-N2.tex',102,108,102,106,'Rules of','నియమాలు'),
 L('content/proof-theory/natural-deduction/rules-N2.tex',102,108,102,106,'labelled','గుర్తులు కలిగిన')
];
locations['TE-T358']=[
 L('content/proof-theory/natural-deduction/rules-proofs.tex',34,40,33,33,'major','ముఖ్య'),
 L('content/proof-theory/natural-deduction/rules-proofs.tex',59,62,38,38,'discharge label','విసర్జన గుర్తు'),
 L('content/proof-theory/natural-deduction/rules-proofs.tex',207,209,135,135,'height','ఎత్తు')
];
locations['TE-T359']=[
 L('content/proof-theory/natural-deduction/sequents.tex',19,22,13,14,'sequent style','సీక్వెంట్-శైలి'),
 L('content/proof-theory/natural-deduction/sequents.tex',25,30,17,17,'succedent','ఫలితభాగం'),
 L('content/proof-theory/natural-deduction/sequents.tex',25,30,17,17,'context','సందర్భం')
];
locations['TE-T360']=[
 L('content/proof-theory/natural-deduction/translation-G2i.tex',11,11,11,11,'Translating from','అనువాదం'),
 L('content/proof-theory/natural-deduction/translation-G2i.tex',13,20,13,13,'multisets','బహుసమితులు'),
 L('content/proof-theory/natural-deduction/translation-G2i.tex',16,20,13,13,'corresponds to','అనురూపం')
];
locations['TE-T361']=[
 L('content/proof-theory/natural-deduction/translation-N2i.tex',11,11,11,11,'Translating from','అనువాదం'),
 L('content/proof-theory/natural-deduction/translation-N2i.tex',13,18,13,16,'multiset','బహుసమితి'),
 L('content/proof-theory/natural-deduction/translation-N2i.tex',13,18,13,16,'emptyset','emptyset')
];
locations['TE-T362']=[
 L('content/proof-theory/normalization/introduction.tex',38,43,30,30,'normalization','సాధారణీకరణ'),
 L('content/proof-theory/normalization/introduction.tex',38,43,30,30,'normal','సాధారణ'),
 L('content/proof-theory/normalization/introduction.tex',55,57,32,32,'sub-!!{formula} property','ఉప-')
];
locations['TE-T363']=[
 L('content/proof-theory/normalization/normalization-thm.tex',11,11,11,11,'Normalization Theorem','సాధారణీకరణ ప్రమేయం'),
 L('content/proof-theory/normalization/normalization-thm.tex',13,18,13,13,'permutation','స్థానమార్పు'),
 L('content/proof-theory/normalization/normalization-thm.tex',25,28,19,19,'cut rank and length','కట్ స్థాయి, కట్ పొడవు')
];
locations['TE-T364']=[
 L('content/proof-theory/normalization/normalization.tex',8,8,8,8,'Normalization','సాధారణీకరణ')
];
locations['TE-T365']=[
 L('content/proof-theory/normalization/permutations.tex',11,11,11,11,'Permutation Conversions','స్థానమార్పు పరివర్తనలు'),
 L('content/proof-theory/normalization/permutations.tex',354,356,322,322,'eigenvariable condition','స్వతంత్ర చరరాశి నియమం'),
 L('content/proof-theory/normalization/permutations.tex',417,421,370,370,'topmost','అత్యుపరి')
];
locations['TE-T366']=[
 L('content/proof-theory/normalization/reductions.tex',11,11,11,11,'Reduction Conversions','తగ్గింపు పరివర్తనలు'),
 L('content/proof-theory/normalization/reductions.tex',80,82,45,45,'rightmost','అత్యంత కుడివైపు'),
 L('content/proof-theory/normalization/reductions.tex',109,111,49,49,'detour conversion','పక్కదారి పరివర్తన')
];
locations['TE-T367']=[
 L('content/proof-theory/normalization/segments.tex',11,11,11,11,'Segments and Cuts','ఖండాలు మరియు కట్‌లు'),
 L('content/proof-theory/normalization/segments.tex',72,74,57,57,'segment','ఖండం'),
 L('content/proof-theory/normalization/segments.tex',88,90,70,70,'cut','కట్'),
 L('content/proof-theory/normalization/segments.tex',100,104,77,77,'cut length','కట్ పొడవు')
];
locations['TE-T368']=[
 L('content/proof-theory/normalization/translations.tex',11,11,11,11,'Translating Between Normal','సాధారణ'),
 L('content/proof-theory/normalization/translations.tex',17,23,16,16,'corresponds to','అనురూపం'),
 L('content/proof-theory/normalization/translations.tex',61,65,34,34,'branch','శాఖ'),
 L('content/proof-theory/normalization/translations.tex',66,69,34,34,'main branch','ప్రధాన శాఖ')
];
locations['TE-T369']=[
 L('content/proof-theory/proof-search/completeness.tex',11,11,11,11,'Completeness','సంపూర్ణత'),
 L('content/proof-theory/proof-search/completeness.tex',23,27,16,20,'failure branch','విఫల శాఖ'),
 L('content/proof-theory/proof-search/completeness.tex',66,71,38,39,'term model','పద నమూనా')
];
locations['TE-T370']=[
 L('content/proof-theory/proof-search/introduction.tex',19,22,13,13,'proof search','నిరూపణ అన్వేషణ'),
 L('content/proof-theory/proof-search/introduction.tex',40,43,17,17,'backwards','వెనుకకు'),
 L('content/proof-theory/proof-search/introduction.tex',50,53,19,19,'proof search algorithm','నిరూపణ అన్వేషణ అల్గోరిథం'),
 L('content/proof-theory/proof-search/introduction.tex',73,75,26,26,'backtrack','వెనక్కి')
];
locations['TE-T371']=[
 L('content/proof-theory/proof-search/proof-search.tex',8,8,8,8,'Proof Search','నిరూపణ అన్వేషణ')
];
locations['TE-T372']=[
 L('content/proof-theory/proof-search/rules-Tc.tex',79,81,79,79,'Rules of','నియమాలు'),
 L('content/proof-theory/proof-search/rules-Tc.tex',80,81,79,79,'must be new to the branch','శాఖకు కొత్తది')
];
locations['TE-T373']=[
 L('content/proof-theory/proof-search/search-algorithm.tex',11,11,11,11,'Search Algorithm','అన్వేషణ అల్గోరిథం'),
 L('content/proof-theory/proof-search/search-algorithm.tex',20,24,16,16,'fairness','సముచిత అవకాశ నిబంధన'),
 L('content/proof-theory/proof-search/search-algorithm.tex',36,38,20,20,'maximal index','గరిష్ఠ సూచిక')
];
locations['TE-T374']=[
 L('content/proof-theory/proof-search/tableaux.tex',11,11,11,11,'Tableaux','టాబ్లోలు'),
 L('content/proof-theory/proof-search/tableaux.tex',19,20,13,13,'semantic','అర్థవిచార'),
 L('content/proof-theory/proof-search/tableaux.tex',22,23,15,16,'signed','చిహ్నిత'),
 L('content/proof-theory/proof-search/tableaux.tex',44,46,25,27,'closed','మూసుకుంది')
];
locations['TE-T375']=[
 L('content/proof-theory/proof-theory.tex',7,7,7,7,'Proof Theory','నిరూపణ సిద్ధాంతం'),
 L('content/proof-theory/proof-theory.tex',10,12,10,10,'incomplete and experimental','అసంపూర్ణమైనది, ప్రయోగాత్మకమైనది')
];
locations['TE-T376']=[
 L('content/proof-theory/propositions-as-types/introduction.tex',44,46,16,16,'typed','రకాలతో కూడిన'),
 L('content/proof-theory/propositions-as-types/introduction.tex',75,76,32,32,'composition','ప్రయోగ'),
 L('content/proof-theory/propositions-as-types/introduction.tex',116,119,71,71,'Curry--Howard','కర్రీ--హోవర్డ్'),
 L('content/proof-theory/propositions-as-types/introduction.tex',131,131,82,82,'product type','లబ్ధ రకం'),
 L('content/proof-theory/propositions-as-types/introduction.tex',132,132,83,83,'sum type','యోగ రకం')
];
locations['TE-T377']=[
 L('content/proof-theory/propositions-as-types/normalization.tex',11,11,11,11,'Normalization','సాధారణీకరణ'),
 L('content/proof-theory/propositions-as-types/normalization.tex',176,176,125,125,'strong normalization','బలమైన సాధారణీకరణ'),
 L('content/proof-theory/propositions-as-types/normalization.tex',201,201,134,134,'Weak Church-Rosser','బలహీన చర్చ్--రోసర్'),
 L('content/proof-theory/propositions-as-types/normalization.tex',225,225,145,145,"Newman","న్యూమన్")
];
locations["TE-T378"]=[
 L("content/proof-theory/propositions-as-types/proof-terms.tex",11,11,11,11,"Proof Terms","నిరూపణ పదాలు"),
 L("content/proof-theory/propositions-as-types/proof-terms.tex",32,32,15,15,"constructors","నిర్మాతలు"),
 L("content/proof-theory/propositions-as-types/proof-terms.tex",92,92,54,54,"typed lambda calculus","రకాలతో కూడిన లాంబ్డా"),
 L("content/proof-theory/propositions-as-types/proof-terms.tex",127,127,71,71,"correct} proof terms","సరైన")
];
locations["TE-T379"]=[
 L("content/proof-theory/propositions-as-types/proofs-to-terms.tex",11,11,11,11,"Converting","నిరూపణ పదాలుగా మార్చడం"),
 L("content/proof-theory/propositions-as-types/proofs-to-terms.tex",18,18,14,14,"witnesses","సాక్ష్యం ఇస్తుంది"),
 L("content/proof-theory/propositions-as-types/proofs-to-terms.tex",29,29,21,21,"height","ఎత్తుపై"),
 L("content/proof-theory/propositions-as-types/proofs-to-terms.tex",73,73,55,55,"abstraction","అమూర్తీకరణ")
];
locations["TE-T380"]=[
 L("content/proof-theory/propositions-as-types/propositions-as-types.tex",8,8,8,8,"Propositions as Types","రకాలుగా ప్రతిపాదనలు"),
 L("content/proof-theory/propositions-as-types/propositions-as-types.tex",11,11,11,11,"very experimental","అత్యంత ప్రయోగాత్మకమైన")
];
locations["TE-T381"]=[
 L("content/proof-theory/propositions-as-types/reduction.tex",11,11,11,11,"Reduction","తగ్గింపు"),
 L("content/proof-theory/propositions-as-types/reduction.tex",59,59,43,43,"reductum","సంకోచన ఫలితం"),
 L("content/proof-theory/propositions-as-types/reduction.tex",133,133,110,110,"permutation conversions","క్రమమార్పు పరివర్తన"),
 L("content/proof-theory/propositions-as-types/reduction.tex",195,195,162,162,"normal form","సాధారణ రూపం")
];
locations["TE-T382"]=[
 L("content/proof-theory/propositions-as-types/rules-tN2.tex",11,11,11,11,"Axioms:","అక్షయాలు:"),
 L("content/proof-theory/propositions-as-types/rules-tN2.tex",13,13,13,13,"Inference Rules:","నిగమన నియమాలు:"),
 L("content/proof-theory/propositions-as-types/rules-tN2.tex",67,67,67,67,"Rules of the propositional","ప్రతిపాదనాత్మక")
];
locations["TE-T383"]=[
 L("content/proof-theory/propositions-as-types/rules-tN3.tex",11,11,11,11,"Axioms:","అక్షయాలు:"),
 L("content/proof-theory/propositions-as-types/rules-tN3.tex",13,13,13,13,"Inference Rules:","నిగమన నియమాలు:"),
 L("content/proof-theory/propositions-as-types/rules-tN3.tex",67,67,67,67,"Rules of the propositional","ప్రతిపాదనాత్మక")
];
locations["TE-T384"]=[
 L("content/proof-theory/propositions-as-types/sequent-natural-deduction.tex",11,11,11,11,"Sequent Natural Deduction","సీక్వెంట్ సహజ నిగమనం"),
 L("content/proof-theory/propositions-as-types/sequent-natural-deduction.tex",14,14,13,13,"undischarged","విడుదల చేయని"),
 L("content/proof-theory/propositions-as-types/sequent-natural-deduction.tex",111,111,97,97,"notational variant","సంకేతాత్మక ప్రత్యామ్నాయంగా")
];
locations["TE-T385"]=[
 L("content/proof-theory/propositions-as-types/terms-to-proofs.tex",11,11,11,11,"Recovering","పునర్నిర్మించడం"),
 L("content/proof-theory/propositions-as-types/terms-to-proofs.tex",15,15,13,13,"context","సందర్భానికి"),
 L("content/proof-theory/propositions-as-types/terms-to-proofs.tex",34,34,27,27,"antecedent","పూర్వపక్షం"),
 L("content/proof-theory/propositions-as-types/terms-to-proofs.tex",79,79,58,58,"recovered the proof fully","నిరూపణను పూర్తిగా పునర్నిర్మించాం")
];
locations["TE-T386"]=[
 L("content/proof-theory/propositions-as-types/type-preservation.tex",11,11,11,11,"Type Preservation","రక సంరక్షణ"),
 L("content/proof-theory/propositions-as-types/type-preservation.tex",107,107,74,74,"progress","పురోగతి"),
 L("content/proof-theory/propositions-as-types/type-preservation.tex",110,110,76,76,"gets stuck","ముందుకు సాగలేని స్థితి")
];
locations["TE-T387"]=[
 L("content/proof-theory/propositions-as-types/types.tex",11,11,11,11,"Types","రకాలు"),
 L("content/proof-theory/propositions-as-types/types.tex",20,20,16,16,"context}","సందర్భం}"),
 L("content/proof-theory/propositions-as-types/types.tex",51,51,42,42,"exactly one type","ఆ రకం అనన్యమైనది"),
 L("content/proof-theory/propositions-as-types/types.tex",68,68,55,55,"empty type","ఖాళీ రకాలతో")
];
locations["TE-T388"]=[
 L("content/proof-theory/sequent-calculus/admissible-derivable.tex",11,11,11,11,"Admissible and Derivable Rules","అనుమతించదగిన, వ్యుత్పాదించదగిన నియమాలు"),
 L("content/proof-theory/sequent-calculus/admissible-derivable.tex",22,22,16,16,"admissible}","అనుమతించదగినది}"),
 L("content/proof-theory/sequent-calculus/admissible-derivable.tex",70,70,65,65,"derivable}","వ్యుత్పాదించదగినది}"),
 L("content/proof-theory/sequent-calculus/admissible-derivable.tex",185,185,131,131,"height}-preserving admissible","ఎత్తును"),
 L("content/proof-theory/sequent-calculus/admissible-derivable.tex",82,82,65,65,"schematic","పథకాత్మక")
];
locations["TE-T389"]=[
 L("content/proof-theory/sequent-calculus/interpretation-rules.tex",11,11,11,11,"Interpretation of Rules","నియమాల అర్థవ్యాఖ్యానం"),
 L("content/proof-theory/sequent-calculus/interpretation-rules.tex",16,16,14,14,"truth","సత్య"),
 L("content/proof-theory/sequent-calculus/interpretation-rules.tex",37,37,19,19,"exclusive or","విశిష్ట వియోగం"),
 L("content/proof-theory/sequent-calculus/interpretation-rules.tex",133,133,75,75,"context sharing","సందర్భాన్ని పంచుకునే")
];
locations["TE-T390"]=[
 L("content/proof-theory/sequent-calculus/introduction.tex",11,11,11,11,"Introduction","పరిచయం"),
 L("content/proof-theory/sequent-calculus/introduction.tex",21,21,15,15,"multiset","బహుసమితి"),
 L("content/proof-theory/sequent-calculus/introduction.tex",44,44,25,25,"antecedent}","పూర్వపక్షం}"),
 L("content/proof-theory/sequent-calculus/introduction.tex",45,45,25,25,"succedent}","ఉత్తరపక్షం}"),
 L("content/proof-theory/sequent-calculus/introduction.tex",61,61,30,30,"multiplicity","బాహుళ్యం"),
 L("content/proof-theory/sequent-calculus/introduction.tex",113,113,44,44,"cut-elimination","కట్-తొలగింపు")
];
locations["TE-T391"]=[
 L("content/proof-theory/sequent-calculus/invertibility.tex",11,11,11,11,"Invertibility of Rules","నియమాల విలోమ్యత"),
 L("content/proof-theory/sequent-calculus/invertibility.tex",23,23,23,23,"invertible}","విలోమ్యమైనది}"),
 L("content/proof-theory/sequent-calculus/invertibility.tex",170,170,133,133,"eigenvariable condition","స్వీయచర షరతు"),
 L("content/proof-theory/sequent-calculus/invertibility.tex",218,218,169,169,"contraction rules","సంకోచన నియమాలు")
];
locations["TE-T392"]=[
 L("content/proof-theory/sequent-calculus/proof-examples.tex",11,11,11,11,"Examples of Proofs","నిరూపణల ఉదాహరణలు"),
 L("content/proof-theory/sequent-calculus/proof-examples.tex",122,122,105,105,"schematic","పథకాత్మకమైనది"),
 L("content/proof-theory/sequent-calculus/proof-examples.tex",138,138,121,121,"depth}","లోతు}"),
 L("content/proof-theory/sequent-calculus/proof-examples.tex",184,184,224,224,"not}","కాదు}"),
 L("content/proof-theory/sequent-calculus/proof-examples.tex",282,282,235,235,"eigenvariable condition","స్వీయచర షరతు")
];
locations["TE-T393"]=[
 L("content/proof-theory/sequent-calculus/quantifiers.tex",11,11,11,11,"Regular Proofs and Substitution","నియమిత నిరూపణలు, ప్రతిస్థాపన"),
 L("content/proof-theory/sequent-calculus/quantifiers.tex",20,20,16,16,"regular}","నియమితమైనది}"),
 L("content/proof-theory/sequent-calculus/quantifiers.tex",119,119,86,86,"clean}","శుభ్రమైనది}"),
 L("content/proof-theory/sequent-calculus/quantifiers.tex",121,121,86,86,"dirty}","అశుభ్రమైనది}")
];
locations["TE-T394"]=[
 L("content/proof-theory/sequent-calculus/rules-G1c.tex",11,11,11,11,"Axioms","అక్షయాలు"),
 L("content/proof-theory/sequent-calculus/rules-G1c.tex",14,14,14,14,"Structural Rules","నిర్మాణ నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G1c.tex",35,35,35,35,"Logical Rules","తార్కిక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G1c.tex",111,111,14,14,"Rules of","నియమాలు")
];
locations["TE-T395"]=[
 L("content/proof-theory/sequent-calculus/rules-G1i.tex",11,11,11,11,"Axioms","అక్షయాలు"),
 L("content/proof-theory/sequent-calculus/rules-G1i.tex",14,14,14,14,"Structural Rules","నిర్మాణ నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G1i.tex",31,31,31,31,"Logical Rules","తార్కిక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G1i.tex",107,107,14,14,"Rules of","నియమాలు")
];
locations["TE-T396"]=[
 L("content/proof-theory/sequent-calculus/rules-G2c.tex",11,11,11,11,"Axioms","అక్షయాలు"),
 L("content/proof-theory/sequent-calculus/rules-G2c.tex",14,14,14,14,"Structural Rules","నిర్మాణ నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G2c.tex",35,35,35,35,"Logical Rules","తార్కిక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G2c.tex",111,111,14,14,"Rules of","నియమాలు")
];
locations["TE-T397"]=[
 L("content/proof-theory/sequent-calculus/rules-G3c.tex",11,11,11,11,"Axioms","అక్షయాలు"),
 L("content/proof-theory/sequent-calculus/rules-G3c.tex",14,14,14,14,"Logical Rules","తార్కిక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G3c.tex",77,77,14,14,"Rules of","నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G3c.tex",80,80,77,77,"atomic","పరమాణువు")
];
locations["TE-T398"]=[
 L("content/proof-theory/sequent-calculus/rules-G3i.tex",11,11,11,11,"Axioms","అక్షయాలు"),
 L("content/proof-theory/sequent-calculus/rules-G3i.tex",14,14,14,14,"Logical Rules","తార్కిక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-G3i.tex",77,77,77,77,"intuitionistic logic","అంతఃప్రజ్ఞావాద తర్కానికి"),
 L("content/proof-theory/sequent-calculus/rules-G3i.tex",81,81,77,77,"atomic","పరమాణువు")
];
locations["TE-T399"]=[
 L("content/proof-theory/sequent-calculus/rules-LK.tex",11,11,11,11,"Axioms","అక్షయాలు"),
 L("content/proof-theory/sequent-calculus/rules-LK.tex",14,14,14,14,"Structural Rules","నిర్మాణ నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-LK.tex",45,45,45,45,"Logical Rules","తార్కిక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-LK.tex",124,124,121,121,"sequences","వరుసలు")
];
locations["TE-T400"]=[
 L("content/proof-theory/sequent-calculus/rules-mG3i.tex",11,11,11,11,"Axioms","అక్షయాలు"),
 L("content/proof-theory/sequent-calculus/rules-mG3i.tex",14,14,14,14,"Logical Rules","తార్కిక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-mG3i.tex",77,77,77,77,"multi-conclusion","బహుళ-నిర్ధారణల"),
 L("content/proof-theory/sequent-calculus/rules-mG3i.tex",81,81,77,77,"mG1m","మూల పక్క గమనిక")
];
locations["TE-T401"]=[
 L("content/proof-theory/sequent-calculus/rules-proofs.tex",11,11,11,11,"\\olsection{Rules","\\olsection{నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-proofs.tex",38,38,30,30,"The quantifier rules","పరిమాణక నియమాలు"),
 L("content/proof-theory/sequent-calculus/rules-proofs.tex",127,127,79,79,"It is often necessary","\\tetoken{నిరూపణల}")
];
locations["TE-T402"]=[
 L("content/proof-theory/sequent-calculus/sequent-calculus.tex",8,8,8,8,"The Sequent Calculus","సీక్వెంట్ కలనశాస్త్రం")
];
locations["TE-T403"]=[
 L("content/proof-theory/sequent-calculus/translations.tex",13,13,13,13,"We mentioned that both","శాస్త్రీయ తర్కానికి"),
 L("content/proof-theory/sequent-calculus/translations.tex",38,38,24,24,"  If $n>0$","$n>0$ అయితే"),
 L("content/proof-theory/sequent-calculus/translations.tex",56,56,32,32,"  We again proceed","మళ్లీ")
];
locations["TE-T404"]=[
 L("content/propositional-logic/syntax-and-semantics/completeness.tex",11,11,11,11,"Completeness of Propositional Logic","ప్రతిపాదనా తర్కం యొక్క సంపూర్ణత"),
 L("content/propositional-logic/syntax-and-semantics/completeness.tex",15,15,15,15,"A set $\\Gamma$","సమితి $\\Gamma$"),
 L("content/propositional-logic/syntax-and-semantics/completeness.tex",105,105,78,78,"Compactness Theorem","సంహతత సిద్ధాంతం")
];
locations["TE-T405"]=[
 L("content/propositional-logic/syntax-and-semantics/soundness.tex",11,11,11,11,"Soundness of Propositional Logic","ప్రతిపాదనా తర్కం యొక్క సార్థకత"),
 L("content/propositional-logic/syntax-and-semantics/soundness.tex",20,20,19,19,"By induction on theorems","వ్యుత్పత్తిపై ఆగమనంతో")
];
locations["TE-T406"]=[
 L("content/second-order-logic/syntax-and-semantics/language-of-sol.tex",11,11,11,11,"The Language of Second-Order Logic","ద్వితీయ క్రమ తర్కం యొక్క భాష"),
 L("content/second-order-logic/syntax-and-semantics/language-of-sol.tex",13,13,13,13,"Like in first-order logic","ప్రథమ క్రమ తర్కంలో మాదిరిగానే"),
 L("content/second-order-logic/syntax-and-semantics/language-of-sol.tex",31,31,20,20,"In first-order logic, the","ప్రథమ క్రమ తర్కంలో సాధారణంగా")
];
locations["TE-T407"]=[
 L("content/sets-functions-relations/functions/isomorphic-functions.tex",11,11,10,10,"Isomorphism","సమరూపత"),
 L("content/sets-functions-relations/functions/isomorphic-functions.tex",14,14,13,13,"An \\emph{isomorphism}","\\emph{సమరూపణం}"),
 L("content/sets-functions-relations/functions/isomorphic-functions.tex",36,36,13,13,"Consider the following two sets $X","$X=\\{1,2,3\\}$")
];
locations["TE-T408"]=[
 L("content/sets-functions-relations/inductive-defs-proofs/introduction.tex",14,14,14,14,"Induction is a commonly-used","ఆగమనం అనేది"),
 L("content/sets-functions-relations/inductive-defs-proofs/introduction.tex",47,47,32,32,"The property of","“సరి సంఖ్య కావడం”"),
 L("content/sets-functions-relations/inductive-defs-proofs/introduction.tex",63,63,41,41,"The sum of the first","సున్నా నుంచి $n$"),
 L("content/sets-functions-relations/inductive-defs-proofs/introduction.tex",88,88,63,63,"For !!{formula}s","\\tetoken{సూత్రాల}")
];
locations["TE-T409"]=[
 L("content/sets-functions-relations/relations/relations.tex",8,8,8,8,"{Relations}","{సంబంధాలు}")
];
locations["TE-T410"]=[
 L("content/sets-functions-relations/sets-functions-relations.tex",7,7,7,7,"{Sets, Relations, Functions}","{సమితులు, సంబంధాలు, ప్రమేయాలు}"),
 L("content/sets-functions-relations/sets-functions-relations.tex",10,10,10,10,"This file includes","ఈ ఫైలు")
];
locations["TE-T411"]=[
 L("content/sets-functions-relations/sets/proofs-about-sets.tex",10,10,10,10,"Proofs about Sets","సమితుల గురించి నిరూపణలు"),
 L("content/sets-functions-relations/sets/proofs-about-sets.tex",18,18,17,17,"Sets and the notations","ఇప్పటివరకు పరిచయం"),
 L("content/sets-functions-relations/sets/proofs-about-sets.tex",80,80,34,34,"[Absorption]","[శోషణ]")
];
locations["TE-T412"]=[
 L("content/sets-functions-relations/size-of-sets/size-of-sets.tex",8,8,8,8,"The Size of Sets","సమితుల పరిమాణం"),
 L("content/sets-functions-relations/size-of-sets/size-of-sets.tex",11,11,11,11,"This chapter discusses","ఈ అధ్యాయం")
];
const alternatives={
 'TE-T002':['మూలకం (chosen)','సభ్యము (documented synonym)'],
 'TE-T003':['సమితుల సమానత్వ సూత్రం (chosen descriptive label)','Extensionality (retained only as the explicit parenthetical source label)','విస్తరణతత్వ సూత్రం (not adopted because it is unattested and less transparent)'],
 'TE-T004':['క్రమ ఉపసమితి (chosen; directly attested at TE-P009)','నిజ ఉపసమితి (superseded after canon revalidation)'],
 'TE-T012':['క్రమయుగ్మం (chosen; directly attested at TE-P034)','క్రమిత జత (superseded after exact ordered-pair witness was located)','tuple transliteration (not adopted for the generalization)'],
 'TE-T019':['గ్రాఫు / నోడ్‌లు (explicit borrowings)','fully native graph/node replacements (not located in checked witnesses)'],
 'TE-T023':['ఒకటి-ఒకటి (chosen transparent injective form)','an established specialist injective headword, if documented'],
 'TE-T024':['సీరియల్ (explicit borrowing)','a documented Telugu formal-relation headword, if one exists'],
 'TE-T025':['తాదాత్మ్య ప్రమేయం (chosen identity variant)','తత్సమ ప్రమేయం (TE-P015 witness form)'],
 'TE-T026':['లెక్కించదగిన / లెక్కించలేని (chosen transparent forms)','గణనీయ / అగణనీయ (not adopted here because of collision with computability terminology)','జాబితా చేయదగిన / చేయలేని (retained as explanatory gloss)'],
 'TE-T027':['సమసంఖ్యాక (chosen transparent headword)','తుల్య సమితులు (TE-P016 witness expression for the finite concept)'],
 'TE-T028':['descriptive Telugu constructions (chosen)','source-eponym transliterations for Cantor and Schröder–Bernstein (retained)'],
 'TE-T029':['descriptive Telugu algebra headwords (chosen)','untranslated English algebra terminology (not adopted in prose)','source-eponym-free explanatory paraphrases (used where needed)'],
 'TE-T030':['descriptive Telugu bound/completeness terminology (chosen)','Dedekind and Cauchy source-eponym transliterations (retained)','untranslated English analysis terminology (not adopted in prose)'],
 'TE-T031':['descriptive Telugu closure, induction and isomorphism headwords (chosen)','Dedekind source-eponym transliteration (retained)','untranslated English structure terminology (not adopted in prose)'],
 'TE-T032':['descriptive Telugu syntax and construction headwords (chosen)','direct transliterations of English formal-syntax terminology (not adopted in prose)','protected source-token spellings inside macros (retained for source identity)'],
 'TE-T033':['descriptive Telugu truth and consequence headwords (chosen)','direct transliterations of English model-theoretic terminology (not adopted in prose)','protected source-token spellings inside macros (retained for source identity)'],
 'TE-T034':['descriptive Telugu derivability and metatheory headwords (chosen)','soundness transliteration or reuse of consistency vocabulary (not adopted because the definitions distinguish them)','protected source-token spellings inside macros (retained for source identity)'],
 'TE-T035':['sequent, tableau, modus ponens and resolution transliterations (explicit borrowings)','descriptive Telugu rule, branch and assumption headwords (chosen)','untranslated English prose terminology (not adopted outside protected tokens and titles)'],
 'TE-T036':['sequent, eigen and cut borrowings combined with descriptive Telugu side/rule names (chosen)','leave every sequent-calculus headword in English (not adopted)','replace the established sequent borrowing with a longer descriptive phrase (not adopted)'],
 'TE-T037':['reuse the established relation/consequence vocabulary with each proof-theoretic sense fixed locally (chosen)','direct English transliterations (not adopted)','an alternative specialist term for compactness if a Telugu logic authority documents one'],
 'TE-T038':['descriptive Telugu assumption, premise, conclusion and rule names with ఉపసంహరణ for formal discharge (chosen)','direct transliterations of the English rule taxonomy (not adopted)','retain the source token spellings only inside protected grammatical macros (chosen for source identity)'],
 'TE-T039':['descriptive Telugu truth-sign and branch-state wording with tableau, eigen and cut borrowings (chosen)','leave every tableau-specific headword in English (not adopted)','replace tableau, eigenvariable and cut with unattested coined headwords (not adopted)','retain protected source-token spellings inside grammatical macros (chosen for source identity)'],
 'TE-T040':['descriptive Telugu axiom, inference and proof-theoretic headwords with a modus-ponens borrowing (chosen)','leave the axiomatic-deduction taxonomy in English (not adopted)','translate modus ponens into an unattested coined headword (not adopted)','retain protected source-token spellings inside grammatical macros (chosen for source identity)'],
 'TE-T041':['descriptive Telugu completeness and model-theoretic headwords with eponymic names retained as explicit borrowings (chosen)','leave the completeness taxonomy in English (not adopted)','introduce unattested coined replacements for the eponymic names (not adopted)','retain protected source-token spellings inside grammatical macros (chosen for source identity)']
};
alternatives['TE-T042']=['preserve each raw key as non-reader-visible configuration identity while rendering the mapped Telugu surface (chosen)','show raw English configuration keys to readers (rejected)','discard the source keys during translation (rejected because it would break configuration identity)'];
alternatives['TE-T043']=['use the directly witnessed Telugu first-order/formal-logic register and definition-controlled compounds (chosen)','retain English syntax headwords in reader prose (rejected except for protected source-token keys)','coin an unsupported specialist neologism for each OpenLogic compound (rejected)'];
alternatives['TE-T044']=['use the directly witnessed first-order/domain/function/consequence register with definition-controlled model-theoretic compounds (chosen)','leave model-theoretic headwords in English reader prose (rejected)','claim the covered-structure and satisfaction headwords as directly attested by the canon (rejected because the inspected pages do not contain them)'];
alternatives['TE-T045']=['x-భేదరూపం as a transparent definition-controlled compound (chosen)','x-వేరియంట్ as an unexplained English borrowing (rejected)','claim direct canon attestation for the compound (rejected)'];
alternatives['TE-T046']=['విస్తారత with the source alternate label సంబద్ధత stated at introduction (chosen)','unexplained extensionality transliteration (rejected)','reuse set-extensionality wording without the local semantic definition (rejected)'];
alternatives['TE-T047']=['reuse the established స్వీకృతం, సిద్ధాంతం and నమూనా register with definition-controlled compounds (chosen)','leave axiomatization and definability headwords in English prose (rejected)','claim direct canon attestation for the full model-theoretic taxonomy (rejected)'];
alternatives['TE-T048']=['reuse the established ధర్మసంగ్రహం and రసెల్ వైరుధ్యం terminology while distinguishing scheme, principle and separation locally (chosen)','replace the source eponyms and urelement with unattested coined names (rejected)','leave all set-foundational prose in English (rejected)'];
alternatives['TE-T049']=['భాగతత్త్వం with మీరియాలజీ supplied once as an explicit borrowing (chosen)','use the English mereology headword throughout the reader (rejected)','claim the new parthood taxonomy as directly attested by the checked relation witness (rejected)'];
alternatives['TE-T050']=['descriptive బహు-రక and రక-పరిమాణకం wording with టైపు and అరిటీ disclosed as technical borrowings (chosen)','leave all many-sorted terminology in English reader prose (rejected)','claim direct canon attestation for the many-sorted taxonomy (rejected)'];
alternatives['TE-T051']=['definition-controlled Telugu compounds with explicit borrowings for predicative, impredicative, categorical, type and lambda terminology (chosen)','translate the defective source formulas literally rather than follow their declared corrections (rejected)','claim every higher-order headword as directly witnessed in the canon (rejected)'];
alternatives['TE-T052']=['descriptive Telugu proof and truth register with BHK, Curry--Howard, forcing and monotone borrowings explicitly identified (chosen)','leave the intuitionistic exposition in English terminology (rejected)','replace source eponyms and abbreviations with unsupported coined names (rejected)'];
alternatives['TE-T053']=['descriptive possible-world and accessibility wording with modal and intensional/extensional borrowings made explicit (chosen)','leave the full modal taxonomy in English reader prose (rejected)','reuse only classical-semantic terminology and obscure the possible-world distinction (rejected)'];
alternatives['TE-T054']=['source-controlled descriptive subfield names with fuzzy, default and deontic marked as explicit borrowings (chosen)','leave the closing taxonomy in untranslated English (rejected)','coin unsupported replacements without a Telugu specialist witness (rejected)'];
alternatives['TE-T055']=['reuse the established నమూనా, నిర్మాణం and సిద్ధాంతం register with definition-controlled descriptive compounds (chosen)','leave reduct and substructure in English prose (rejected)','claim direct canon attestation for model-theoretic signature restriction (rejected)'];
alternatives['TE-T056']=['make the defining first-order-sentence criterion visible in మొదటిస్థాయి-వాక్య తుల్యత and reuse established సమరూపత (chosen)','import elementary as an unexplained English headword (rejected)','collapse elementary equivalence into isomorphism (rejected because the chapter distinguishes them)'];
alternatives['TE-T057']=['use descriptive Telugu labels with overspill and rank explicitly marked as technical borrowings (chosen)','leave the full advanced taxonomy in English prose (rejected)','claim the checked witnesses directly attest overspill or quantifier rank (rejected)'];
alternatives['TE-T058']=['reuse the established number, truth, model and structure register with the standard/non-standard distinction fixed by isomorphism and numeral values (chosen)','leave standard and non-standard as unexplained English headwords (rejected)','claim direct canon attestation for the arithmetic-model taxonomy (rejected)'];
alternatives['TE-T059']=['use ఉత్తరాధికారి, పూర్వాధికారి and the locally defined ఖండం terminology (chosen)','reuse the graph-theoretic ఉత్తరవర్తి and పూర్వవర్తి labels despite the arithmetic context (rejected)','claim direct canon attestation for arithmetic blocks (rejected)'];
alternatives['TE-T060']=['reuse the edition’s definition-controlled గణనీయ terminology and descriptive నిర్ణయించదగిన సంబంధం (chosen)','use లెక్కించదగిన for computable and thereby collapse computability into enumerability (rejected)','omit the Tennenbaum eponym or leave the theorem statement in English (rejected)'];
alternatives['TE-T061']=['use అంతర్వేశం/అంతర్వేశకం with the established separation and consistency register, and give ఇంటర్‌పోలంట్ once as an explicit parenthetical borrowing (chosen)','leave interpolation, separation and joint consistency in untranslated English prose (rejected)','claim the specialized interpolation compounds as directly attested by the checked canon (rejected)'];
alternatives['TE-T062']=['use transparent స్పష్ట and అవ్యక్త definition wording with the Beth eponym retained (chosen)','leave explicit and implicit definability in untranslated English prose (rejected)','collapse implicit definability into ordinary explicit definition (rejected because the theorem distinguishes them)'];
alternatives['TE-T063']=['use the descriptive Telugu abstract-logic and property labels while retaining formal L- notation and the Lindström eponym (chosen)','leave abstract logic and the property names in English reader prose (rejected)','claim direct native attestation for every specialized property label (rejected because the frozen definitions control the exact senses)'];
alternatives['TE-T064']=['reuse the directly witnessed సంయుక్త function register and the edition’s definition-controlled recursive/computable terminology (chosen)','use సంయోజనం for mathematical function composition despite the established TE-T015 decision and direct TE-P011 witness (rejected)','leave primitive recursion, projection and arity in untranslated English prose (rejected)','claim direct native attestation for the specialized recursion taxonomy (rejected because the frozen equations and definitions control those senses)'];
alternatives['TE-T065']=['reuse the directly witnessed ప్రధాన సంఖ్యలు, ప్రధాన కారణాంకాలు, quantifier, relation and function register while keeping the specialized recursion and coding compounds definition-controlled (chosen)','leave the specialized headwords in untranslated English reader prose (rejected)','claim direct native attestation for partial recursion, normal form, halting, regularity or general recursion (rejected because the frozen definitions and arguments control those senses)','retain హాల్టింగ్ only as an explicit parenthetical borrowing beside descriptive నిలుపు సమస్య (chosen)'];
alternatives['TE-T066']=['reuse the established గణనీయత and లెక్కించదగిన registers while making the computability modifier explicit (chosen)','use లెక్కించదగిన alone for computably enumerable and thereby collapse effective enumerability into ordinary countability (rejected)','leave computably enumerable and semi-decidable in untranslated English prose (rejected)','claim direct native attestation for s-m-n, universal computation or semi-decidability (rejected because the frozen definitions and proofs control those senses)'];
alternatives['TE-T067']=['reuse the established set, function, relation and proof register while making each reducibility, completeness, index-set and fixed-point sense explicit from its local definition (chosen)','leave the specialized computability-theory headwords in untranslated English reader prose (rejected)','collapse many-one, one-one and Turing reducibility into one undifferentiated term (rejected because the definitions distinguish them)','claim direct native attestation for oracle computation, Rice’s theorem or fixed points (rejected because the frozen equations and proofs control those senses)'];
alternatives['TE-T068']=['use transparent Telugu compounds for the machine, transition, configuration and effective-procedure vocabulary, with exact senses fixed by the adjacent tuples, diagrams and definitions (chosen)','leave the specialized machine vocabulary in untranslated English reader prose (rejected)','collapse state, configuration and run into one undifferentiated term (rejected because the definitions distinguish them)','claim direct native attestation for Turing-machine components, nondeterminism or the Church--Turing thesis (rejected because the frozen definitions and equivalence claim control those senses)'];
alternatives['TE-T069']=['reuse the established machine, function, formal-logic and proof register, with universal-machine, representation and finite-model compounds fixed by the adjacent constructions (chosen)','leave the specialized undecidability and finite-model vocabulary in untranslated English reader prose (rejected)','collapse ordinary enumerability, machine enumeration and semi-decidability into one term (rejected because the definitions distinguish them)','claim direct native attestation for universal simulation, arithmetized computation or Trakhtenbrot’s theorem (rejected because the frozen constructions and proofs control those senses)'];
alternatives['TE-T070']=['reuse the established number, theory, axiom, derivation, consistency and proof register, with incompleteness, representability and arithmetization compounds fixed by the adjacent definitions and theorems (chosen)','leave the specialized incompleteness vocabulary in untranslated English reader prose (rejected)','collapse completeness, decidability and axiomatizability into one property (rejected because the chapter distinguishes them)','claim direct native attestation for Robinson’s Q, representability, provability predicates or Gödel’s theorems (rejected because the frozen definitions and proofs control those senses)'];
alternatives['TE-T071']=['reuse the established number, sequence, function, relation, formula, derivation and proof register, with Gödel coding, formation-sequence and proof-predicate compounds fixed by the adjacent definitions and tuple layouts (chosen)','leave the specialized coding and proof-verification vocabulary in untranslated English reader prose (rejected)','collapse symbol, sequence, term, formula and proof codes into one undifferentiated notion (rejected because the definitions distinguish their constructors and tests)','claim direct native attestation for Gödel numbering, formation-sequence bounds or primitive-recursive proof verification (rejected because the frozen definitions, recursions and predicates control those senses)'];
alternatives['TE-T072']=['reuse the established number, function, relation, formula, proof and Q-theory register while making the beta, Sunzi, closure and arithmetical-hierarchy senses explicit from the adjacent definitions (chosen)','leave the specialized representability vocabulary in untranslated English reader prose (rejected)','collapse representability, computability and definability into one property (rejected because the chapter proves precise implications and equivalences)','claim direct native attestation for Q-representability, beta coding, Sunzi’s theorem or the Delta_0/Sigma_1/Pi_1 hierarchy (rejected because the frozen definitions and proofs control those senses)'];
alternatives['TE-T073']=['reuse the established theory, consistency, completeness, computability, separation and formal-logic register while fixing c.e.-completeness, omega-consistency, inseparability and interpretation from the adjacent definitions (chosen)','leave the specialized computability and incompleteness headwords in untranslated English reader prose (rejected)','collapse consistency, omega-consistency, completeness, decidability and axiomatizability into one property (rejected because the chapter distinguishes them)','claim direct native attestation for c.e.-complete theories, computable inseparability or proof-theoretic interpretation (rejected because the frozen reductions and theorems control those senses)'];
alternatives['TE-T074']=['reuse the established truth, formula, sentence, derivation and consistency register, with fixed-point, arithmetized provability, reflection and undefinability senses fixed by the adjacent constructions (chosen)','leave the specialized incompleteness and provability headwords in untranslated English reader prose (rejected)','collapse truth, provability and derivability into one undifferentiated notion (rejected because the chapter distinguishes them)','claim direct canon attestation for the fixed-point lemma or the Rosser, L\u00f6b and Tarski theorems (rejected because the frozen definitions and proofs control those senses)'];
alternatives['TE-T075']=['reuse the established set, relation, function, formula, sentence and semantic-consequence register while fixing the second-order extensions from the adjacent formation and satisfaction clauses (chosen)','leave the specialized second-order semantics and expressive-power headwords in untranslated English reader prose (rejected)','collapse relations, functions, relation variables and function variables into one undifferentiated category (rejected because the typing clauses distinguish them)','claim direct native attestation for standard second-order semantics, transitive closure or Dedekind infinitude (rejected because the frozen definitions, examples and proofs control those senses)'];
alternatives['TE-T076']=['reuse the established arithmetic, induction, axiomatizability, compactness and Lowenheim--Skolem register while fixing the second-order failures from the adjacent axioms, reductions and countermodels (chosen)','leave the specialized metatheory and model-size headwords in untranslated English reader prose (rejected)','collapse undecidability, non-axiomatizability, non-compactness and Lowenheim--Skolem failure into one undifferentiated limitation (rejected because the proofs distinguish them)','claim direct native attestation for second-order categoricity or the upward and downward Lowenheim--Skolem compounds (rejected because the frozen axioms and countermodels control those senses)'];
alternatives['TE-T077']=['reuse the established set, subset, power-set, relation, function, equinumerosity and cardinality register while fixing relation coding, aleph levels and the continuum from the adjacent corrected formulas (chosen)','leave the specialized set-theoretic headwords in untranslated English reader prose (rejected)','collapse ordinary cardinality, aleph-one and continuum cardinality into one undifferentiated size notion (rejected because the definitions distinguish them)','claim direct native attestation for relation-coded power sets, the aleph hierarchy or the Continuum Hypothesis (rejected because the corrected definitions and cardinality arguments control those senses)'];
alternatives['TE-T078']=['reuse the established term, variable, substitution, function, argument, composition, equivalence and proof register while fixing lambda abstraction, reduction and confluence from the adjacent rules and theorem (chosen)','leave the specialized lambda-calculus vocabulary in untranslated English reader prose (rejected)','collapse alpha-equivalence, beta-reduction and beta-equivalence into one undifferentiated relation (rejected because the definitions distinguish them)','claim direct native attestation for redex, contractum, Church--Rosser or Currying (rejected because the frozen formation clauses, reductions and theorem control those senses)'];
alternatives['TE-T079']=['reuse the established natural-number, function, composition, primitive-recursion, minimization, term, reduction and proof register while fixing Church numerals, lambda-definability and fixed points from the adjacent corrected constructions (chosen)','leave the specialized lambda-computability vocabulary in untranslated English reader prose (rejected)','collapse ordinary computability, lambda-definability and primitive recursiveness into one property (rejected because the theorem and closure proof distinguish them)','claim direct native attestation for Church numerals, iterators or fixed-point combinators (rejected because the explicit definitions and reductions control those senses)'];
alternatives['TE-T080']=['reuse the inspected native term, variable, scope, function, set and induction register while the lambda formation clauses fix the specialist senses (chosen)','leave unique readability, parameter and combinator in English reader prose (rejected)','claim the native witnesses directly attest lambda parameter and combinator usage (rejected; the source definitions fix those senses)','treat scope as the whole ambient term N (rejected because the binder scope is its body M)'];
alternatives['TE-T081']=['ఇప్పటికే వాడుతున్న ప్రతిస్థాపన, పరిధి, చరం, సమితి, ఆగమన భాషను మూలంలోని పాక్షిక నియమంతో అనుసంధానించడం (ఎంపిక)','నిర్వచనంలో లేని x=y అమూర్తీకరణ సందర్భానికి ఫలితాన్ని నిశ్శబ్దంగా చేర్చడం (తిరస్కరణ)','స్థానిక పేజీలు ప్రత్యేక లాంబ్డా ప్రతిస్థాపనను నేరుగా స్థాపిస్తాయని పేర్కొనడం (తిరస్కరణ)','ఇంగ్లీషు substitution, capture పదాలను పాఠక గద్యంలో వివరణ లేకుండా వదలడం (తిరస్కరణ)'];
alternatives['TE-T082']=['గత పదం, చరం, సంబంధం, నిరూపణ భాషలో ఆల్ఫా-పరివర్తనం, ఆల్ఫా-తుల్యతను మూల నిర్వచనాలతో నియంత్రించడం (ఎంపిక)','ఆల్ఫా-మార్పును బీటా-తగ్గింపుతో కలపడం (తిరస్కరణ)','స్థానిక పేజీలు ప్రత్యేక ఆల్ఫా నామాలను నేరుగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)','అసంపూర్ణ మూల నిరూపణను పూర్తి నిరూపణగా ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T083']=['స్థానిక పదం, చరం, బంధనం, ప్రమేయ భాషతో మూల F/G సమీకరణాలను కలిపి డి బ్రూయిన్ సూచికకు వివరణ ఇవ్వడం (ఎంపిక)','01ను ఒకే సంఖ్యా సూచికగా చదవడం (తిరస్కరణ)','Gammaలో పలుసార్లు వచ్చే చరానికి ఏ స్థానమైనా తీసుకోవడం (తిరస్కరణ)','పరిధికి బయట సూచికలకూ G నిర్వచితమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T084']=['ఆచారబద్ధ అధితర్కం, ఆచారబద్ధ పద్ధతులు అనే వేర్వేరు తాత్కాలిక పదకూర్పులు (ఎంపిక)','meta-logicను పరిచయ ఆచారబద్ధ తర్కానికే సమానంగా చూపడం (తిరస్కరణ)','రెండు శాస్త్రాలకు వివరణ లేకుండా ఆంగ్ల నామాలనే పాఠక గద్యంలో వదలడం (తిరస్కరణ)'];
alternatives['TE-T085']=['అనౌపచారిక సమితి సిద్ధాంతం అనే అర్థవివరణను శీర్షిక, పరిచయం రెండింటిలో వాడడం (ఎంపిక)','naiveని అమాయక అనే సాధారణ విశేషణంగా అనువదించడం (తిరస్కరణ)','మూలంలో లేని సంపూర్ణ స్వీకృతిక సమితి సిద్ధాంత పరిధిని శీర్షికలో చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T086']=['ఆల్ఫా-తుల్యతా వర్గం, ప్రతినిధి, వర్గాలపైకి దింపడం అనే నిర్వచన-నియంత్రిత వివరణ (ఎంపిక)','మూల వర్గ ప్రతిస్థాపన ఫలితాన్ని ముడి ప్రతినిధి పదంతో సమానమని మౌనంగా చెప్పడం (తిరస్కరణ)','మూల నిరూపణ ఖాళీలున్నా వర్గ చర్య ప్రతినిధి-స్వతంత్రమని ఈ దశలో పూర్తి నిరూపితంగా ప్రకటించడం (తిరస్కరణ)','అన్ని quotient చర్యలకు ప్రత్యక్ష స్థానిక తెలుగు సాక్ష్యం ఉందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T087']=['మునుపటి బీటా-సంకోచనం/తగ్గింపు పదజాలంతో సహజ వ్యూహం, అత్యంత ఎడమవైపు రెడెక్స్ అనే స్థాన-నియంత్రిత వివరణ (ఎంపిక)','ఎడమవైపు అని మాత్రమే చెప్పి రెడెక్స్ మొదలయ్యే స్థానం అనే మూల నియమాన్ని వదలడం (తిరస్కరణ)','సహజ వ్యూహం ఏ పదాన్నైనా తప్పక నియత రూపానికి తీసుకెళ్తుందని చెప్పడం (తిరస్కరణ; మూల వాదన నియత రూపం ఉన్నప్పుడు మాత్రమే)','స్థానిక పేజీలు బీటా వ్యూహాన్ని నేరుగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T088']=['మునుపటి బీటా పదజాలంతో ఏటా-సంకోచనం/తగ్గింపు, వేరు నిర్వచించిన లాంబ్డా పదాల విస్తారత (ఎంపిక)','మొదటి-స్థాయి అర్థసంబంధ విస్తారత, లాంబ్డా విస్తారత ఒకే నియమమని ప్రకటించడం (తిరస్కరణ)','ఏటా-తుల్యతా నియమాన్ని స్వేచ్ఛా-చర షరతు లేకుండా అన్ని పదాలపై వర్తింపజేయడం (తిరస్కరణ)','సూత్రం మారకుండా లోపించిన షరతును పక్కన స్పష్టంగా చెప్పడం (ఎంపిక)'];
alternatives['TE-T089']=['చర్చ్--రోసర్ అనే మూల పేరుతో, రెండు మార్గాలకు ఉమ్మడి దిగువ పదం అనే నిర్వచనంతో లక్షణాన్ని ఇవ్వడం (ఎంపిక)','ప్రతి పదం తప్పక నియత రూపానికి చేరుతుందని చర్చ్--రోసర్ లక్షణం నుంచి తేల్చడం (తిరస్కరణ)','జాలకాన్ని అలంకార రూపకంగా మాత్రమే తీసుకుని N సూచికల వరుస/నిలువు అర్థాన్ని వదలడం (తిరస్కరణ)','జాలక అంచులలో మూలంలో లేని P,Q పేర్లను నిర్వచించకుండా కొనసాగించడం (తిరస్కరణ)'];
alternatives['TE-T090']=['నాలుగు నియమాల ప్రత్యేక అర్థాన్ని నిలిపే సమాంతర బీటా-తగ్గింపు, బీటా-సంపూర్ణ వికాసం అనే వివరణాత్మక పదాలు (ఎంపిక)','స్థానిక పేజీలు ఈ ప్రత్యేక లాంబ్డా భావాలను నేరుగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)','మూలంలోని సాధారణ బీటా పూర్వాపేక్షను సమాంతర నియమంలో నిశ్శబ్దంగా ఉంచడం (తిరస్కరణ)','ప్రతిస్థాపన నిరూపణ ఖాళీని పూర్తి నిరూపణగా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T091']=['మునుపటి బీటా సంకోచనం, సమాంతర తగ్గింపు, సంక్రమణ సంబంధం పదజాలాన్ని మూల నిర్వచనాల తేడాతో కొనసాగించడం (ఎంపిక)','అనుకూల బీటా సంకోచనాన్ని మూలస్థాన రెడెక్స్‌కే పరిమితం చేయడం (తిరస్కరణ)','స్థానిక పేజీలు ప్రత్యేక చర్చ్--రోసర్ బదిలీని నేరుగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)','ఆధార నిరూపణ ఖాళీలను దాచిపెట్టి తుది వాదనకు స్వతంత్ర ధృవీకరణ ఉందనడం (తిరస్కరణ)'];
alternatives['TE-T092']=['మునుపటి సమాంతర బీటా, ఏటా పదజాలంతో ప్రత్యేక బీటా-ఏటా సంబంధాన్ని మూల నియమాల మేరకు కొనసాగించడం (ఎంపిక)','స్థానిక పేజీలు సంపూర్ణ వికాసం లేదా ఒక-దశ బీటా-ఏటా సంబంధాన్ని నేరుగా నిర్వచిస్తాయని చెప్పడం (తిరస్కరణ)','మూలంలోని సంపూర్ణ-వికాస అతివ్యాప్తి, నిర్వచించని ఒక-దశ సంకేతాన్ని దాచడం (తిరస్కరణ)','పూరించని ఆగమన నిరూపణను పూర్తి నిరూపణగా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T093']=['TE-T079లోని లాంబ్డాతో నిర్వచించదగిన, చర్చ్ సంఖ్యాంకం పదాలను కొత్త అంకగణిత ఉదాహరణలలో మూల నిర్వచనాలకు తగినట్లు కొనసాగించడం (ఎంపిక)','TE-P007లో సున్నా సహజ సంఖ్య కాదన్న ప్రాంతీయ సంప్రదాయాన్ని OpenLogic \\Natపై రుద్దడం (తిరస్కరణ)','స్థానిక పేజీలు చర్చ్ సంఖ్యాంకాల బీటా గణనలను నేరుగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)','దశల సంఖ్య లేదా గుణకార ప్రత్యామ్నాయంలోని తప్పును దాచిపెట్టడం (తిరస్కరణ)'];
alternatives['TE-T094']=['TE-P034లో ప్రత్యక్షంగా ఉన్న క్రమయుగ్మం పదాన్ని లాంబ్డా జతకు వర్తింపజేసి Fst/Snd సూత్రాలతో క్రమాన్ని నిలపడం (ఎంపిక)','క్రమిత జత అనే అస్థిర పర్యాయాన్ని తిరిగి తెచ్చుకోవడం (తిరస్కరణ)','స్థానిక పేజీ చర్చ్ జత సంకేతీకరణను నేరుగా బోధిస్తుందని చెప్పడం (తిరస్కరణ)','Predలో మొదటి, రెండవ అవయవాల క్రమాన్ని మార్చడం (తిరస్కరణ)'];
alternatives['TE-T095']=['పూర్వ సత్యమూల్యం, సంయోగం, వికల్పం పదాలను సూత్రాల ఎంపిక-ప్రమేయ అర్థంతో కొనసాగించడం (ఎంపిక)','సత్యమూల్యపు లాంబ్డా సంకేతీకరణకు ప్రత్యక్ష స్థానిక సాక్ష్యం ఉందని చెప్పడం (తిరస్కరణ)','బహిష్కార వికల్పాన్ని కనీసం ఒకటి నిజమైన సందర్భంతో కలపడం (తిరస్కరణ)','సంబంధపు స్థానం n/k అసమానతను దాచడం (తిరస్కరణ)'];
alternatives['TE-T096']=['TE-T064, TE-T079, TE-T094లోని ఆదిమ పునరావృత్తి, సంయుక్తం, క్రమయుగ్మం రూపాలను ఈ దశ-స్థితి నిర్మాణంలో నిలపడం (ఎంపిక)','దశ ప్రమేయం g బదులు n+1-స్థానిక hనే n+2 ఆర్గ్యుమెంట్లకు ప్రయోగించడం (తిరస్కరణ)','స్థానిక పేజీలు చర్చ్ పునరావర్తక లాంబ్డా పదాన్ని నేరుగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)','ఆగమన స్థితిలో సూచిక, విలువ అవయవాల క్రమాన్ని మార్చడం (తిరస్కరణ)'];
alternatives['TE-T097']=['పూర్వ క్రమగుణిత ప్రమేయం, స్థిరబిందువు, సంయోజకం, బీటా-తుల్యత, నియత రూపం వాడుకను మూల ట్యూరింగ్/చర్చ్ తగ్గింపుల భేదంతో కొనసాగించడం (ఎంపిక)','ఒకే సంఖ్యాప్రమేయాన్ని సూచించడం నుంచి పదాల బీటా-తుల్యతను తేల్చడం (తిరస్కరణ)','చర్చ్, ట్యూరింగ్ సంయోజకాల్లో ఏది ముందుకు తగ్గుతుందో కలపడం (తిరస్కరణ)','స్థానిక సాధారణ పేజీలు లాంబ్డా స్థిరబిందు సిద్ధాంతాన్ని నేరుగా బోధిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T098']=['TE-T065, TE-T078, TE-T079లోని సక్రమత, పాక్షిక పునరావృత్తి, నియత రూపం పదజాలాన్ని OLP-0380–0381 మూల నిర్వచనాలు, ప్రతిదృష్టాంతంతో కొనసాగించడం (ఎంపిక)','పాక్షిక ప్రమేయం నిర్వచితం కాని చోట తప్పనిసరిగా F(Gx)కు నియత రూపం ఉండదని ఊహించడం (తిరస్కరణ)','స్థానిక సాధారణ పేజీలు లాంబ్డా పాక్షికతను నేరుగా బోధిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T099']=['గోడెల్ అంకీకరణ–నియత రూపం–చర్చ్ సంఖ్యాంక మార్పిడిని మూల రూపురేఖల పరిమితిలో తెలుగులో వివరించడం (ఎంపిక)','మూల నిరూపణ రూపురేఖలను పూర్తి నిర్మాణాత్మక నిరూపణగా ప్రకటించడం (తిరస్కరణ)','గోడెల్ పేరు లేదా కోడ్ ప్రమేయాల గుర్తింపులను అనువదించి మూల అనుసంధానం పోగొట్టడం (తిరస్కరణ)','స్థానిక ప్రధాన సంఖ్యల పేజీ గోడెల్ సంకేతీకరణను నేరుగా ధృవీకరిస్తుందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T100']=['TE-P019లో ప్రత్యక్షంగా కనిపించే సత్యతావిలువకు బదులుగా ఈ సంచికలో స్థిరపడిన సత్యమూల్యం వాడుకను, TE-T033/095 అర్థపర గద్యంతో కలిపి కొనసాగించడం (ఎంపిక)','సత్యతావిలువ అనే స్థానిక సాక్ష్య రూపాన్ని సంచికలోని సమాన సందర్భాలకు ఒకేసారి మార్పు లేకుండా మాత్రమే ప్రతిష్ఠించడం (తిరస్కరణ; సందర్భానుసార సమీక్షకు తెరిచి ఉంది)','బహుమూల్య తర్కాన్ని తప్పనిసరిగా True విలువ కలిగిన వ్యవస్థగా చూపడం (తిరస్కరణ)','నిర్దేశిత విలువల కొత్త భావానికి స్థానిక ద్విమూల్య సత్య పట్టికనే ప్రత్యక్ష సాక్ష్యంగా ప్రకటించడం (తిరస్కరణ)','మూల కరణీయ సంఖ్యలను అకరణీయ సంఖ్యలుగా మార్చడం (తిరస్కరణ; TE-P006 భేదం ప్రత్యక్షంగా చూసాం)'];
alternatives['TE-T101']=['స్థానసంఖ్యను n-స్థానిక సంయోజకంగా, మాత్రికను మూల నిర్వచించిన భాష–V–V^+–సత్యమూల్య ప్రమేయాల నిర్మాణంగా చదవడం (ఎంపిక)','మాత్రికను కేవలం సంఖ్యల దీర్ఘచతురస్ర పట్టికగా చదవడం (తిరస్కరణ)','గుణిత తర్కం, నిర్ణీతత్వ సంచాలకం పేర్లకు స్థానిక ద్విమూల్య తర్క పేజీలే నేరుగా సాక్ష్యమని ప్రకటించడం (తిరస్కరణ)','మూల n, 0, 1, 2 స్థానసంఖ్యలను వదిలేయడం (తిరస్కరణ)'];
alternatives['TE-T102']=['కేటాయింపు, మూల్యాంకనం, సంతృప్తి, అనుగమనం అనే వేరు సంబంధాలను మూల మాత్రిక నిర్వచనాలకు అనుగుణంగా విడదీయడం; నాలుగు సంయోజకాలతో చరాల నుంచి నిర్మించిన సాధారణ భాగానికే పోలిక ఫలితాన్ని పరిమితం చేయడం (ఎంపిక)','కేటాయింపునే సూత్రాల సమితి అనుగమనానికి ఎడమ పదంగా చదవడం (తిరస్కరణ; మూల సంబంధానికి రకం సరిపోదు)','నాలుగు సంయోజకాల పరికల్పనల నుంచే భాషలోని అన్ని స్థిరాంకాలు, అదనపు సంయోజకాల విలువలూ నియంత్రితమవుతాయని ఊహించడం (తిరస్కరణ; ప్రతిదృష్టాంతం ఉంది)','స్థానిక ద్విమూల్య పేజీలు బహుమూల్య సంతృప్తి, ఉపతర్కం ప్రత్యేక పదజాలాన్ని నేరుగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T103']=['సత్యమూల్యం, సత్య పట్టిక, ప్రమేయం, ఫలితానికి ప్రత్యక్ష స్థానిక పేజీల వాడుకను; అనిర్ణీత మూడవ విలువ, భవిష్యత్ ఆధారిత వాక్యం, మోడల్ సాధ్యత/అనివార్యతకు స్థిర మూల పట్టికలు, TE-T053/100/102 అర్థ నియంత్రణను వేరుగా నమోదు చేయడం (ఎంపిక)','స్థానిక ద్విమూల్య పట్టికలే లూకాసియెవిచ్ మూడు-విలువల లేదా మోడల్ పదాలకు ప్రత్యక్ష సాక్ష్యమని చెప్పడం (తిరస్కరణ)','సాధ్యమే కాని తప్పనిసరి కాదు అనే చారిత్రక ఉపయోగాన్ని నేటి సాధారణ సాధ్యతతో ఒకటిగా చదవడం (తిరస్కరణ; మూల పాదటిప్పణి భేదం చెబుతుంది)','నాలుగు ముద్రిత పట్టికలే అసత్య స్థిరాంక విలువను నిర్బంధిస్తాయని ఊహించి దాని సంపాదకీయ చేర్పును దాచడం (తిరస్కరణ)'];
alternatives['TE-T104']=['TE-T032/100/101/102/103లోని సత్యమూల్యం, మాత్రిక, వికల్పం, సర్వసత్యం, అనుగమనం పదాలను కొనసాగించి ప్రత్యేక మూడు-విలువల వ్యవస్థల పేర్లు, విస్ఫోటనరహిత భావం మూల నిర్వచనాలకు కట్టుబడి తాత్కాలికంగా ఇవ్వడం (ఎంపిక)','స్థానిక ద్విమూల్య పేజీలు క్లీని, గోడెల్, LP, హాల్డెన్, ఆర్-మింగిల్ వ్యవస్థలను నేరుగా బోధిస్తాయని చెప్పడం (తిరస్కరణ)','అసత్య స్థిరాంకానికి మూలంలో లేని విలువను మౌనంగా చేర్చి క్లీని సర్వసత్యాలు లేవనే వాదం నిలుస్తుందని ఊహించడం (తిరస్కరణ)','విస్ఫోటనరహితతను అన్ని వైరుధ్యాలనుంచి అన్ని ముగింపులు వస్తాయని పొరబడడం (తిరస్కరణ)'];
alternatives['TE-T105']=['TE-P006 కరణీయ/వాస్తవ, TE-P008 సమితి, TE-P019 సత్యతావిలువ, TE-P011 ప్రమేయం పదాలను సంచిక స్థిర వాడుకతో కొనసాగించి, ఫజీ, అనంత-విలువల తర్కం, గోడెల్--డమ్మెట్ పథకాన్ని మూల నిర్వచనానికి కట్టుబడి తాత్కాలికంగా వాడటం (ఎంపిక)','TE-P007లో సహజ సంఖ్యలు ఒకటితో మొదలయ్యే స్థానిక సంప్రదాయాన్ని సున్నాతో మొదలయ్యే OpenLogic Natపై రుద్దడం (తిరస్కరణ)','స్థానిక ద్విమూల్య తర్క పేజీలు ఫజీ లేదా గోడెల్--డమ్మెట్ ప్రత్యేక భావాలను నేరుగా ధృవీకరిస్తాయని చెప్పడం (తిరస్కరణ)','ముద్రిత V_m పరిమితి, అసత్య స్థిరాంక లోపాలను దాచడం (తిరస్కరణ)'];
alternatives['TE-T106']=['TE-P019/020 సత్యతావిలువ, TE-P024 వ్యుత్పత్తి, TE-P033 అనుమానం అనే ప్రత్యక్ష వాడుకను TE-T035/036 సీక్వెంట్ పదాలతో కొనసాగించి, n-వైపుల ప్రత్యేక రూపాన్ని స్థిర మూల నిర్వచనంతో నియంత్రించడం (ఎంపిక)','సీక్వెంట్‌కు స్థానిక పేజీలలో కనబడని ఒక స్వదేశీ సాంకేతిక పదాన్ని స్థిరపడినదిగా ప్రకటించడం (తిరస్కరణ)','ద్విమూల్య స్థానిక ఫలిత నిర్వచనం మూడు-విలువల నియమాలను నేరుగా నిరూపిస్తుందని ఊహించడం (తిరస్కరణ)','నియమ చిత్రాల్లోని మూడు-విలువల స్థానాలను గద్య సరళీకరణ కోసం మార్చడం (తిరస్కరణ)'];
alternatives['TE-T107']=['నార్మల్ మోడల్ తర్కం అనే గుర్తించదగిన సాంకేతిక అరువును TE-T053/103 సాధ్యలోక పదజాలంతో కలిపి, ప్రత్యేక నిర్వచనాన్ని స్థిర మూలానికి కట్టుబడి ఉంచడం (ఎంపిక)','నార్మల్‌ను రోజువారీ సాధారణ అని చదివి సాంకేతిక వర్గభేదాన్ని మసకబార్చడం (తిరస్కరణ)','స్థానిక ద్విమూల్య ప్రతిజ్ఞావాక్య పేజీలు క్రిప్కె అర్థవిచారం లేదా అనురూపతా సిద్ధాంతాన్ని నేరుగా బోధిస్తాయని చెప్పడం (తిరస్కరణ)','బాక్స్, డైమండ్ సూత్ర సంకేతాలను గద్య సౌలభ్యం కోసం మార్చడం (తిరస్కరణ)'];
alternatives['TE-T108']=['స్థానిక సంబంధం, ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సోపాధికం, వ్యుత్పత్తి పదజాలాన్ని మాత్రమే తీసుకొని ఏకకాల ప్రతిస్థాపన, సంబంధాత్మక నమూనా, శూన్యసందర్భ సత్యం, ద్వైతత్వ ప్రత్యేక అర్థాలను స్థిర మూల నిర్వచనంతో నియంత్రించడం (ఎంపిక)','సంబంధం అనే స్థానిక పదమే క్రిప్కె ప్రాప్యత సంబంధానికి ప్రత్యక్ష సాక్ష్యమని ప్రకటించడం (తిరస్కరణ)','ఏకకాల, వరుస ప్రతిస్థాపన ఫలితాలు ఎప్పుడూ ఒకటేనని సరళీకరించడం (తిరస్కరణ)','లోకంలో సత్యం, నమూనాలో సత్యం, శూన్యసందర్భ సత్యం మధ్య మూలం చూపిన భేదాలను కలపడం (తిరస్కరణ)'];
alternatives['TE-T109']=['ముందరి చెల్లుబాటు, స్వావర్తన పదజాలాన్ని కొనసాగించి నమూనాల వర్గంలోని ఖచ్చిత అర్థాన్ని మూల నిర్వచనానికి కట్టడం (ఎంపిక)','స్థానిక ద్విమూల్య ఫలిత భావన క్రిప్కె నమూనా చెల్లుబాటును నేరుగా నిరూపిస్తుందని ప్రకటించడం (తిరస్కరణ)','నార్మల్ అనే సాంకేతిక పరిమితిని రోజువారీ సాధారణ అనే అర్థంగా మార్చడం (తిరస్కరణ)','ఖాళీ ప్రాప్యత సంబంధంలో బాక్స్/డైమండ్ శూన్యసందర్భ భేదాన్ని విస్మరించడం (తిరస్కరణ)'];
const completion=`partial_${draftedSourceUnits}_of_${sourceUnitTotal}_draft_units`;
alternatives['TE-T110']=['ముందరి సర్వసత్యం, ప్రతిస్థాపన నిదర్శనం పదాలను కలిపి, మోడల్-రహిత మూల సర్వసత్యం మరియు మోడల్ లక్ష్య సూత్రం మధ్య భేదాన్ని నిలపడం (ఎంపిక)','ప్రతి మోడల్ సూత్రానికీ సర్వసత్యం నేరుగా నిర్వచించబడిందని చెప్పడం (తిరస్కరణ)','సర్వసత్య ప్రతిస్థాపన నిదర్శనాన్ని సాధారణ మోడల్ చెల్లుబాటుతో సమానపరచడం (తిరస్కరణ)','స్థానిక ద్విమూల్య పేజీలే మోడల్ ఆగమన ఉపసిద్ధాంతాన్ని నిరూపిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T111']=['పథకం ప్రతిస్థాపన నిదర్శనాల సమితి, లక్షణ సూత్రం, నమూనాలో సత్యం, సర్వనమూనా చెల్లుబాటు భేదాలను మూల నిర్వచనాలకు కట్టుబడి ఉంచడం (ఎంపిక)','పథకాన్ని ఒకే సూత్రంగా పరిగణించడం (తిరస్కరణ)','ఒక నమూనాలో లక్షణ సూత్రం సత్యం అయితే దాని పథకం కూడా అక్కడ సత్యమని ఊహించడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలు K, Dual ప్రత్యేక పథకాలను నేరుగా నిరూపిస్తాయని ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T112']=['ముందరి అర్థపర అనుగమనం పదాన్ని కొనసాగించి, అన్ని నమూనాలు/లోకాల నిర్వచనం, ఒక లోక ప్రతిదృష్టాంతం, ఖాళీ ప్రాప్యతలో బాక్స్ సత్యం భేదాలను మూలానికి కట్టడం (ఎంపిక)','ప్రతి నమూనాలో ఒకే లోకం సరిపోతుందని అనుగమనాన్ని బలహీనపరచడం (తిరస్కరణ)','వాక్య ఫలితానికి స్థానిక ద్విమూల్య సత్య పట్టికయే క్రిప్కె అనుగమనాన్ని నేరుగా నిరూపిస్తుందని చెప్పడం (తిరస్కరణ)','ఖాళీ ప్రాప్యతలో బాక్స్ సత్యాన్ని బాక్స్ p అసత్యమని పొరబడడం (తిరస్కరణ)'];
alternatives['TE-T113']=['చట్రాన్ని W,R జతగా, దానిపై ఆధారపడే నమూనాను W,R,V త్రయంగా వేరు చేసి, అన్ని కేటాయింపుల చెల్లుబాటును మూల నిర్వచనానికి కట్టడం (ఎంపిక)','ఒక నిర్ణీత Vలో సూత్రం సత్యమైతే చట్రంలో చెల్లుబాటవుతుందని పొరబడడం (తిరస్కరణ)','స్థానిక సంబంధ పేజీలే క్రిప్కె చట్ర నిర్వచనీయతకు ప్రత్యక్ష సాక్ష్యమని చెప్పడం (తిరస్కరణ)','స్వావర్తనానికి ఒకే నమూనా సరిపోతుందని సాధారణీకరించడం (తిరస్కరణ)'];
alternatives['TE-T114']=['పూర్వ సంబంధ/ప్రమేయ పదజాలాన్ని కొనసాగించి, ప్రతి ప్రాప్యత ధర్మాన్ని పట్టికలోని ఖచ్చిత పరిమాణక నిర్వచనానికి కట్టడం (ఎంపిక)','బలహీన సంయుక్తను గ్రాఫు అనుసంధానత్వంతో సమానం చేయడం (తిరస్కరణ)','పాక్షిక ప్రమేయాత్మకాన్ని ప్రతి లోకానికి ఖచ్చితంగా ఒక ప్రాప్య లోకం ఉండడంగా పొరబడడం (తిరస్కరణ)','స్థానిక సంబంధ చిత్రాలే యూక్లిడియన్ లేదా వజ్ర ధర్మానికి ప్రత్యక్ష పేరు ఇస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T115']=['చట్రాల వర్గాన్ని నిర్వచించే iff భావాన్ని రెండు దిశల నిరూపణతో కట్టి, నమూనాలో సత్యం వర్సెస్ చట్ర-చెల్లుబాటు, చట్ర సూచన వర్సెస్ లోక-అనుగమనం భేదాలను నిలపడం (ఎంపిక)','ఒక నిర్ణీత నమూనాలో B/T సత్యమైతే సంబంధ ధర్మం తప్పక వస్తుందని సాధారణీకరించడం (తిరస్కరణ)','S4/S5ను ఒక్క లోకంలో పథక అనుగమనం ద్వారా నిర్వచించడం (తిరస్కరణ)','స్థానిక ద్విమూల్య తర్క పేజీలే క్రిప్కె చట్ర అనురూపతకు ప్రత్యక్ష సాక్ష్యమని ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T116']=['మొదటిస్థాయి, ద్విస్థాన సంబంధం, వాక్యం అనే స్థానిక వాడుకను కొనసాగించి, సుస్థాపితత్వాన్ని మూల అనంత-శ్రేణి దిశతో, సంహతత్వాన్ని పూర్వ నిర్వచనంతో కట్టడం (ఎంపిక)','సుస్థాపితత్వం, దాని విలోమాన్ని ఒకే శ్రేణి దిశగా కలపడం (తిరస్కరణ)','సార్వత్రిక చట్రాలన్నిటిలో చెల్లుబాటును ఒక్క సార్వత్రిక చట్రంలో సత్యంగా కుదించడం (తిరస్కరణ)','స్థానిక పేజీలే లొబ్ లేదా సంహతత్వ ప్రత్యేక పేర్లను నేరుగా ధ్రువీకరిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T117']=['TE-T017లోని తుల్యతా సంబంధం/వర్గాన్ని కొనసాగించి, పరస్పర వియుక్తతను TE-P009కు, S5 సమాన తర్కాన్ని మూల వర్గ-పరిమిత నమూనా నిరూపణకు కట్టడం (ఎంపిక)','తుల్యతా సంబంధాన్ని సార్వత్రిక సంబంధంతో సమాన ధర్మంగా ప్రకటించడం (తిరస్కరణ)','వర్గానికి పరిమితం చేసిన నమూనాలో బయట లోకాలపై మోడల్ సంచాలకాలను ఇంకా మూల్యాంకనం చేయడం (తిరస్కరణ)','స్థానిక సమితి/సంబంధ పేజీలే S5 పూర్తి అనురూపతను నేరుగా స్థాపిస్తాయని ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T118']=['స్థానిక మొదటిస్థాయి/విధేయ/సమితి పదజాలాన్ని కొనసాగించి, ప్రామాణిక అనువాదం మరియు ఏకస్థానిక ద్వితీయ-స్థాయి చట్ర ఫలితాన్ని OLP-0426 ఆగమన శాఖలు, రెండు iff వాదాలకు కట్టడం (ఎంపిక)','ST_xను కేవలం సంకేతాలను మరో అక్షరంతో మార్చడంగా వర్ణించి బాక్స్/డైమండ్ పరిమాణీకరణ భేదం తొలగించడం (తిరస్కరణ)','చట్రంలో ఒకే నిర్దేశానికి సత్యాన్ని అన్ని ఉపసమితులపై చట్ర చెల్లుబాటుతో సమానపరచడం (తిరస్కరణ)','స్థానిక విధేయ తర్క పేజీలే ప్రామాణిక మోడల్ అనువాదాన్ని లేదా నిర్ణయనీయత-లేమిని నేరుగా నిరూపిస్తాయని ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T119']=['పూర్వ స్వీకృతాధారిత వ్యుత్పత్తి/మోడస్ పోనెన్స్ ఎంపికలను కొనసాగించి, అవశ్యకీకరణను A నుంచి □A అనే మూల నియమంతో నిర్వచించడం (ఎంపిక)','అవశ్యకీకరణను A నుంచి A సాధ్యమే అనే నియమంగా చదవడం (తిరస్కరణ)','వ్యుత్పత్తిలో నాలుగు శాఖల్లో ప్రతిస్థాపన నిదర్శనాలను సాధారణ స్వీకృతాలతో కలిపివేయడం (తిరస్కరణ)','స్థానిక నియమ-వ్యుత్పత్తి పేజీలే K/Dual నార్మల్ మోడల్ వ్యవస్థకు ప్రత్యక్ష ధ్రువీకరణ అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T120']=['మోడల్ తర్కం, నార్మల్ మోడల్ తర్కం వేరు నిర్వచనాలుగా ఉంచి, K/Dual మరియు అవశ్యకీకరణను రెండో దానికి మాత్రమే జోడించడం; ప్రతిపాదనకు అన్ని మోడల్ తర్కాల ప్రతిచ్ఛేదం వాడడం (ఎంపిక)','అన్ని మోడల్ తర్కాల స్థానంలో నార్మల్ తర్కాల ప్రతిచ్ఛేదాన్ని తీసుకొని మొదటి ప్రతిపాదన కనిష్ఠత నిరూపితమని చెప్పడం (తిరస్కరణ)','RK ఆగమన దశలో K నిదర్శనాన్ని లేదా మోడస్ పోనెన్స్‌ను మౌనంగా తొలగించడం (తిరస్కరణ)','స్థానిక సమితి పేజీ మోడల్ తర్కాల ప్రత్యేక కనిష్ఠత సిద్ధాంతాన్నే స్థాపిస్తుందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T121']=['వ్యుత్పత్తి నిర్వచనంలోని సర్వసత్య/K/Dual/అదనపు స్వీకృత శాఖలను, MP/Nec నియమాలను వేరుగా ఉంచి, రెండు సమితి-చేరికల వాదనను మూల క్రమంలో నిలపడం; K సూత్రపు సభ్యత్వాన్ని ప్రకటిత సవరణతో రాయడం (ఎంపిక)','K పథకం పేరును సూత్రాల సమితిలో సాక్షాత్తు మూలకంగా ప్రకటించడం (తిరస్కరణ)','ఒకే నమూనాలో సత్యాన్ని నార్మల్ మోడల్ వ్యవస్థలో వ్యుత్పాద్యతతో సమానమని అనుకోవడం (తిరస్కరణ)','ప్రతిస్థాపనపై మూల వ్యాయామాన్ని పరిష్కరించామని మౌనంగా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T122']=['నాలుగు K నిరూపణలను, సర్వసత్య ప్రతిస్థాపన నిదర్శనాల పంక్తి-సూచనలను, మూడు Box/Diamond tag శాఖలను, పరిష్కరించని మూడు వ్యాయామాలను యథాతథంగా ఉంచడం (ఎంపిక)','Diamond నిర్వచిత శాఖను ప్రాథమిక శాఖగా కలపడం లేదా Box నిర్వచిత శాఖలో అదే తీర్మానాన్ని బలవంతంగా రాయడం (తిరస్కరణ)','స్థానిక నియమ-వ్యుత్పత్తి పేజీలు K పంపిణీ, Dual, Necలను ప్రత్యక్షంగా ధ్రువీకరిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T123']=['ప్రతిజ్ఞావాక్య తర్కం, నియమ-ఆధారిత వ్యుత్పత్తి, ఆగమనం అనే స్థానిక రూపాలను తీసుకుని, PL/RK/rewriting ప్రత్యేక ఫలితాలను స్థిర మూల నిరూపణలకే కట్టడం; రెండు మూల దిశ/మెటాచర భేదాలను ప్రకటించడం (ఎంపిక)','PL/RK ప్రత్యేక నియమాలను స్థానిక పేజీలే ప్రత్యక్షంగా స్థాపిస్తాయని చెప్పడం (తిరస్కరణ)','ప్రతిస్థాపనలో పాత–కొత్త క్రమాన్ని తారుమారు చేసి వ్యుత్పత్తి దిశను మార్చడం (తిరస్కరణ)','rewriting అభ్యాసాన్ని పరిష్కరించామని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T124']=['నాలుగు K నిరూపణలను PL/RK, Diamond భర్తీ సూచికలతో నిలిపి, చివరి వికల్ప క్రమాన్ని ప్రతిపాదనకు సరిపడే ఒక ప్రకటిత మార్పుగా చూపడం (ఎంపిక)','చివరి నిరూపణను ప్రతిపాదనతో వేరే క్రమంలో ముగిసినా గమనిక లేకుండా ఉంచడం (తిరస్కరణ)','స్థానిక ప్రతిజ్ఞావాక్య తర్క పేజీనే Box/Diamond పంపిణీ సిద్ధాంతాలకు ప్రత్యక్ష ఆధారంగా చూపడం (తిరస్కరణ)','చివరి మూడు అభ్యాసాలకు మూలంలో లేని పరిష్కారాలను చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T125']=['ద్వంద్వ సూత్రం అని T/B/4/5 డైమండ్-ఉపసూచిక రూపాలను వివరించి, D స్వద్వంద్వత్వం, K వ్యవస్థ సమానత్వ వాదనను మూల గణితానికి కట్టడం (ఎంపిక)','డైమండ్ ఉపసూచికను కొత్త భాషా పదంగా కల్పించి గణిత సంకేతాన్ని మార్చడం (తిరస్కరణ)','స్థానిక ప్రతిజ్ఞావాక్య తర్క పేజీనే మోడల్ ద్వంద్వత్వానికి ప్రత్యక్ష సాక్ష్యమని చెప్పడం (తిరస్కరణ)','సమానత్వ నిరూపణను మూల వ్యాయామం స్థానంలో మౌనంగా చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T126']=['ఆరు నిరూపణలు, ప్రతిస్థాపన సూచనలు, S4/S5 నిర్వచనాలు, సమాన వ్యవస్థలను మూల క్రమంలో నిలిపి, తుల్యతా సంబంధం అనే పూర్వ పదాన్ని కొనసాగించడం (ఎంపిక)','మూలంలో వ్యాయామంగా ఉన్న చివరి సమానత్వ నిరూపణను మౌనంగా పూరించడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ/వ్యుత్పత్తి పేజీలు ప్రత్యేక మోడల్ సమానత్వాలను నేరుగా నిరూపిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T127']=['నిర్దుష్టత అనే పూర్వ పదాన్ని కొనసాగించి, ఆధార/ఆగమన శాఖలు, MP/Nec, నమూనాల వర్గ-ప్రతిచ్ఛేదం నిలపడం; మూలంలోని రెండు నిరూపణ-వివరణ ఖాళీలను పక్కనే ప్రకటించడం (ఎంపిక)','ఆగమన దశలో K/ఐచ్ఛిక Dual సందర్భాలను మౌనంగా వదిలేయడం (తిరస్కరణ)','ప్రపంచ-చెల్లుబాటు ఉదాహరణనే ఏ నమూనాల వర్గానికైనా ప్రత్యక్ష ప్రకటనగా చదవడం (తిరస్కరణ)','స్థానిక పేజీలు మోడల్ నిర్దుష్టతా సిద్ధాంతాన్ని నేరుగా ధ్రువీకరిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T128']=['మూడూ మూల TikZ ప్రతినమూనాలు, చట్ర ధర్మాలు, రెండు వ్యాయామాలు, వ్యుత్పాద్యత/చేరిక దిశలు నిలిపి, D/4/5 స్వీకృత సూత్రాల రకభేదాన్ని రెండు ప్రకటిత సవరణలతో స్పష్టం చేయడం (ఎంపిక)','వ్యవస్థ-పేర్లనే వ్యుత్పాద్య సూత్రాలుగా మౌనంగా ఉంచడం (తిరస్కరణ)','సౌష్ఠవ, స్వావర్తన, సీరియల్, యూక్లిడియన్ ధర్మాలను ఒకే లక్షణంగా కలపడం (తిరస్కరణ)','స్థానిక సంబంధ పేజీనే మోడల్ ప్రతినమూనాలకు ప్రత్యక్ష సాక్ష్యంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T129']=['సమితి Gamma నుంచి వ్యవస్థ Sigmaలో నిరూపణీయతకు మూలంలోని అంతర్నిహితార్థ-శ్రేణి షరతును యథాతథంగా ఉంచి, పూర్వ వ్యుత్పాద్యత పదరూపాన్ని కొనసాగించడం (ఎంపిక)','Gamma/Sigma పాత్రలను తారుమారు చేయడం (తిరస్కరణ)','మూలంలో చెప్పని శూన్య-n సంప్రదాయాన్ని నిర్వచనంలో జోడించడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలనే ఈ మోడల్-ప్రత్యేక నిర్వచనానికి ప్రత్యక్ష సాక్ష్యంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T130']=['ఏకదిశత, స్వావర్తనత్వం, కట్, నిగమన సిద్ధాంతం, నిగమన పరంగా సంవృతం అనే పూర్వ పదరూపాలను Gamma/Sigma-సాపేక్ష ఐదు మూల షరతులతో కలిపి నిలపడం (ఎంపిక)','కట్‌కు మూలంలో కనిపించని కొత్త ఉపపత్తిని చేర్చడం (తిరస్కరణ)','రెండు దిశల నిగమన సిద్ధాంతాన్ని ఒక్క దిశగా పరిమితం చేయడం (తిరస్కరణ)','పేరులేని ఐదవ అంశానికి మూలంలో కనిపించే Rule T లేబుల్ ఉన్నట్లుగా ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T131']=['స్థిర అవైరుధ్యం/వైరుధ్యం జోడీని స్థానిక సుసంగతత్వం/అసంగత పర్యాయంతో కలిపి నమోదు చేసి, వ్యవస్థ-సాపేక్ష షరతులు, K/K5 ఉదాహరణలు, మూడు లక్షణాలు, విపర్యయ నిరూపణ నిలపడం; రెండు మూల స్పష్టీకరణలు ప్రకటించడం (ఎంపిక)','స్థానిక సాధారణ ప్రతిజ్ఞావాక్య అవైరుధ్య భావమే K/K5-సాపేక్ష పూర్తి సిద్ధాంతాన్ని నిరూపిస్తుందని చెప్పడం (తిరస్కరణ)','ఏ నమూనాలోనైనా వ్యవస్థ-సాపేక్ష వైరుధ్యం అసంతృప్తిని ఇస్తుందని పరిమితి లేకుండా ఉంచడం (తిరస్కరణ)','(b) అంశాన్ని విస్తరించిన సమితుల నుంచి bottom వ్యుత్పాద్యతకు తక్షణ నిర్వచనంగా పొరబడడం (తిరస్కరణ)'];
alternatives['TE-T132']=['అధ్యాయ శీర్షిక నుంచి కానానికల్ నమూనా వరకూ పూర్వ సంపూర్ణత/అవైరుధ్యం/ప్రతినమూనా రూపాలను కొనసాగించి, K/KT/KD నిర్దుష్టత, విపర్యయ ప్రతినమూనా, పూర్తి సమితుల ప్రాప్యత, సభ్యత్వ-సత్య లక్ష్యం నిలపడం (ఎంపిక)','ఈ పరిచయంలో భవిష్యత్ కానానికల్ నిర్మాణం పూర్తిగా నిరూపించబడిందని చూపడం (తిరస్కరణ)','సౌష్ఠవ/స్వావర్తన/సీరియల్ నమూనా వర్గాలను కలపడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలే మోడల్ సంపూర్ణతకు ప్రత్యక్ష సాక్ష్యం అని చూపడం (తిరస్కరణ)'];
alternatives['TE-T133']=['సంపూర్ణ Sigma-అవిరుద్ధత, నిగమన సంవృతత, సంయోజకాల సభ్యత్వ షరతులు, guarded exercise branches నిలిపి, నాలుగు స్థానిక నిరూపణ సమస్యలను పక్కనే ప్రకటించి సరిచేయడం (ఎంపిక)','నిషేధం రెండవ దిశలో A/నిషేధ-A పొరపాటును నిలపడం (తిరస్కరణ)','వికల్ప, తుల్యత నిరూపణల తప్పిన దిశలను మౌనంగా వదలడం (తిరస్కరణ)','సాధారణ స్థానిక అవైరుధ్య పేజీనే మోడల్ పూర్తి సమితుల ప్రత్యక్ష నిరూపణగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T134']=['లిండెన్‌బామ్ ఉపసిద్ధాంతం, సంపూర్ణ Sigma-అవిరుద్ధ విస్తరణ, సమగ్ర జాబితా, పరిమిత సాక్ష్య అవైరుధ్య వాదనను నిలిపి, జాబితా దశ పొడవును గరిష్ఠంగా nగా ప్రకటితంగా సరిచేయడం (ఎంపిక)','సరిగ్గా n పొడవు దశలనే సమగ్ర జాబితా అని అనువదించడం (తిరస్కరణ)','స్థానిక సాధారణ ప్రతిజ్ఞావాక్య పేజీలే మోడల్ లిండెన్‌బామ్ నిరూపణను ప్రత్యక్షంగా ఇస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T135']=['Box/Diamond షరతుపర శాఖలు, పూర్వప్రతిబింబాలు, కానానికల్ ప్రాప్యత సంబంధం, RK ఉద్ధరణను నిలిపి, రెండు మూల సూచిక/పరామితి సమస్యలను పక్కనే ప్రకటించి సరిచేయడం (ఎంపిక)','B_k సాక్షుల శ్రేణిలో నిర్వచించని B_nను నిలపడం (తిరస్కరణ)','Sigma-సాపేక్ష మధ్యంతర వ్యుత్పాద్యతను పరామితి లేకుండా ఉంచడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలే ఈ మోడల్-ప్రత్యేక నిరూపణలను ప్రత్యక్షంగా ఇస్తాయని చూపడం (తిరస్కరణ)'];
alternatives['TE-T136']=['సంపూర్ణ Sigma-అవిరుద్ధ సమితులను లోకాలుగా, Box/Diamond guarded ప్రాప్యతను Rగా, మూలకత్వ-ఆధారిత పరమాణు విలువ నిర్ణయాన్ని Vగా నిర్వచించడం (ఎంపిక)','సత్య-మూలకత్వ తుల్యతను ఈ నిర్వచనంలోనే పూర్తిగా నిరూపించామని చూపడం (తిరస్కరణ)','Box/Diamond శాఖల ప్రాప్యత షరతులను తారుమారు చేయడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలే కానానికల్ నమూనాను ప్రత్యక్షంగా నిర్వచించాయని చూపడం (తిరస్కరణ)'];
alternatives['TE-T137']=['సత్య ఉపసిద్ధాంతం, ప్రతిజ్ఞావాక్య/మోడల్ అన్ని ఆగమన సందర్భాలు, guarded వ్యాయామ శాఖలు నిలిపి, Diamond నిరూపణలో రెండు దశలు, వ్యాయామ ట్యాగ్ కేసును పక్కనే ప్రకటించి సరిచేయడం (ఎంపిక)','Box-ప్రాప్యత నుంచి Diamond-ప్రతిబింబానికి తప్పు ప్రతిపాదనను సూచించడం (తిరస్కరణ)','ప్రాప్య లోకంలోని B మూలకత్వం నుంచి ఆగమన పరికల్పన లేకుండా సత్యానికి దూకడం (తిరస్కరణ)','proband అనే అసమాన ట్యాగ్‌ను జాబితాలో ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T138']=['నిర్ణాయకత్వాన్ని నమూనాలో సర్వత్రా సత్యం, వ్యవస్థలో వ్యుత్పాద్యత తుల్యతగా నిర్వచించి, K సంపూర్ణత విపర్యయ నిరూపణను, సాధారణ నమూనా వర్గ పరిమితిని నిలపడం (ఎంపిక)','నిర్ణాయకత్వమే ఏ నమూనా వర్గానికైనా వ్యవస్థ సంపూర్ణతను ఇస్తుందని చెప్పడం (తిరస్కరణ)','కానానికల్ నమూనా వర్గ-సభ్యత్వ అవసరాన్ని తొలగించడం (తిరస్కరణ)','స్థానిక సాధారణ ప్రతిజ్ఞావాక్య పేజీలే ఈ మోడల్ K సిద్ధాంతాన్ని ప్రత్యక్షంగా నిరూపిస్తాయని చూపడం (తిరస్కరణ)'];
alternatives['TE-T139']=['TE-T114లో స్థిర సీరియల్/స్వావర్తన/సౌష్ఠవ/సంక్రామక/యూక్లిడియన్, పాక్షిక ప్రమేయాత్మక/ప్రమేయాత్మక/బలహీన సాంద్ర రూపాలను కొనసాగించి D/T/B/4/5 guarded నిరూపణలు, నమూనా వర్గ సిద్ధాంతం, చివరి అసంపూర్ణత హెచ్చరిక నిలపడం (ఎంపిక)','సంక్రామక బదులు కొత్త సంక్రమణీయ రూపాన్ని ఈ అధ్యాయంలో ప్రవేశపెట్టడం (తిరస్కరణ)','కానానికల్ అనురూపత నుంచే ప్రతి మోడల్ వ్యవస్థకు సంపూర్ణత వస్తుందని చెప్పడం (తిరస్కరణ)','బలహీన సాంద్రత నిరూపణ చివరి అవైరుధ్యాన్ని పాఠకుడికి చెప్పకుండా వదలడం (తిరస్కరణ)'];
alternatives['TE-T140']=['Filtrationsకు నిర్వచనాధీన తాత్కాలిక వడపోతలు, decidabilityకు పూర్వ నిర్ణేయత రూపాన్ని అధ్యాయ శీర్షికలో వాడి తొమ్మిది రక్షిత దిగుమతులను యథాతథం ఉంచడం (ఎంపిక)','మోడల్ వడపోత అర్థం స్థానిక సాధారణ తర్క పేజీలో ప్రత్యక్షంగా ఉన్నట్లు చూపడం (తిరస్కరణ)','దిగుమతి మార్గాలను శీర్షికతోపాటు అనువదించి TeX నిర్మాణం మార్చడం (తిరస్కరణ)'];
alternatives['TE-T141']=['పరిమిత ప్రతినమూనా శోధన, పరిమిత నమూనా ధర్మం, సూత్రాధార పరిమాణ హద్దు అనే మూడు వేర్వేరు దశలను నిలిపి, వడపోతను తాత్కాలిక పదంగా ఉంచి నాలుగు మూల సమస్యలను పక్కనే ప్రకటించి సరిచేయడం (ఎంపిక)','పరిమిత ప్రతినమూనా శోధన ఒక్కటే నిర్ణయ ప్రక్రియ అని చెప్పడం (తిరస్కరణ)','ప్రతి తుల్యతా వర్గం అనంతమని చెప్పడం (తిరస్కరణ)','మూలంలోని అస్తిత్వాత్మక బాక్స్ షరతు, అన్ని నమూనా చరాల పరీక్షను యథాతథం ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T142']=['ఉపసూత్ర సంవృతతకు అదనంగా Box/Diamond సంవృతతను విడిగా నిర్వచించి, తుల్యతా వర్గాలకు పూర్వ తుల్యతా సంబంధ పదజాలం, ఖచ్చిత సభ్యత్వ/సూత్ర పరీక్షలు నిలపడం (ఎంపిక)','మోడల్ సంవృత సమితి కూడా పరిమితమని అనుకోకుండా చేర్చడం (తిరస్కరణ)','TE-P022 ప్రతిజ్ఞావాక్య తుల్యత పేజీనే తుల్యతా సంబంధ సిద్ధాంతానికి ప్రత్యక్ష సాక్ష్యంగా చూపడం (తిరస్కరణ)','ప్రాప్యత సంబంధం R ధర్మాలను ఈ కొత్త తుల్యతా సంబంధానికి బదిలీ చేయడం (తిరస్కరణ)'];
alternatives['TE-T143']=['పూర్తి అధికార నిర్వచనం చూశాక వడపోతను నిర్వచనాధీన ఎడిషన్ పదంగా నిలిపి, స్థిర W*/V*, భిన్న R*, మూడు షరతులు, పరమాణు ప్రతిదిశ, నాలుగు మోడల్ నిరూపణ దిశలు, guarded వ్యాయామాలను యథాతథం ఉంచడం (ఎంపిక)','వడపోతను ఏకైక R* నిర్మాణంగా చెప్పడం (తిరస్కరణ)','V*(p)లో [w] ఉండగానే wలో p సత్యమని p Gamma షరతు లేకుండా తేల్చడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీలు modal సత్య సంరక్షణను ప్రత్యక్షంగా నిరూపిస్తాయని చూపడం (తిరస్కరణ)'];
alternatives['TE-T144']=['అత్యంత సూక్ష్మ/స్థూలను R* జతల చేరిక క్రమంతో నిర్వచనాధీనంగా నిలిపి, R1/R2/R3 నిరూపణలు, చిత్రాలు, ఉదాహరణల్లోని మూడు విలువ సమితి సవరణలను పక్కనే ప్రకటించి నిలపడం (ఎంపిక)','సూక్ష్మ/స్థూలను లోకాల సంఖ్యతో పోల్చడం (తిరస్కరణ)','మొదటి ఉదాహరణలో 1 V(p)లో లేకపోవడమే [1] V*(p)లో లేదని తేల్చుతుందని చెప్పడం (తిరస్కరణ)','W వెలుపలి binary strings/zeroను విలువ సమితుల్లో యథాతథం ఉంచడం (తిరస్కరణ)','చివరి వ్యాయామానికి కోరని పూర్తి పరిష్కారం చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T145']=['పరిమిత Gammaలోనే ప్రతి వడపోత లోక వర్గాన్ని దాని సత్య సూత్రాల ఉపసమితికి పంపే ఒకటి-ఒకటి ప్రమేయం, |W*|≤|P(Gamma)|=2^n హద్దును నిలపడం (ఎంపిక)','వడపోత నిర్వచనమే Gammaతో సంబంధం లేకుండా పరిమితత్వం ఇస్తుందని చెప్పడం (తిరస్కరణ)','ప్రతి సాధ్య ఉపసమితి తప్పనిసరిగా ఒక వర్గం అని భావించి సమానత్వం చెప్పడం (తిరస్కరణ)','సాధారణ స్థానిక సమితి పేజీనే modal ఫిల్ట్రేషన్ నిరూపణగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T146']=['Kకు నమూనా వర్గ ఆంక్ష లేకపోవడం, సార్వత్రిక నమూనా వడపోతలో R1 వల్ల సార్వత్రికత, S5కు తుల్యతా వర్గ పరిమితి, రెండు వ్యాయామ భేదాలను నిలిపి, K నిరూపణలో ఒక వర్గ సూచన సవరించడం (ఎంపిక)','పాత wనే వడపోత లోకంగా వాడడం (తిరస్కరణ)','ఏ L నమూనాకు చేసిన ప్రతి వడపోత L నమూనానే అని సామాన్యీకరించడం (తిరస్కరణ)','ఫ్రేమ్ చెల్లుబాటు సమానత్వమే స్థానిక సత్య మార్పును వేరే వాదన లేకుండా తక్షణం ఇస్తుందని చెప్పడం (తిరస్కరణ)','సౌష్ఠవం/సంక్రామకత్వం/యూక్లిడియన్ కూడా ప్రతి వడపోతలో నిలుస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T147']=['నిరూపణల లెక్కింపు, పరిమిత సార్వత్రిక నమూనాల ప్రతినమూనా శోధనను సమాంతరంగా నడిపి, S5 నిర్ణాయకత్వం మరియు పరిమిత నమూనా ధర్మం వల్ల ముగింపును చూపడం; మూలంలోని నమూనా వర్గ లోపాన్ని పక్కనే ప్రకటించి సరిచేయడం (ఎంపిక)','S5కు చెందని అన్ని పరిమిత నమూనాలను ప్రతినమూనాలుగా అనుమతించడం (తిరస్కరణ)','పరిమిత ప్రతినమూనా శోధన ఒక్కటే ఎప్పుడూ నిర్ణయ ప్రక్రియ అని చెప్పడం (తిరస్కరణ)','నిరూపణ శాఖ, నమూనా శాఖలను క్రమంగా మాత్రమే నడిపి నిలుపు సమస్యను తిరిగి తెచ్చుకోవడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలు S5 నిర్ణేయతకు ప్రత్యక్ష నిరూపణ అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T148']=['C1..C4 పట్టికలో అన్ని Box/Diamond guarded దిశలను నిలిపి, జతల చేరిక తగ్గితే సూక్ష్మత పెరుగుతుందని, నాలుగు వడపోత నిర్వచనాలు వాటి ధర్మాలకు సరిపోతాయని, మూడు శాఖలు మూలంలాగే వ్యాయామాలేనని చెప్పడం (ఎంపిక)','సూక్ష్మతను W*లో లోకాల సంఖ్యతో కలపడం (తిరస్కరణ)','C3/C4లో Box/Diamond బదిలీ దిశలను తారుమారు చేయడం (తిరస్కరణ)','వ్యాయామ శాఖలను పూర్తిగా నిరూపించామని ప్రకటించడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీనే modal C-షరతులకు ప్రత్యక్ష సాక్ష్యంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T149']=['మొదటి నమూనా w2 స్వబాణం, వడపోత [w2] స్వబాణం, quotient బాణాల బ్రాకెట్లు, శూన్యం కాని modal సంవృతత, సిద్ధాంత-నిరూపణ అంశ క్రమాన్ని నాలుగు మూల సవరణలతో ప్రకటించి సరిచేయడం; పని చేసిన సంక్రామక నిరూపణ, రెండు వ్యాయామాలను నిలపడం (ఎంపిక)','w2కు బయటకు బాణం లేకుండానే చిత్రం సీరియల్/యూక్లిడియన్ అని చెప్పడం (తిరస్కరణ)','పాత లోకాలు w2,w5నే వడపోత బాణాల చివరలుగా చూపడం (తిరస్కరణ)','ఖాళీ modal సంవృత సమితి కూడా అనంతమని చెప్పడం (తిరస్కరణ)','సంక్రామక నిరూపణను సిద్ధాంతంలోని సౌష్ఠవ అంశానికి అంటించడం (తిరస్కరణ)'];
alternatives['TE-T150']=['పూర్వ టాబ్లో రూపం, prefixedకు నిర్వచనాధీన పూర్వసూచికలతో కూడిన వివరణ, ముసాయిదా/ఇంకా కావలసిన అంశాల హెచ్చరిక, తొమ్మిది దిగుమతులు, రక్షిత శీర్షిక హుక్‌ను నిలపడం (ఎంపిక)','ముసాయిదా గమనికను తొలగించి అధ్యాయం సంపూర్ణమని చూపడం (తిరస్కరణ)','prefixedకు స్థానిక సాధారణ తర్క పేజీలో ప్రత్యక్ష సాంకేతిక పదం ఉందని చెప్పడం (తిరస్కరణ)','దిగుమతి ఫైల్ మార్గాలు లేదా usetoken గుర్తింపును అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T151']=['పూర్వ టాబ్లో/చిహ్నిత సూత్రం/సంవృత శాఖ రూపాలను నిలిపి, పూర్వసూచికను మూల నిర్వచనం ప్రకారం ధన పూర్ణసంఖ్యల శూన్యం కాని అనుక్రమంగా, sigma.nను ప్రాప్య లోకపు పేరుగా అర్థం చేసుకోవడం (ఎంపిక)','ప్రతి పూర్వసూచికను ఒకే పూర్ణసంఖ్యగా చెప్పడం (తిరస్కరణ)','వేర్వేరు పూర్వసూచికల వద్ద ఎదురైన సత్యసంకేతాలకే శాఖను సంవృతమని చెప్పడం (తిరస్కరణ)','స్థానిక సాధారణ సత్యమూల్య/వ్యుత్పత్తి పేజీల్లోనే prefixed modal tableaux నేరుగా ఉన్నాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T152']=['T Box/F Diamondలకు ఉపయోగించిన sigma.n, F Box/T Diamondలకు కొత్త sigma.n, ఒకే పూర్వసూచిక వద్ద సంవృతత, నిషిద్ధ countertableau శాఖలను నిలిపి, ఇతర లోకాల సత్య వాదన/Box-only నియమ చీటీని రెండు ప్రకటిత మూల సవరణలతో సరిచేయడం (ఎంపిక)','T Boxకు కొత్త, F Boxకు పాత పూర్వసూచిక అనుమతించడం (తిరస్కరణ)','వేర్వేరు పూర్వసూచికల వద్ద T A, F Aతో శాఖను మూయడం (తిరస్కరణ)','నిషిద్ధ సంవృత చిత్రాలను చెల్లుబాటు నిరూపణలుగా చెప్పడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీల్లోనే modal K నియమాలు నేరుగా ఉన్నాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T153']=['Box, Diamond షరతు ఉదాహరణల పూర్తి చెట్లను, నాలుగు పరిష్కరించని సమస్యలను, K శీర్షికలో రక్షిత టాబ్లో హుక్‌ను నిలపడం (ఎంపిక)','వ్యాయామాలకు సమాధానాలు చేర్చి మూల పాఠ్య పరిధిని మార్చడం (తిరస్కరణ)','ఒక modal operator మాత్రమే ఉన్న ఎడిషన్‌లోనూ రెండో షరతు ఉదాహరణను బలవంతంగా చూపడం (తిరస్కరణ)','చెట్టు లోని 1.1 పూర్వసూచిక లేదా సంవృత గుర్తులను మార్చడం (తిరస్కరణ)'];
alternatives['TE-T154']=['f:P->W అర్థనిర్దేశం, R సంరక్షణ, T/F సంతృప్తి, శాఖ సంతృప్తి, ఉపయోగించిన/కొత్త సాక్షి, ఆరు ప్రకటిత మూల సవరణలు, మూల వ్యాయామాలు/tagfalse పరిమితిని నిలపడం (ఎంపిక)','ప్రతినమూనాలో A సత్యమని చెప్పడం (తిరస్కరణ)','F Box B, T Diamond B నుంచి A నిష్కర్షలు తీయడం (తిరస్కరణ)','రెండు శాఖల నియమాలను రెండు పూర్వాధారాల నియమాలుగా చెప్పడం (తిరస్కరణ)','Gamma Proves A పరికల్పననే పర్యవసాన నిష్కర్షగా పునరావృతం చేయడం (తిరస్కరణ)','సాధారణ సంబంధ/తర్క పేజీలు మోడల్ నిర్దుష్టతను నేరుగా నిరూపిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T155']=['T/D/B/4/4r పట్టిక, ఆరు తర్కాల ప్రాప్యత వర్గీకరణ, ఉపయోగించిన sigma.n షరతు, ఆరు పరిష్కరించని సమస్యలు నిలిపి, S5లో 5 స్వీకృత ఉదాహరణను స్థిర నిర్వచనానికి సరిపోయే సంవృత చెట్టుగా ఒక ప్రకటిత మూల సవరణతో మార్చడం (ఎంపిక)','Box A implies Box Diamond Aనే 5 స్వీకృతమని చెప్పడం (తిరస్కరణ)','S5 ఉదాహరణను వేరే సూత్రానికి మార్చి మూల 5 వాదనను వదలడం (తిరస్కరణ)','కొత్త 1.2 సాక్షిని ఉపయోగించిన పూర్వసూచికగా ముందుగానే భావించడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీలో modal 4r నియమం ప్రత్యక్షంగా ఉందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T156']=['T స్వావర్తన, D సీరియల్, B సౌష్ఠవ, 4 సంక్రామక, 4r యూక్లిడియన్ నిర్దుష్టత కేసులు, షరతు వ్యాయామాలు నిలిపి 4r రెండు లోక/నిష్కర్ష తప్పులను పక్కన ప్రకటించి సరిచేయడం (ఎంపిక)','4r Boxలో లోకం f(sigma).nను సరైన ప్రపంచ సూచికగా స్వీకరించడం (తిరస్కరణ)','4r Diamondలో T Box Bని ఆ నియమ నిష్కర్షగా ఉంచడం (తిరస్కరణ)','probBox/probDiamond వ్యాయామాలకు పూర్తి నిరూపణలు జోడించినట్లు చెప్పడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీనే modal నిర్దుష్టత ప్రత్యక్ష నిరూపణగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T157']=['సార్వత్రిక S5 నమూనాల్లో ప్రతి లోకం నుంచి ప్రతి లోకం ప్రాప్యమని, అనుక్రమాల బదులు ధన పూర్ణసంఖ్య పూర్వసూచికలు వాడవచ్చని, T Box/F Diamondకు పాత m, F Box/T Diamondకు కొత్త m, 2/3 సాక్షులతో 5 సంవృత చెట్టు అని నిలపడం (ఎంపిక)','S5లోని ఏకైక లోకమే ప్రతి పూర్వసూచికకు ఉండాలని చెప్పడం (తిరస్కరణ)','used/new m నియమాలను తారుమారు చేయడం (తిరస్కరణ)','ప్రతి సార్వత్రిక నమూనా అచ్చంగా ఒక్క లోకం గలదని చెప్పడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీ S5 సంపూర్ణతకు ప్రత్యక్ష నిరూపణ అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T158']=['సంపూర్ణ శాఖ సంతృప్తి, పూర్వసూచిక నమూనా, సత్య ఆగమనాన్ని నిలిపి, ఏడు మూల సవరణలను ప్రకటించడం; పరిమిత Gamma ఆధారంతో సాధారణ సంపూర్ణతను నిరూపించలేదని స్పష్టంగా ఉంచడం (ఎంపిక)','ప్రతి శాఖ సంవృతం అనే మూల ముగింపును యథాతథంగా అనువదించడం (తిరస్కరణ)','మూడు అసత్య ఆగమన సందర్భాల్లో రెండో Bనే ఉంచడం (తిరస్కరణ)','అనంత Gammaకు మూలంలో లేని నిరూపణను కల్పించడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలు K టాబ్లో సంపూర్ణతను నిరూపిస్తాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T159']=['K నిర్ణయ విధానం, Box/Diamond రెండు ప్రతినమూనా చెట్లు, W/R/V నమూనాలను నిలిపి, ఐదు స్థానిక మూల పొరపాట్లు ప్రకటించి సరిచేయడం (ఎంపిక)','F Diamond పంక్తికి T Diamond నియమాన్ని వర్తింపజేయడం (తిరస్కరణ)','మధ్య చెట్టులో తిరగబడిన షరతును నిజమైన మొదటి సూత్రంగా ఉంచడం (తిరస్కరణ)','నమూనా చిత్రాన్ని చెట్టుకి విరుద్ధంగా మార్చడం (తిరస్కరణ)','మునుపటి సాధారణ Gamma నిరూపణ ఖాళీ ఇక్కడే పరిష్కరించబడిందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T160']=['మోడల్ సీక్వెంట్ కలనశాస్త్రం శీర్షిక, ముసాయిదా హెచ్చరిక, నాలుగు క్రియాశీల/మూడు వ్యాఖ్యానిత దిగుమతులను నిలపడం (ఎంపిక)','ముసాయిదాను పూర్తి నిరూపణలున్న అధ్యాయంగా చూపడం (తిరస్కరణ)','వ్యాఖ్యానిత దిగుమతులను సక్రియం చేయడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీని modal సీక్వెంట్ పూర్తి నిరూపణగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T161']=['LK నుంచి Kకి Box/Diamond feature నియమాలు, S5లో సాధారణ కట్-రహిత సీక్వెంట్ తెలియదనే పరిమిత వాదన, హైపర్ సీక్వెంట్ ఉనికిని నిలపడం (ఎంపిక)','S5కు అలాంటి కలనశాస్త్రం అసాధ్యమని బలమైన వాదనగా మార్చడం (తిరస్కరణ)','మూడు feature రూపాల్లో ఒకటే ముద్రించడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీ హైపర్ సీక్వెంట్‌ను నేరుగా నిరూపిస్తుందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T162']=['K నియమాల్లో ఒక్క ప్రధాన సూత్ర పరిమితి, ఖాళీ సందర్భాలు, రెండు నక్షత్ర నియమ ప్రతివాదాలను నిలపడం (ఎంపిక)','నక్షత్ర నియమాలను చెల్లే K నియమాలుగా చూపడం (తిరస్కరణ)','Gamma/Delta అనుక్రమాలకు అన్ని సూత్రాల prefix చేర్పును మానడం (తిరస్కరణ)','స్థానిక సాధారణ వ్యుత్పత్తి పేజీ modal K నియమ నిర్దుష్టతకు ప్రత్యక్ష నిరూపణ అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T163']=['Box/Diamond వ్యాప్తి చెట్లు, Dual వ్యుత్పత్తి, నాలుగు వ్యాయామాలు నిలిపి రెండు ఎడమ నిరాకరణ చీటీలను ప్రకటించి సరిచేయడం (ఎంపిక)','ఎడమ నిరాకరణ అడుగులను కుడి నిరాకరణగా వదిలేయడం (తిరస్కరణ)','వ్యాయామాలకు మూలంలో లేని పూర్తి పరిష్కారాలు చేర్చడం (తిరస్కరణ)','Dual చెట్టు చివరి iff/land దశ అన్ని feature రూపాల్లో స్వతంత్రంగా ధ్రువీకరించామని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T164']=['T/D/B/4/5 మూడు feature పట్టికలు, ఆరు తర్క-ప్రాప్యత జతలు, K4/S5 చెట్లు, కట్ ఉదాహరణ, ఆరు సమస్యలు నిలపడం (ఎంపిక)','S5 కట్ లేకుండానే ఈ LK-ఆధార వ్యవస్థ సంపూర్ణమని చెప్పడం (తిరస్కరణ)','మూలం ఇంకా కావాలన్న నిరూపణలను పూర్తిగా ఇచ్చినట్టు చెప్పడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీ modal సీక్వెంట్ సంపూర్ణతకు ప్రత్యక్ష నిరూపణ అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T165']=['అనువర్తిత మోడల్ తర్క భాగ శీర్షిక, ప్రయోగాత్మక ముసాయిదా స్థితి, కాలిక/జ్ఞాన దిగుమతులను నిలపడం (ఎంపిక)','ముసాయిదాను పూర్తయిన తుది పాఠ్యంగా చూపడం (తిరస్కరణ)','ఇంపోర్టులను లేదా భాగం ముగింపు హుక్‌ను మార్చడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీలు కాలిక/జ్ఞాన తర్కాలకు ప్రత్యక్ష పాఠ్య సాక్ష్యం అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T166']=['కాలిక తర్క అధ్యాయ శీర్షిక, ఐదు దిగుమతులు నిలిపి, తప్పు భాగం ముగింపు హుక్‌ను ప్రకటించి అధ్యాయ హుక్‌గా సరిచేయడం (ఎంపిక)','అధ్యాయ డ్రైవరులో భాగం హుక్‌ను యథాతథంగా ఉంచడం (తిరస్కరణ)','దిగుమతుల పథాలను మార్చడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీ TeX హుక్‌కు ప్రత్యక్ష సాక్ష్యం అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T167']=['ప్రైయర్ కాలరూప తర్కం, బీజీ సమయ ఉదాహరణ, భవిష్యత్ అనిశ్చిత వాక్యం, నిర్ణయవాదం/తెరచిన భవిష్యత్తు, రేఖీయ/శాఖా/చక్రీయ కాల ఎంపికలను నిలపడం (ఎంపిక)','కూర్చోవడం-కూర్చోకపోవడం ఒకేసారి సత్యమని చెప్పడం (తిరస్కరణ)','భవిష్యత్ అనిశ్చిత వాక్యాన్ని తప్పనిసరిగా అసత్యమని చెప్పడం (తిరస్కరణ)','కాలం తప్పనిసరిగా రేఖీయమే అని మూలం నిర్ణయించినట్లు చూపడం (తిరస్కరణ)','స్థానిక సాధారణ పేజీలు ప్రైయర్ చరిత్రకు ప్రత్యక్ష ఆధారం అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T168']=['P/H గత, F/G భవిష్యత్ సాక్షి/సార్వత్రిక దిశలు, T-prec-V నమూనా, ద్వంద్వత్వం నిలిపి bare F మూల మాక్రో తప్పును ప్రకటించి సరిచేయడం (ఎంపిక)','Fను పాఠ్య లాటిన్ చరంగా ఉంచడం (తిరస్కరణ)','H/Gకి ఏదో ఒక బిందువు షరతు పెట్టడం (తిరస్కరణ)','denumerableను కేవలం పరిమిత సమితిగా చెప్పడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీ కాలిక అర్థవిజ్ఞానానికి ప్రత్యక్ష నిర్వచనం అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T169']=['కాలిక K పూర్వ/భవిష్యత్ రూపాలు, సంక్రామక/రేఖీయ/సాంద్ర/రెండు అంచులేని చట్ర అనురూపతలు, అస్వావర్తనత్వం వ్యక్తీకరణ పరిమితిని నిలపడం (ఎంపిక)','రేఖీయత్వాన్నే షరతులేని అన్ని కాలిక నమూనాల ధర్మంగా చెప్పడం (తిరస్కరణ)','గత, భవిష్యత్ అంచులేని షరతులను తారుమారు చేయడం (తిరస్కరణ)','అస్వావర్తనత్వానికి మూలం ఇచ్చని కాలిక సూత్రం కల్పించడం (తిరస్కరణ)'];
alternatives['TE-T170']=['Since B Cలో గత B సాక్షి, మధ్య C; Until B Cలో భవిష్యత్ B సాక్షి, మధ్య C, మూల సహజ పఠనాలు నిలపడం (ఎంపిక)','B/C స్థానాలను మార్చడం (తిరస్కరణ)','Since/Untilను ఏకస్థాన కారకాలుగా చూపడం (తిరస్కరణ)','మధ్య బిందువుల కఠిన అసమానతలను వదలడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీ ఈ కాలిక కారకాలకు ప్రత్యక్ష సాక్ష్యం అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T171']=['T-C-V సాధ్య చరిత్రలు, శేష అనుక్రమ మూసుకుపోవడం, sigma క్రమం, ప్రస్తుత చరిత్రలో F, ప్రత్యామ్నాయ చరిత్రలో Diamond, చివరి p ఉదాహరణ నిలపడం (ఎంపిక)','Diamondను అదే చరిత్రలోని మరొక కాల బిందువుకు మార్చడం (తిరస్కరణ)','Fను అన్ని ప్రత్యామ్నాయ చరిత్రల్లో సత్యంగా చెప్పడం (తిరస్కరణ)','భాష మార్చడం తప్పనిసరి అని మూలం చెప్పినట్టు చూపడం (తిరస్కరణ)','స్థానిక సాధారణ సంబంధ పేజీ branching-time నమూనాకు ప్రత్యక్ష నిరూపణ అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T172']=['జ్ఞానసంబంధ తర్క శీర్షిక, మూల రచయితల గమనిక, ఎనిమిది దిగుమతులు నిలిపి తప్పు భాగం హుక్‌ను ప్రకటిత అధ్యాయ హుక్‌గా సరిచేయడం (ఎంపిక)','భాగం హుక్‌ను అధ్యాయంలో అలాగే ఉంచడం (తిరస్కరణ)','స్థానిక సాధారణ తర్క పేజీ TeX హుక్‌కు ప్రత్యక్ష సాక్ష్యం అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T173']=['జ్ఞానసంబంధ/విశ్వాససంబంధ భేదం, పూర్వ ప్రాప్యత సంబంధ పదం, నాలుగు ఉదాహరణలు, బహు-కర్త పరిమితి నిలపడం (ఎంపిక)','epistemic, doxastic రెండింటినీ ఒకే జ్ఞాన పదంగా అనువదించడం (తిరస్కరణ)','ప్రాప్యత సంబంధాన్ని కాల సంబంధంగా చూపడం (తిరస్కరణ)','మూల చారిత్రక పేరును నిశ్శబ్దంగా సరిచేయడం (తిరస్కరణ)'];
alternatives['TE-T174']=['Knows వ్యక్తి జ్ఞానం, EKnows సమూహ సంయోగం, CKnows అంతులేని పరస్పరజ్ఞానం భేదం నిలపడం (ఎంపిక)','సమూహ జ్ఞానం, సామాన్య జ్ఞానం ఒకటేనని చూపడం (తిరస్కరణ)','C కర్తకు అదనపు సత్య షరతు కల్పించడం (తిరస్కరణ)','మూల !! టోకెన్లను తీసివేయడం (తిరస్కరణ)'];
alternatives['TE-T175']=['W/R/V నమూనాలో ప్రతి కర్తకు వేరు ప్రాప్యత సంబంధం, సమాచార అనుకూలతను వ్యాఖ్యానంగా నిలపడం (ఎంపిక)','బహు-కర్తలో ఒక్క సంబంధమే ఉందని చెప్పడం (తిరస్కరణ)','సమాచార అనుకూలతను కొత్త అధికారిక స్వీకృతంగా ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T176']=['Knows సత్యానికి అన్ని ప్రాప్య లోకాలు, ఉత్తరవర్తి లేక శూన్యసత్యం, స్వావర్తన ఎంపిక, R_G ద్వారా CKnows సత్యం నిలపడం (ఎంపిక)','mSat/ అసత్య సంకేతాన్ని టైపోగా మార్చడం (తిరస్కరణ)','మూల R^0=R సూచికను నిశ్శబ్దంగా మార్చడం (తిరస్కరణ)','S5 తప్పనిసరి అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T177']=['K/T/4/5 పట్టిక జతలు, యూక్లిడియన్ పూర్వ పదం, తెలిసిన షరతువాక్యం విక్టోరియా ఉదాహరణ నిలపడం (ఎంపిక)','జ్ఞాన మూసుకుపోవడాన్ని అందరూ అంగీకరిస్తారని చెప్పడం (తిరస్కరణ)','స్వపరిశీలన రెండు రకాల్ని కలపడం (తిరస్కరణ)','యూక్లిడియన్ పూర్వ పదానికి భిన్న రూపం ప్రవేశపెట్టడం (తిరస్కరణ)'];
alternatives['TE-T178']=['అణు ఏకీభావం, ముందుకు/వెనక్కి షరతులు, సూత్ర సత్య సంరక్షణ, చిత్రాన్ని నిలిపి A కర్త-సమితి తప్పును Gగా ప్రకటించి మార్చడం (ఎంపిక)','నిర్వచించని Aను కర్త సమితిగా ఉంచడం (తిరస్కరణ)','సూత్రాలన్నింటికీ కొత్త నిరూపణ కల్పించడం (తిరస్కరణ)','చిత్ర ద్విసమానుకరణను ఒకటి-ఒకటిగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T179']=['గతి జ్ఞాన మార్పు, అందరూ గమనించే సత్య ప్రకటన, [!B] కారకం, [!A]!B నిర్మాణం, ఐచ్ఛిక CKnows నిలపడం (ఎంపిక)','సత్యం కాని ప్రకటన కూడా ప్రజలందరికీ సత్యంగా కనిపించిందని చెప్పడం (తిరస్కరణ)','మూల తొలి జాబితాలో లేని ద్విసోపాధిక కారకాన్ని మౌనంగా చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T180']=['నవీకరణలో W-prime/R-prime/V-prime పరిమితులు, ప్రకటన శూన్యసత్యం, b కొత్త జ్ఞానం, p సామాన్య జ్ఞానం, p∧¬Knows_b p అసత్యమయ్యే ఉదాహరణ నిలిపి ఒక్క సంకేత లోపం ప్రకటించి సరిచేయడం (ఎంపిక)','ప్రకటన ఎల్లప్పుడూ దాని విషయాన్ని సామాన్య జ్ఞానంగా చేస్తుందని చెప్పడం (తిరస్కరణ)','మూల [!A]B సంకేత లోపాన్ని మౌనంగా వదలడం (తిరస్కరణ)','ప్రకటనలో చరాల విలువలను మార్చడం (తిరస్కరణ)'];
alternatives['TE-T181']=['పూర్వ TE-T052 అంతఃప్రజ్ఞావాద తర్క రూపం, నాలుగు దిగుమతులు, భాగం హుక్ నిలపడం (ఎంపిక)','ప్రత్యేక కారణం లేకుండా మరో శాఖా శీర్షిక పెట్టడం (తిరస్కరణ)','దిగుమతి పథాలను స్థానికీకరించడం (తిరస్కరణ)'];
alternatives['TE-T182']=['పరిచయం అధ్యాయ శీర్షిక, ఐదు దిగుమతులు, అధ్యాయ ముగింపు హుక్ నిలపడం (ఎంపిక)','BHK దిగుమతిని వదలడం (తిరస్కరణ)','భాగం ముగింపు హుక్‌గా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T183']=['సాంప్రదాయిక పరిమితి, n సరి/బేసి మరియు 2/3 షరతులు, రెండు అకరణీయ ఘాత నిరూపణలు, నిర్మాణాత్మక సాక్షి అర్థం నిలపడం (ఎంపిక)','పూర్వ సారూప్య విభాగంలోని ప్రధాన/సంయుక్త 7/9 ఉదాహరణను ఇక్కడికి మార్చడం (తిరస్కరణ)','మొదటి నిరూపణ స్పష్ట జతను ఇస్తుందని చెప్పడం (తిరస్కరణ)','నిర్మాణాత్మక/తాత్త్విక భేదం కలపడం (తిరస్కరణ)'];
alternatives['TE-T184']=['ప్రాథమిక ∧/∨/→, అసత్య స్థిరాంకం, నిర్వచిత ¬/↔, సూత్ర ఆగమన నిర్వచనం నిలపడం (ఎంపిక)','అసత్య స్థిరాంకాన్ని కూడా నిర్వచిత సంకేతంగా చేయడం (తిరస్కరణ)','సాంప్రదాయిక సమానతలన్నీ అంతఃప్రజ్ఞావాదంలోనూ ఉన్నాయని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T185']=['నిర్మాణం-వ్యుత్పత్తి భేదం, BHK సంధాయక కేసులు, గుర్తుగల వియోజనం, ద్వినిషేధ నిర్మాణాలు నిలిపి C/!C, M2/M1 మూల లోపాలు ప్రకటించి సరిచేయడం (ఎంపిక)','నిర్మాణాన్ని ఔపచారిక వ్యుత్పత్తితో కలపడం (తిరస్కరణ)','అన్ని ఉదాహరణలు సరళమని మూల సంపాదకీయ హెచ్చరిక తొలగించడం (తిరస్కరణ)','h1 ఇన్‌పుట్ M1కు బదులు M2 జతను ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T186']=['FalseCl లేని సహజ నిగమనం, ఉపసంహరించని పరికల్పనల ప్రమేయకార్థం, అన్ని నియమ వృక్షాలు, సాంప్రదాయిక చేర్పు నిలిపి A1∧A1 మూల లోపం ప్రకటించి సరిచేయడం (ఎంపిక)','సాంప్రదాయిక వైరుధ్య నియమాన్ని జోడించడం (తిరస్కరణ)','నిరాకరణను మూల నిర్వచిత స్థితి నుంచి ప్రాథమికం చేయడం (తిరస్కరణ)','నిరూపణ వృక్షాలను గద్యంగా మాత్రమే మార్చడం (తిరస్కరణ)'];
alternatives['TE-T187']=['మూడు రకాల క్రమ-పంక్తి కారణాలు, తొమ్మిది స్వీకృత పథకాలు, Γ వ్యుత్పాద్యత, ఖాళీ సమితి సిద్ధాంతం, ఒకదిశ సాంప్రదాయిక చేర్పు నిలపడం (ఎంపిక)','సాంప్రదాయిక వ్యుత్పాద్యత నుంచి అంతఃప్రజ్ఞావాద వ్యుత్పాద్యతను కూడా ప్రకటించడం (తిరస్కరణ)','స్వీకృత పథకాలను అనువాదార్థం మార్చడం (తిరస్కరణ)'];
alternatives['TE-T188']=['నాలుగు దిగుమతులు, అధ్యాయ ముగింపు హుక్, క్రిప్కె/స్థలవిజ్ఞాన పరిమితి, ఉదాహరణల లేమి నిలపడం (ఎంపిక)','అధ్యాయం సంపూర్ణమని ప్రకటించడం (తిరస్కరణ)','దిగుమతుల పథాలు స్థానికీకరించడం (తిరస్కరణ)'];
alternatives['TE-T189']=['పాక్షిక క్రమం, జ్ఞాన ఏకదిశ పెరుగుదల, భవిష్యత్ స్థితుల్లో సోపాధికం/నిరాకరణ, బహిష్కృత మధ్యమ వైఫల్యం, వివృత సమితుల ప్రత్యామ్నాయం నిలపడం (ఎంపిక)','సోపాధికాన్ని స్థానిక సాంప్రదాయిక సత్య షరతుగా మార్చడం (తిరస్కరణ)','నిరాకరణకు భవిష్యత్ స్థితి షరతు తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T190']=['పాక్షిక క్రమ నమూనా, ఏకదిశ విలువకేటాయింపు, అన్ని లోక-సత్య నిబంధనలు, ప్రతికూల సత్య సంకేతం, అభ్యాసాలు నిలపడం (ఎంపిక)','\\mSat/ను దోషంగా భావించి మార్చడం (తిరస్కరణ)','సోపాధికానికి స్థానిక మాత్రపు సత్య నిర్వచనం పెట్టడం (తిరస్కరణ)'];
alternatives['TE-T191']=['నమూనా అంతట సత్యం, స్థానిక అనుగమనం, ప్రపంచ పరిమితి, తుద అనుగమన నిరూపణ నిలిపి మొదటి నిరూపణలో స్థానిక పరికల్పన సరిచేయడం (ఎంపిక)','మొదటి అంశంలో మూల అన్యాయ సమగ్ర పరికల్పనను ఉంచడం (తిరస్కరణ)','నమూనాలో సత్యం, లోకంలో సత్యం ఒకటిగా కలపడం (తిరస్కరణ)'];
alternatives['TE-T192']=['వివృత సమితి మూడు స్వీకృతాలు, అంతర్భాగం, ఐదు సూత్ర-సమితి నిబంధనలు, అతి పెద్ద వివృత సోపాధికం నిలపడం (ఎంపిక)','మూల subset/subseteq సంకేతాలను వ్యాఖ్యాత్మకంగా మార్చడం (తిరస్కరణ)','సోపాధికాన్ని సాధారణ సమితి వ్యత్యాసంగానే నిర్ధారించడం (తిరస్కరణ)'];
alternatives['TE-T193']=['పూర్వ నిర్దుష్టత/సంపూర్ణత పదాలు, ఏడు దిగుమతులు, పరిచయం మరియు వ్యుత్పాద్యత నిరూపణల లేమి నిలపడం (ఎంపిక)','అసంపూర్ణ సంపాదకీయ గమనికను తొలగించడం (తిరస్కరణ)','దిగుమతి పథాలు మార్చడం (తిరస్కరణ)'];
alternatives['TE-T194']=['వ్యుత్పత్తి పొడవుపై ఆగమనం, స్వీకృత/పూర్వాపేక్ష/MP కేసులు, స్వావర్తన-ఆధారిత ముగింపు నిలిపి అదనపు సత్య వాదన సంకేతాన్ని ప్రకటించి సరిచేయడం (ఎంపిక)','స్వీకృత చెల్లుబాటు ఇప్పటికే ఇక్కడ నిరూపితమని చెప్పడం (తిరస్కరణ)','తప్పు మూడవ సత్య వాదనను యథాతథం ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T195']=['నియమాల కేసులపై ఆగమనం, ఉపసంహరించని పరికల్పనలు, భవిష్యత్ లోక-సత్యం, నిరాకరణ అభ్యాసాలు నిలిపి మూడు మూల లోపాలు ప్రకటించి సరిచేయడం (ఎంపిక)','సంయోగ కేసులో A∧B అనే తప్పు లక్ష్యం ఉంచడం (తిరస్కరణ)','వియోజన కేసులో మూలకాన్ని నేరుగా సమితితో సమ్మేళనం చేయడం (తిరస్కరణ)','మూల అభ్యాసంగా వదిలిన నిరాకరణ నిరూపణలు కల్పించడం (తిరస్కరణ)'];
alternatives['TE-T196']=['ప్రధాన సమితి మూడు షరతులు, అవ్యుత్పాద్యతను నిలిపే Γ_n నిర్మాణం, పరిమిత మద్దతు, వరుస ఎంపిక నిలిపి రెండు మూల నిరూపణ ఖాళీలు ప్రకటించి సరిచేయడం (ఎంపిక)','ఖాళీ పరిమిత ఉపసమితికి గరిష్ఠ సూచిక ఉందని అనుకోవడం (తిరస్కరణ)','మొత్తం అర్హ వియోజనాల సంఖ్య ప్రతిదశలో తగ్గుతుందని చెప్పడం (తిరస్కరణ)','ప్రధానాన్ని సంపూర్ణ సమితితో కలపడం (తిరస్కరణ)'];
alternatives['TE-T197']=['పూర్వ మోడల్ తర్క కానానికల్ నమూనా పదం, ప్రకృతిసంఖ్యల పరిమిత క్రమాలు, ప్రారంభ భాగ R, Δ(σ) విస్తరణ, V ఏకదిశ పెరుగుదల నిలిపి ఆగమన పరామితి ప్రకటించి సరిచేయడం (ఎంపిక)','canonicalను అంకగణిత standardతో కలిపి ప్రామాణిక నమూనా అనడం (తిరస్కరణ)','మూల క్రమం σపైనే ఆగమనం అంటూనే ఉండడం (తిరస్కరణ)'];
alternatives['TE-T198']=['కానానికల్ నమూనా సత్యం iff ప్రధాన సమితి వ్యుత్పాద్యత, అసత్య/అణు/సంయోగ/వియోజన/సోపాధిక కేసులు, మూల ఖాళీ నిరాకరణ కేసు నిలపడం (ఎంపిక)','మూలంలో లేని నిరాకరణ నిరూపణను అనుమానంగా చేర్చడం (తిరస్కరణ)','ఖాళీ కేసు ఉన్నా ఉపప్రమేయం పూర్తిగా నిరూపితమైందని ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T199']=['లిండెన్‌బామ్ ప్రధాన విస్తరణ, శూన్య క్రమ లోకం, సత్య ఉపప్రమేయం ఆధారిత ప్రతివిపర్యయం, మూడు అభ్యాసాలు నిలిపి ఉపప్రమేయ ఖాళీ కేసును సమీక్ష పరిమితిగా ప్రకటించడం (ఎంపిక)','అనిరూపిత నిరాకరణ కేసు ఉన్నా పూర్తి నిరూపణ ధృవీకృతమని చెప్పడం (తిరస్కరణ)','మూడు అభ్యాసాలకు కొత్త పరిష్కారాలు చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T200']=['పరిమిత నమూనా సిద్ధాంతం, నిర్ణయ కలనం, ఉపసూత్ర సత్య రకాల సవరించిన quotient, పరిమిత Sకు ఆగమన అభ్యాసం నిలిపి మూల అణు-రక నిర్మాణ లోపం ప్రకటించి సరిచేయడం (ఎంపిక)','అణు-చర రకాలే అన్ని సోపాధిక సూత్రాల సత్యాన్ని నిలుపుతాయని చెప్పడం (తిరస్కరణ)','పరిమిత ఉపసూత్రాల బదులు Pపై అన్ని సూత్రాలకు ఆగమనం ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T201']=['పూర్వ మోడల్ తర్క పూర్వసూచిక టాబ్లో పదం, మూల ముసాయిదా స్థితి, నాలుగు క్రియాశీల/రెండు వ్యాఖ్యానిత దిగుమతులు, చాప్టర్ హుక్ నిలపడం (ఎంపిక)','సంపూర్ణత విభాగం సిద్ధంగా ఉందని రెండు వ్యాఖ్యానిత దిగుమతులు సక్రియం చేయడం (తిరస్కరణ)','ప్రతినమూనా చర్చ ఇంకా అవసరమనే గమనిక తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T202']=['చిహ్నిత సూత్రం, సంవృత శాఖ/టాబ్లో, ధన పూర్ణసంఖ్యల పూర్వసూచికలు, σ.n మరియు σ.* ప్రాప్యత నిలపడం (ఎంపిక)','పూర్వసూచికను సాధారణ చిహ్నంతో కలపడం (తిరస్కరణ)','శూన్య క్రమాన్నీ పూర్వసూచికగా అనుమతించడం (తిరస్కరణ)','మూల మోడల్ టాబ్లోల ప్రస్తావనను మౌనంగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T203']=['రెండు నియమ పట్టికలన్నీ, సత్య స్థిరత్వ సంవృత షరతు, వాడిన/కొత్త పూర్వసూచిక భేదం నిలిపి సోపాధిక సత్య గద్యాన్ని పట్టికకు సరిపోల్చి ప్రకటించడం (ఎంపిక)','గద్యంలోని T A/F B శాఖలను పట్టిక F A/T Bకు విరుద్ధంగా ఉంచడం (తిరస్కరణ)','గద్య నియమ సంకేత వాదనల తారుమారు ఉంచడం (తిరస్కరణ)','పట్టిక వృక్షాలను మార్చడం (తిరస్కరణ)'];
alternatives['TE-T204']=['సంవృత వృక్షపు సూత్రాలు, పూర్వసూచికలు, శాఖలు, సంవృత చిహ్నాలు, నాలుగు అభ్యాసాలు నిలిపి రెండు అసత్య సంయోగ కారణ సూచికలను ఏడో పంక్తికి ప్రకటించి సరిచేయడం (ఎంపిక)','నాలుగో పంక్తి అసత్య సోపాధికం నుంచే సంయోగ శాఖలు వచ్చాయని ఉంచడం (తిరస్కరణ)','ఉదాహరణ వృక్షాన్ని గద్యంగా మాత్రమే మార్చడం (తిరస్కరణ)'];
alternatives['TE-T205']=['పూర్వసూచిక అర్థనిర్దేశం, శాఖ సంతృప్తి, నిర్దుష్టత నిరూపణ, నాలుగు ప్రకటిత మూల సవరణలు నిలపడం (ఎంపిక)','మూల ప్రతినమూనా/నియమ/ఉపపత్తి తప్పులను మౌనంగా పునరుత్పత్తి చేయడం (తిరస్కరణ)','అభ్యాసాల స్థానంలో మూలంలో లేని పూర్తి నిరూపణలు చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T206']=['ప్రతివాస్తవ సోపాధికాలు (ఎంపిక; ప్రత్యేక భావం తరువాతి విభాగ నిర్వచనంతో నియంత్రితం)','వాస్తవవిరుద్ధ షరతువాక్యాలు (సంభావ్య వివరణాత్మక రూపం; అన్ని సందర్భాలు గత అసత్య పూర్వాంగానికి పరిమితం కావు)','counterfactuals అనే ఆంగ్ల శీర్షికను వదలడం (తిరస్కరణ)'];
alternatives['TE-T207']=['పరిచయం (ఎంపిక; స్థిర అధ్యాయ శీర్షిక)','ఆంగ్ల Introduction అలాగే ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T208']=['భౌతిక సోపాధికం / సత్యమూల్యాధారితం / పూర్వపక్షం-ఉత్తరపక్షం (ఎంపిక; సత్యనిర్వచనంతో నియంత్రితం)','ఆంగ్ల material conditional, truth-functionalలను పాఠక పదాలుగానే ఉంచడం (తిరస్కరణ)','భౌతికం అనే పదానికి భౌతికశాస్త్ర భావం ఇవ్వడం (తిరస్కరణ)'];
alternatives['TE-T209']=['సంయోజకం-తార్కిక పర్యవసానం భేదం, లూయిస్ సూత్రాలు, చంద్రుడు ఉదాహరణ, సూచనాత్మక వాక్య సర్వసత్యం నిలపడం (ఎంపిక)','$\\lif$ను ఎక్కడైనా అర్థపర పర్యవసానంగానే చదవడం (తిరస్కరణ)','చంద్రుడు ఉదాహరణను గణిత సూత్రాలకు పర్యవసాన నిరూపణగా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T210']=['కఠిన సోపాధికం, పెట్టె-భౌతిక నిర్వచనం, S5 అభ్యాసాలు, అనివార్య/అనివార్యం కాని సత్య భేదం నిలిపి ఒక తప్పు సూత్రాన్ని ప్రకటించి సరిచేయడం (ఎంపిక)','కఠిన సోపాధికాన్ని భౌతిక సోపాధికంతో కలపడం (తిరస్కరణ)','భౌతిక నిరాకరణ నుంచే పూర్వపక్ష-నిరాకృత ఉత్తరపక్షం పర్యవసించదని మూల తప్పును ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T211']=['ప్రతివాస్తవ/సూచనాత్మక వాక్యజంటలో కాలరూప భేదం, అగ్గిపుల్ల కారణ ఉదాహరణ, సమీప సాధ్యలోక అర్థవిచారం నిలపడం (ఎంపిక)','రెండు ఓస్వాల్డ్ వాక్యాలకు ఒకే కాలరూపం ఇవ్వడం (తిరస్కరణ)','సమీప సాధ్యలోక విశ్లేషణను భౌతిక సోపాధిక సత్యపట్టికతో కలపడం (తిరస్కరణ)'];
alternatives['TE-T212']=['కనిష్ఠ మార్పు అర్థవిచారం (ఎంపిక; పరిచయ విభాగ నిర్వచనంతో నియంత్రితం)','ఆంగ్ల Minimal Change Semanticsను పాఠక శీర్షికగా ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T213']=['సమీప సాధ్యలోకాలు, గోళాల చిత్రపు అంతర్గత/బాహ్య దూర భేదం, $\\cif$ సంతృప్తి షరతు నిలపడం (ఎంపిక)','అత్యంత సమీప ఒకే లోకం తప్పనిసరి అని వాదించడం (తిరస్కరణ)','చిత్రాన్ని మార్చి TeX ఆకృతిని కోల్పోవడం (తిరస్కరణ)'];
alternatives['TE-T214']=['కేంద్రిత/అంతర్నిహిత గోళ వ్యవస్థ, చిత్రం, రెండు సంతృప్తి శాఖలు నిలిపి చిన్న పూర్వపక్ష రహిత గోళాలపై మూల అతివ్యాప్తిని ప్రకటించి పరిమితం చేయడం (ఎంపిక)','చిన్న గోళాలన్నీ పూర్వపక్షాన్ని కలిగినవేనని అనుకోవడం (తిరస్కరణ)','అనంత అవరోహి గోళాలకు తప్పనిసరిగా కనిష్ఠ సాక్షి ఉందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T215']=['శూన్యసత్యం/శూన్యసత్యం కాని సత్యం, రెండు వ్యతిరేకాల అసత్య భేదం, $u$-సత్యం/$v$-అసత్యం స్థితి, ఐదు చిత్ర శీర్షికలు నిలపడం (ఎంపిక)','పూర్వపక్ష-లోకమే లేకున్నా ప్రతివాస్తవం అసత్యమని చెప్పడం (తిరస్కరణ)','కఠిన సోపాధికంలా ప్రతివాస్తవం అనివార్య సత్యం/అసత్యమే అని అనుకోవడం (తిరస్కరణ)'];
alternatives['TE-T216']=['పూర్వపక్ష బలపరచడం సూత్రం, అంతరిక్ష అగ్గిపుల్ల నిగమనం, మూడు లోకాల గోళ ప్రతినమూనా నిలిపి మూడు మూల పూర్వపక్ష చర్యలను ప్రకటించి సరిచేయడం (ఎంపిక)','అగ్గిపుల్ల మండించడమే పూర్వపక్షమని మూల గద్య తప్పును ఉంచడం (తిరస్కరణ)','భౌతిక సోపాధికానికి కూడా పూర్వపక్ష బలపరచడం చెల్లదని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T217']=['గొలుసు నియమం, హూవర్ వేర్వేరు సమీప లోకాల వాదన, మూడు లోకాల ప్రతినమూనా నిలిపి $q \\lif r$ సత్య సంకేతాన్ని ప్రకటించి సరిచేయడం (ఎంపిక)','రెండో పూర్వాపేక్షలో $q \\lif r$ అసత్యమని మూల సంకేత లోపాన్ని ఉంచడం (తిరస్కరణ)','చారిత్రక-రాజకీయ పరికల్పనలను స్వతంత్ర ధృవీకృత వాస్తవాలుగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T218']=['ప్రతివిపర్యయ అపర్యవసానం, గోథె జంట వాక్యాలు, మూడు లోకాల గోళ నమూనా నిలిపి స్థానిక గోళ జాబితాను $O_w$గా ప్రకటించి సరిచేయడం (ఎంపిక)','ప్రపంచం నుంచి గోళ వ్యవస్థకు పంపే $O$ ప్రమేయాన్నే గోళాల జాబితాగా ఉంచడం (తిరస్కరణ)','అన్ని ఇతర లోకాల గోళ వ్యవస్థలను మూలంలో లేకుండా ఊహించడం (తిరస్కరణ)'];
alternatives['TE-T219']=['సమితి సిద్ధాంతం (ఎంపిక; పూర్వ స్థానిక సమితి పదం)','ఆంగ్ల Set Theory శీర్షికను ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T220']=['దశలవారీ భావన (ఎంపిక; సంచిత నిర్మాణ అధ్యాయ సందర్భం)','పునరావృత భావన (సాధ్యమైన ప్రత్యామ్నాయం; కేవలం అదే చర్య మళ్లీ చేయడమనే సంకుచిత భావం వచ్చే ప్రమాదం)','ఆంగ్ల Iterative Conceptionను శీర్షికగా ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T221']=['సమితుల సమానత్వ సూత్రం (Extensionality) అనే పూర్వ TE-T003 వివరణాత్మక శీర్షికను పునర్వాడి ద్విసోపాధిక నిర్వచనం నిలపడం (ఎంపిక)','ప్రత్యక్ష సాక్షి లేని కొత్త తెలుగు తలపదాన్ని సాక్షాత్తు కానానికల్‌గా చెప్పడం (తిరస్కరణ)','కుండలీకృత ఆంగ్ల మూలపదాన్ని లేకుండా చేయడం (తిరస్కరణ)'];
alternatives['TE-T222']=['నిర్బంధరహిత ధర్మసంగ్రహం అని ఏ సూత్రానికైనా సమితి అన్న భావం స్పష్టం చేసి, పూర్వ రసెల్ పదం, మొదటిస్థాయి పథకం నిలపడం (ఎంపిక)','అమాయక ధర్మసంగ్రహం మాత్రమే చెప్పి నిర్బంధరాహిత్యాన్ని దాచడం (తిరస్కరణ)','వైరుధ్యాన్ని కేవలం సమితి సిద్ధాంతపు స్వీకృతం మార్చితే తొలగిపోతుందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T223']=['స్వవర్గావలంబిత/అనవలంబిత అనే నిర్వచన నియంత్రిత సమాసాలు, దుష్టవలయ సూత్రం, ప్రైమ్-రకాలు, రామ్సే వాదన నిలిపి రెండు మూల గద్య తిరుగులను ప్రకటించి సరిచేయడం (ఎంపిక)','ప్రెడికేటివ్/ఇంప్రెడికేటివ్ ఆంగ్ల పదాలనే వివరణ లేకుండా వాడడం (తిరస్కరణ)','స్వవర్గావలంబిత నిర్వచనాలన్నీ తప్పక వైరుధ్యపూరితమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T224']=['సంచిత-దశలవారీ సమితి భావన, 0--3 దశల లెక్కలు, $R_S$ పరిమితి, వ్యాఖ్యానిత ప్రత్యామ్నాయ గద్యాన్ని వ్యాఖ్యలుగానే నిలపడం (ఎంపిక)','దశల ఉనికిని మూల పాదగమనిక లేకుండానే నిరూపితమని చెప్పడం (తిరస్కరణ)','వ్యాఖ్యానిత గద్యాన్ని పాఠక పాఠ్యంలో మౌనంగా చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T225']=['సమితి కాని మూలకాలు అనే నిర్వచన-నియంత్రిత పారదర్శక రూపం, ఆవు/పంది ఉదాహరణలు, అన్వయయోగ్యత మరియు శుద్ధ-సమితి పునాదివాద భేదం నిలపడం (ఎంపిక)','మూల నిర్వచనం లేకుండా కేవలం urelement అప్పుపదం వాడడం (తిరస్కరణ)','ఆవులు, పందులు సమితులు కావని మూలంలో లేని సమగ్ర సిద్ధాంతాన్ని చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T226']=['భావన విస్తారం, విలువల వ్యాప్తి, ప్రాథమిక నియమం V రూపాలను మూల సూత్రాలు/పాదగమనికతో నియంత్రించి నిలపడం (ఎంపిక)','రెండవ-క్రమ పరిమాణకారకాన్ని ప్రథమ-క్రమంగా చూపడం (తిరస్కరణ)','ఫ్రేగె వ్యవస్థలో అమాయక ధర్మసంగ్రహం నేరుగా స్వీకృతమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T227']=['Z సంకేతాన్ని నిలిపి అధ్యాయ శీర్షికను తెలుగులో ఇవ్వడం (ఎంపిక)','దిగుమతి పథాలను స్థానికీకరించడం (తిరస్కరణ)','అధ్యాయ ముగింపు హుక్ తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T228']=['మూడు దశ సూత్రాలను క్రమంగా నిలిపి సుక్రమత బలమైన మౌన ఊహ అనే జాగ్రత్తను స్పష్టం చేయడం (ఎంపిక)','సుక్రమత ముందే నిరూపితమని చెప్పడం (తిరస్కరణ)','స్థానిక సూత్ర పేర్లను ప్రామాణిక సాహిత్య పేర్లుగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T229']=['వేరుచేయడం స్వీకృత పథకం, మూల సమితి A పరిమితి, ఖాళీ కాని కుటుంబ ఛేదనం, స్వీయ-సభ్యత్వ దశ వివరణలో తరువాతి తొలి దశ అనే కచ్చిత రూపం (ఎంపిక)','అమాయక ధర్మసంగ్రహం, పరిమిత వేరుచేయడాన్ని కలపడం (తిరస్కరణ)','ఖాళీ కుటుంబ ఛేదనం కూడా సమితి అవుతుందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T230']=['పూర్వ TE-T009 సమ్మేళనం/ఛేదనం రూపాలతో సర్వసామాన్య సమ్మేళన సూత్రాన్ని నిలపడం (ఎంపిక)','సమ్మేళనాన్ని ద్విసమితుల సందర్భానికే కుదించడం (తిరస్కరణ)','మూలకాల సభ్యుల దశ క్రమాన్ని కలపడం (తిరస్కరణ)'];
alternatives['TE-T231']=['జంటల స్వీకృతం, చివరి దశ లేదు అనే అదనపు అంగీకారం, మూడు పర్యవసానాలు, వ్యాఖ్యానిత నిరూపణ స్థితి నిలపడం (ఎంపిక)','చివరి దశ లేదు అనేది పూర్వ కథలో ఇప్పటికే స్పష్టమని చెప్పడం (తిరస్కరణ)','వ్యాఖ్యానిత నిరూపణను మౌనంగా పాఠక పాఠ్యంలో చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T232']=['ఘాత సమితుల స్వీకృతం, తరువాతి దశ సమర్థన, ద్విఘాత సమితి నుంచి కార్టీజియన్ లబ్ధం, రెండు అభ్యాసాలు నిలపడం (ఎంపిక)','ప్రతి ఉపసమితి ఉనికిని వేరుచేయడం లేకుండానే స్వీకృతం ఒక్కటే ఇస్తుందని చెప్పడం (తిరస్కరణ)','ద్విఘాత సమితిని ఒకే ఘాత సమితిగా కుదించడం (తిరస్కరణ)'];
alternatives['TE-T233']=['అనంతంగా అనేక సమితులు, అనంత సమితి తేడా, డెడెకిండ్ బీజగణితం, రెండు నిరూపణ సందర్భాలు, అదనపు అనంత దశ ఊహ నిలపడం (ఎంపిక)','వారస నిర్మాణంతోనే అనంత సమితి స్వయంగా లభిస్తుందని చెప్పడం (తిరస్కరణ)','అనంత దశ దశలవారీ భావన నుంచే అనివార్యమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T234']=['Z-minus సంకేతం, ఆరు స్వీకృత-రకాలు, సెర్మెలో చారిత్రక ఆపాదన, పూర్వ భాగానికి పునఃపరిశీలన నిలపడం (ఎంపిక)','వేరుచేయడం పథకం ఒక్క స్వీకృతమేనని చెప్పడం (తిరస్కరణ)','మూలంలోని minus సూచనకు ఇప్పుడే అదనపు స్వీకృత పేరు చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T235']=['సహజ సంఖ్యల ప్రతినిధులు ఎంపిక మాత్రమే, సెర్మెలో/వాన్ న్యూమన్ రెండు వారసాలు, రెండు 2 రూపాలు, ఏకైకత లేమి నిలపడం (ఎంపిక)','సహజ సంఖ్యలు తాత్త్వికంగా ఒక నిర్దిష్ట సమితి రూపమేనని ప్రకటించడం (తిరస్కరణ)','కరణీయ సంఖ్యలను అకరణీయ సంఖ్యలుగా కలపడం (తిరస్కరణ)'];
alternatives['TE-T236']=['తరగతి-సమితి జాగ్రత్త, phi(S) సాక్షి, పరిమిత వేరుచేయడం, డెడెకిండ్ సంవృతం నిలపడం; వ్యాఖ్యానిత c/C మూల లోపాన్ని నాన్-రెండరింగ్ స్థితితో ప్రకటించడం (ఎంపిక)','అపరిమిత ధర్మసంగ్రహ సమితి ఉందని ఊహించడం (తిరస్కరణ)','మూల వ్యాఖ్యను పాఠక నిరూపణగా ప్రచురించడం (తిరస్కరణ)'];
alternatives['TE-T237']=['క్రమసంఖ్యలు అనే అధ్యాయ శీర్షికను మూల పది దిగుమతులతో నిలపడం (ఎంపిక)','అధ్యాయంలో ఇంకా నిర్వచించని క్రమసంఖ్యల సాంకేతిక అర్థాన్ని ఈ శీర్షికలోనే ప్రకటించడం (తిరస్కరణ)','దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T238']=['మొదటి అనంత దశ తరువాత కొనసాగింపు, సహజ సంఖ్యలన్నింటి తరువాతి అతిపరిమిత క్రమసంఖ్య భావన, తరువాతి నిర్వచన లక్ష్యం నిలపడం (ఎంపిక)','అనంత దశనే చివరి దశగా చూపడం (తిరస్కరణ)','అతిపరిమిత క్రమసంఖ్యను సహజ సంఖ్యతో కలపడం (తిరస్కరణ)'];
alternatives['TE-T239']=['మూడు చిత్రాలూ, omega/omega+1/omega+omega క్రమభేదాలూ నిలిపి అనుక్రమం పదం వాడడం (ఎంపిక)','0ను చివరికి మార్చిన తరువాత కూడా చివరి మూలకం లేదని చెప్పడం (తిరస్కరణ)','సరి-బేసి క్రమాన్ని సాధారణ సహజ క్రమంగా కలపడం (తిరస్కరణ)'];
alternatives['TE-T240']=['సంపర్కితత్వం, కనిష్ఠ/అత్యల్ప భేదం, కఠిన క్రమధర్మాలు, సుక్రమ ఆగమన విపర్యయ నిరూపణ నిలపడం (ఎంపిక)','కనిష్ఠాన్ని నిర్వచన దశలోనే అత్యల్పంతో సమానమని ఊహించడం (తిరస్కరణ)','సూత్రాల్లో పరామితులను నిషేధించడం (తిరస్కరణ)'];
alternatives['TE-T241']=['నిర్వచన-నియంత్రిత క్రమ-సమరూపత, తనకన్నా చిన్న ఆరంభ ఖండం, సమరూపత ఏకైకత్వం/పోలిక నిరూపణలు, f పరిధి మూల లోపం ప్రకటించి సరిచేయడం (ఎంపిక)','properను క్రమం గల ఖండంగా తప్పుగా అనువదించడం (తిరస్కరణ)','f నిర్వచన సమితి B_b2 అని మూల లోపాన్ని నిలపడం (తిరస్కరణ)'];
alternatives['TE-T242']=['క్రమరకం రెండు ఆశిత సూత్రాలు, సంక్రామక/సభ్యత్వ-సుక్రమ నిర్వచనం, తొలి క్రమసంఖ్యలు, ప్రతినిధి ఎంపిక జాగ్రత్త నిలపడం (ఎంపిక)','క్రమరకపు ఆశిత సూత్రాలను ఇక్కడే నిరూపిత సిద్ధాంతాలుగా చెప్పడం (తిరస్కరణ)','సహజ సంఖ్యల సమితి ప్రతినిధినే తాత్త్విక ఏకైక సంఖ్యగా ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T243']=['అతిపరిమిత ఆగమనం, త్రివిధత, బురాలి-ఫోర్టీ వైరుధ్యం, అవరోహణ/ఉపసమితి ఫలితాలు నిలిపి phi-సంతృప్తి అత్యల్ప సాక్షి లోపాన్ని ప్రకటించి సరిచేయడం (ఎంపిక)','సూత్రం phiనే క్రమసంఖ్య మూలకంగా చూపడం (తిరస్కరణ)','అన్ని క్రమసంఖ్యలు ఒక సమితి అని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T244']=['ప్రతిస్థాపన పథకంలో ప్రతి xకు ఏకైక y, పద-చిత్ర పర్యవసానం, సమితి-ప్రమేయ చిత్రం భేదం నిలపడం (ఎంపిక)','సూత్రం ఏకైకత షరతును తొలగించడం (తిరస్కరణ)','ప్రతిస్థాపన Z-minusలోనే వ్యుత్పన్నమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T245']=['ZF-minusను Z-minusతో పాటు ప్రతిస్థాపనగా నిర్వచించి ఫ్రెంకెల్/స్కోలెమ్ ఆపాదనల తేడా నిలపడం (ఎంపిక)','ప్రతిస్థాపన సమర్థన ఇప్పటికే పూర్తయిందని చెప్పడం (తిరస్కరణ)','తొలి కచ్చిత రూపకల్పనను ఫ్రెంకెల్‌కే ఆపాదించడం (తిరస్కరణ)'];
alternatives['TE-T246']=['ప్రతిస్థాపనతో ఏకైక క్రమసంఖ్య ప్రతినిధి, క్రమరక నిర్వచనం, సమానత్వ/సభ్యత్వ లక్షణాలు నిలిపి రెండు మూల సూత్ర లోపాలను ప్రకటించి సరిచేయడం (ఎంపిక)','క్రమయుగ్మ నిర్మాణాన్ని ప్రమేయపు లక్ష్య సమితిగా వదలడం (తిరస్కరణ)','నిర్వచితం కాని f(alpha)పై ద్విసోపాధికాన్ని నిరూపితంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T247']=['ఉత్తరవర్తి, సీమా అనే వేరు క్రమసంఖ్య రూపాలు, మూడు-సందర్భాల ఆగమనం, కనిష్ఠ కఠిన పై హద్దు నిలపడం (ఎంపిక)','సీమాను పరిమితమైన సంఖ్యగా అర్థమయ్యే పదంతో కలపడం (తిరస్కరణ)','కఠిన, కఠినంకాని పై హద్దులను కలపడం (తిరస్కరణ)'];
alternatives['TE-T248']=['దశలు, స్థాయిలు శీర్షికను ఆరు మూల దిగుమతులతో నిలపడం (ఎంపిక)','స్థాయి, దశను నిర్వచనం ముందే ఒకటిగా ప్రకటించడం (తిరస్కరణ)','దిగుమతి పథాలు అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T249']=['V-alpha మూడు పునరావృత్త సమీకరణాలు, నమూనా/అంతర్గత నిర్వచన భేదం నిలపడం (ఎంపిక)','సీమా దశలో ముందరి దశల ఛేదనం పెట్టడం (తిరస్కరణ)','ఉనికి నిరూపణ ఈ నిర్వచనంతోనే పూర్తయిందని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T250']=['పరిమిత/సాధారణ/సరళ అతిపరిమిత పునరావృత్తి, ఉజ్జాయింపు నిర్వచన భేదాలు నిలపడం (ఎంపిక)','పద పథకాన్ని సమితి ప్రమేయంగా చూపడం (తిరస్కరణ)','శూన్య ప్రమేయానికి మూల విభజన లోపాన్ని చెప్పకుండా వదలడం (తిరస్కరణ)'];
alternatives['TE-T251']=['సమర్థమైనది అనే పదాన్ని మూల ద్విసోపాధిక నిర్వచనంతో కట్టడం (ఎంపిక)','potentను నిర్దిష్టంగా ప్రామాణిక తెలుగు పదమని చెప్పడం (తిరస్కరణ)','సంక్రమణను సంచితత్వంతో కలపడం (తిరస్కరణ)'];
alternatives['TE-T252']=['పునాది, నియమితత్వం స్వయంసిద్ధ సూత్రాలను వేరు చేసి సంక్రమణ ఆవరణను పునరావృత్తితో నిర్వచించడం (ఎంపిక)','రెండు సూత్రాలు ఒకే వాక్యమని చూపడం (తిరస్కరణ)','మూల b/B చిహ్న లోపాన్ని మౌనంగా వదలడం (తిరస్కరణ)'];
alternatives['TE-T253']=['Z/ZF సిద్ధాంతాల చేర్పుల నిర్వచనాలు, Z-minus/ZF-minus సాపేక్ష భేదం నిలపడం (ఎంపిక)','Z-minusలో నియమితత్వం పునాదికి సమానమని ప్రకటించడం (తిరస్కరణ)','V-alpha నిర్వచనానికి ప్రతిస్థాపన అవసరాన్ని వదలడం (తిరస్కరణ)'];
alternatives['TE-T254']=['స్థాయిని కనిష్ఠ దశతో నిర్వచించి సభ్యత్వ ఆగమనం, సుప్రీమం సంబంధం నిలపడం (ఎంపిక)','స్థాయిని దశల సంఖ్యగానే నిర్వచించడం (తిరస్కరణ)','మూల వైరుధ్య ముగింపును ప్రకటించకుండా అనుసరించడం (తిరస్కరణ)'];
alternatives['TE-T255']=['ప్రతిస్థాపన అధ్యాయ శీర్షికను పూర్వ పదంతో ఏకరూపంగా నిలపడం (ఎంపిక)','దిగుమతి పథాలను స్థానికీకరించడం (తిరస్కరణ)','అధ్యాయ డ్రైవర్‌లో ఉపవిభాగ నిరూపణలు చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T256']=['బాహ్య సమర్థనను ఫలితాలతో, అంతర్గత సమర్థనను భావనలతో కట్టడం (ఎంపిక)','రెండు సమర్థనలను ఒకటిగా కలపడం (తిరస్కరణ)','ప్రతిస్థాపన బలం వ్యాఖ్యను తగ్గించడం (తిరస్కరణ)'];
alternatives['TE-T257']=['పరిధి పరిమితిని Mకు రెండు పరిమాణకారకాల కట్టుతో నిర్వచించి స్థాయిక్రమ ఎత్తు వాదన నిలపడం (ఎంపిక)','నమూనా సమితిని మొత్తం విశ్వంగా చెప్పడం (తిరస్కరణ)','సరి/బేసి సుక్రమాన్ని సాధారణ సంఖ్యాక్రమంగా కలపడం (తిరస్కరణ)'];
alternatives['TE-T258']=['LT స్థరానికి, rank స్థాయికి వేరు పదాలు ఉంచి బాహ్య సమర్థనపై రెండు అభ్యంతరాలు నిలపడం (ఎంపిక)','LT, Zrను ZFతో సమబలంగా చూపడం (తిరస్కరణ)','సుసంగతతపై సందేహాన్ని అసంగతి నిరూపణగా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T259']=['పరిమాణ పరిమితి సూత్రాన్ని మరీ ఎక్కువ కాని వస్తువుల సమితి రూపంలో, దశ భావనతో ఉద్రిక్తతతో ఉంచడం (ఎంపిక)','రస్సెల్ సమితి పెద్దదిగా ఉండటం నిరూపితమని చెప్పడం (తిరస్కరణ)','పగ్ ఉపమానాన్ని వదలడం (తిరస్కరణ)'];
alternatives['TE-T260']=['సంపూర్ణ అనంతత్వం, సహాంత్యత నిషేధం భేదాన్ని నిలిపి సాంకేతిక అడ్డంకి ప్రకటించడం (ఎంపిక)','సుక్రమ ప్రాతినిధ్యం ప్రతిస్థాపనకు సమానమని చెప్పడం (తిరస్కరణ)','Zలో దశ నిర్వచన సమస్యను మూసివేయడం (తిరస్కరణ)'];
alternatives['TE-T261']=['ప్రతిబింబన పథక ద్విసోపాధిక సూత్రం, ఆరంభ ఖండ పరిమితీకరణను నిలపడం (ఎంపిక)','పథకాన్ని ఒక్క సూత్రంగా చెప్పడం (తిరస్కరణ)','సమర్థన ప్రయత్నాన్ని నిరూపిత నిర్ణయంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T262']=['బలహీన ప్రతిబింబనం, నిరపేక్షత, పైగీత సంకేతాలను వాటి స్థానిక నిరూపణ పాత్రలతో నిలపడం (ఎంపిక)','0/1 యుక్తిని ఒక్క సూత్ర ప్రతిబింబనగా తగ్గించడం (తిరస్కరణ)','మూల మూడు సూత్ర లోపాలను ప్రకటించకుండా అనుసరించడం (తిరస్కరణ)'];
alternatives['TE-T263']=['పరిమిత స్వయంసిద్ధీకరణకు ZFలోపల/గురించి నిరూపణ భేదం, సంక్రమణ నమూనా వాదన నిలపడం (ఎంపిక)','T అసంగత ఫలితాన్ని ZF స్వయంగా అసంగతమని చదవడం (తిరస్కరణ)','మూల తప్పు పరిమితీకరణ పైసూచికను వదలడం (తిరస్కరణ)'];
alternatives['TE-T264']=['క్రమసంఖ్య అంకగణితం శీర్షికతో ఐదు దిగుమతులు నిలపడం (ఎంపిక)','దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)','డ్రైవరులో కొత్త సిద్ధాంతాలు రాయడం (తిరస్కరణ)'];
alternatives['TE-T265']=['వెన్నెముక ఉపమానం, క్రమసంఖ్య అంకగణిత కొత్త పాత్ర వేరు చేయడం (ఎంపిక)','omega కూడికలను ఇప్పటికే ఔపచారికంగా నిర్వచించామని చెప్పడం (తిరస్కరణ)','రెండు మార్గాల్లో ఒకటినే ముందుగా స్వీకరించడం (తిరస్కరణ)'];
alternatives['TE-T266']=['విచ్ఛిన్న సమ్మేళనం, విలోమ నిఘంటు క్రమం ద్వారా కూడిక నిర్మాణం, పునరావృత్త మార్గం భేదం నిలపడం (ఎంపిక)','క్రమసంఖ్య కూడికను కమ్యూటేటివ్‌గా చెప్పడం (తిరస్కరణ)','మూల రెండు తప్పు సమ్మేళనాలను ప్రకటించకుండా ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T267']=['ఆరు స్థాయి లెక్కల సమానత్వ/అసమానత్వ భేదం, ఐదు అనంతత్వ సమానార్థకాలు నిలపడం (ఎంపిక)','గుణిత స్థాయి అసమానత్వాన్ని ఎల్లప్పుడూ సమానత్వంగా మార్చడం (తిరస్కరణ)','రెండవ అభ్యాస సంబంధ లోపాన్ని మౌనంగా వదలడం (తిరస్కరణ)'];
alternatives['TE-T268']=['కార్టీషియన్ గుణితపు విలోమ నిఘంటు క్రమరకంగా గుణకారాన్ని, శూన్య మినహాయింపును నిలపడం (ఎంపిక)','శూన్య ఎడమ గుణకానికి తప్పు కఠిన సుప్రీమాన్ని వర్తింపజేయడం (తిరస్కరణ)','గుణకారాన్ని క్రమమార్పిడి ధర్మంతో చూపడం (తిరస్కరణ)'];
alternatives['TE-T269']=['ధనాత్మక ఆధార పరిమిత మద్దతు ప్రమేయ నిర్మాణం, అన్ని ఆధారాల పునరావృత్తి నిర్వచనం వేరు ఉంచడం (ఎంపిక)','ఘాత/ఆధార ప్రమేయ రకాలను తిరగరాయడం (తిరస్కరణ)','శూన్య ఆధారంలోని నిర్మాణాత్మక/పునరావృత్తి తేడాను దాచడం (తిరస్కరణ)'];
alternatives['TE-T270']=['కార్డినల్ సంఖ్యలు అనే వివరణాత్మక శీర్షిక (ఎంపిక)','క్రమసంఖ్యలు అని కలపడం (తిరస్కరణ)','దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T271']=['కార్డినాలిటీ సమానత్వాన్ని ద్వైజెక్షన్ సమసంఖ్యకత్వంతో అప్పుడూ అప్పుడే అనుసంధానించడం (ఎంపిక)','క్రమ-సమరూపతనే పరిమాణ సమానత్వంగా తీసుకోవడం (తిరస్కరణ)','హ్యూమ్ సూత్రాన్ని కాంటర్ సూత్రంతో మాటలేకుండా సమానీకరించడం (తిరస్కరణ)'];
alternatives['TE-T272']=['అత్యల్ప సమసంఖ్యక క్రమసంఖ్య నిర్వచనాన్ని సుక్రమపరచదగిన సమితులకు షరతుగా ఉంచడం (ఎంపిక)','ZFలోనే ప్రతి సమితి కార్డినాలిటీ ఉందని చెప్పడం (తిరస్కరణ)','చిత్రంలోని ఇంజెక్షన్‌ను ద్వైజెక్షన్‌గా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T273']=['ZFCను ZFతో సుక్రమపరచడం చేర్పుగా, ఎంపిక సమానత్వం ZF పరిధిలోనే చెప్పడం (ఎంపిక)','ఎంపికను ఇప్పటికే చేర్చిన వేరే స్వయంసిద్ధంగా జాబితా చేయడం (తిరస్కరణ)','విభజన/ప్రతిస్థాపన పథకాలను ఒకే ఉదాహరణగా తగ్గించడం (తిరస్కరణ)'];
alternatives['TE-T274']=['లెక్కించదగిన/లెక్కించలేని భేదాన్ని ఒమేగా కార్డినాలిటీ సరిహద్దుతో నిలపడం (ఎంపిక)','లెక్కించదగిన అన్ని క్రమసంఖ్యలనే కార్డినల్ సంఖ్యలుగా చెప్పడం (తిరస్కరణ)','సహజ సంఖ్య కాని ప్రతి సమితిని అనంతమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T275']=['పూర్వ స్వవర్గానవలంబిత/స్వవర్గావలంబిత పదాలతో సమితి-విధేయ రకభేదం నిలపడం (ఎంపిక)','హ్యూమ్ సూత్రాన్ని కాంటర్ సూత్రంతో రకభేదం లేకుండా కలపడం (తిరస్కరణ)','మౌలిక నియమం Vకు ఉన్న అసంగతతను హ్యూమ్ సూత్రానికీ ఆపాదించడం (తిరస్కరణ)'];
alternatives['TE-T276']=['పూర్వ కార్డినల్, అంకగణిత పదాలతో శీర్షికను ఇవ్వడం (ఎంపిక)','క్రమసంఖ్య అంకగణితంగా మార్చడం (తిరస్కరణ)','దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T277']=['విచ్ఛిన్న సమ్మేళనం/కార్టీషియన్ గుణితం/ప్రమేయాల సమితి ఆధారంగా మూడు కార్డినల్ క్రియలను వేరు చూపడం (ఎంపిక)','కార్డినల్ క్రియలను క్రమసంఖ్య క్రియలతో సమానీకరించడం (తిరస్కరణ)','రియల్ సంఖ్యల నిరూపణ రూపరేఖను పూర్తి నిరూపణగా ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T278']=['యుగ్మాల గరిష్ఠ-మొదటి-రెండవ నిర్దేశాంక క్రమం, అనంత గరిష్ఠ కార్డినల్ ఫలితం నిలపడం (ఎంపిక)','క్రమాన్ని సాధారణ నిఘంటు క్రమంగా మార్చడం (తిరస్కరణ)','పరిమిత సూచిక ఖండ కేసును దాచడం (తిరస్కరణ)'];
alternatives['TE-T279']=['ప్రమేయ విభజనను క్రమయుగ్మంగా, పునర్వ్యవస్థీకరణను నిజమైన కార్టీషియన్ గుణితంపై నిర్వచించి ఘాత నియమాలు నిలపడం (ఎంపిక)','ప్రమేయాల గుణితాన్ని యుగ్మంగా భావించడం (తిరస్కరణ)','శూన్య ఘాతానికి ఆధారమే ఫలితమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T280']=['CH/GCHను వేరు పరికల్పనలుగా, ZFC స్వతంత్రతను సత్య-అనిర్ణీతతతో కలపకుండా చూపడం (ఎంపిక)','స్వతంత్రత నుంచి సత్యవిలువ అనిర్ణీతమని వెంటనే చెప్పడం (తిరస్కరణ)','పరిమిత కార్డినల్ సంఖ్యలకు ఆలెఫ్ సూచికలు ఇవ్వడం (తిరస్కరణ)'];
alternatives['TE-T281']=['ఆలెఫ్/బెత్ స్థిర బిందువులను ఎత్తు-వెడల్పు సమానత్వంతో, కఠినంగా పెరిగే టౌ/W నిర్మాణంతో నిలపడం (ఎంపిక)','టౌ ప్రారంభంలోనే స్థిర బిందువు ఉంటే కూడా కఠిన పెరుగుదల ఉందని చెప్పడం (తిరస్కరణ)','శూన్యాన్ని బెత్-స్థిర బిందువుగా లెక్కించడం (తిరస్కరణ)'];
alternatives['TE-T282']=['ఎంపిక శీర్షిక, ఎనిమిది దిగుమతులు నిలపడం (ఎంపిక)','దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)','శీర్షికను సుక్రమపరచడంగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T283']=['సుక్రమపరచడం/ఎంపిక సమానత్వంతో వినియోగం, సమర్థన రెండు ప్రశ్నలు నిలపడం (ఎంపిక)','స్వయంసిద్ధాల సమానత్వాన్ని కారణం లేకుండా ఒకే వాక్యంగా తగ్గించడం (తిరస్కరణ)','తాత్త్విక ఆమోదయోగ్యత ప్రశ్నను తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T284']=['అత్యల్ప స్థాయి ప్రతినిధుల సమితితో సుక్రమపరచడం లేని TS-కార్డినల్ నిర్మాణం నిలపడం (ఎంపిక)','అన్ని సమసంఖ్యక సమితుల సమగ్రతను సమితిగా స్వీకరించడం (తిరస్కరణ)','TS-కార్డినల్ నిర్వచనానికి ఎంపిక అవసరమని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T285']=['ZF హార్టోగ్స్ క్రమసంఖ్య, ప్రతి జత కార్డినాలిటీ పోలికతో సుక్రమపరచడం సమానత్వం నిలపడం (ఎంపిక)','సుక్రమపరచడం లేకుండానే అన్ని పరిమాణాలు పోల్చదగినవని చెప్పడం (తిరస్కరణ)','మూల గూడుకట్టిన సమసంఖ్యకత్వ సూత్రాన్ని అలాగే ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T286']=['ఖాళీ కాని సమితి నుంచి ఎంపిక ప్రమేయం, రెండు దిశల సమానత్వం, ఆపే ముందరి ఇంజెక్టివ్ గణన నిలపడం (ఎంపిక)','ఖాళీ సమితిపై నిర్వచితం కాని మొదటి ఎంపికను వర్తింపజేయడం (తిరస్కరణ)','ఆపు దశలో గత ఎంపికలను చెరిపివేయడం (తిరస్కరణ)'];
alternatives['TE-T287']=['పరిమిత ఎంపిక, లెక్కించదగిన ఎంపిక, పూర్తి ఎంపిక బలభేదం మరియు రెండు గోప్య వినియోగాలు నిలపడం (ఎంపిక)','లెక్కించదగిన సమ్మేళన ఫలితం ఎంపిక లేకుండానే వస్తుందని చెప్పడం (తిరస్కరణ)','పూర్వ సమ్మేళన సూచిక తప్పును ప్రకటించకుండా వదలడం (తిరస్కరణ)'];
alternatives['TE-T288']=['దశ-అంగీకారం, విచ్ఛిన్న కుటుంబ ఎంపిక సమితి ద్వారా అంతర్గత సమర్థన ప్రయత్నం అని చూపడం (ఎంపిక)','సమర్థన ప్రయత్నాన్ని ZF సిద్ధాంత నిరూపణగా చూపడం (తిరస్కరణ)','ఎంపిక సమితిని ఎంపిక ప్రమేయం నుంచి పూర్తిగా వేరు భావనగా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T289']=['ఘన గోళ విభజన, కొలవలేని ముక్కలు, భౌతిక పదార్థ-గణిత సిద్ధాంత భేదం నిలపడం (ఎంపిక)','గోళ ఉపరితలం ఘనపరిమాణమని చెప్పడం (తిరస్కరణ)','ముక్కలన్నిటికీ వేర్వేరు ఘనపరిమాణాలు కేటాయించడం (తిరస్కరణ)'];
alternatives['TE-T290']=['పరిమేయ పూర్తి-చుట్టు భ్రమణ సమూహం, ఎంపిక ప్రతినిధులు, లెక్కించదగిన విభజన, కొలత వైరుధ్యం నిలపడం (ఎంపిక)','పరిమేయ రేడియన్ విలువలనే సమూహంగా వాడడం (తిరస్కరణ)','స్థిరబిందు అపవాదాన్ని పరిష్కరించకుండానే గోళ నిరూపణ పూర్తి అయిందనడం (తిరస్కరణ)'];
alternatives['TE-T291']=['పద్ధతులు అనే పాఠక భాగ శీర్షిక, నిరూపణ పద్ధతుల సంపాదక పరిచయం నిలపడం (ఎంపిక)','దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T292']=['నిరూపణలు అనే అధ్యాయ శీర్షిక, పది విభాగ దిగుమతుల క్రమం నిలపడం (ఎంపిక)','శీర్షిక మాత్రమే ఉన్నందుకు దిగుమతులను తీసివేయడం (తిరస్కరణ)'];
alternatives['TE-T293']=['నియమవ్యుత్పత్తి వ్యవస్థను సహజభాష నిరూపణ నుంచి వేరు చేసి, ఫలితాల నాలుగు పేర్ల పాత్రలు నిలపడం (ఎంపిక)','అన్ని నిరూపణలను వ్యుత్పత్తులుగా పిలవడం (తిరస్కరణ)','పరికల్పనను నిరూపించాల్సిన నిష్కర్షగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T294']=['నిరూపణ లక్ష్యం, అనుమతించిన పరికల్పన, వర్తించే నిర్వచనాలు వేరుగా చూపడం (ఎంపిక)','లక్ష్యాన్నే నిరూపణ ప్రారంభ పరికల్పనగా వాడడం (తిరస్కరణ)'];
alternatives['TE-T295']=['నిర్వచ్యపదం/నిర్వచక భాగం అని సంక్షిప్త పేరు-పూర్తి షరతు భేదం, సమితి సమానత్వ స్థానభర్తీ నిలపడం (ఎంపిక)','నిర్వచనంలోని A/Bలను ప్రతిపాదనలోని A/Bలతో యథాతథంగా కలపడం (తిరస్కరణ)','రెండు దిశల సభ్యత్వంలో ఒక దిశ వదలడం (తిరస్కరణ)'];
alternatives['TE-T296']=['సోపాధిక దిశ, సందర్భాలవారీ వాదన, ఏదైనా వస్తువు మరియు తాజా అస్తిత్వ సాక్షి పేరును వేరుగా నిలపడం (ఎంపిక)','p only if qను q→pగా తిప్పడం (తిరస్కరణ)','వేర్వేరు అస్తిత్వ సాక్షులకు ఒకే xను పెట్టే చివరి తప్పును నిజ నిరూపణగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T297']=['పంపిణీ సమానత్వం రెండు దిశలు, వెనుక దిశలో గూడుకట్టిన సందర్భాలు నిలపడం (ఎంపిక)','మొదటి సభ్యత్వ దిశతోనే సమానత్వం పూర్తయిందనడం (తిరస్కరణ)','(A∪B)∩(A∪C) నుంచి A లేదా B లేదా C మాత్రమే అని తేల్చడం (తిరస్కరణ)'];
alternatives['TE-T298']=['భేద సమితి ద్వారా రెండు ఉపసమితి దిశలు, వెనుక దిశలో బహిష్కృత మధ్యమ విభజన నిలపడం (ఎంపిక)','A⊆C నుంచి A=C అని తేల్చడం (తిరస్కరణ)','మూల రెండవ ఉపసమితి కుండలీకరణ లోపాన్ని అలాగే వదలడం (తిరస్కరణ)'];
alternatives['TE-T299']=['ప్రతికూల నిరూపణ, సాంప్రదాయిక సానుకూల పరోక్ష నిరూపణ వేరుచేసి తాత్కాలిక పరికల్పన నుంచి వైరుధ్యం చూపడం (ఎంపిక)','ద్వినిషేధ నిర్మూలనను అన్ని తర్కాలలో చెల్లుతుందని చెప్పడం (తిరస్కరణ)','నిర్వచించని Cను ఉపసమితి వ్యతిరేక ఉదాహరణలో ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T300']=['సంక్షిప్త నిరూపణ వెనుక సమానత్వపు రెండు ఉపసమితి దిశలు, గోప్య నిర్వచన దశలను స్పష్టంగా నిలపడం (ఎంపిక)','మూల విస్తరణలో (b) ముందరి దిశనే మళ్లీ చూపడం (తిరస్కరణ)','చివరి అదనపు కుండలీకరణాన్ని వదలడం (తిరస్కరణ)'];
alternatives['TE-T301']=['ఉత్సాహపరిచే స్వరంతో ముందస్తు పని, సహకారం, సహాయం, విరామం, తిరిగి సాధన నిలపడం (ఎంపిక)','తోటి విద్యార్థి సమాధానం కాపీ చేయమని సూచించడం (తిరస్కరణ)','విఫలతను తెలివిలేమితో కలపడం (తిరస్కరణ)'];
alternatives['TE-T302']=['శీర్షికలు తెలుగులో, బాహ్య పుస్తక పేర్లు/ఉటంకింపులు/చిరునామాలు యథాతథంగా నిలపడం (ఎంపిక)','బాహ్య పుస్తకాల అసలు శీర్షికలను మార్పిడి చేసి శోధనయోగ్యత కోల్పోవడం (తిరస్కరణ)','లింకులు ఇప్పటికీ పనిచేస్తున్నాయని ధృవీకరణ లేకుండా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T303']=['ఆగమనం అధ్యాయ శీర్షిక, ఐదు విభాగ దిగుమతులు నిలపడం (ఎంపిక)','దిగుమతి మార్గాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T304']=['పరిశీలనాత్మక సరళ ఆగమనం, శూన్య ఆధారం-అనువర్తి దశ గణిత నిరూపణ, నిర్మాణాత్మక విస్తరణ వేరుచేయడం (ఎంపిక)','ఎమరాల్డ్ పరిశీలనను గణిత ఆగమన నిరూపణగా చెప్పడం (తిరస్కరణ)','ఆధార దశను ఒకటిగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T305']=['శూన్య ఆధారం, అనువర్తి దశ, పాచికల శూన్య కేసు విడి ధృవీకరణ, వరుస మొత్తాల గణన నిలపడం (ఎంపిక)','ఒక పాచిక ఆధారంతోనే శూన్య పాచికల సిద్ధాంతమూ వచ్చిందనడం (తిరస్కరణ)','సాధారణ దశలో nను k బదులు ప్రతిస్థాపించడం (తిరస్కరణ)'];
alternatives['TE-T306']=['అన్ని చిన్న సందర్భాల పూర్వపక్షం, శూన్య ఖాళీ పరిధి, ధన సూచికల పూర్వసంఖ్య వాదన నిలపడం (ఎంపిక)','శూన్యానికి సహజ పూర్వసంఖ్య ఉందనడం (తిరస్కరణ)','ఖాళీ పరిధిలో P(0)ని సాధారణ P(l) పూర్వపక్షంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T307']=['చక్కని పదం, అత్యంత చక్కని పదం అనే ఉదాహరణ పేర్లను భేదించి, నిర్మాణ నియమాలు మరియు బ్రాకెట్ అసమానత నిలపడం (ఎంపిక)','మూడవ మూసివేత నియమాన్ని మర్చిపోవడం (తిరస్కరణ)','ఉపపదాల పొడవులు ప్రస్తుత పదం కంటే చిన్నవి అని చూపకుండా ఆగమనం వాడడం (తిరస్కరణ)'];
alternatives['TE-T308']=['ప్రారంభ వస్తువులు, నిర్మాణ క్రియ దశ, కచ్చితంగా చిన్న నిజ ప్రారంభ భాగం, ఐదు బ్రాకెట్ కేసులు నిలపడం (ఎంపిక)','పూర్తి పదాన్నే నిజ ప్రారంభ భాగంగా లెక్కించడం (తిరస్కరణ)','సమాన బ్రాకెట్ లెక్క లేకుండా చివరి కేసులను తేల్చడం (తిరస్కరణ)'];
alternatives['TE-T309']=['ఉపపదం, బ్రాకెట్లు లేని పదం, ఏకైక పఠనీయత, లోతు ప్రమేయం వేర్వేరుగా నిలిపి రెండు పఠనాల విరోధాన్ని చూపడం (ఎంపిక)','బ్రాకెట్లు లేని పదాల్లో కూడా ఉపపద/లోతు నిర్వచనాలు ఏకైకమని చెప్పడం (తిరస్కరణ)','3 మరియు 2 అనే విరుద్ధ లోతు విలువలను ఒకటిగా సవరించడం (తిరస్కరణ)'];
alternatives['TE-T310']=['చరిత్ర అని భాగ శీర్షికను తెలుగులోకి మార్చి రెండు దిగుమతులను నిలపడం (ఎంపిక)','భాగ కోడ్ లేదా దిగుమతి మార్గాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T311']=['జీవిత చరిత్రలు అని అధ్యాయ శీర్షికను తెలుగులోకి మార్చి పదకొండు దిగుమతులను నిలపడం (ఎంపిక)','పేర్ల ఆధారిత దిగుమతి మార్గాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T312']=['గెయోర్గ్ కాంటర్ పేరు/ఉచ్చారణ, సమితి సిద్ధాంతం, అతిపరిమిత సంఖ్యల పూర్వ పదాలను నిలిపి మూల జీవిత చరిత్రను అనువదించడం (ఎంపిక)','అసత్య ఓడ కథను నిజ చారిత్రక వివరంగా చెప్పడం (తిరస్కరణ)','అతిపరిమితకు కొత్త అసంగత పదం వాడడం (తిరస్కరణ)'];
alternatives['TE-T313']=['చర్చ్--ట్యూరింగ్ సిద్ధాంతప్రతిపాదనను చర్చ్ అనిర్ణయనీయత సిద్ధాంతం నుంచి వేరు చేసి, పూర్వ గణన పదాలు వాడడం (ఎంపిక)','రెండింటినీ ఒక నిరూపిత సిద్ధాంతంగా కలపడం (తిరస్కరణ)','నిర్ణయ సమస్య అనిర్ణయనీయతను కేవలం కష్టతనంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T314']=['సహజ నిగమనం, సీక్వెంట్ కలనం, అవిరోధత్వం పూర్వ పదజాలాన్ని కొనసాగించి, రాజకీయ విధేయతపై మూల అనిశ్చితిని నిలపడం (ఎంపిక)','మూలం చెప్పని ఖచ్చిత నాజీ ఉద్దేశాన్ని ఆపాదించడం (తిరస్కరణ)','నిగమన వ్యవస్థల పేర్లను ఒకటిగా కలపడం (తిరస్కరణ)'];
alternatives['TE-T315']=['1929 ప్రథమ శ్రేణి సంపూర్ణత సిద్ధాంతాన్ని 1931 రెండు అసంపూర్ణత సిద్ధాంతాల నుంచి వేరు చేసి చారిత్రక కథనాన్ని నిలపడం (ఎంపిక)','సంపూర్ణత, అసంపూర్ణత సిద్ధాంతాలను ఒకే ఫలితంగా చెప్పడం (తిరస్కరణ)','మూల వైద్య కథనాన్ని స్వతంత్ర నిర్ధారణగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T316']=['ఆరోహణ శ్రేణి షరతు, అవరోహణ శ్రేణి షరతు దిశలను వేరు చేసి సుస్థాపిత క్రమపు ఆగమనాన్ని నిలపడం (ఎంపిక)','ఐడియళ్ల ఆరోహణ ఉదాహరణను అవరోహణగా తిప్పడం (తిరస్కరణ)','రెండు షరతులను సమానార్థకాలుగా చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T317']=['పీటర్ ఆదిమ పునరావృత్తం కాని ప్రమేయం, ఆకెర్మాన్ సరళీకరణ, ఆకెర్మాన్--పీటర్ పేరు వేర్వేరుగా నిలపడం (ఎంపిక)','ప్రమేయం ఆదిమ పునరావృత్తమేనని తిప్పడం (తిరస్కరణ)','ఆకెర్మాన్ పూర్వ ఫలితాన్ని పీటర్‌కు పూర్తిగా ఆపాదించడం (తిరస్కరణ)'];
alternatives['TE-T318']=['పరిమేయ సిద్ధాంత నిర్ణయ సమస్యను పూర్ణసంఖ్య డయోఫాంటైన్ సమస్య నుంచి వేరు చేసి, జె.ఆర్. పరికల్పన-ఎంఆర్‌డీపీ ఫలిత క్రమాన్ని నిలపడం (ఎంపిక)','పరిమేయ సంఖ్యల నిర్ణయ సిద్ధాంతాన్నే హిల్బర్ట్ పదవ సమస్యగా చూపడం (తిరస్కరణ)','ఘాతీయ డయోఫాంటైన్ ఫలితం ఒక్కటే పూర్తి పదవ సమస్యను పరిష్కరించిందనడం (తిరస్కరణ)'];
alternatives['TE-T319']=['విశ్లేషణాత్మక తత్వశాస్త్రం, ప్రిన్సిపియా గణిత-తర్క తగ్గింపు అభిప్రాయం, మూల జీవిత-రాజకీయ వాదనలు విడిగా నిలపడం (ఎంపిక)','గణితాన్ని తర్కానికి తగ్గించడం నిరూపిత సత్యంగా స్వరం మార్చడం (తిరస్కరణ)','బాహ్య రచన శీర్షికలను అనువదించి శోధనయోగ్యత కోల్పోవడం (తిరస్కరణ)'];
alternatives['TE-T320']=['తార్కిక అనుగమనం, తార్కిక సత్యం పూర్వ పదాలు కొనసాగించి, బీ గ్రేడ్ కథను ఏ గ్రేడ్ రికార్డుతో స్పష్టంగా భేదించడం (ఎంపిక)','అనుభవ కథనే నిర్ధారిత విద్యా రికార్డుగా చూపడం (తిరస్కరణ)','అనుగమనం, సత్యం రెండింటినీ ఒకే భావంగా కలపడం (తిరస్కరణ)'];
alternatives['TE-T321']=['ట్యూరింగ్ యంత్రం-చర్చ్ ఫలిత ప్రాధాన్యం, ఎనిగ్మా/బాంబ్-లోరెన్జ్/కొలోసస్ భేదం, ఆత్మహత్య సంభావ్యతను మూల మేరకు నిలపడం (ఎంపిక)','ఆత్మహత్యను నిర్ధారిత వాస్తవంగా చెప్పడం (తిరస్కరణ)','రెండు గూఢలిపి యంత్రాలను ఒకటిగా కలపడం (తిరస్కరణ)'];
alternatives['TE-T322']=['సెర్మెలో అని తాజా సమితి అధ్యాయ రూపం ఎంచుకొని, 1904 ఎంపిక స్వయంసిద్ధం-1908 స్వయంసిద్ధీకరణ భేదం నిలపడం (ఎంపిక)','పూర్వ జెర్మెలో/సెర్మెలో భేదాన్ని ధృవీకరిత ఏకరూపంగా చూపడం (తిరస్కరణ)','రెండు చారిత్రక ఘట్టాలను ఒకే సంవత్సరానికి మార్చడం (తిరస్కరణ)'];
alternatives['TE-T323']=['అధ్యాయ శీర్షిక, టిమ్ బటన్ చారిత్రక ఉపోద్ఘాత క్రెడిట్ అనువదించి ఆరు దిగుమతులు నిలపడం (ఎంపిక)','సంపాదకీయ మూల క్రెడిట్‌ను తొలగించడం (తిరస్కరణ)','దిగుమతి మార్గాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T324']=['అనంతసూక్ష్మం/అవకలనం/వ్యుత్పన్నం వేరు చేసి, మూడు త్రిభుజాల పాదం-వాలు సంబంధం, శూన్య భాగహారం సందిగ్ధం నిలపడం (ఎంపిక)','చిన్న ధన beta ఉజ్జాయింపునే ఖచ్చిత వాలుగా చెప్పడం (తిరస్కరణ)','రంగు టోకెన్లను తొలగించి చిత్ర సూచన కోల్పోవడం (తిరస్కరణ)'];
alternatives['TE-T325']=['రంధ్రిత పరిసర పరిమితి, |x| రెండు వైపుల వాలు భేదం, అవకలనీయత/అవిచ్ఛిన్నత వేరు చేసి మూడు మూల లోపాలు ప్రకటించడం (ఎంపిక)','కేంద్ర బిందువు విలువను సాధారణ పరిమితికి తప్పనిసరిగా కోరడం (తిరస్కరణ)','స్థిర వ్యుత్పన్నమే బీటాతో మారుతుందనడం (తిరస్కరణ)'];
alternatives['TE-T326']=['స్థలాన్ని నింపే పియానో పటానికి అవిచ్ఛిన్నత, సున్నితత్వం కానిదని స్పష్టం చేసి కాంటర్/హిల్బర్ట్ చరిత్ర నిలపడం (ఎంపిక)','సున్నితమైన వక్రరేఖ చతురస్రాన్ని నింపగలదని మూల పొరపాటును పునరుక్తి చేయడం (తిరస్కరణ)','ఆరు చిత్ర దశలను వదలడం (తిరస్కరణ)'];
alternatives['TE-T327']=['కాంటర్ మాటకు లేఖ సందర్భం, హిల్బర్ట్ చిత్రాలతో అంతఃప్రజ్ఞ ఉపయోగం, అతిశయ ప్రచారం హెచ్చరిక నిలపడం (ఎంపిక)','కాంటర్ తన ఫలితాన్ని నమ్మలేదని ఖచ్చితంగా ప్రకటించడం (తిరస్కరణ)','ప్రచురిత నిరూపణల్లో చిత్రాలేవీ లేవని చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T328']=['ద్వియాంశ రూప ఎంపికతో మొత్తం-సమితి అంతఃక్షేపణను, నిజమైన అధిక్షేపణేతర ఉదాహరణను ప్రకటించడం (ఎంపిక)','మూలంలోని 0.1010... విలువ బింబం బయట ఉందని పునరుక్తి చేయడం (తిరస్కరణ)','1.000... రూపంతో అసంపూర్ణ పటాన్ని అలాగే ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T329']=['హిల్బర్ట్ అనౌపచారిక నిర్మాణాన్ని చిత్రాలతో నిలిపి, నాలుగు మూల-నిరూపణ ఖాళీలను ప్రకటించడం (ఎంపిక)','బిందువువారీ అభిసరణ నుంచే స్థలపూరకత, అవిచ్ఛిన్నత నిరూపితమని ప్రకటించడం (తిరస్కరణ)','మూల చిత్రాలు/గడి వాదనను పూర్తిగా తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T330']=['సూచిక భాగ శీర్షిక, అనుబంధ జాబితాల సంపాదకీయ పరిచయం (ఎంపిక)','Reference అనే ఆంగ్ల శీర్షికనే ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T331']=['గ్రీకు అక్షరాల పేర్లకు తెలుగు లిప్యంతరీకరణ, గణిత చిహ్నాలకు మూలరూపం (ఎంపిక)','ఆంగ్ల పేర్లను మార్పులేకుండా ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T332']=['ఫ్రాక్టూర్ వర్ణమాల అనే తెలుగు శీర్షిక, చిహ్న పట్టిక యథాతథం (ఎంపిక)','చిహ్నాల లాటిన్/ఫ్రాక్టూర్ జతలను తెలుగులోకి మార్చడం (తిరస్కరణ)'];
alternatives['TE-T333']=['నిరూపణీయత/సామాన్యీకరణ మూల దశలను నిలిపి ఐదు గుర్తించిన తప్పులను పక్కనే ప్రకటించడం (ఎంపిక)','తప్పు ప్రదర్శిత సూత్రాలను నిజమైన నిరూపణలుగా ప్రకటించడం (తిరస్కరణ)','ట్యాగు శాఖలు, సాధనలను తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T334']=['గరిష్ఠ అవైరుధ్య సమితి నిర్వచనం, సభ్యత్వ మూసివేత లక్షణాలను మూల ట్యాగులతో నిలపడం (ఎంపిక)','గరిష్ఠ సమితి విస్తరణను ఈ విభాగంలోనే పూర్తిగా నిరూపించామని చెప్పడం (తిరస్కరణ)','ట్యాగు ఆధార నిరూపణ శాఖలను తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T335']=['వాక్యనిర్మాణం, అర్థవిచారం, సంతృప్తి, అనుగమనం పదాలను పూర్వ విభాగాలకు అనుగుణంగా ఉంచడం (ఎంపిక)','semantic validity, entailmentలను రెండింటినీ ఒక్క చెల్లుబాటు పదంగా కుదించడం (తిరస్కరణ)'];
alternatives['TE-T336']=['తెలుగు అధ్యాయ శీర్షికతో అన్ని దిగుమతుల మూల క్రమం నిలపడం (ఎంపిక)','దిగుమతి పేర్లను స్థానికీకరించి TeX పథాలు విరగొట్టడం (తిరస్కరణ)'];
alternatives['TE-T337']=['Qలో ప్రతినిధీకరణ, బాహ్య ఆగమన, సంయోజన/అపరిమిత శోధన సూత్రాలు మూలరూపంలో నిలపడం (ఎంపిక)','మూలపు భాగిక లెమ్మా నిరూపణను సంపూర్ణమని ప్రకటించడం (తిరస్కరణ)','ప్రదర్శిత సూత్రాలను వివరణ లేక తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T338']=['C వర్గ మూల ప్రమేయాలు, సంవృత క్రియలు, మొత్తం ఫలిత పరిమితి నిలపడం (ఎంపిక)','regular అనే పరిమితిని తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T339']=['ప్రతిపాదనను సత్యమయ్యే లోకాల సమితిగా, ఆరు ఆగమన కేసులతో ఉంచడం (ఎంపిక)','సాధనగా ఉన్న సత్య తుల్యతకు కల్పిత నిరూపణ జోడించడం (తిరస్కరణ)'];
alternatives['TE-T340']=['జాబితాను కుడివైపు మడత/సంచయకం రూపంలో వివరిస్తూ Sum/Len పదాలు నిలపడం (ఎంపిక)','Len సాధన సమాధానాన్ని మూలంలో లేనప్పటికీ చేర్చడం (తిరస్కరణ)'];
alternatives['TE-T341']=['మూల తునకలోని alpha-మార్పు పరిచయం అనువదించి లేని నియమాన్ని ప్రకటించడం (ఎంపిక)','వాగ్దానం చేసిన నియమాన్ని మూలంలో ఉన్నట్లు కల్పించడం (తిరస్కరణ)'];
alternatives['TE-T342']=['సమాంతర మొదటిస్థాయి సీక్వెంట్ అనువాదాన్ని సమాన మూల పాఠ్యానికి పునర్వినియోగించి భాగ ID మార్చడం (ఎంపిక)','సమాన పాఠ్యాన్ని కొత్త అసంగత పదాలతో మళ్లీ అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T343']=['అప్రమాణ నమూనా బ్లాక్ నిర్మాణాన్ని నిలిపి నాలుగు మూల లోపాలను పక్కనే సరిచేసి ప్రకటించడం (ఎంపిక)','ప్రతి xతో భాగింపు అసత్య వాక్యాన్ని అలాగే అంగీకరించడం (తిరస్కరణ)','ఒకే బ్లాక్‌లోని x<yనూ బ్లాక్‌ల కఠిన క్రమంగా ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T344']=['మోడల్ తర్కానికి ఏకరీతి ప్రతిస్థాపన, సాధారణతకు K/Dual/అనివార్యతీకరణను విడిగా ఉంచడం (ఎంపిక)','సాధారణతను కేవలం K స్వీకృతానికి తగ్గించడం (తిరస్కరణ)'];
alternatives['TE-T345']=['అత్యధిక స్థాయి కట్ సంక్షేపణం, CutCS విలోమయోగ్యత, గుర్తించిన సంభవాల విధానాన్ని మూల వృక్షాలతో నిలపడం (ఎంపిక)','కట్-స్థాయి వాదనను కేవలం అత్యున్నత కట్ తొలగింపుగా కుదించడం (తిరస్కరణ)','మూడు మూల లోపాలను నిశ్శబ్దంగా దాటవేయడం (తిరస్కరణ)'];
alternatives['TE-T346']=['అత్యున్నత కట్, కట్ ఎత్తు/స్థాయి, స్థానమార్పు, సంక్షేపణం వేర్వేరు భావాలుగా ఉంచడం (ఎంపిక)','కట్ ఎత్తు, స్థాయిలను ఒకే కొలమానంగా కుదించడం (తిరస్కరణ)','నిరూపణ వృక్షాల్లోని నాలుగు మూల లోపాలను ప్రకటించకుండా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T347']=['కట్ తొలగింపు తెలుగు అధ్యాయ శీర్షికతో దిగుమతుల మూల క్రమం నిలపడం (ఎంపిక)','దిగుమతి TeX పేర్లను తెలుగులోకి మార్చి పథాలు విరగొట్టడం (తిరస్కరణ)'];
alternatives['TE-T348']=['అంతర్వర్తన ప్రమేయం, మధ్యవర్తి సూత్రం అనే భావపారదర్శక రూపాలు; చిహ్న పరిమితి స్పష్టంగా చెప్పడం (తాత్కాలిక ఎంపిక)','interpolantను అర్థవివరణ లేక కేవలం లిప్యంతరం చేయడం (తిరస్కరణ)','బెత్/రాబిన్సన్ మూల వాదనలోని ఆరు లోపాలను మౌనంగా వదిలేయడం (తిరస్కరణ)'];
alternatives['TE-T349']=['కట్ తొలగింపు, అనుమతిత నియమం, సందర్భం పంచుకునే కట్ భేదాలు నిలపడం (ఎంపిక)','Cut, CutCSలను ఒకే చిత్ర లేబుల్‌గా వాడడం (తిరస్కరణ)','నిర్మాణాత్మక అన్వయాన్ని కేవలం ఉనికి వాదనగా కుదించడం (తిరస్కరణ)'];
alternatives['TE-T350']=['సహాయక తునకను పూర్తి అనువదించి రెండు ఖచ్చిత సంకేతాలను సరిచేసి, మిగిలిన నిరూపణ అసంగతిని ప్రకటించడం (ఎంపిక)','అసంగత వృక్షాన్ని నిర్ధారిత ప్రమేయ నిరూపణగా చెప్పడం (తిరస్కరణ)','తునకను formal-only అని అనువాదం నుంచి వదిలేయడం (తిరస్కరణ)'];
alternatives['TE-T351']=['మధ్యసీక్వెంట్, ప్రీనెక్స్, హెర్బ్రాండ్ వియోజనం పదాలను భావవివరణతో నిలపడం (ఎంపిక)','పరిమాణీకరణిక నిగమనాల క్రమాన్ని నిరూపణ ఎత్తుతో కలపడం (తిరస్కరణ)','మూడు మూల లోపాలను మౌనంగా సరిచేసినట్టు చూపడం (తిరస్కరణ)'];
alternatives['TE-T352']=['నిరూపణలను అంటుకట్టడం, తెరిచి ఉన్న ఉపపత్తి, ఐగెన్ చరరాశి భేదాలు నిలపడం (ఎంపిక)','ప్రతిస్థాపిత ఉపపత్తి ఫలితంలోనూ తెరిచి ఉంటుందని చెప్పడం (తిరస్కరణ)','నాలుగు మూల లోపాలను మౌనంగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T353']=['సహజ నిగమనం, ప్రవేశ/తొలగింపు నియమాలు, ఉపపత్తి విసర్జనను వేర్వేరుగా నిలపడం (ఎంపిక)','ఉపపత్తి విసర్జనను సూత్ర తొలగింపుతో కలపడం (తిరస్కరణ)','మూలంలోని రెండు వ్యత్యాసాలను మౌనంగా సరిచేయడం (తిరస్కరణ)'];
alternatives['TE-T354']=['పరిచయ విభాగంతో సమానంగా సహజ నిగమనం శీర్షిక ఉంచడం (ఎంపిక)','అధ్యాయ దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T355']=['క్రమబద్ధమైన నిరూపణ, ఐగెన్ చరరాశి షరతు, శుభ్రమైన/అశుభ్రమైన నిగమనం భేదాలు నిలపడం (ఎంపిక)','అస్తిత్వ తొలగింపు వృక్షం స్థానంలో మూలంలోని పునరావృత సార్వత్రిక వృక్షాన్ని వదిలేయడం (తిరస్కరణ)','అత్యుపరి నిగమనం శుభ్రమైనా ఆగమనం తగ్గుతుందని భావించడం (తిరస్కరణ)'];
alternatives['TE-T356']=['N1 పట్టిక వృక్షాలు నిలిపి అస్తిత్వ ఐగెన్ స్థిరాంకం షరతును ఫలితం, తెరిచి మిగిలే ఉపపత్తులపై చెప్పడం (ఎంపిక)','పూర్వపక్షంలోనే ఐగెన్ స్థిరాంకం లేదనే అసాధ్య మూల వాక్యాన్ని నిలపడం (తిరస్కరణ)'];
alternatives['TE-T357']=['N2 పట్టికలో గుర్తులతో కూడిన సందర్భాలను నిలిపి పరిమాణీకరణిక మాక్రోలను ఏకరీతిగా చేయడం (ఎంపిక)','ఒకే శీర్షికలో forall, lforall రకాలను కలిపి ఉంచడం (తిరస్కరణ)'];
alternatives['TE-T358']=['ముఖ్య/ఉప పూర్వపక్షం, విసర్జన గుర్తు, తెరిచి ఉన్న ఉపపత్తి, నిరూపణ ఎత్తు భేదాలు నిలపడం (ఎంపిక)','ఉపపత్తుల విసర్జనను అన్ని సమాన రూపాలపై తప్పనిసరి చేయడం (తిరస్కరణ)','ఐదు మూల లోపాలను మౌనంగా సరిచేయడం (తిరస్కరణ)'];
alternatives['TE-T359']=['సీక్వెంట్-శైలి, సందర్భం, ఫలితభాగం, గుర్తు గల ఉపపత్తి భేదాలు నిలపడం (ఎంపిక)','N1/N2 ద్విదిశ మార్పిడిలో ఉపనిరూపణ గుర్తులను కలపడం (తిరస్కరణ)','మూడు మూల లోపాలను మౌనంగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T360']=['బహుసమితి అనురూపతను బహుళత్వ పరిమితితో, N2i గుర్తులతో కూడిన సందర్భాలుగా చూపడం (ఎంపిక)','G2i సందర్భాన్ని సాధారణ సమితిగా కుదించడం (తిరస్కరణ)','ఏడు మూల లోపాలను మౌనంగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T361']=['గుర్తుల తొలగింపు, ఖాళీ ఫలితభాగం, సాంప్రదాయిక అసత్య నియమం ప్రత్యేక సందర్భాలను వేర్వేరుగా నిలపడం (ఎంపిక)','అసత్య ఫలితాన్ని ఖాళీ ఫలితభాగంగా స్వయంచాలకంగా పరిగణించడం (తిరస్కరణ)','నాలుగు మూల లోపాలను మౌనంగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T362']=['సాధారణీకరణ, సాధారణ నిరూపణ, పక్కదారి, ఉపసూత్ర లక్షణం వేర్వేరు పదాలుగా నిలపడం (ఎంపిక)','పక్కదారిని ఏ నిరూపణలోనైనా తప్పనిసరి భాగంగా చూడడం (తిరస్కరణ)','చిత్రంలోని ఉపనిరూపణ గుర్తులను మౌనంగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T363']=['కట్ స్థాయి/పొడవు ఆగమనం, స్థానమార్పు/తగ్గింపు పరివర్తనలను వేర్వేరుగా ఉంచడం (ఎంపిక)','ఏ క్రమమైనా ఫలితాన్ని ఇస్తుందనే అదనపు వాదనను ఈ సంక్షిప్త ఆగమనంలోనే పూర్తిగా నిరూపించినట్లు చెప్పడం (తిరస్కరణ)'];
alternatives['TE-T364']=['మునుపటి విభాగాలతో సమానంగా సాధారణీకరణ శీర్షిక ఉంచడం (ఎంపిక)','TeX దిగుమతి పథాలను అనువదించడం (తిరస్కరణ)'];
alternatives['TE-T365']=['స్థానమార్పు పరివర్తన, స్వతంత్ర చరరాశి నియమం, అత్యుపరి గరిష్ఠ కట్ అనే వేర్వేరు భావాలను స్పష్టంగా ఉంచడం (ఎంపిక)','మూలంలోని తప్పు సంయోజకాన్ని లేదా నియమచిహ్నాన్ని మౌనంగా అనుసరించడం (తిరస్కరణ)'];
alternatives['TE-T366']=['తగ్గింపు పరివర్తనను పక్కదారి పరివర్తనకు ప్రధాన పేరుగా, రెండవదాన్ని ప్రత్యామ్నాయ పేరుగా ఉంచడం (ఎంపిక)','స్థానమార్పు పరివర్తనతో ఈ దశను కలిపేయడం (తిరస్కరణ)'];
alternatives['TE-T367']=['ఖండం, కట్, కట్ స్థాయి, కట్ పొడవు వేర్వేరు నిర్వచనాలుగా ఉంచడం (ఎంపిక)','పొడవు ఒకటైన అన్ని ఖండాలనూ ప్రవేశ నియమంతో మాత్రమే కట్‌గా వర్ణించడం (తిరస్కరణ)'];
alternatives['TE-T368']=['శాఖ, ప్రధాన శాఖ, సందర్భ అనురూపతలను నిర్వచనాల ద్వారా స్పష్టంగా వేరు చేయడం (ఎంపిక)','తెరిచి ఉన్న ఊహలను ఉపసూత్ర లక్షణ పరిధి నుంచి తొలగించడం (తిరస్కరణ)'];
alternatives['TE-T369']=['విఫల శాఖ, పద నమూనా, నిరూపణ అన్వేషణ సంపూర్ణతను నిర్వచిత సాంకేతిక పదాలుగా వేరు చేయడం (ఎంపిక)','ముగియని అన్వేషణలో విఫల శాఖను కేవలం పరిమిత శాఖగా భావించడం (తిరస్కరణ)'];
alternatives['TE-T370']=['నిరూపణ అన్వేషణ, వెనుకకు నియమ వర్తింపు, వెనక్కి వచ్చి మళ్లీ ఎంపిక అనే వివరణాత్మక పదాలు (ఎంపిక)','నిరూపణ తనిఖీనే నిరూపణ కనుగొనడంగా చూపడం (తిరస్కరణ)'];
alternatives['TE-T371']=['మునుపటి విభాగంతో సమానంగా నిరూపణ అన్వేషణ శీర్షిక (ఎంపిక)','దిగుమతి పథాలను భాషా పదాలుగా మార్చడం (తిరస్కరణ)'];
alternatives['TE-T372']=['కొత్త స్థిరాంకం షరతును పైనున్న శాఖలో కనిపించకపోవడంగా స్పష్టీకరించడం (ఎంపిక)','స్థిరాంకం మొత్తం భాషలో ఎన్నడూ వాడకూడదని బలపరచడం (తిరస్కరణ)'];
alternatives['TE-T373']=['fairnessను ప్రతి సూత్రానికి అవసరమైనన్ని తగ్గింపు అవకాశాలు వచ్చే నిబంధనగా వర్ణించడం (ఎంపిక)','కొత్త సూత్రానికి పాత గరిష్ఠ సూచికను మళ్లీ కేటాయించడం (తిరస్కరణ)','పునర్వినియోగ పదం కేటాయించిన స్థిరాంక సమితి వెలుపల ఉండవచ్చని అనుకోవడం (తిరస్కరణ)'];
alternatives['TE-T374']=['చిహ్నిత టాబ్లో, అర్థవిచార టాబ్లో, మూసుకున్న శాఖ, సత్య వృక్షం వేర్వేరు భావాలుగా ఉంచడం (ఎంపిక)','సత్యంగా చిహ్నితమైన అసత్య సూత్రం ఉన్న శాఖను తెరిచి ఉన్న నమూనా శాఖగా చూడడం (తిరస్కరణ)'];
alternatives['TE-T375']=['నిరూపణ సిద్ధాంతం శీర్షికను, మూల సంపాదకీయ పరిమితిని నిలపడం (ఎంపిక)','మూల PDF స్థితిని ప్రస్తుత తెలుగు విడుదల స్థితిగా ప్రకటించడం (తిరస్కరణ)'];
alternatives['TE-T376']=['రకం, ప్రయోగం, లబ్ధ/యోగ రకాలు అనే నిర్వచనాత్మక పదాలు (ఎంపిక)','ప్రయోగ పదాన్ని ప్రమేయాల సమ్మేళన పదంగా పిలవడం (తిరస్కరణ)'];
alternatives['TE-T377']=['సాధారణీకరణ, బలమైన సాధారణీకరణ, సంగమ లక్షణాలను వేరు చేయడం (ఎంపిక)','మూల అసంపూర్ణ వాదనలను పూర్తి నిరూపణలుగా ప్రకటించడం (తిరస్కరణ)'];
const lines=(kind,loc)=>{
 const base=path.join(root,kind==='source'?'upstream':'translation',loc.path);
 const all=fs.readFileSync(base,'utf8').split(/\r?\n/),start=loc[kind+'_start'],end=loc[kind+'_end'];
 return all.slice(start-1,end).join('\n');
};
const detailedLocation=loc=>{
 const sourceText=lines('source',loc);
 const normalizedSource=sourceText.normalize('NFC');
 const sourceIndex=normalizedSource.indexOf(loc.source_needle.normalize('NFC'));
 if(sourceIndex<0)throw new Error('Source locator mismatch '+loc.path+':'+loc.source_start);
 const sourceLine=loc.source_start+normalizedSource.slice(0,sourceIndex).split('\n').length-1;
 const segment=ledger.find(s=>s.source_path===loc.path&&s.source_start_line<=sourceLine&&s.source_end_line>=sourceLine);
 if(!segment)throw new Error('No aligned segment for '+loc.path+':'+loc.source_start);
 return {unit_id:segment.unit_id,section_path:loc.path.replace(/^content\//,'').replace(/\.tex$/,''),source_file:loc.path,target_file:`translation/${loc.path}`,segment_id:segment.segment_id,source_locator:`${loc.path}:${segment.source_start_line}${segment.source_end_line===segment.source_start_line?'':'-'+segment.source_end_line}`,target_locator:`translation/${loc.path}:${segment.target_start_line}${segment.target_end_line===segment.target_start_line?'':'-'+segment.target_end_line}`,source_unit_sha256:segment.source_unit_sha256,translation_unit_sha256:segment.translation_unit_sha256,source_segment_sha256:segment.source_segment_sha256,translation_segment_sha256:segment.translation_segment_sha256,final_printed_page:null,pagination_status:'pending_coherent_reader_pagination'};
};
alternatives["TE-T378"]=["నిరూపణ పదం; నిర్మాణ చిహ్నం/నిర్మాత; విచ్ఛేదకం; విడుదల గుర్తు; సరైన నిరూపణ పదం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T379"]=["నిరూపణ-పద మార్పిడి; సందర్భంలో సాక్ష్యం ఇవ్వడం; నిరూపణ ఎత్తు; లాంబ్డా అమూర్తీకరణ (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T380"]=["రకాలుగా ప్రతిపాదనలు; ప్రయోగాత్మక ముసాయిదా; క్రమమార్పు, సరళీకరణ పరివర్తనలు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T381"]=["తగ్గింపు; కట్; రెడెక్స్; సంకోచన ఫలితం; బీటా తగ్గింపు; క్రమమార్పు పరివర్తన; సాధారణ రూపం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T382"]=["పదాలతో గుర్తించిన సహజ నిగమన నియమాలు; అక్షయం; సందర్భాల సమ్మేళనం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T383"]=["రక కేటాయింపు నియమాలు; ఒకే సందర్భం; అక్షయ సభ్యత్వ షరతు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T384"]=["సీక్వెంట్ సహజ నిగమనం; విడుదల చేయని ఊహలు; సందర్భాల సమ్మేళనం; ఊహ విడుదల (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T385"]=["నిరూపణ పునర్నిర్మాణం; స్వేచ్ఛా చర సందర్భం; పూర్వపక్షం; ప్రక్షేపణ (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T386"]=["రక సంరక్షణ; పురోగతి; సరిగ్గా రకీకరించిన పదం; ముందుకు సాగలేని గణన స్థితి (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T387"]=["రకం; సందర్భం; రక అనన్యత; సరిగ్గా రకీకరించిన పదం; లబ్ధ, యోగ, ఖాళీ రకాలు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T388"]=["అనుమతించదగిన నియమం; వ్యుత్పాదించదగిన నియమం; పథకాత్మక నిరూపణ; ఎత్తు-సంరక్షక అనుమతించదగినత; బలహీనీకరణ (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T389"]=["నియమాల అర్థవ్యాఖ్యానం; సత్య షరతు; ప్రధాన సూత్రం; సందర్భాన్ని పంచుకోవడం; నిర్మాణ నియమాలు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T390"]=["సీక్వెంట్ కలనశాస్త్రం; బహుసమితి; బాహుళ్యం; పూర్వపక్షం; ఉత్తరపక్షం; కట్-తొలగింపు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T391"]=["విలోమ్యత; ఎత్తు-సంరక్షక విలోమం; ప్రధాన సూత్రం; స్వీయచర తాజాతనం; సంకోచన అనుమతించదగినత (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T392"]=["వెనుక దిశలో నిరూపణ అన్వేషణ; పథకాత్మక నిరూపణ; సూత్ర లోతు; పరమాణు స్వీయ సీక్వెంట్; స్వీయచర షరతు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T393"]=["నియమిత నిరూపణ; స్వీయచర షరతు; బంధనంలో చిక్కని ప్రతిస్థాపన; శుభ్ర, అశుభ్ర నిగమనం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T394"]=["సాంప్రదాయ G1c నియమాలు; నిర్మాణ నియమాలు; స్వీయచర షరతు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T395"]=["అంతఃప్రజ్ఞావాద సీక్వెంట్ నియమాలు; ఒకే ఉత్తరపక్ష సూత్రం; కనిష్ఠ రూపం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T396"]=["స్వతంత్ర సందర్భాల G2c నియమాలు; బహుసమితి సమ్మేళనం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T397"]=["G3c నియమాలు; పరమాణు స్వీయ అక్షయం; అసత్య ఎడమ అక్షయం; నిలిచే ప్రధాన సూత్రం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T398"]=["G3i నియమాలు; అంతఃప్రజ్ఞావాద వియోగ ప్రవేశం; ఒకే ఉత్తరపక్ష సూత్రం; స్వీయచర తాజాతనం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T399"]=["LK నియమాలు; వరుస సందర్భం; స్థాన మార్పిడి; నిర్మాణ నియమం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T400"]=["బహుళ-నిర్ధారణల అంతఃప్రజ్ఞావాద కలనశాస్త్రం; పరిమిత కుడి నియమాలు; మూల వ్యవస్థ-సూచన ఖాళీ (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T401"]=["పూర్వపక్షం; నిష్కర్ష; సందర్భం; పార్శ్వ సూత్రం; ప్రధాన సూత్రం; క్రియాశీల సూత్రం; ఈగెన్‌చరం; నిరూపణ ఎత్తు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T402"]=["సీక్వెంట్ కలనశాస్త్రం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T403"]=["నిరూపణ రూపాంతరం; నియమ అనుకరణ; నిలుపుకున్న ప్రధాన సూత్రం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T404"]=["గరిష్ఠ సంగత సమితి; సత్య ఉపసిద్ధాంతం; సంపూర్ణత; సంహతత (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T405"]=["సార్థకత; మోడస్ పోనెన్స్; అర్థాత్మక నిగమనం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T406"]=["ద్వితీయ క్రమ సంబంధ చరం; ద్వితీయ క్రమ ప్రమేయ చరం; విలువ కేటాయింపు ఆధారిత వ్యక్తీకరణ (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T407"]=["సమరూపణం; నిర్మాణాన్ని నిలుపుకునే ద్వైక్యం; ఉత్తరవర్తి సంబంధం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T408"]=["ఆగమనం; ప్రమేయం కింద సంవృతత; ప్రమేయం కింద లక్షణం నిలుపుదల; ఆధార దశ; ఆగమన దశ (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T409"]=["సంబంధాలు (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T410"]=["సమితులు; సంబంధాలు; ప్రమేయాలు; అమాయక సమితి సిద్ధాంతం (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T411"]=["సమితుల శోషణ; మూలకాలవారీ నిరూపణ; సందర్భాలవారీ నిరూపణ (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
alternatives["TE-T412"]=["సమితుల పరిమాణం; గణన; గణనీయత; అగణనీయత (definition-controlled choice)","Leaving reader-visible explanatory prose untranslated (rejected)"];
const phase='Evidence reconstruction through 2026-09-28 from the current primary TERM_DECISIONS, aligned segment ledger, canonical-passage records and exact source/target bytes; earlier records are not represented as contemporaneous pre-draft notes, while TE-T064--TE-T412 record the Batch 025--Batch 371 consultations performed during reconciliation. The 2026-09-25 classification repair restores reader-visible headings and token statements to linguistic segments using recorded same-unit canon consultations.';
const notChecked=['No human Telugu logician, mathematician or copy editor has reviewed this choice yet.','No independent Telugu logic dictionary or comprehensive AP/Telangana higher-education terminology standard was checked unless it appears among the listed passage records.'];
const termRecords=terms.map(d=>{
 if(!locations[d.term_id])throw new Error('Missing review locations '+d.term_id);
 const checked=(d.passages??[]).map(id=>{const p=passages[id];if(!p)throw new Error('Unknown passage '+id);return {passage_id:id,source_id:p.source_id,pdf_page:p.pdf_page,printed_page:p.printed_page,region:p.region,verified:p.verified,role:p.role};});
 const rationale=[d.basis,d.decision,d.scope,d.borrowing].filter(Boolean).join(' ');
 const uncertainty=d.uncertainty??`Not separately graded in the original record; evidence status is ${d.status}, and optional specialist review remains open.`;
 const confidence=/high/i.test(uncertainty)?'mixed_provisional':/low/i.test(uncertainty)?'moderate':'not_separately_graded';
 return {review_id:'REV-'+d.term_id,record_type:'terminology_or_sense_decision',scope_completion:completion,language:'Telugu',script:'Telu',locale:'te-Telu-IN',term_id:d.term_id,source_term:d.source_term,chosen_wording:d.telugu,chosen_sense:d.scope??'The precise extension is fixed by the adjacent OpenLogic definition and formulas.',evidence_status:d.status,confidence,review_priority:/high/i.test(uncertainty)?'high':'standard',expert_review_status:'provisional_pending_optional_specialist_review_no_hold',implementation_locations:locations[d.term_id].map(detailedLocation),actual_authorities_checked:checked,not_checked_or_not_found:notChecked,rationale,alternatives_considered_or_recorded:alternatives[d.term_id]??['No separate alternative was recorded in the primary decision; retain the current reversible wording unless a specialist supplies a source-grounded replacement.'],uncertainty,rationale_phase:phase,precise_review_questions:[`Please double-check whether “${d.telugu}” is idiomatic and technically standard for “${d.source_term}” in Telugu logic/mathematics across Andhra Pradesh and Telangana.`,`If not, what exact replacement should be used while leaving the displayed definition, formulas and source scope unchanged?`],translation_hold:false};
});
const correctionQuestions={
"OLTESFRINDINT-001":"Is the disclosure precise: Replace the erroneous leading 2k by k^2. Also localize the two reader-facing equation tags in the same display; disclose the combined display atom delta.",
"OLTESFRINDINT-002":"Does replacing every mathematical !!^a artifact by !A consistently preserve the intended induction template and its pairing with !B?",
"OLTENMLFRDST-002":"Does moving the closing math delimiter inside the tagged biconditional case restore TeX grouping without changing the standard-translation identity?",
"OLTESOLSYNLAN-001":"Is the disclosure precise: State the assignment-dependent translation using free relation/function variables, and disclose that quantifying them would change the proposition.",
 "OLTEPTSEQTR-001":"Is the disclosure precise: Attribute arbitrary identity axioms to G1c and preserve the G3c provability citation, with a reader-visible disclosure.",
 "OLTEPTSEQTR-002":"Is the disclosure precise: Remove the misdirected citation; explicitly weaken the missing conjunct/disjunct then apply the G3c rule, using the already cited G3c weakening admissibility.",
 "OLTEPTSEQTR-003":"Is the disclosure precise: Supply both bounded quantifier simulations: weaken in the principal before applying the G3c rule in the forward direction; apply G1c with the retained principal in context and contract the duplicate principal in the reverse direction (blocks 10 and 12).",
 "OLTEPTSEQTR-004":"Is the disclosure precise: Delete the duplicated comma, preserving all formulas and rule labels.",
 "OLTEPTSEQRP-001":"Is the disclosure precise: Describe height as the maximum number of inference steps/tree edges on an end-to-initial path, preserving the recursive definition and documenting the clarification.",
 "OLTEPTSEQRP-002":"Is the disclosure precise: Replace the second succedent D by E and disclose that only antecedent order changes.",
 "OLTEPTSEQMG3I-001":"Is the disclosure precise: Insert the context separator.",
 "OLTEPTSEQMG3I-002":"Is the disclosure precise: Retain the names as an attributed source remark and disclose the unresolved definition/reference; do not invent or certify a minimal-system definition.",
 "OLTEPTSEQMG3I-003":"Is the disclosure precise: Give this table its own tab:mG3i label.",
 "OLTEPTSEQLK-001":"Is the disclosure precise: Give the sequence-based table its own tab:LK label.",
 "OLTEPTSEQG3I-001":"Is the disclosure precise: Use the indexed right-disjunction schema with one premise summand Ai and conclusion A1 or A2, for i=1,2.",
 "OLTEPTSEQG3I-002":"Is the disclosure precise: Insert the multiset separator.",
 "OLTEPTSEQG3I-003":"Is the disclosure precise: Align this G1m/G1i side reference with the preceding G1i table: remove right weakening and the actual falsity base axiom.",
 "OLTEPTSEQG3I-004":"Is the disclosure precise: Give this table the distinct tab:G3i label.",
 "OLTEPTSEQG3C-001":"Is the disclosure precise: Insert the context separator.",
 "OLTEPTSEQG1I-001":"Is the disclosure precise: Give the G1i table its own tab:G1i label.",
 "OLTEPTSEQG1I-002":"Is the disclosure precise: Name the actual displayed falsity base axiom while retaining removal of right weakening.",
 "OLTEPTSEQADM-004":"Does the weakening induction explicitly preserve the falsity-left axiom family as well as atomic identity axioms?",
 "OLTEPTSEQINV-007":"Do the inversion and contraction bases explicitly retain the falsity-left axiom family, including a remaining falsity occurrence after contraction?",
 "OLTEPTSEQQUA-001":"Is the disclosure precise: Use the universal-left labels in those two diagrams.",
 "OLTEPTSEQQUA-002":"Is the disclosure precise: Choose a highest dirty inference, justify regularity by cleanliness of upper inferences, and state a decrease of at least one.",
 "OLTEPTSEQQUA-003":"Is the disclosure precise: Separate the unchanged eigenvariable set and the inserted-term freshness statements without changing the mathematical content.",
 "OLTEPTSEQQUA-004":"Is the disclosure precise: Clarify capture-avoiding substitution with alpha-renaming of bound variables when needed.",
 "OLTEPTSEQEX-001":"Is the disclosure precise: Use the actual antecedent (C and D) implies E as Gamma.",
 "OLTEPTSEQEX-002":"Is the disclosure precise: Use the left-implication label.",
 "OLTEPTSEQEX-003":"Is the disclosure precise: Add the display command inside its existing display.",
 "OLTEPTSEQEX-004":"Is the disclosure precise: Keep E in the succedent of that weakening inference.",
 "OLTEPTSEQEX-005":"Is the disclosure precise: Name G3c in the not-yet-established claim.",
 "OLTEPTSEQEX-006":"Is the disclosure precise: Use the inner formula B in both quantified forms to agree with the recurrence.",
 "OLTEPTSEQEX-008":"Is the disclosure precise: Retain the common duplicated antecedent through right conjunction, then contract only on the left and retain the conjunction succedent; remove trailing commas.",
 "OLTEPTSEQEX-009":"Is the disclosure precise: State the needed premise-proof restriction instead of the irrelevant empty-context formula.",
 "OLTEPTSEQEX-010":"Is the disclosure precise: Use !D.",
 "OLTEPTSEQEX-011":"Is the disclosure precise: Use B,Gamma for the second antecedent context.",
 "OLTEPTSEQEX-012":"Is the disclosure precise: Explicitly restrict that depth observation to logical rules.",
 "OLTEPTSEQINV-001":"Is the disclosure precise: Keep n as premise count and use a separate height bound h.",
 "OLTEPTSEQINV-002":"Is the disclosure precise: Replace those two narrative conjunction occurrences by separate A,B antecedent entries.",
 "OLTEPTSEQINV-003":"Is the disclosure precise: Rename internal eigenvariables away from the inserted constant before substitution, here and in the later universal contraction example.",
 "OLTEPTSEQINV-004":"Is the disclosure precise: Retain every freshness condition of the lemma while applying the induction.",
 "OLTEPTSEQINV-005":"Is the disclosure precise: Use the universal-right label.",
 "OLTEPTSEQINV-006":"Is the disclosure precise: Restore B(t) in both places.",
 "OLTEPTSEQIRL-001":"Is the disclosure precise: Use true on the right or false on the left.",
 "OLTEPTSEQIRL-002":"Is the disclosure precise: Use the left XOR rule label.",
 "OLTEPTSEQIRL-003":"Is the disclosure precise: Restrict the necessity argument to distinct atomic placeholders and the last logical inference, setting aside redundant structural endings; keep the displayed construction unchanged.",
 "OLTEPTSEQADM-001":"Is the disclosure precise: Insert the multiset comma before Gamma.",
 "OLTEPTSEQADM-002":"Is the disclosure precise: Put A iff B in the antecedent of that rule conclusion.",
 "OLTEPTSEQADM-003":"Is the disclosure precise: Render the logical object as the end-sequent and disclose the source wording while preserving the protected token.",
 "OLTEPTPTYTYP-001":"Is the disclosure precise: Use the declared term N.",
 "OLTEPTPTYTYP-002":"Is the disclosure precise: Use x,y in the case constructor to match the branch contexts.",
 "OLTEPTPTYTYP-003":"Is the disclosure precise: State uniqueness conditional on existence of a type, and qualify the introductory reconstruction claim for correct proof terms.",
 "OLTEPTPTYTYP-004":"Is the disclosure precise: Refer to the distinct tab:tN3ip label repaired in the actual typing table.",
 "OLTEPTPTYTYP-005":"Is the disclosure precise: Clarify that contexts are single-valued assignments and alpha-rename binders to fresh names before extending them, while still allowing extra unused variables.",
 "OLTEPTPTYSND-001":"Is the disclosure precise: Align the second conjunct with B in both opening expressions.",
 "OLTEPTPTYSND-002":"Is the disclosure precise: Keep the declared B assumption in each affected context, derive falsity twice, and discharge B only at the end.",
 "OLTEPTPTYTN3-001":"Is the disclosure precise: Give the tN3 table its own tab:tN3ip label and align the types-section reference.",
 "OLTEPTPTYRED-001":"Is the disclosure precise: Use separate arguments N1 and N2.",
 "OLTEPTPTYRED-002":"Is the disclosure precise: Use the optional type annotation plus index and term.",
 "OLTEPTPTYRED-003":"Is the disclosure precise: Use A_(3-i), preserving the branch selection and substitution. This gather expression was inspected directly; the existing parser reports no delta for it.",
 "OLTEPTPTYRED-004":"Is the disclosure precise: Write the third term M3.",
 "OLTEPTPTYTER-001":"Is the disclosure precise: Use the declared second premise M in the constructor.",
 "OLTEPTPTYTER-002":"Is the disclosure precise: Supply the existing premise term N as its argument.",
 "OLTEPTPTYTER-003":"Is the disclosure precise: Use the declared proof term N.",
 'OLFUN-001':'Does the Telugu correction state the exact condition “A nonempty or B empty” and make the empty-domain counterexample immediately clear?',
 'OLFUN-002':'Is “nonnegative (principal) square root” rendered unambiguously while preserving the separate positive-integer statement?',
 'OLFUN-003':'Is the alpha-equivalent n-to-x normalization disclosed clearly without suggesting a mathematical change?',
 'OLFUN-004':'Does the note clearly distinguish a relation between A and B, a subset of A×B, from a relation on A×B?',
 'OLFUN-005':'Does the note clearly distinguish input-only function restriction from two-coordinate relation restriction R∩C²?',
 'OLSIZ-001':'Does the repaired table visibly place -3 beneath f(7), with the note tied to the controlling ceiling formula?',
 'OLSIZ-002':'Does the Telugu cofinite definition unambiguously describe a complement in Nat of a finite subset of Nat?',
 'OLSIZ-003':'Does the alternate pairing prose advance from the (2,m) family to the (3,m) family exactly as the table does?',
 'OLTESIZ-001':'Does the Telugu editorial note clearly identify the source adjective typo without overstating its importance?',
 'OLTESIZ-002':'Does the triangular-number explanation now say at most k while preserving k(k+1)/2?',
 'OLTESIZ-003':'Does the repaired exercise distinguish the inverse on ran(f) from an enumeration whose domain is all of Nat?',
 'OLTESIZ-004':'Does the repaired first-row procedure identify (0,1) as the second pair, matching the table?',
 'OLSIZ-004':'Does the Telugu characteristic-sequence definition use one bound output name consistently and preserve the intended subset-to-sequence map?',
 'OLSIZ-005':'Does the repaired h(n) example visibly denote an infinite binary sequence while preserving the reduction-direction warning?',
 'OLSIZ-006':'Do both empty-set branches refer to the given bijection f rather than the not-yet-defined enumeration g?',
 'OLSIZ-007':'Does the Cantor proof quantify its diagonal conclusion over every x in A and make non-surjectivity immediate?',
 'OLSIZ-008':'Does the Telugu prose identify s_n(m) as the mth digit of the nth string, matching the array?',
 'OLSIZ-009':'Does the diagonal construction state the complementary 1-to-0 and 0-to-1 changes unambiguously?',
 'OLSIZ-010':'Does the alternate characteristic-string definition use one bound output name consistently?',
 'OLTEARITH-001':'Does the rational-order explanation use s-r consistently with both controlling occurrences and preserve the nonnegative-numerator, positive-denominator condition?',
 'OLTEARITH-002':'Does the Telugu note make clear that only a stray less-than character was removed from ordinary prose?',
 'OLTEARITH-003':'Does the multiplication formula use the embedded real zero 0_Real consistently with the surrounding construction?',
 'OLTEARITH-004':'Does the completeness proof correctly attribute existence of a member of S to non-emptiness rather than boundedness?',
 'OLTEARITH-005':'Does the Cauchy construction distinguish the equivalence relation from the real objects, which are its equivalence classes?',
 'OLTEARITH-006':'Is positivity of a represented real compared with 0_Real rather than the differently typed 0_Rat?',
 'OLTEARITH-007':'Do the ordered-field theorem and exercise state the result for equivalence classes rather than raw Cauchy sequences?',
 'OLTEARITH-008':'Is S consistently a family of representative sequences while every ordered object is its represented equivalence class?',
 'OLTEINF-001':'Does condition 3-prime explicitly require the least successor-closed set to contain zero, ruling out the empty set?',
 'OLTEINF-002':'Does the closure definition bind one ambient set A, a self-map f:A-to-A, its base point o in A and candidate subsets X of A consistently?',
 'OLTEINF-003':'Does the induction proof apply closure minimality to N-intersection-X rather than to an arbitrary set X outside the self-map domain?',
 'OLTEINF-004':'Does the set-closure definition bind one ambient U, a self-map on U, a base subset of U and closure candidates contained in U?',
 'OLTEINF-005':'Please double-check that the qualified note correctly explains the valid nested cardinality chain and that the two explicit target comparisons are mathematically equivalent without retaining the rejected source-error claim.',
 'OLTEINF-006':'Does the proof establish both inclusions needed for ran(g)=B, including the formerly missing ran(g)-subset-B direction?',
 'OLTEPLSYN-001':'Does the Telugu disclosure identify the malformed nested tag arms and make clear that only their brace/empty-arm closure was repaired?',
 'OLTEMVLSYN-001':'Does the final defTrue tag test close its empty false arm before the outer defined-symbol block closes, without changing the displayed connective list?',
 'OLTEMVLSUB-001':'Does the proposition and corollary now apply only to the variable-generated fragment using the four controlled connectives, with the uncontrolled lfalse counterexample disclosed?',
 'OLTEMVLSUB-002':'Does the final countervaluation satisfy Gamma and fail to satisfy B using the previously defined satisfaction relation, without putting a valuation on the left of formula-set entailment?',
 'OLTEMVLLUK-001':'Does the second conjunction term now reverse the False and Undef inputs, as the adjacent truth table requires?',
 'OLTEMVLLUK-002':'Does the standard L_0 matrix explicitly interpret its falsity constant as False, while disclosing that the four printed tables alone do not force this editorial completion?',
 'OLTEMVLLUK-003':'Was only the unmatched last parenthesis removed from the first non-tautology exercise formula?',
 'OLTEMVLLUK-004':'Does the modal counterexample evaluate to False for p=Undef by the printed conjunction, Diamond and negation tables, with its non-tautology conclusion preserved?',
 'OLTEMVLKLE-001':'Is strong Kleene logic explicitly restricted to the variable-generated four-connective language, so the no-tautology theorem does not silently include a falsity constant?',
 'OLTEMVLKLE-002':'Is weak Kleene logic given the same explicit language restriction, with all four printed truth tables unchanged?',
 'OLTEMVLMUL-001':'Does LP inherit only the strong-Kleene four-connective language, without silently assigning a truth value to the missing falsity constant?',
 'OLTEMVLMUL-002':'Does Hallden extend the weak-Kleene four-connective fragment by plus while leaving the absent falsity constant unassigned?',
 'OLTEMVLMUL-003':'Is equality of LP and classical tautologies stated for their common four-connective language, as the proof requires?',
 'OLTEMVLMUL-004':'Does the induction base avoid equating v and v-prime on Undef and prove only preservation of definite False and True values?',
 'OLTEMVLMUL-005':'Do the false and true conjunction cases use B and C respectively, matching the strong Kleene table and their inductive conclusions?',
 'OLTEMVLMUL-006':'Is the shared-tautology claim scoped to the common four-connective language rather than treating Hallden plus-formulas as classical formulas?',
 'OLTEMVLINF-001':'Does the rational truth-value comprehension exclude a zero denominator while retaining every rational in the unit interval?',
 'OLTEMVLINF-002':'Does V_m now have exactly m evenly spaced values from zero through one for each m at least two, matching the printed V_5 example?',
 'OLTEMVLINF-003':'Is the falsity constant valued zero explicitly and disclosed as an editorial completion needed for the standard-language comparison?',
 'OLTEMVLINF-004':'Were only the two nested dollar delimiters removed from Gödel negation cases, with numeric outputs and conditions unchanged?',
 'OLTEMVLSEQ-001':'Does the left sequent list now end at A_m, matching its conjunction, while the right list still ends at B_n?',
 'OLTEMVLSEQ-002':'Was the missing valuation argument v restored only to the second initial-sequent evaluation, leaving its truth condition intact?',
 'OLTEMVLSEQ-003':'Does each Gamma_i correctly quantify over all n sides, consistent with the displayed sequent and later position-i rules?',
 'OLTEPLSYN-002':'Does the material-conditional abbreviation read exactly as not A or B after removal of the source’s unmatched closing parenthesis?',
 'OLTEPLSYN-003':'Does the formation-sequence proof use syntactic identity, rather than semantic equivalence, for literal identity of symbol strings?',
 'OLTEPLSYN-004':'Does Local Determination unambiguously restrict agreement to variables occurring in the one fixed formula A?',
 'OLTEPRF-001':'Does the general sequent use independent final indices m and n, consistently with either side being independently empty?',
 'OLTEPRF-002':'Does the false-conjunction tableau rule pass only the conjunction operator to the documented rule-label macro?',
 'OLTEPRF-003':'Are both children produced from the true conjunction on line 2 labelled with the true-conjunction rule and the same line reference?',
 'OLTEPRF-004':'Does the tableau inconsistency definition require every displayed finite premise B_i, rather than merely some one premise, to belong to Gamma?',
 'OLTESEQ-001':'Are all four steps that change only antecedent order labelled as left exchange while every displayed sequent remains unchanged?',
 'OLTESEQ-002':'Do both prose candidate premises contain not-A-or-not-B, matching the end-sequent and the two displayed inferences?',
 'OLTESEQ-003':'Does the editorial scope note identify the sequent calculus, consistently with the chapter path, identifiers and LK definitions?',
 'OLTESEQ-004':'Does the left-conjunction soundness case conclude that the full lower sequent A-and-B,Gamma entails Delta is valid?',
 'OLTESEQ-005':'Does the cut case use the residual sequent Pi entails Lambda rather than a set difference?',
 'OLTEND-001':'Please double-check that the repaired definition consistently treats every natural-deduction tree node as a sentence, not a sequent.',
 'OLTEND-002':'Please double-check that the contradiction step from not-A and A is labelled negation-elimination, matching both the defined rule and the later completed tree.',
 'OLTEND-003':'Please double-check that “the sentence in the conclusion” is the correct natural-deduction wording here, with no end-sequent object implied.',
 'OLTEND-004':'Please double-check that the FOL branch names a structure M and the propositional branch a valuation v, with both satisfaction readings preserved.',
 'OLTETAB-001':'Please double-check that the scope note names tableaux, rather than natural deduction, while preserving the chapter driver and imports.',
 'OLTETAB-002':'Please double-check that the initial tableau assumptions are three separate signed formulas: true A-or-B, false B, and false A.',
 'OLTETAB-003':'Please double-check that the reusable quantifier lines are identified as lines 1 and 4, matching the two completed tableaux.',
 'OLTETAB-004':'Please double-check that each finite premise family is displayed as a set contained in Gamma.',
 'OLTETAB-005':'Please double-check that Gamma_1 uses the same terminal index m in its definition and both later occurrences.',
 'OLTETAB-006':'Please double-check that true negation is applied to a true signed negation and that its conclusion is added on a fresh generic line.',
 'OLTETAB-007':'Please double-check that all eight repaired signed-formula nodes have both sign and formula arguments while leaving the displayed proof strategy unchanged.',
 'OLTETAB-008':'Please double-check that the true- and false-universal soundness cases use A consistently in their premises, conclusions, and satisfaction claims.',
 'OLTETAB-009':'Please double-check that the symmetry explanation identifies line 3 as true A(s_1), matching the displayed tableau.',
 'OLTETAB-010':'Please double-check that the transitivity explanation identifies line 2 as s_1 equals s_2, matching the displayed tableau.',
 'OLTETAB-011':'Please double-check that the true-equality soundness conclusion carries the true sign, with the analogous false case still stated separately.',
 'OLTETAB-012':'Please double-check that only the dangling comma after the two signed assumptions was removed and no tableau formula changed.',
 'OLTEAXD-001':'Please double-check that the transitivity proof consistently names the indexed formula as !B_i, matching the displayed concatenated derivation.',
 'OLTEAXD-002':'Please double-check that the length-one derivation case now states the complete membership proposition !B in Gamma union {!A}.',
 'OLTEAXD-003':'Please double-check that derived-facts item (a) has exactly the balanced parentheses required by its nested composition conditional.',
 'OLTEAXD-004':'Please double-check that the quantified meta-conditional closes both nested consequent parentheses without changing any connective.',
 'OLTEAXD-005':'Please double-check that the universal-quantifier case concludes Gamma proves A implies B, exactly matching the deduction theorem target.',
 'OLTEAXD-006':'Please double-check that reflexivity explicitly supplies Gamma proves not-A before the two modus-ponens applications.',
 'OLTEAXD-007':'Please double-check that the left conjunction projection uses ax:land1 and the right projection uses ax:land2.',
 'OLTEAXD-008':'Please double-check that not-A implies (A implies false) is attributed to ax:lnot2, not the contraposition axiom.',
 'OLTEAXD-009':'Please double-check that the last strong-generalization step uses the top axiom and modus ponens rather than invoking the deduction theorem again.',
 'OLTEAXD-010':'Please double-check that all three repaired B occurrences in the quantifier-soundness case carry the formula-metavariable marker.',
 'OLTEAXD-011':'Please double-check that reflexive identity is claimed only for closed terms, matching the stated scope of ax:id1.',
 'OLTECOM-001':'Please double-check that condition (b) ranges over every sentence, matching the complete-set definition rather than the source adjective atomic.',
 'OLTECOM-002':'Please double-check that the recalled universal formula retains the argument x_n in A_n(x_n), matching the surrounding Henkin formulas.',
 'OLTECOM-003':'Please double-check that the term-value lemma is explicitly restricted to closed terms, matching the term-model domain and proof.',
 'OLTECOM-004':'Please double-check that the universal Truth Lemma case concludes with forall x B(x), matching its case formula and preceding instances.',
 'OLTECOM-005':'Please double-check that both universal-case equivalences quantify over closed terms, matching the cited propositions.',
 'OLTECOM-006':'Please double-check that both existential-case equivalences require at least one closed term, matching the cited propositions.',
 'OLTECOM-007':'Please double-check that only the duplicate comma after t_(i+1) was removed from the function term and no argument changed.',
  'OLTECOM-008':'Please double-check that Gamma is typed as a set of sentences and A as one sentence in the Compactness Theorem statement.',
  'OLTECOM-009':'Please double-check that B is restored as the left operand of membership in Gamma_n, matching the scoped sentence and ensuing subset conclusion.',
  'OLTEFOLMAT-001':'Please double-check that the repaired strict-order formula gives its final v_2 the same object-language marker as the other variables, without changing any other symbol.',
  'OLTEFOLBYD-001':'Please double-check that the inner many-sorted universal now binds x with the same two optional arguments as the outer universal and that no other display symbol changed.',
  'OLTEFOLBYD-002':'Please double-check that the comprehension explanation uses the atomic-formula constructor for R(t_1,...,t_k), consistently with the surrounding rule.',
  'OLTEFOLBYD-003':'Please double-check that the second arithmetic axiom uses the declared postfix successor on x and y, rather than the source sentence’s undefined s.',
  'OLTEFOLBYD-004':'Please double-check that the lambda-bound x is assigned type tau, matching formation rule (6), while s remains type sigma.',
  'OLTEMODBAS-001':'Please double-check that the Telugu editorial reads the defective phrase as “is planning to work” while preserving the contributor and issue reference.',
  'OLTEMODBAS-002':'Please double-check that the relation-only substructure remark requires N to be non-empty, consistently with OpenLogic’s structure definition.',
  'OLTEMODBAS-003':'Please double-check that the value of the function term in M-prime uses the interpretation of f in M-prime.',
  'OLTEMODBAS-004':'Please double-check that the first function-term equality closes the outer h application with exactly one restored parenthesis.',
  'OLTEMODBAS-005':'Please double-check that the even back-and-forth stages now add b_0, b_1, and so on rather than skipping b_0.',
  'OLTEMODBAS-006':'Please double-check that the finite-signature proposition states its predicate, constant, and function inventory without contradicting the earlier purely-relational definition.',
  'OLTEMODBAS-007':'Please double-check that k is the sequence length while n remains the recursion and quantifier-rank index in I_n.',
  'OLTEMODBAS-008':'Please double-check that the strengthened fixed-variable formula-class lemma is exactly what the finite conjunction T_n^a requires.',
  'OLTEMODBAS-009':'Please double-check that the dense-order Forth proof now covers both the empty partial map and an already-mapped point before its three new-point cases.',
  'OLTEMODBAS-010':'Please double-check that the automorphism exercise is limited to parameter-free definability, so invariance under every automorphism is valid.',
  'OLTEMODARI-001':'Please double-check that the two operation arguments are strings a^n and a^m, while the displayed results remain a^(n+m) and a^(nm).',
  'OLTEMODARI-002':'Please double-check that the added order on strings compares their exponents and completes exactly the claimed arithmetic-language structure.',
  'OLTEMODARI-003':'Please double-check that x is restored as the first argument of the binary PA proof predicate in the existential witness formula.',
  'OLTEMODARI-004':'Please double-check that failure of surjectivity is described as omission from the range, not the already total function domain.',
  'OLTEMODARI-005':'Please double-check that the new constant c is evaluated in the expanded structure M^c rather than the reduct M.',
  'OLTEMODARI-006':'Please double-check that the finite-subset proof handles the case with no c-inequality before choosing a largest constrained numeral.',
  'OLTEMODARI-007':'Please double-check that Downward Löwenheim--Skolem is invoked after compactness to obtain the proposition’s countable model.',
  'OLTEMODARI-008':'Please double-check that the last non-standard K case is y=a, since the domain contains no b.',
  'OLTEMODARI-009':'Please double-check that the b-plus-a calculation ends with (b plus a)^succ rather than the source’s free y.',
  'OLTEMODARI-010':'Please double-check that the unique-predecessor assertion is restricted exactly to nonzero elements.',
  'OLTEMODARI-011':'Please double-check that all three averages use the chapter’s defined model-addition symbol nsplus rather than the unrelated opulus.',
  'OLTEMODARI-012':'Please double-check that density and endpointlessness remain general while denumerability is conditional on a countable model.',
  'OLTEMODARI-013':'Please double-check that the final set builder constrains x, the ordered pair’s first component, rather than unrelated n.',
  'OLTEMODARI-014':'Please double-check that Tennenbaum’s theorem rules out computable non-standard PA models and states uniqueness only up to isomorphism.',
  'OLTEMODARI-015':'Please double-check that g(n)=n-1 for n>0 is bijective onto N union {a} and yields the displayed transported operations.',
  'OLTEMODINT-001':'Please double-check that the first separation proof restores H, the conjunction defined immediately above, rather than retaining the undefined delta.',
  'OLTEMODINT-002':'Please double-check that the existential macro places S in the same optional formula argument used by every adjacent occurrence.',
  'OLTEMODINT-003':'Please double-check that the maximal-pair construction enumerates sentences of the expanded languages L-prime-1 and L-prime-2.',
  'OLTEMODINT-004':'Please double-check that the amalgamated model retains the shared new-constant interpretations while Gamma-star and Delta-star are evaluated, before taking the original-language reduct.',
  'OLTEMODINT-005':'Please double-check that a predicate exclusive to L1 is transported from its M-prime-1 interpretation, which agrees with the following tuplewise clause.',
  'OLTEMODINT-006':'Please double-check that formula satisfaction across the two domains is compared only after variable assignments are transported along h.',
  'OLTEMODINT-007':'Please double-check that the Beth theorem is stated as the biconditional proved by its explicit-to-implicit and implicit-to-explicit directions.',
  'OLTEMODINT-008':'Please double-check that the P-prime atomic formula uses the same Atom constructor as all adjacent entailments.',
  'OLTEMODINT-009':'Please double-check that both recursive sequences explicitly remain unchanged whenever their respective addition condition fails.',
  'OLTEMODLIN-001':'Please double-check that the renamed L-prime structure M-prime corresponds to the original structure M, rather than to the language L.',
  'OLTEMODLIN-002':'Please double-check that the relativized domain uses X, the supplied interpretation of the fresh predicate R, instead of the undefined interpretation of R in the original structure.',
  'OLTEMODLIN-003':'Please double-check that relativization is restricted to a nonempty fibre containing every original constant interpretation, exactly as required for an induced substructure.',
  'OLTEMODLIN-004':'Please double-check that the Expansion Property places E in L of the finite sublanguage L-prime before later proofs use that membership.',
  'OLTEMODLIN-005':'Please double-check that I codes membership of the coordinate map sending each a_i to b_i in the chosen partial-isomorphism family.',
  'OLTEMODLIN-006':'Please double-check that K and K-zero name the ambient coding structure and its countable model, and that both starred domains use well-formed subscripts.',
  'OLTEMODLIN-007':'Please double-check that D-one is an abstract L-sentence obtained by relativization and Boolean closure, while D-two alone is first-order.',
  'OLTEMODLIN-008':'Please double-check that the finite-rank lemma explicitly assumes a normal abstract logic, as required to treat its first-order D inside L.',
  'OLTEMODLIN-009':'Please double-check that A, rather than the abstract sentence E, ranges over bounded-rank first-order sentences in the finite conjunction.',
  'OLTEMODLIN-010':'Please double-check that both occurrences of D sub N enclose the full structure symbol N in the subscript.',
  'OLTEMODLIN-011':'Please double-check that the Lindström theorem explicitly assumes normality in addition to compactness and the Löwenheim--Skolem property.',
  'OLTEMODLIN-012':'Please double-check that the subsequence is reindexed rank-preservingly and that compatible copies and tagged disjoint sorts make the stated unions well defined.',
  'OLTEMODLIN-013':'Please double-check that K names the ambient structure and K-star its compactness model, without colliding with the previously constructed M-star side structure.',
  'OLTEMODLIN-014':'Please double-check that the abstract sentence E is evaluated with models-L in both M_n and N_n clauses.',
  'OLTEMODLIN-015':'Please double-check that the fresh constant d and the full type of numeral inequalities force its value to be a nonstandard index after compactness.',
  'OLTEMODLIN-016':'Please double-check that ordinary first-order sentences are described as built from all language symbols, including predicates, rather than from constants alone.',
  'OLTEMODLIN-017':'Please double-check that both coded sequence structures interpret the same fresh predicate symbols P and Q, so the ambient comparison has one vocabulary.',
  'OLTEMODLIN-018':'Please double-check that the Boolean Property supplies the atomic-sentence base case using constants, without presupposing semantics for open formulas.',
  'OLTEMODLIN-019':'Please double-check that binding and removing c places the resulting sentence F in L of the reduced language L-prime.',
  'OLTEMODLIN-020':'Please double-check that the conjunctions and disjunction use one representative from each of finitely many equivalence classes, so they are genuine finite first-order formulas.',
  'OLTEMODLIN-021':'Please double-check that the element and finite-sequence domains are prepared as tagged disjoint sorts before their union is used.',
  'OLTEMODLIN-022':'Please double-check that both base-tuple occurrences use the chapter’s empty-sequence notation emptyseq rather than the empty-set notation emptyset.',
  'OLTECMPREC-001':'Please double-check that the motivating recursion proceeds from h(x) to h(x+1), consistently with every adjacent example and defining equation.',
  'OLTECMPREC-002':'Please double-check that the composed n-place function h retains arguments x_0 through x_{n-1}, while k continues to count the inner functions supplied to f.',
  'OLTECMPREC-003':'Please double-check that the repaired title denotes primitive recursive functions, not functions named “primitive recursion.”',
  'OLTECMPREC-004':'Please double-check that every stage S_{i+1} retains S_i and adds the one-step compositions and primitive recursions, so the union is the intended closure.',
  'OLTECMPREC-005':'Please double-check that the projection family is indexed by its n argument places in the naming sentence, matching the adjacent definition.',
  'OLTECMPREC-006':'Please double-check that the doubling construction uses const_2 rather than the unrestricted const_n, matching f(x)=2 times x and the displayed composition.',
  'OLTECRREM-001':'Please double-check that the displayed x less-than-or-equal y relation is named non-strict order rather than strict less-than.',
  'OLTECRREM-002':'Please double-check that the third successor-bound case preserves the parameter vector x used by the relation and the other two cases.',
  'OLTECRREM-003':'Please double-check that x divides y is explained through the remainder when y is divided by x, not the reverse operation.',
  'OLTECRREM-004':'Please double-check that nextPrime is typeset as a function name followed by its argument in both repaired occurrences.',
  'OLTECRREM-005':'Please double-check that x=0 and x=1 are discharged directly before the Euclid product proof assumes a largest prime at most x.',
  'OLTECRREM-006':'Please double-check that the repaired map explicitly sends a finite tuple to its numeric sequence code and states the injective direction correctly.',
  'OLTECRREM-007':'Please double-check that the sequence bound is defined at length zero and that the bounded search includes a code equal to the proved upper bound.',
  'OLTECRREM-008':'Please double-check that hSubtreeSeq is described cumulatively as listing subtrees at distance at most n, matching its recurrence.',
  'OLTECRREM-009':'Please double-check that the sequence fold starts empty and appends indices 0 through k-1, so the length call never reads past the sequence.',
  'OLTECRREM-010':'Please double-check that the universal indexed family removes the impossible non-index branch and that both halting values directly contradict the diagonal index equation.',
  'OLTECOMTHY-001':'Please double-check that e remains the program or machine-description index throughout the s-m-n explanation.',
  'OLTECOMTHY-002':'Please double-check that the opening contrast says the partial function is universal, not total, for all partial computable functions.',
  'OLTECOMTHY-003':'Please double-check that the second halting proof attributes definedness to g and treats the assumed computable h as total.',
  'OLTECOMTHY-004':'Please double-check that Russell self-membership uses S on both sides of the biconditional and introduces no stray X.',
  'OLTECOMTHY-005':'Please double-check that the corrected full section title simply removes the source spelling error without changing its scope.',
  'OLTECOMTHY-006':'Please double-check that the reverse range proof evaluates cfind_e at (z)_0, the input encoded by the displayed computation pair.',
  'OLTECOMTHY-007':'Please double-check that the closure proof repairs “for looking” and “tricker” without changing either enumeration construction.',
  'OLTECOMTHY-008':'Please double-check that the complement proof uses d, not e, in T(d,x,h(x)) because cfind_d has domain A.',
  'OLTECOMTHY-009':'Please double-check that the informal parallel-search explanation consistently uses the already assigned indices d and e rather than introducing e and f.',
  'OLTECOMTHY-010':'Please double-check that removing the duplicated word “notion” leaves the intended reducibility claim unchanged.',
  'OLTECOMTHY-011':'Please double-check that “in unsolvable” is treated as the local typo “is unsolvable,” matching the cited halting result.',
  'OLTECOMTHY-012':'Please double-check that the W_e characterization of K_0 uses the ordered pair <e,x>, in the same order as its defining computation.',
  'OLTECOMTHY-013':'Please double-check that the repaired sentence says the first proposition establishes transitivity of many-one reducibility.',
  'OLTECOMTHY-014':'Please double-check that a many-one reduction is typed f: N to N, not merely f: A to B, so the characteristic-function composition is well formed.',
  'OLTECOMTHY-015':'Please double-check that the proof uses K_0 many-one reduces to K, that the valid original exercise K reduces to K_0 is retained, and that the reverse direction appears only as a separately labelled added exercise completing the proof.',
  'OLTECOMTHY-016':'Please double-check that the repaired procedural sentence first simulates cfind_x(x) and returns zero exactly if that computation halts.',
  'OLTECOMTHY-017':'Please double-check that the fourth Rice-theorem example asserts strict increase only when both displayed function values are defined.',
  'OLTECOMTHY-018':'Please double-check that the fixed-point application begins with arbitrary partial computable f, matching the theorem and the partial construction of g.'
  ,'OLTEART-001':'Please double-check that the arithmetized substitution construction is singular throughout and maps the three input codes k, l and m to the output code n.'
  ,'OLTEART-002':'Please double-check that the term-formation clause explicitly quantifies the function-symbol index j together with n and z.'
  ,'OLTEART-003':'Please double-check that the formula-formation proof uses the valid bounded sequence-code argument from the term proof rather than claiming that the whole sequence code is below its final formula code.'
  ,'OLTEART-004':'Please double-check that both repaired LK Gödel codes have balanced parentheses and agree with the displayed conclusion and the definition of p_0.'
  ,'OLTEART-005':'Please double-check that EndSequent is the single projection name used in its definition and every subsequent rule and proof predicate.'
  ,'OLTEART-006':'Please double-check that the final LK correctness formula calls the defined InitSeq predicate rather than an undefined InitialSeq predicate.'
  ,'OLTEART-007':'Please double-check that the explanation of Correct refers to the end-sequent of p, matching the displayed formula and proposition.'
  ,'OLTEART-008':'Please double-check that the primitive-recursiveness proof calls Deriv(p), consistently with its quantified subtree formula and proposition.'
  ,'OLTEART-009':'Please double-check that the sole right-side formula code is equated with y, the Gödel number of A, rather than x, the derivation code.'
  ,'OLTEART-010':'Please double-check that Sent(EndFmla(d)) is conjoined with the complete disjunction of every natural-deduction correctness case.'
  ,'OLTEART-011':'Please double-check that Subderiv searches tuple positions j+1 for j below the recorded arity, thereby covering exactly positions 1 through (d-prime)_0.'
  ,'OLTEART-012':'Please double-check that the QR_1 test existentially binds a preceding-line index j<i and that the bounded symbol is c, the constant appearing on that line.'
  ,'OLTEART-013':'Please double-check that the recursive hCond clause calls hCond(s,y,n), while Cond remains only the two-argument wrapper introduced afterwards.'
  ,'OLTEART-014':'Please double-check that the unary Correct call in the LK Deriv definition is closed before the bounded-universal body is closed.'
  ,'OLTEREQ-001':'Please double-check that the representing formula is named A_f consistently in the lemma.'
  ,'OLTEREQ-002':'Please double-check that the restored Th(Q)-proves prefix makes the use of representability clause (b) explicit.'
  ,'OLTEREQ-003':'Please double-check that the primitive-recursion prose uses h(vector x,y), matching the displayed defining equations.'
  ,'OLTEREQ-004':'Please double-check that the equality characteristic-function notation is consistently Char{=} and A_{Char{=}}.'
  ,'OLTEREQ-005':'Please double-check that every g_i conjunct and the A_f conjunct lie inside the balanced existential scope.'
  ,'OLTEREQ-006':'Please double-check that the two composition exercises now refer to prop:rep1 and prop:rep2 respectively.'
  ,'OLTEREQ-007':'Please double-check that the repaired induction step uses the successor of the induction hypothesis and the two required Q5 rewrites.'
  ,'OLTEREQ-008':'Please double-check that the second closed term is equated with numeral m rather than numeral n.'
  ,'OLTEREQ-009':'Please double-check that both successor-versus-zero contradictions cite Q2 rather than Q3.'
  ,'OLTEREQ-010':'Please double-check that the zero-member bounded-universal expansion is described as an empty conjunction.'
  ,'OLTETCP-001':'Please double-check that the first-incompleteness proof retains computable axiomatizability rather than weakening the premise to mere axiomatization.'
  ,'OLTETCP-002':'Please double-check that the universal-relation argument uses the Goedel code of the one-variable formula D_S(u).'
  ,'OLTETCP-003':'Please double-check that the first ZFC corollary excludes consistent decidable extensions, since an inconsistent extension is decidable.'
  ,'OLTESOLSYN-001':'Please double-check that the prose summary explicitly includes predicate-symbol-to-relation and relation-variable-to-relation assignments.'
  ,'OLTESOLSYN-002':'Please double-check that R consistently denotes the relation value while M remains the fixed structure in the substitution definition.'
  ,'OLTESOLSYN-003':'Please double-check that R consistently denotes the quantified relation in both second-order relation-quantifier satisfaction clauses.'
  ,'OLTESOLSYN-004':'Please double-check that N, already used for the example subset, consistently replaces the source collision with the structure symbol M.'
  ,'OLTESOLSYN-005':'Please double-check that S denotes the arbitrary subset throughout the forward Count proof while M remains the structure.'
  ,'OLTESOLSYN-006':'Please double-check that S denotes the orbit subset throughout the reverse Count proof while M remains the structure.'
  ,'OLTESOLMET-001':'Please double-check that w, the universally quantified variable, occurs in both argument positions of the addition recursion equation.'
  ,'OLTESOLMET-002':'Please double-check that the repaired satisfaction expression closes its formula argument after the complete conditional P implies A.'
  ,'OLTESOLMET-003':'Please double-check that the non-compactness theorem has the unique label thm:sol-not-compact rather than the preceding undecidability label.'
  ,'OLTESOLMET-004':'Please double-check that the finite-satisfiability proof bounds the indices occurring in Gamma_0 rather than claiming the full Gamma omits larger bounds.'
  ,'OLTESOLSET-001':'Please double-check that Inf(X) now describes an injective non-surjective self-map of X, with range containment and injectivity both restricted to X.'
  ,'OLTESOLSET-002':'Please double-check that Count(X) includes the empty set, restricts induction sets Y to subsets of X, and has balanced delimiters.'
  ,'OLTESOLSET-003':'Please double-check that the Y(x)-conditional in Pow(Y,R,X) closes before the second universal quantifier closes.'
  ,'OLTESOLSET-004':'Please double-check that the Cont(Y) proof refers to subsets of the controlling base set s(X), not the bound variable s(Z).'
  ,'OLTESOLSET-005':'Please double-check that the domain-to-Y witness has all values in Y, making it a bijection from the whole domain onto Y.'
  ,'OLTESOLSET-006':'Please double-check that the equinumerosity formula restricts injectivity to arguments in X, so it imposes no condition on the complements of X and Y.'
  ,'OLTESOLSET-007':'Please double-check that Aleph_1(X) quantifies over proper subsets and also requires X itself to be infinite and not of size aleph-zero.'
  ,'OLTELAMALP-001':'మొదటి పేరు మార్పు నిర్వచనంలో x, y భిన్నం అనే షరతు తరువాతి రెండు నిర్వచనాలతో ఏకరూపతను తెస్తుందా?'
  ,'OLTELAMALP-002':'పునరుక్త అభ్యాస జతను ఊహతో మార్చకుండా ఉంచినట్టు స్పష్టమా?'
  ,'OLTELAMALP-003':'స్వేచ్ఛా-చరాల నిరూపణలో సరిచేసిన FV సంకేతాలు, రెండవ సందర్భపు మధ్య దశ సరైనవా?'
  ,'OLTELAMALP-004':'తిరుగు పేరు మార్పుకు అవసరమైనది ప్రతిస్థాపన తరువాత x స్వేచ్ఛగా లేకపోవడమేనని స్పష్టమా?'
  ,'OLTELAMALP-005':'రెండో ప్రతిస్థాపన నిర్వచితమన్న మూల వాదనలో ఖాళీని ఇచ్చిన ఉదాహరణ సరిగ్గా చూపుతుందా? దానికి పూర్తి నిర్మాణాత్మక నిరూపణ ఏమిటి?'
  ,'OLTELAMALP-006':'మూల గణనలో సమానత్వానికి బదులుగా ఏ ఆల్ఫా-తుల్యత దశలు కావాలి? సాధారణ M-double-primeను ఎలా కవర్ చేస్తారు?'
  ,'OLTELAMALP-007':'ఉపసిద్ధాంతంలో రెండవ జతకు ఆల్ఫా-తుల్యత, నిర్వచితత్వం పరికల్పనలు రెండూ పునరుద్ధరించబడ్డాయా?'
  ,'OLTELAMDEB-001':'మొత్తం పదంలోని రెండు సంఖ్యా సూచికలు 0, 1ల ప్రయోగమేనని, ఒక్క 01 సూచిక కాదని స్పష్టమా?'
  ,'OLTELAMDEB-002':'ఒకే చరం సందర్భ జాబితాలో పలుసార్లు ఉంటే దగ్గరి బంధకానికి చెందిన తొలి ఘటన స్థానం తీసుకోవడం సరిగ్గా వివరించబడిందా?'
  ,'OLTELAMDEB-003':'జాబితా పరిధి మించిన సూచికలపై G తిరుగు పటం నిర్వచితం కాదని, మూల సమీకరణం మారలేదని స్పష్టమా?'
  ,'OLTELAMTR-001':'వర్గంపై ప్రతిస్థాపన ఫలితం ముడి పదం కాదు, ఆ పదాన్ని కలిగి ఉన్న ఆల్ఫా-తుల్యతా వర్గమని తెలుగు గద్యం స్పష్టంచేస్తుందా?'
  ,'OLTELAMTR-002':'పూర్వ ఉపసిద్ధాంతంపై ఆధార సూచనను నిలిపి, OLTELAMALP-005–006 మూల నిరూపణ ఖాళీలు ఇంకా తెరిచే ఉన్నాయని స్పష్టంగా ప్రకటించామా?'
  ,'OLTELAMBETA-001':'వాక్యనిర్మాణ అధ్యాయ డ్రైవరు దిగుమతి చేసే బీటా విభాగపు ఫైలు గుర్తింపులో intకు బదులు syn అవసరమని మూల పథం, డ్రైవరు, పక్క విభాగాల ఆధారాలు చూపుతున్నాయా?'
  ,'OLTELAMETA-001':'ఏటా-తుల్యతా సమీకరణంలో f ఏ పదమైనా సూచించవచ్చని, కానీ x ఆ పదంలో స్వేచ్ఛగా ఉండకూడదనే షరతు పూర్వ సంకోచన నిర్వచనానికీ తరువాతి నిరూపణకీ సరిపోతుందా?'
  ,'OLTELAMETA-002':'నిరూపణలో ext మాక్రోను ఒకే విధంగా వాడటం నిర్వచన, సిద్ధాంత సంకేతాలతో సరిపోతుందా; సంబంధం యొక్క భావాన్ని మార్చలేదా?'
  ,'OLTELAMCRDAP-001':'రెండు తగ్గింపు మార్గాలు తిరిగి కలవడమనే లక్షణం తుది విలువ ఉనికిని కాదు, ఏదైనా ఉంటే దాని అనన్యతను మాత్రమే ఇస్తుందని మొదటి వివరణ స్పష్టంచేస్తుందా?'
  ,'OLTELAMCRDAP-002':'జాలక సరిహద్దు నిర్వచనాల నుంచి N_{m,0}=P_m, N_{0,n}=Q_n అని వస్తుందని, మూల P/Q పేర్లను అంతకుమించి ఏదీ మార్చకుండా సరిచేశామా?'
  ,'OLTELAMCRPB-001':'అమూర్తీకరణ నియమపు పూర్వాపేక్ష సమాంతర తగ్గింపే అని, స్వప్రతిఫలకత్వం మరియు తరువాతి ఆగమన వాదనలతో సరిపోతుందని స్పష్టమా?'
  ,'OLTELAMCRPB-002':'ప్రతిస్థాపన ఉపసిద్ధాంతపు రెండవ సందర్భంలో కుడివైపు R-prime పునరుద్ధరణ ఉపసిద్ధాంత లక్ష్యంతో సరిపోతుందా?'
  ,'OLTELAMCRPB-003':'నాలుగవ సందర్భానికి అవసరమైన తాజా ప్రతినిధులు, ప్రతిస్థాపనల నిర్వచితత్వం, మార్పిడి నియమం మూలంలో నిరూపించలేదనే పరిమితి తగినంత స్పష్టమా?'
  ,'OLTELAMCRB-001':'అనుకూల బీటా సంకోచనంలోని అమూర్తీకరణ/ప్రయోగ సందర్భాలకు మూలస్థాన గణన సరిపోదనే నిరూపణ పరిమితి స్పష్టమా?'
  ,'OLTELAMCRB-002':'నాలుగవ సందర్భపు సాక్షి-పద జాబితాలో N-prime పునరుద్ధరణ అదే సందర్భపు పూర్వాపేక్ష, తరువాతి తగ్గింపుతో సరిపోతుందా?'
  ,'OLTELAMCRB-003':'తుది చర్చ్--రోసర్ వాదన ముందరి రెండు ఇంకా అసంపూర్ణ నిరూపణలపై ఆధారపడుతుందనే జాగ్రత్త పాఠకుడికి కనిపిస్తుందా?'
  ,'OLTELAMCRPBE-001':'అమూర్తీకరణ నియమంలో సమాంతర బీటా-ఏటా పూర్వాపేక్ష పునరుద్ధరణ స్వప్రతిఫలకత్వం, ఆగమన వాదనలకు సరిపోతుందా?'
  ,'OLTELAMCRPBE-002':'సంపూర్ణ వికాసం రెండవ, అయిదవ సమీకరణాల ఏటా అతివ్యాప్తి, ప్రాధాన్య నియమం లేనితనం స్పష్టమా?'
  ,'OLTELAMCRPBE-003':'ఏటా-ప్రతిస్థాపన సందర్భానికి తాజా చరం, నిర్వచిత ప్రతిస్థాపనలు కావాలనే పరిమితి తగినంత స్పష్టమా?'
  ,'OLTELAMCRPBE-004':'సంపూర్ణ-వికాస ఉపసిద్ధాంతం నిర్వచన అస్పష్టత, పూర్వ నిరూపణ ఖాళీపై ఆధారపడుతుందనే హెచ్చరిక సరిపోతుందా?'
  ,'OLTELAMCRPBE-005':'సమాంతర చర్చ్--రోసర్ సిద్ధాంతం పూరించని ఉపసిద్ధాంతంపై ఆధారపడుతుందనే పరిమితి పాఠకుడికి కనిపిస్తుందా?'
  ,'OLTELAMCRBE-001':'beredone టెక్స్ మాక్రో మాత్రమే ఉండి ఒక-దశ గణిత సంబంధం నిర్వచించబడలేదనే తేడా స్పష్టమా?'
  ,'OLTELAMCRBE-002':'ఏటా సందర్భంలో eredone పునరుద్ధరణ, సమాంతర ఏటా నియమం అవసరం, పూర్వ అనుకూల-సందర్భ ఖాళీ స్పష్టమా?'
  ,'OLTELAMCRBE-003':'అయిదవ సందర్భమే ముద్రించబడిందనీ, తొలి నాలుగు సందర్భాలు, ఒక-దశ సంకేతం నిర్వచనం లేవనీ స్పష్టమా?'
  ,'OLTELAMCRBE-004':'తుది సిద్ధాంతం ఆధారపడే పూర్వ నిర్వచన, నిరూపణ పరిమితులు పూర్తి ధ్రువీకరణగా పొరబడకుండా ఉన్నాయా?'
  ,'OLTELAMLDFI-001':'స్థిర ప్రమేయం c_k పరిచయానికి అనుగుణంగా c_k(n)=k ఉపసూచిక పునరుద్ధరణ సరైనదా?'
  ,'OLTELAMLDFARF-001':'చర్చ్ సంఖ్యాంకాన్ని f, xలకు ప్రయోగించడానికి రెండు బీటా సంకోచనాలు కావడంతో బహుదశ బాణం సరైనదా?'
  ,'OLTELAMLDFARF-002':'సంకలన గణనలో నాలుగు బాణాలన్నిటికీ కనీసం రెండు దశలు కావాలని, మధ్య పదాలను మార్చకుండా చూపామా?'
  ,'OLTELAMLDFARF-003':'ప్రత్యామ్నాయ గుణకార పదంలో Add b పునరుద్ధరణ రెండవ ఆర్గ్యుమెంటును వాడి n mను ఇస్తుందా?'
  ,'OLTELAMLDFTVR-001':'సంబంధపు రెండు ప్రయోగాల్లో k ఆర్గ్యుమెంట్లు ఉండగా ప్రకటించిన ఘాతం మాత్రమే Nat^kగా మార్చి, ఆ స్థాన సవరణను స్పష్టంగా చెప్పామా?'
  ,'OLTELAMLDFPRF-001':'సంయుక్త లెమ్మాలో k ప్రతినిధి పదాలకు G_0 నుంచి G_{k-1} వరకు మాత్రమే పేర్లు ఇచ్చి, H పదం h ప్రమేయాన్ని సూచిస్తుందని స్పష్టంగా చెప్పామా?'
  ,'OLTELAMLDFPRF-002':'ఆదిమ పునరావృత్తి దశలో బయట gను వాడి, Gతో నిర్మించిన స్థితి-నవీకరణ, ఆగమన నిర్ధారణకు దాని స్థానసంఖ్య సరిపోతుందా?'
  ,'OLTELAMLDFPIX-001':'ముందరి ప్రత్యామ్నాయ గుణకార సవరణకు అనుగుణంగా Addకు b ఇవ్వడం, చర్చ్ శూన్యాన్ని వాడటం ఇక్కడి ఉదాహరణకు సరిపోతుందా?'
  ,'OLTELAMLDFPIX-002':'స్వీయ-ప్రతిస్థాపన తర్వాత గుణకార శాఖ బయటి లాంబ్డా శరీరంలోనే ఉండగా లోపలి Fac స్వీయ సూచన మిగిలిందా?'
  ,'OLTELAMLDFPIX-003':'ఒకే సంఖ్యాప్రమేయాన్ని సూచించడాన్ని పదాల బీటా-తుల్యతతో కలపకుండా స్థిరబిందు సమీకరణాన్ని ప్రత్యేకంగా చెప్పామా?'
  ,'OLTELAMLDFPIX-004':'Yg=(UU)gలో లోపలి UU మాత్రమే రెడెక్స్ అని, మొత్తం పదంలో అది ఉందని వాక్యం స్పష్టంగా చెబుతుందా?'
  ,'OLTELAMLDFPIX-005':'చర్చ్ సంయోజకం బీటా-తుల్యతను మాత్రమే ఇస్తుందనే పోలికలో Y_Cను వాడి, ట్యూరింగ్ Y ముందుకు తగ్గుతుందనే సిద్ధాంతాన్ని నిలిపామా?'
  ,'OLTENMLLAN-001':'Is the lone unmatched closing parenthesis removed only from the prvOr branch of defIf, with both subformulas, the other branch, and the adjacent Telugu disclosure preserved?'
  ,'OLTENMLSYN-001':'Does the biconditional substitution case use the prvIff tag while retaining the exact liff recurrence and disclosing the source tag slip?'
  ,'OLTENMLSYN-002':'Does the box substitution case use prvBox consistently with the basic-language definition, with no change to the recursive formula?'
 ,'OLTENMLSYN-003':'Is the world argument [w] restored only to the first missing non-satisfaction atom in the second box-diamond duality proof?'
 ,'OLTENMLENT-001':'Is the one-world countermodel an ordered W-prime/R-prime/V-prime triple rather than an unordered set, with the exact source repair disclosed?'
 ,'OLTENMLENT-002':'Is V-prime total on every propositional variable while preserving the stated p-only counterexample truth values and disclosing the completion?'
 ,'OLTENMLFRDINT-001':'Is the fixed-valuation non-reflexive example explicitly restricted to A=p, without treating it as frame-validity for arbitrary A?'
 ,'OLTENMLFRDACC-001':'Does the one-world countermodel explicitly take an empty accessibility relation before asserting non-reflexivity and vacuous Box p?'
 ,'OLTENMLFRDACC-002':'Does the two-world example explicitly exclude self-loops before calling the relation irreflexive, while preserving both cross-edges and equal atomic valuations?'
 ,'OLTENMLFRDDEF-001':'Is Box A asserted only at the chosen world w with no successors, with the added [w] disclosed and the D contradiction kept at that same world?'
 ,'OLTENMLFRDFOL-001':'Is A_1 explicitly read as the true empty conjunction, and is the finite subset with no A_n covered by a one-element model, without altering the printed n≥2 chain?'
 ,'OLTENMLAXSDER-001':'Does the rewriting conclusion use the formula metavariable !B, matching its hypothesis and exercise, with the one source atom delta disclosed?'
 ,'OLTENMLAXSDER-002':'Does the Telugu replacement label say that new !B replaces old !A in C(!A) to C(!B), consistently with the later p-for-double-negation example?'
 ,'OLTENMLAXSMPR-001':'Does the final PL step yield the proposition’s Diamond A or Diamond B order directly from line 6, with the single source atom delta and disclosure recorded?'
 ,'OLTENMLAXSSND-001':'Does the induction step cover K and the guarded Dual as possible final-line axioms even in a proof sequence longer than one line, with the source omission disclosed?'
 ,'OLTENMLAXSSND-002':'Is necessitation justified for validity at every world in each model of the stated intersection class, rather than inferred solely from the cited global-validity proposition?'
 ,'OLTENMLAXSDIS-001':'Does the KD-in-KT proof derive the D axiom formula, not a system named D, consistently with the cited KT proves Ax D result?'
 ,'OLTENMLAXSDIS-002':'Do the two KTB nonprovability claims concern axiom formulas 4 and 5, as the countermodel proof requires, rather than system labels?'
 ,'OLTENMLAXSCON-001':'Is the non-satisfiability of a Sigma-inconsistent set restricted to a model class where Sigma is sound, rather than asserted for arbitrary models?'
 ,'OLTENMLAXSCON-002':'Do the two Gamma-plus-assumption derives-bottom lines follow directly from the Sigma-consistency definition and union shorthand, with item (b) cited only as context?'
 ,'OLTENMLCOMCCS-001':'Does the reverse negation case conclude not-A in Gamma from A not in Gamma, instead of the source contradictory A in Gamma?'
 ,'OLTENMLCOMCCS-002':'Does the non-exercise disjunction proof also establish membership from either disjunct by tautology and deductive closure, while leaving the exercise branch open?'
 ,'OLTENMLCOMCCS-003':'Does the biconditional converse start from A iff B not in Gamma, which alone licenses the next negated-biconditional membership step?'
 ,'OLTENMLCOMCCS-004':'Is the neither-belongs case excluded using completeness and closure before the biconditional converse conclusion, without silently filling the exercise branch?'
 ,'OLTENMLCOMLIN-001':'Does the at-most-n schedule list every finite formula while keeping each stage finite, including short formulas using higher-indexed variables?'
 ,'OLTENMLCOMMOD-001':'Do both Box-lifting implication chains end at the same B_k as the finite witness list, without changing the normal-system RK step?'
 ,'OLTENMLCOMMOD-002':'Does the intermediate Box-lifted entailment retain the Sigma parameter required by the cited lemma and subsequent monotonicity step?'
 ,'OLTENMLCOMTRU-001':'Does the Box-guarded Diamond-forward case use the Box/Diamond accessibility equivalence lemma, not the membership proposition, while preserving the same witness?'
 ,'OLTENMLCOMTRU-002':'Does the Diamond-reverse case apply the induction hypothesis to B at the accessible world before invoking the Diamond truth clause?'
 ,'OLTENMLCOMTRU-003':'Does the exercise tag list use the exact probAnd key tested by the conjunction branch, with no loss of the worked or exercise text?'
 ,'OLTENMLCOMFRA-001':'Does the added final sentence make only the source-implied contradiction between the B-witness conjunction and its negation in Delta-2 explicit, without changing the weak-density claim?'
 ,'OLTENMLFILINT-001':'Does the Telugu correction distinguish finitely many quotient classes from the possibly finite or infinite cardinality of an individual class?'
 ,'OLTENMLFILINT-002':'Does the universal-accessibility toy case give the universal truth clause for Box B, consistent with the later Box induction, without implying the same clause for arbitrary frames?'
 ,'OLTENMLFILINT-003':'Is the first equivalence restricted to variables occurring in A, and is the later general equivalence correctly strengthened to all subformulas of A?'
 ,'OLTENMLFILINT-004':'Is the p argument restored only to the defective first V-star membership assertion, leaving the already correct second assertion unchanged?'
 ,'OLTENMLFILEXF-001':'Do both binary-tree valuation sets explicitly intersect W, keeping the diagram labels and the source exclusion of the string 1 without claiming that exclusion alone fixes the codomain?'
 ,'OLTENMLFILEXF-002':'Does the first example restrict the even-natural valuation to positive world set W, given that this edition includes zero in Nat, without changing any depicted positive-world truth value?'
 ,'OLTENMLFILFMP-001':'Does the K proof put the filtered truth of A at quotient world [w], rather than original world w, exactly as the preceding truth-preservation theorem requires?'
 ,'OLTENMLFILDEC-001':'Does the countermodel branch enumerate only finite universal models appropriate to S5, rather than arbitrary finite models, while preserving the independent proof-enumeration branch?'
 ,'OLTENMLFILEUC-001':'Do both diagrams show the w2 and [w2] self-loops required for the claimed original serial/Euclidean relation and the filtration R1 inheritance, without altering p or Box p truth labels?'
 ,'OLTENMLFILEUC-002':'Does the infinite modal-closure claim explicitly exclude the empty set while preserving the warning that the construction gives no immediate finite-model bound?'
 ,'OLTENMLFILEUC-003':'Do the proof cases now follow the theorem order symmetry, transitivity, Euclideanness, with only transitivity worked and the other two still exercises?'
 ,'OLTENMLFILEUC-004':'Are the newly forced quotient arrows described between [w2] and [w5], while the Box p at w2 and not-p at w5 checks remain at original worlds?'
 ,'OLTENMLTABRUL-001':'Does the conjunction rule draw A and B only at the same prefix without claiming they are false in all other worlds?'
 ,'OLTENMLTABRUL-002':'Does the Box-only countertableau label the first F Box expansion F Box while still leaving the later forbidden reuse of 1.1 visible?'
 ,'OLTENMLTABSOU-001':'Does the contrapositive countermodel make A false at w while all B_i are true there?'
 ,'OLTENMLTABSOU-002':'Does the false-disjunction rule premise have the missing [sigma] prefix restored and remain an exercise?'
 ,'OLTENMLTABSOU-003':'Does the F Box B case conclude F B at the new prefix and use modal model/satisfaction notation consistently?'
 ,'OLTENMLTABSOU-004':'Does the T Diamond B case conclude T B at the new prefix and use modal model/satisfaction notation consistently while retaining its tags?'
 ,'OLTENMLTABSOU-005':'Are the three later rule cases correctly described as one-premise, two-branch inferences rather than two-premise rules?'
 ,'OLTENMLTABSOU-006':'Does the contradiction proof conclude Gamma entails A, matching the corollary, rather than repeat Gamma proves A?'
 ,'OLTENMLTABMRU-001':'Does the S5 tableau actually close for the edition-defined axiom 5 Diamond A -> Box Diamond A, using distinct fresh prefixes 1.1 and 1.2 and the Euclidean 4r Diamond step?'
 ,'OLTENMLTABMSN-001':'Does the 4r Box proof evaluate its premise at f(sigma.n), not the ill-formed f(sigma).n, while keeping the Euclidean edge argument?'
 ,'OLTENMLTABMSN-002':'Does the 4r Diamond proof conclude F Diamond B at sigma and evaluate its premise at f(sigma.n), consistently with the rule table and final line?'
 ,'OLTENMLTABCPL-001':'Do the complete-branch examples now match the preceding signed and prefixed K tableau rules in every propositional and modal conclusion?'
 ,'OLTENMLTABCPL-002':'Does the proposition end with every branch complete rather than closed, while disclosing the unstated termination justification?'
 ,'OLTENMLTABCPL-003':'Is the finite-Gamma scope of the displayed proof distinguished from the unqualified theorem and corollaries, without claiming to fill the general-case gap?'
 ,'OLTENMLTABCPL-004':'Does the false-conjunction induction use negative satisfaction of C in its second alternative?'
 ,'OLTENMLTABCPL-005':'Does the false-disjunction induction use negative satisfaction of C in its second conjunct?'
 ,'OLTENMLTABCPL-006':'Does the false-conditional induction use negative satisfaction of consequent C in its second conjunct?'
 ,'OLTENMLTABCPL-007':'Is the identity prefix interpretation f explicit and used in the final Gamma satisfaction statement?'
 ,'OLTENMLTABCM-001':'Does the opening non-entailment assertion have the same !A formula as the rest of the decision-procedure explanation?'
 ,'OLTENMLTABCM-002':'Are the Box model witness line references 12 for T p at 1.2 and 11 for T q at 1.1 in the final tableau?'
 ,'OLTENMLTABCM-003':'Does the Diamond example apply F Diamond to its F Diamond line 3 at both already-used successor prefixes?'
 ,'OLTENMLTABCM-004':'Does the middle Diamond tableau root test the same implication as the first and third trees, consistent with its F conditional children?'
 ,'OLTENMLTABCM-005':'Does the Diamond model assign q to 1.2 and cite the T q[1.2] witness on line 7?'
 ,'OLTENMLSEQPRK-001':'Do both corrected Dual-tree labels introduce negation on the antecedent, matching the frozen LK left-negation rule?'
 ,'OLTEAMLTLDRV-001':'Does this olchapter driver now invoke the chapter-end hook rather than the part-end hook, matching the separate macro roles and chapter-driver pattern?'
 ,'OLTEAMLTLSEM-001':'Does the temporal formation clause use the Ftemp macro already introduced in the operator list and used in the future truth clause?'
 ,'OLTEAMLELDRV-001':'Does this epistemic olchapter driver now invoke the chapter-end hook rather than the part-end hook, matching the separate macro roles and chapter-driver pattern?'
 ,'OLTEAMLELBIS-001':'Do both forth and back clauses quantify agents over the language-defined set G, rather than the otherwise undefined A, without changing the bisimulation conditions?'
 ,'OLTEAMLELPALSEM-001':'Does the vacuity paragraph now use the same marked operand !B as the announcement formation and truth clauses, without changing its conditional semantics?'
 ,'OLTEINTBHK-001':'Does the currying example consistently produce constructions of the target meta-formula !C, including the one corrected codomain mention?'
 ,'OLTEINTBHK-002':'Does the first tagged disjunction injection h_1 pair tag 1 with its own input M_1, while h_2 still pairs tag 2 with M_2?'
 ,'OLTEINTND-001':'Does the conjunction-elimination explanation now use A_1 and A_2, matching the pair N_1,N_2 and preceding introduction explanation, without changing any rule tree?'
 ,'OLTEINTSEMNOT-001':'Does the first proposition proof use the local hypothesis at w rather than an unjustified model-wide hypothesis, while preserving the second item and restriction argument?'
 ,'OLTEINTSAX-001':'Does the premise-membership case now use the defined local truth expression for A_n at w, without the source extra Gamma argument, while retaining the three-case induction?'
 ,'OLTEINTSND-001':'Does the conjunction-introduction case state B and C as its goal, matching both premises and its concluding satisfaction clause?'
 ,'OLTEINTSND-002':'Does the first disjunction-elimination case place [w] inside the local satisfaction expression?'
 ,'OLTEINTSND-003':'Do both disjunction-elimination entailments use singleton formula sets in their assumption unions, as the premises and induction hypotheses do?'
 ,'OLTEINTLIN-001':'Does the finite-support step handle an empty supporting subset by choosing the initial stage, while retaining the contradiction with nonderivability?'
 ,'OLTEINTLIN-002':'Does the enumeration argument use the finite prefix before a fixed index instead of claiming the total number of eligible disjunctions decreases?'
 ,'OLTEINTCAN-001':'Does the valuation-monotonicity argument keep the starting sequence fixed and induct on the length of its appended finite segment?'
 ,'OLTEINTDEC-001':'Does the finite quotient use truth of the target formula’s finite subformulas, not atomic valuations alone, and restrict the truth-preservation exercise to that finite set?'
 ,'OLTEINTTABRULE-001':'Does the true-conditional prose now match the displayed false-antecedent/true-consequent branches and do both prose rule labels use the diagram’s argument order?'
 ,'OLTEINTTABPRF-001':'Do the two false-conjunction branches cite the seventh tableau line containing their premise, rather than the fourth false-conditional line?'
 ,'OLTEINTTABSOU-001':'Does the countermodel make every premise true and the conclusion false at the same world?'
 ,'OLTEINTTABSOU-002':'Does the closure proof interpret the descendant prefix and apply monotonicity at that descendant?'
 ,'OLTEINTTABSOU-003':'Do both false-conditional branch sets contain the true antecedent and false consequent at the fresh prefix?'
 ,'OLTEINTTABSOU-004':'Does the corollary conclude semantic entailment rather than repeat the derivability premise?'
 ,'OLTECNTSTR-001':'Does the fifth non-entailment compare the negation of a strict conditional, rather than the negation of a material conditional that actually entails the displayed consequent?'
 ,'OLTECNTSPH-001':'Is the non-vacuous satisfaction condition passed only to smaller spheres that still contain an antecedent-true world, and is an innermost such sphere asserted only when it exists?'
 ,'OLTECNTANT-001':'Do all three corrected prose phrases make striking, not lighting, the match the antecedent action, matching the quoted inference and three-world model?'
 ,'OLTECNTTRA-001':'Does the stated valuation make q→r true throughout the q-admitting sphere, and does the target satisfaction macro now carry the positive sign?'
 ,'OLTECNTCPO-001':'Is the listed sphere family explicitly the local system O_w, given that O is defined as a function on worlds, without claiming unprovided values at other worlds?'
 ,'OLTESTPRED-001':'Does the prose expansion of the Russell-set predicate describe sets that are not self-membered, matching x∉x rather than its double negation?'
 ,'OLTESTPRED-002':'Does following the cited authors mean accepting the vicious-circle principle and therefore introducing predicative comprehension?'
 ,'OLTESTORDISO-001':'Does the isomorphism f : A_{a_2} -> B_{b_2} have B_{b_2} as its range rather than its domain, making b_1 < b_2 follow from b_1 = f(a_1)?'
 ,'OLTESTORDBASIC-001':'Does the corrected least-witness proof choose the membership-least member satisfying phi within the witness ordinal, ensuring no earlier ordinal satisfies phi?'
 ,'OLTESTORDTYPE-001':'Does the order-isomorphism underlying function map the ordinal beta into the set B, rather than into the ordered-pair structure <B, lessdot>?'
 ,'OLTESTORDTYPE-002':'Does the existential initial-segment equivalence avoid f(alpha) when alpha is outside beta and establish both directions using restriction and ordinal uniqueness?'
 ,'OLTESTSPINREC-001':'Does the auxiliary xi term assign A to the empty function, which has ordinal domain zero, so the subsequent recursion base case is defined?'
 ,'OLTESTSPINFOUND-001':'Does the supremum in the transitive-set lemma range over the selected set B, rather than the unintroduced lowercase b?'
 ,'OLTESTSPINRANK-001':'Does the converse stage/rank proof exclude rank(x)=alpha, instead of contradicting its premise that x is in V_alpha?'
 ,'OLTESTREPLREFP-001':'Is the auxiliary witness-stage implication a balanced formula after removing the source’s extra closing parenthesis?'
 ,'OLTESTREPLREFP-002':'Does the omega-indexed union defining S range over S_m, matching its bound index and the following witness argument?'
 ,'OLTESTREPLREFP-003':'Is the existential predicate in the Replacement theorem’s set-builder expression properly closed, matching the proof’s final equality?'
 ,'OLTESTREPLFINITE-001':'Is N-is-transitive relativized to the surrounding transitive model M, making the next ambient transitivity step valid?'
 ,'OLTESTORDADD-001':'Does the successor-isomorphism codomain use ordinary union of the already tagged alpha and singleton components, as required by the disjoint-sum definition?'
 ,'OLTESTORDADD-002':'Does the zero-addition calculation eliminate the empty product 0 times {1}, rather than replacing it with the nonempty singleton {0}?'
 ,'OLTESTORDUSEADD-001':'Does the second product-rank exercise explicitly request equality at the lemma’s upper bound, filling its missing relation sign?'
 ,'OLTESTORDMULT-001':'Is the strict-supremum limit clause restricted to nonzero left factors, with zero left multiplication handled separately?'
 ,'OLTESTORDEXPO-001':'Do the finite-support functions map exponent beta to base alpha, with support and last-difference indices drawn from beta, so their order type matches alpha^beta?'
 ,'OLTESTORDEXPO-002':'Is the synthetic/recursive equivalence exercise restricted to positive base, with the zero-base mismatch disclosed rather than hidden?'
 ,'OLTESTCARDCLASS-001':'Does the gloss of card(A) notin omega say that A is not finite, rather than incorrectly saying that A is not a natural number?'
 ,'OLTESTCARDSIMP-001':'Does the segment-size argument explicitly handle the omitted finite maximum-coordinate case before concluding the bound for every pair?'
 ,'OLTESTCARDEXPO-001':'Does the disjoint-sum restriction map produce an ordered pair of functions, as required by the Cartesian-product codomain?'
 ,'OLTESTCARDEXPO-002':'Is the direct curried-function bijection stated over the Cartesian product domain, with cardinal-product equality applied only afterward?'
 ,'OLTESTCARDEXPO-003':'Is the infinite-base finite-exponent proposition restricted to nonzero exponents, excluding the false exponent-zero case?'
 ,'OLTESTCARDCH-001':'Does the transfinite recursion paragraph identify the aleph and beth sequences, rather than a fixed cardinal, as recursively defined?'
 ,'OLTESTCARDCH-002':'Does the aleph-index proof handle the omega base, restrict indexed predecessors to infinite cardinals, and explain uniqueness?'
 ,'OLTESTCARDCH-003':'Is the GCH exponent bound qualified to infinite base and nonzero smaller exponent, excluding the zero-exponent counterexample?'
 ,'OLTESTCARDFIX-001':'Does tau begin above the input cardinal, so the claimed strict inequality still holds when the input cardinal is already a beth fixed point?'
 ,'OLTESTCARDFIX-002':'Does W begin at a beth fixed point and preserve fixed-point status through successor and limit stages, so the all-index width-height claim holds?'
 ,'OLTESTCHOICEHART-001':'Does the transitivity proof take the well-ordered domain B as a subset of A, rather than of its relation R?'
 ,'OLTESTCHOICEHART-002':'Is the transported well-order defined using two actual indices in the domain of f, rather than f(alpha) at an excluded endpoint?'
 ,'OLTESTCHOICEHART-003':'Do the order-isomorphism functions have A and B as their underlying codomain sets, while preserving the order-isomorphism property?'
 ,'OLTESTCHOICEHART-004':'Are the disjoint-sum and Cartesian-product comparisons with the larger set stated separately rather than as a nested cardinal-comparison argument?'
 ,'OLTESTCHOICEWO-001':'Is the empty set handled separately before evaluating f(A), which is undefined for the empty set under the given choice-function domain?'
 ,'OLTESTCHOICEWO-002':'Does the stop marker begin at or after the first completed stage, leaving the pre-stop choice enumeration intact for the injectivity and bijection argument?'
 ,'OLTESTCHOICECOUNT-001':'Is the finite family listed without repetition before the chosen ordered pairs are called a function?'
 ,'OLTESTCHOICECOUNT-002':'Does the cardinal bound use the union of prior varying A_i, rather than a repeated A_n under a dummy index?'
 ,'OLTESTCHOICEBANACH-001':'Does the interval-to-real tangent example have balanced parentheses after removing the extra closing parenthesis in the source?'
 ,'OLTESTCHOICEVITALI-001':'Are the chosen rotation angles rational multiples of a full turn, giving a group under composition, rather than rational radian values?'
 ,'OLTESTCHOICEVITALI-002':'Does the inverse construction treat the zero rotation separately from the formula whose value would be the excluded full-turn endpoint?'
 ,'OLTESTCHOICEVITALI-003':'Does the partition proof index its first part over the defined rotation subset rather than undefined R_1?'
 ,'OLTESTCHOICEVITALI-004':'Is the paradoxical free-group claim restricted to rank at least two, and is the missing fixed-point treatment on the sphere clearly disclosed rather than presented as proved?'
 ,'OLTESTCHOICEVITALI-005':'Do both measure-proof rotation quantifiers range over the rotation group rather than over the set of representative points?'
 ,'OLTEMTHPRFPAT-001':'Does the nonemptiness equivalence concern the set A rather than the arbitrary member x, while leaving the final deliberately invalid proof clearly invalid?'
 ,'OLTEMTHPRFEX2-001':'Is the second inclusion expression balanced after closing the outer union parenthesis, without changing the intended two-inclusion equivalence?'
 ,'OLTEMTHPRFCON-001':'Does the Telugu text explicitly restrict deriving positive p from not-not-p to classical logic, without restricting the valid proof of a negated conclusion?'
 ,'OLTEMTHPRFCON-002':'Does the negated-subset counterexample use nonmembership in A union B rather than an undefined C?'
 ,'OLTEMTHPRFREA-001':'Does the expanded absorption proof list the reverse inclusion as obligation (b), matching the later proof rather than repeating obligation (a)?'
 ,'OLTEMTHPRFREA-002':'Is the final union-membership expression balanced after removing the extra closing parenthesis?'
 ,'OLTEMTHINDN-001':'Does the successor-step explanation substitute one for the quantified step variable k rather than for n?'
 ,'OLTEMTHINDN-002':'Does the dice theorem now cover zero dice separately while retaining the one-die base and positive successor argument?'
 ,'OLTEMTHINDSTR-001':'Is the predecessor-index rephrasing restricted to positive natural numbers, since zero has no predecessor?'
 ,'OLTEMTHINDSTR-002':'Does the empty-domain base instantiate the actual P(l) strong-induction premise, while correctly noting the source P(0) sentence is also vacuously true?'
 ,'OLTEHISSETLIM-001':'Does the passage identify the beta-dependent difference quotient, not the fixed derivative value, as approaching the gradient?'
 ,'OLTEHISSETLIM-002':'Does the epsilon-delta implication exclude x=c while retaining the source quantifier order and strict epsilon bound?'
 ,'OLTEHISSETLIM-003':'Does the absolute-value graph label exactly the four intended x-axis ticks without an unpaired or duplicated entry?'
 ,'OLTEHISSETPATH-001':'Is Peano’s map described as a continuous surjection from a line segment onto a square, without claiming a smooth curve can fill positive planar area?'
 ,'OLTEHISSETCANP-001':'Does the binary-expansion convention define a total interleaving map on the closed square and justify injectivity, including at 1?'
 ,'OLTEHISSETCANP-002':'Is the source’s 0.1010... witness rejected under that convention and replaced by a genuinely omitted value while preserving the historical argument?'
 ,'OLTEHISSETHILB-001':'Is the parameter x in the unit line rather than the square, with convergence still acknowledged as unproved by the sketch?'
 ,'OLTEHISSETHILB-002':'Does the target clearly distinguish the dense approximating images from a proved surjective pointwise limit?'
 ,'OLTEHISSETHILB-003':'Is the source’s target-neighborhood condition identified as different from continuity at each input parameter?'
 ,'OLTEHISSETHILB-004':'Does the final grid argument remain labeled an incomplete continuity proof pending specified parametrizations and convergence?'
 ,'OLTEFOLAXDPRV-001':'Is the second listed proposition distinguished from the opposite implication actually derived in its source proof?'
 ,'OLTEFOLAXDPRV-002':'Is the conjunction-elimination display’s incorrect disjunction conclusion disclosed without changing its protected formula?'
 ,'OLTEFOLAXDPRV-003':'Is the undefined Gamma_1 in the modus-ponens conclusion explained as a finite-support slip?'
 ,'OLTEFOLAXDPRV-004':'Is the weak-generalization axiom case understood as referring to each A_i rather than only final A?'
 ,'OLTEFOLAXDPRV-005':'Is the free-for lemma’s opening substitution mismatch with its stated target formula disclosed?'
 ,'OLTELAMSYNCONV-001':'Is the source fragment’s promised but absent formal alpha-conversion rule disclosed without inventing the missing material?'
 ,'OLTEMODBASENSA-001':'Is the source’s L_N/L notation switch identified without silently redefining the arithmetic language?'
 ,'OLTEMODBASENSA-002':'Does the separated-block argument conclude x*<y rather than merely repeat x<y?'
 ,'OLTEMODBASENSA-003':'Is distinct-block membership required before comparing blocks strictly?'
 ,'OLTEMODBASENSA-004':'Does the parity sentence say for every y there exists an x, matching division by two and the subsequent proof?'
 ,'OLTEPTCUTINVL-001':'Is the conjunction exercise identified as maximal-rank cut reduction rather than invertibility?'
 ,'OLTEPTCUTINVL-002':'Is the final maximal-rank reduction attributed to the local maximal-cut lemma rather than the earlier cut-admissibility lemma?'
 ,'OLTEPTCUTINVL-003':'Does the atomic principal-axiom case use Delta-prime in its succedent decomposition, matching the next sequent?'
 ,'OLTEPTCUTTOP-001':'Does the alternative axiom case name the left premise proof pi_1 for the doubled succedent?'
 ,'OLTEPTCUTTOP-002':'Does the disjunction case use the defined cutrank macro instead of the undefined cutr?'
 ,'OLTEPTCUTTOP-003':'Does the lower cut in the final implication tree remove B from its conclusion?'
 ,'OLTEPTCUTTOP-004':'Do both Case D trees use Delta-prime where an explicit B-and-C copy is appended?'
 ,'OLTEPTCUTITP-001':'Does the Beth proof use Maehara’s language inclusion rather than an undefined equality of L_1 and L_2?'
 ,'OLTEPTCUTITP-002':'Does the Beth conclusion name predicate R, not the source typo !R?'
 ,'OLTEPTCUTITP-003':'Is the complete common theory assumed in the whole shared language, as the next argument requires?'
 ,'OLTEPTCUTITP-004':'Does the joint-consistency argument use completeness and consistency instead of reversing entailment from an extension to its base?'
 ,'OLTEPTCUTITP-005':'Is the variable-term case separated from the constant-symbol case without function symbols?'
 ,'OLTEPTCUTITP-006':'Is the primed ambient language distinguished from the symbols actually occurring in the primed theory?'
 ,'OLTEPTCUTINT-001':'Is the context-sharing cut diagram labeled CutCS rather than Cut?'
 ,'OLTEPTCUTAUX-001':'Is the reversed B! in the auxiliary implication cut tree corrected to !B?'
 ,'OLTEPTCUTAUX-002':'Is the undefined cutr rank macro replaced by cutrank and disclosed?'
 ,'OLTEPTCUTAUX-003':'Are the unresolved final Cut-tree context inconsistencies disclosed without claiming a verified derivation?'
 ,'OLTEPTCUTMID-001':'Does the Herbrand extraction refer to the displayed pi_1 rather than an undefined pi_1-prime?'
 ,'OLTEPTCUTMID-002':'Does the zero-order proof handle the possibility of no quantifier inferences?'
 ,'OLTEPTCUTMID-003':'Is the stray marker before Gamma-prime removed from the existential permutation tree?'
 ,'OLTEPTNATGRA-001':'Does the implication-introduction tree conclude B-to-A rather than B-to-C?'
 ,'OLTEPTNATGRA-002':'Is the sequent derivation correctly identified as N2c/N2i rather than N1c/N1i?'
 ,'OLTEPTNATGRA-003':'Is induction on the height of delta_1 rather than an undefined delta?'
 ,'OLTEPTNATGRA-004':'Are replaced open assumptions excluded from the grafted derivation’s remaining open assumptions?'
 ,'OLTEPTNATINT-001':'Does the Jaśkowski box begin with assumption A and end with consequent B?'
 ,'OLTEPTNATINT-002':'Does implication introduction conclude Gamma entails A-to-B?'
 ,'OLTEPTNATQUA-001':'Does the existential-elimination substitution case show both substituted premises and its correct two-branch inference?'
 ,'OLTEPTNATQUA-002':'Does the regularization induction choose a highest dirty inference whose upper subproof is regular?'
 ,'OLTEPTNATN1-001':'Does the existential eigenconstant restriction avoid forbidding its required occurrence in the minor premise?'
 ,'OLTEPTNATN2-001':'Do the caption’s quantifier rule macros match the N2 table and its later wording?'
 ,'OLTEPTNATRPR-001':'Are N1 derivations consistently characterized as formula trees built from assumptions?'
 ,'OLTEPTNATRPR-002':'Does the third premise of the generic three-premise tree end in A_3?'
 ,'OLTEPTNATRPR-003':'Does the reference to tab:N1 correctly name N1c/N1i rules?'
 ,'OLTEPTNATRPR-004':'Is the discharge label attached to the whole conjunction assumption in every example diagram?'
 ,'OLTEPTNATRPR-005':'Are the immediate subproof and example heights stated consistently with the derivations?'
 ,'OLTEPTNATSEQ-001':'Are the opening natural-deduction formula-tree systems named N1c/N1i rather than G1c/G1i?'
 ,'OLTEPTNATSEQ-002':'Is the missing formula marker restored in the N2 implication-introduction tree?'
 ,'OLTEPTNATSEQ-003':'Does the reverse translation identify the N1 inductive subproof as delta_1-prime in prose and diagrams?'
 ,'OLTEPTNATG2I-001':'Does the proof use G2i as the source calculus, consistent with the proposition?'
 ,'OLTEPTNATG2I-002':'Does the induction hypothesis produce N2i rather than N2c derivations?'
 ,'OLTEPTNATG2I-003':'Is the left-weakening inference correctly labelled on the diagram?'
 ,'OLTEPTNATG2I-004':'Are labelled formulas renamed in the induced N2i derivation rather than the G2i source proof?'
 ,'OLTEPTNATG2I-005':'Is implication introduction applied to the inductive derivation to obtain the final derivation?'
 ,'OLTEPTNATG2I-006':'Does implication-left relabel the induced derivation and retain its context in the auxiliary tree?'
 ,'OLTEPTNATG2I-007':'Does conjunction-right use B for its second premise and relabel the induced N2i derivation?'
 ,'OLTEPTNATN2I-001':'Does the proposition target G2i rather than repeat N2i?'
 ,'OLTEPTNATN2I-002':'Does implication elimination with a false conclusion derive an empty succedent from the actual second-premise result?'
 ,'OLTEPTNATN2I-003':'Is the N2 label removed from the G2c proof-tree premise?'
 ,'OLTEPTNATN2I-004':'Does classical absurdity with a false conclusion reach the required empty succedent?'
 ,'OLTEPTNORINT-001':'Are delta_1 and delta_2 consistently assigned to the A proof and the B-from-A subproof?'
 ,'OLTEPTNORPER-001':'Does the first cut formula agree with the displayed conjunction-elimination derivation?'
 ,'OLTEPTNORPER-002':'Is the second exercise consistently phrased with the N1i existential-elimination rule?'
 ,'OLTEPTNORPER-003':'Does the eigenvariable explanation use the same existential-elimination rule as its displayed derivation?'
 ,'OLTEPTNORRED-001':'Is the unexplained fourth subproof removed only from the unchanged-cut list while the actual derivation remains intact?'
 ,'OLTEPTNORSEG-001':'Does the conclusion follow the minor premise in the segment explanation, consistent with the formal definition?'
 ,'OLTEPTNORSEG-002':'Is the next formula occurrence marked with the same exclamation notation as the rest of the sequence?'
 ,'OLTEPTNORSEG-003':'Does the one-occurrence cut summary include the falsum-elimination alternative from the formal definition?'
 ,'OLTEPTNORTR-001':'Is the cut-free source system consistently named G2i?'
 ,'OLTEPTNORTR-002':'Is the first corollary consistently targeted at N2i?'
 ,'OLTEPTNORTR-003':'Is normality stated as the condition for avoiding cuts in the reverse translation?'
 ,'OLTEPTNORTR-004':'Does the transformed conjunction-case proof use the declared delta_1 label?'
 ,'OLTEPTNORTR-005':'Does the conjunction-case G2i induction result remove labels and use the primed context?'
 ,'OLTEPTNORTR-006':'Do the implication-case G2i results use Gamma_1 prime and Gamma_2 prime respectively?'
 ,'OLTEPTNORTR-007':'Is the falsum condition for the first right weakening complete?'
 ,'OLTEPTNORTR-008':'Does the N1i subformula scope include open assumptions, as the N2i end-sequent does?'
 ,'OLTEPTPSCPL-001':'Is the missing formula letter restored in the countermodel condition for the succedent?'
 ,'OLTEPTPSCPL-002':'Does the failure-branch constant set refer to the defined Lambda_n succedent?'
 ,'OLTEPTPSCPL-003':'Do all m-place term-model lists and domain powers use the same arity m?'
 ,'OLTEPTPSSAL-001':'Does fresh index allocation keep every new index strictly above the previous maximum?'
 ,'OLTEPTPSSAL-002':'Is the right-existential reduction tree labelled with the right rule?'
 ,'OLTEPTPSSAL-003':'Does the prose retain the selected existential occurrence index?'
 ,'OLTEPTPSSAL-004':'Does the exhausted-term fallback stay within the nonempty assigned constant set?'
 ,'OLTEPTPSTAB-001':'Are both initial succedent formulas signed false?'
 ,'OLTEPTPSTAB-002':'Does true falsum close a branch and translate to the falsum axiom?'
 ,'OLTEPTPSTAB-003':'Is finite open-branch saturation distinguished from checking off reusable quantifiers?'
 ,'OLTEPTPTYINT-001':'Is the displayed M1 M2 typing rule clearly described as application rather than function composition?'
 ,'OLTEPTPTYNOR-001':"Is the disclosed treatment precise: Use the explicitly declared summand types."
 ,'OLTEPTPTYNOR-002':"Is the disclosed treatment precise: Adjoin zero to the set whose maximum is taken."
 ,'OLTEPTPTYNOR-003':"Is the disclosed treatment precise: Use x in the major-term position."
 ,'OLTEPTPTYNOR-004':"Is the disclosed treatment precise: Remove only the stray parenthesis."
 ,'OLTEPTPTYNOR-005':"Is the disclosed treatment precise: Describe the rank as the length of the substituted variable type."
 ,'OLTEPTPTYNOR-006':"Is the disclosed treatment precise: Include both proper source subterms; the stated strict rank assumption covers them."
 ,'OLTEPTPTYNOR-007':"Is the disclosed treatment precise: Retain the source argument for inspection and explicitly disclose the gap; do not certify normalization or the separately asserted strong normalization."
 ,'OLTEPTPTYNOR-008':"Is the disclosed treatment precise: Use O1' as the common result."
 ,'OLTEPTPTYNOR-009':"Is the disclosed treatment precise: Keep the source example and explicitly disclose that a complete weak Church–Rosser proof has not been supplied."
 ,'OLTEPTPTYNOR-010':"Is the disclosed treatment precise: Apply strong normalization to the one-step relation in the prose, Newman statement and proof; retain multistep confluence."
 ,'OLTEPTPTYNOR-011':"Is the disclosed treatment precise: Write the initial one-step arrows."
 ,'OLTEPTPTYNOR-012':"Is the disclosed treatment precise: Reduce the common descendant to N* under the stated termination assumption, then compare normal forms."
};
const correctionRecords=corrections.map(c=>{
 const segments=ledger.filter(s=>s.unit_id===c.unit_id&&s.source_corrections?.includes(c.finding_id));
 if(!segments.length)throw new Error('Missing correction segment '+c.finding_id);
 const sourcePath=c.source_path,targetPath=c.target_locator.replace(/^translation\//,'').replace(/:\d.*$/,'');
 const targetFile=`translation/${targetPath}`;
 const locations=segments.map(segment=>({
  unit_id:c.unit_id,
  section_path:sourcePath.replace(/^content\//,'').replace(/\.tex$/,''),
  source_file:sourcePath,
  target_file:targetFile,
  segment_id:segment.segment_id,
  source_locator:segments.length===1?c.source_locator:`lines ${segment.source_start_line}-${segment.source_end_line}; mapped segment within audited scope ${c.source_locator}`,
  target_locator:segments.length===1?c.target_locator:`${targetFile}:${segment.target_start_line}-${segment.target_end_line}`,
  source_unit_sha256:c.source_sha256,
  translation_unit_sha256:segment.translation_unit_sha256,
  source_segment_sha256:segment.source_segment_sha256,
  translation_segment_sha256:segment.translation_segment_sha256,
  final_printed_page:null,
  pagination_status:'pending_coherent_reader_pagination'
 }));
 const rawQuestion=correctionQuestions[c.finding_id]??`whether the Telugu disclosure for ${c.finding_id} is mathematically precise and idiomatic.`;
 const question=/^Please double-check/i.test(rawQuestion)?rawQuestion:`Please double-check: ${rawQuestion}`;
 const qualified=c.qualification?.disposition==='rejected_false_positive';
 const unresolvedProof=['OLTELAMALP-005','OLTELAMALP-006','OLTELAMCRPB-003','OLTELAMCRB-001','OLTELAMCRB-003','OLTELAMCRPBE-002','OLTELAMCRPBE-003','OLTELAMCRPBE-004','OLTELAMCRPBE-005','OLTELAMCRBE-001','OLTELAMCRBE-002','OLTELAMCRBE-003','OLTELAMCRBE-004','OLTESTCHOICEVITALI-004','OLTEPTPTYNOR-007','OLTEPTPTYNOR-009','OLTEPTSEQMG3I-002'].includes(c.finding_id);
 return {review_id:'REV-'+c.finding_id,record_type:'source_correction_decision',scope_completion:completion,language:'Telugu',script:'Telu',locale:'te-Telu-IN',finding_id:c.finding_id,classification:c.classification,...(c.qualification?{qualification:c.qualification}:{}),confidence:unresolvedProof?'source_proof_gap_disclosed_not_repaired':'high_mathematical_repair_moderate_disclosure_wording',review_priority:unresolvedProof?'high':'medium',expert_review_status:unresolvedProof?'source_proof_gap_disclosed_structural_qa_passed_full_proof_pending_no_translation_hold':qualified?'historical_error_classification_rejected_equivalent_notation_qa_passed_disclosure_wording_open_for_optional_review_no_hold':'mathematical_correction_qa_passed_disclosure_wording_open_for_optional_review_no_hold',implementation_locations:locations,actual_authorities_checked:[{audit_id:c.audit_id,audit_review_sha256:c.audit_review_sha256,audit_findings_sha256:c.audit_findings_sha256},...(qualified?[{qualification_review_sha256:c.qualification.consolidation_review_sha256,disposition:c.qualification.disposition,review_path:c.qualification.review_path}]:[]),{source_revision:'9620cc73f9c8e0ad003c514a5d3748f29611c4c0',source_path:c.source_path,source_sha256:c.source_sha256}],not_checked_or_not_found:[unresolvedProof?'మూల సిద్ధాంతానికి పూర్తి స్వతంత్ర నిరూపణ ఇంకా నమోదు కాలేదు; నిర్మాణాత్మక QA నిరూపణను ధృవీకరించదు.':qualified?'No independent human subject expert has reviewed the Telugu qualification wording yet; the equivalent notation and false-positive disposition were checked by the consolidation review and correction-aware structural QA.':'No independent human subject expert has reviewed the Telugu disclosure wording yet; the mathematical treatment was checked by the recorded source audit and correction-aware structural QA.'],rationale:c.body_treatment,alternatives_considered_or_recorded:unresolvedProof?['మూల నిరూపణలోని అన్యాయ దశను నిరూపితంగా ప్రకటించడం (తిరస్కరణ)','మూల దశను పరిశీలన కోసం ఉంచి ఖాళీని పక్కనే ప్రకటించడం (ఎంపిక)','బలపరిచిన ఆగమన పరికల్పనతో పూర్తి నిరూపణను తరువాతి సమీక్షలో ఇవ్వడం (ఇంకా చేయలేదు)']:qualified?['Retain the valid nested cardinality construction verbatim (viable, but the explicit pair is clearer in the target).','Present the two equivalent explicit comparisons and disclose the rejected historical classification (chosen).']:['Translate the defective source claim verbatim (rejected because it would knowingly reproduce the defect).','Apply the recorded minimal mathematical repair and disclose it adjacent to the translated claim (chosen).'],uncertainty:unresolvedProof?'మూల వాదనలో నిరూపణ ఖాళీ నిర్ధారితమైనది; పూర్తి సిద్ధాంత నిరూపణ ఇంకా లేదు.':qualified?'Low for mathematical equivalence and the rejected-false-positive disposition; optional review remains useful for the clarity of its Telugu qualification.':'Low for the recorded mathematical repair; optional review remains useful for the clarity of its Telugu disclosure.',rationale_phase:unresolvedProof?'మూల పాఠ్యాన్ని నేరుగా పరిశీలించి నిరూపణ ఖాళీని అనువాదంలో ప్రకటించాం; నిర్మాణాత్మక QA సూత్రాల సంరక్షణను మాత్రమే పరీక్షించింది.':qualified?'Historical audit record retained and qualified by the 2026-09-19 consolidation review, followed by correction-aware batch QA.':'Contemporaneous application of the recorded source audit, followed by correction-aware batch QA.',precise_review_questions:[question],translation_hold:false,status:c.status};
});
const records=[...termRecords,...correctionRecords];
const jsonText=records.map(x=>JSON.stringify(x)).join('\n')+'\n';
fs.writeFileSync(path.join(dataDir,'EXPERT_REVIEW_LOG.jsonl'),jsonText);
const machine={schema:'openlogic-te-expert-review-index/2',status:'partial_no_holds',scope_completion:completion,language:'Telugu',script:'Telu',locale:'te-Telu-IN',counts:{records:records.length,terminology:termRecords.length,source_corrections:correctionRecords.length,implementation_occurrences:records.reduce((n,r)=>n+r.implementation_locations.length,0)},pagination_note:'Final printed/PDF page is deliberately null until the cited source unit is integrated into the coherent reader and final pagination is available. Source and target file/line locators are authoritative meanwhile.',records};
const machineText=JSON.stringify(machine,null,2)+'\n';
fs.writeFileSync(path.join(dataDir,'EXPERT_REVIEW_LOG.json'),machineText);
const md=['# Optional expert-review log','',`Status: **partial — ${draftedSourceUnits} of ${sourceUnitTotal} draft units**. This log contains ${termRecords.length} terminology/sense decisions and ${correctionRecords.length} source-correction decisions. Every item remains open to optional specialist review, but **no item is a translation hold**. Work continues even when a dictionary or expert is unavailable.`,'','Locale/script: **te-Telu-IN / Telu**. Final printed/PDF pages are explicitly marked pending until each cited source unit is integrated into the coherent reader and final pagination exists; exact unit, section, file and line locators remain available now.','',`“Attested” means only that the specifically listed native page was actually inspected for the stated scope. It does not mean a human expert endorsed the final edition. The terminology rationales below were reconstructed retrospectively from primary records and exact current files; source-correction entries come from the contemporaneous audit.`,'','Companions: `EXPERT_REVIEW_PRIORITY.md`, `EXPERT_REVIEW_OCCURRENCES.csv`, `EXPERT_REVIEW_LOG.json`, and line-oriented `EXPERT_REVIEW_LOG.jsonl`.',''];
for(const r of records){
 md.push(`## ${r.review_id} — ${r.source_term??r.finding_id}`,'',`- Status: ${r.expert_review_status}`,'',`- Locale/script: ${r.locale} / ${r.script}`,'',`- Confidence/priority: ${r.confidence} / ${r.review_priority}`,'',`- Chosen wording/treatment: ${r.chosen_wording??r.rationale}`,'',`- Exact implementation: ${r.implementation_locations.map(x=>`${x.unit_id}; ${x.section_path}; ${x.source_locator} ↔ ${x.target_locator} (${x.segment_id}); printed/PDF page ${x.final_printed_page??'pending'}`).join('; ')}`,'',`- Authorities actually checked: ${r.actual_authorities_checked.map(x=>x.passage_id?`${x.passage_id}, PDF ${x.pdf_page}, printed ${x.printed_page}, ${x.region}`:`${x.audit_id??x.source_revision}`).join('; ')}`,'',`- Not checked/not found: ${r.not_checked_or_not_found.join(' ')}`,'',`- Rationale: ${r.rationale}`,'',`- Alternatives: ${r.alternatives_considered_or_recorded.join('; ')}`,'',`- Uncertainty: ${r.uncertainty}`,'',`- Please double-check: ${r.precise_review_questions.join(' ')}`,'');
}
fs.writeFileSync(path.join(dataDir,'EXPERT_REVIEW_LOG.md'),md.join('\n').trimEnd()+'\n');
const priorityRecords=records.filter(r=>r.review_priority==='high'||r.review_priority==='medium');
const priorityMd=['# Priority optional expert-review view','',`Scope: **partial — ${draftedSourceUnits} of ${sourceUnitTotal} draft units**. This view selects ${priorityRecords.length} of ${records.length} open decisions whose nomenclature is highly provisional or whose correction disclosure merits a human clarity check. It creates no translation hold.`,'','Final printed/PDF pages remain pending coherent-reader pagination; exact unit, section, file and line locators are supplied.',''];
for(const r of priorityRecords)priorityMd.push(`## ${r.review_id} — ${r.source_term??r.finding_id}`,'',`- Priority/confidence: ${r.review_priority} / ${r.confidence}`,'',`- Chosen wording/treatment: ${r.chosen_wording??r.rationale}`,'',`- Occurrences: ${r.implementation_locations.map(x=>`${x.unit_id}; ${x.section_path}; ${x.target_locator}; printed/PDF page ${x.final_printed_page??'pending'}`).join('; ')}`,'',`- Please double-check: ${r.precise_review_questions.join(' ')}`,'');
fs.writeFileSync(path.join(dataDir,'EXPERT_REVIEW_PRIORITY.md'),priorityMd.join('\n').trimEnd()+'\n');
const headers=['review_id','record_type','review_priority','confidence','source_term_or_finding','chosen_rendering_or_treatment','language','script','locale','unit_id','section_path','source_file','target_file','source_locator','target_locator','segment_id','final_printed_page','pagination_status','expert_review_status','please_double_check'];
const occurrences=records.flatMap(r=>r.implementation_locations.map(loc=>({review_id:r.review_id,record_type:r.record_type,review_priority:r.review_priority,confidence:r.confidence,source_term_or_finding:r.source_term??r.finding_id,chosen_rendering_or_treatment:r.chosen_wording??r.rationale,language:r.language,script:r.script,locale:r.locale,unit_id:loc.unit_id,section_path:loc.section_path,source_file:loc.source_file,target_file:loc.target_file,source_locator:loc.source_locator,target_locator:loc.target_locator,segment_id:loc.segment_id,final_printed_page:loc.final_printed_page??'',pagination_status:loc.pagination_status,expert_review_status:r.expert_review_status,please_double_check:r.precise_review_questions.join(' ')})));
const csvCell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const csvText=[headers.map(csvCell).join(','),...occurrences.map(row=>headers.map(h=>csvCell(row[h])).join(','))].join('\n')+'\n';
fs.writeFileSync(path.join(dataDir,'EXPERT_REVIEW_OCCURRENCES.csv'),csvText);
console.log(JSON.stringify({records:records.length,terminology:termRecords.length,source_corrections:correctionRecords.length,priority:priorityRecords.length,occurrences:occurrences.length,jsonl_bytes:Buffer.byteLength(jsonText),json_bytes:Buffer.byteLength(machineText),csv_bytes:Buffer.byteLength(csvText),status:'partial_no_holds'}));

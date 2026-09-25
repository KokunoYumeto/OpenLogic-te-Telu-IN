import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const dataArg=process.argv.find(a=>a.startsWith('--data-dir='));
if(process.argv.some(a=>a.startsWith('--')&&!a.startsWith('--data-dir=')))throw new Error('Unknown option');
const dataDir=dataArg?path.resolve(dataArg.slice(11)):path.join(root,'evidence');
const jsonl=name=>fs.readFileSync(path.join(dataDir,name),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const terms=jsonl('TERM_DECISIONS.jsonl'),passages=Object.fromEntries(jsonl('CANON_PASSAGES.jsonl').map(x=>[x.passage_id,x]));
const corrections=jsonl('SOURCE_CORRECTIONS.jsonl').filter(c=>c.status.startsWith('applied')),ledger=jsonl('SEGMENT_CANON_USE.jsonl');
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
 'TE-T017':[L('content/sets-functions-relations/relations/equivalence-relations.tex',16,20,16,20,'Equivalence relation','తుల్యతా సంబంధం'),L('content/sets-functions-relations/relations/equivalence-relations.tex',31,36,30,36,'equivalence class','తుల్యతా వర్గం'),L('content/sets-functions-relations/relations/orders.tex',22,24,23,25,'Preorder','పూర్వక్రమం'),L('content/sets-functions-relations/relations/orders.tex',27,29,28,30,'Partial order','పాక్షిక క్రమం'),L('content/sets-functions-relations/relations/orders.tex',32,34,33,35,'Linear order','రేఖీయ క్రమం'),L('content/sets-functions-relations/relations/orders.tex',82,84,88,90,'Strict order','కఠిన క్రమం')],
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
const completion=`partial_${draftedSourceUnits}_of_${sourceUnitTotal}_draft_units`;
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
const phase='Evidence reconstruction through 2026-09-25 from the current primary TERM_DECISIONS, aligned segment ledger, canonical-passage records and exact source/target bytes; earlier records are not represented as contemporaneous pre-draft notes, while TE-T064--TE-T087 record the Batch 025--Batch 047 consultations performed during reconciliation. The 2026-09-25 classification repair restores reader-visible headings and token statements to linguistic segments using recorded same-unit canon consultations.';
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
 const unresolvedProof=['OLTELAMALP-005','OLTELAMALP-006'].includes(c.finding_id);
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

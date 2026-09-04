import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const dataArg=process.argv.find(a=>a.startsWith('--data-dir='));
if(process.argv.some(a=>a.startsWith('--')&&!a.startsWith('--data-dir=')))throw new Error('Unknown option');
const dataDir=dataArg?path.resolve(dataArg.slice(11)):path.join(root,'evidence');
const jsonl=name=>fs.readFileSync(path.join(dataDir,name),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const terms=jsonl('TERM_DECISIONS.jsonl'),passages=Object.fromEntries(jsonl('CANON_PASSAGES.jsonl').map(x=>[x.passage_id,x]));
const corrections=jsonl('SOURCE_CORRECTIONS.jsonl').filter(c=>c.status.startsWith('applied')),ledger=jsonl('SEGMENT_CANON_USE.jsonl');
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
 'TE-T030':[L('content/sets-functions-relations/arithmetization/reals.tex',74,74,76,81,'Completeness Property','సంపూర్ణతా ధర్మం'),L('content/sets-functions-relations/arithmetization/cuts.tex',26,29,26,29,'\\emph{cut}','\\emph{కోత}'),L('content/sets-functions-relations/arithmetization/cauchy.tex',83,87,78,82,'\\emph{Cauchy sequence}','\\emph{కౌషీ క్రమం}')]
};
const alternatives={
 'TE-T002':['మూలకం (chosen)','సభ్యము (documented synonym)'],
 'TE-T003':['మూలకాధారిత సమానత్వం (chosen descriptive coinage)','English-headword transliteration (not adopted)'],
 'TE-T004':['నిజ ఉపసమితి (chosen)','క్రమ ఉపసమితి (TE-P009 witness form)'],
 'TE-T012':['క్రమిత జత (chosen)','క్రమయుగ్మం (TE-P008 witness form)','tuple transliteration (not adopted for the generalization)'],
 'TE-T019':['గ్రాఫు / నోడ్‌లు (explicit borrowings)','fully native graph/node replacements (not located in checked witnesses)'],
 'TE-T023':['ఒకటి-ఒకటి (chosen transparent injective form)','an established specialist injective headword, if documented'],
 'TE-T024':['సీరియల్ (explicit borrowing)','a documented Telugu formal-relation headword, if one exists'],
 'TE-T025':['తాదాత్మ్య ప్రమేయం (chosen identity variant)','తత్సమ ప్రమేయం (TE-P015 witness form)'],
 'TE-T026':['లెక్కించదగిన / లెక్కించలేని (chosen transparent forms)','గణనీయ / అగణనీయ (not adopted here because of collision with computability terminology)','జాబితా చేయదగిన / చేయలేని (retained as explanatory gloss)'],
 'TE-T027':['సమసంఖ్యాక (chosen transparent headword)','తుల్య సమితులు (TE-P016 witness expression for the finite concept)'],
 'TE-T028':['descriptive Telugu constructions (chosen)','source-eponym transliterations for Cantor and Schröder–Bernstein (retained)'],
 'TE-T029':['descriptive Telugu algebra headwords (chosen)','untranslated English algebra terminology (not adopted in prose)','source-eponym-free explanatory paraphrases (used where needed)'],
 'TE-T030':['descriptive Telugu bound/completeness terminology (chosen)','Dedekind and Cauchy source-eponym transliterations (retained)','untranslated English analysis terminology (not adopted in prose)']
};
const completion='partial_45_of_722_draft_units';
const lines=(kind,loc)=>{
 const base=path.join(root,kind==='source'?'upstream':'translation',loc.path);
 const all=fs.readFileSync(base,'utf8').split(/\r?\n/),start=loc[kind+'_start'],end=loc[kind+'_end'];
 return all.slice(start-1,end).join('\n');
};
const detailedLocation=loc=>{
 const sourceText=lines('source',loc),targetText=lines('target',loc);
 const normalizedSource=sourceText.normalize('NFC'),normalizedTarget=targetText.normalize('NFC');
 const sourceIndex=normalizedSource.indexOf(loc.source_needle.normalize('NFC')),targetIndex=normalizedTarget.indexOf(loc.target_needle.normalize('NFC'));
 if(sourceIndex<0)throw new Error('Source locator mismatch '+loc.path+':'+loc.source_start);
 if(targetIndex<0)throw new Error('Target locator mismatch '+loc.path+':'+loc.target_start);
 const sourceLine=loc.source_start+normalizedSource.slice(0,sourceIndex).split('\n').length-1;
 const targetLine=loc.target_start+normalizedTarget.slice(0,targetIndex).split('\n').length-1;
 const segment=ledger.find(s=>s.source_path===loc.path&&s.source_start_line<=sourceLine&&s.source_end_line>=sourceLine&&s.target_start_line<=targetLine&&s.target_end_line>=targetLine);
 if(!segment)throw new Error('No aligned segment for '+loc.path+':'+loc.source_start);
 return {unit_id:segment.unit_id,segment_id:segment.segment_id,source_locator:`${loc.path}:${loc.source_start}${loc.source_end===loc.source_start?'':'-'+loc.source_end}`,target_locator:`translation/${loc.path}:${loc.target_start}${loc.target_end===loc.target_start?'':'-'+loc.target_end}`,source_unit_sha256:segment.source_unit_sha256,translation_unit_sha256:segment.translation_unit_sha256,source_segment_sha256:segment.source_segment_sha256,translation_segment_sha256:segment.translation_segment_sha256};
};
const phase='Retrospective reconstruction on 2026-09-04 from the current primary TERM_DECISIONS, aligned segment ledger, canonical-passage records and exact source/target bytes; it is not represented as a contemporaneous pre-draft note.';
const notChecked=['No human Telugu logician, mathematician or copy editor has reviewed this choice yet.','No independent Telugu logic dictionary or comprehensive AP/Telangana higher-education terminology standard was checked unless it appears among the listed passage records.'];
const termRecords=terms.map(d=>{
 if(!locations[d.term_id])throw new Error('Missing review locations '+d.term_id);
 const checked=(d.passages??[]).map(id=>{const p=passages[id];if(!p)throw new Error('Unknown passage '+id);return {passage_id:id,source_id:p.source_id,pdf_page:p.pdf_page,printed_page:p.printed_page,region:p.region,verified:p.verified,role:p.role};});
 const rationale=[d.basis,d.decision,d.scope,d.borrowing].filter(Boolean).join(' ');
 const uncertainty=d.uncertainty??`Not separately graded in the original record; evidence status is ${d.status}, and optional specialist review remains open.`;
 return {review_id:'REV-'+d.term_id,record_type:'terminology_or_sense_decision',scope_completion:completion,term_id:d.term_id,source_term:d.source_term,chosen_wording:d.telugu,chosen_sense:d.scope??'The precise extension is fixed by the adjacent OpenLogic definition and formulas.',evidence_status:d.status,expert_review_status:'provisional_pending_optional_specialist_review_no_hold',implementation_locations:locations[d.term_id].map(detailedLocation),actual_authorities_checked:checked,not_checked_or_not_found:notChecked,rationale,alternatives_considered_or_recorded:alternatives[d.term_id]??['No separate alternative was recorded in the primary decision; retain the current reversible wording unless a specialist supplies a source-grounded replacement.'],uncertainty,rationale_phase:phase,precise_review_questions:[`Is “${d.telugu}” idiomatic and technically standard for “${d.source_term}” in Telugu logic/mathematics across Andhra Pradesh and Telangana?`,`If not, what exact replacement should be used while leaving the displayed definition, formulas and source scope unchanged?`],translation_hold:false};
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
 'OLTEARITH-008':'Is S consistently a family of representative sequences while every ordered object is its represented equivalence class?'
};
const correctionRecords=corrections.map(c=>{
 const segment=ledger.find(s=>s.unit_id===c.unit_id&&s.source_corrections?.includes(c.finding_id));
 if(!segment)throw new Error('Missing correction segment '+c.finding_id);
 return {review_id:'REV-'+c.finding_id,record_type:'source_correction_decision',scope_completion:completion,finding_id:c.finding_id,classification:c.classification,expert_review_status:'mathematical_correction_qa_passed_disclosure_wording_open_for_optional_review_no_hold',implementation_locations:[{unit_id:c.unit_id,segment_id:segment.segment_id,source_locator:c.source_locator,target_locator:c.target_locator,source_unit_sha256:c.source_sha256,translation_unit_sha256:segment.translation_unit_sha256,source_segment_sha256:segment.source_segment_sha256,translation_segment_sha256:segment.translation_segment_sha256}],actual_authorities_checked:[{audit_id:c.audit_id,audit_review_sha256:c.audit_review_sha256,audit_findings_sha256:c.audit_findings_sha256},{source_revision:'9620cc73f9c8e0ad003c514a5d3748f29611c4c0',source_path:c.source_path,source_sha256:c.source_sha256}],not_checked_or_not_found:['No independent human subject expert has reviewed the Telugu disclosure wording yet; the mathematical treatment was checked by the recorded source audit and correction-aware structural QA.'],rationale:c.body_treatment,alternatives_considered_or_recorded:['Translate the defective source claim verbatim (rejected because it would knowingly reproduce the defect).','Apply the recorded minimal mathematical repair and disclose it adjacent to the translated claim (chosen).'],uncertainty:'Low for the recorded mathematical repair; optional review remains useful for the clarity of its Telugu disclosure.',rationale_phase:'Contemporaneous application of the recorded 2026-09-04 source audit, followed by correction-aware batch QA.',precise_review_questions:[correctionQuestions[c.finding_id]??`Is the Telugu disclosure for ${c.finding_id} mathematically precise and idiomatic?`],translation_hold:false,status:c.status};
});
const records=[...termRecords,...correctionRecords];
const jsonText=records.map(x=>JSON.stringify(x)).join('\n')+'\n';
fs.writeFileSync(path.join(dataDir,'EXPERT_REVIEW_LOG.jsonl'),jsonText);
const md=['# Optional expert-review log','',`Status: **partial — 45 of 722 draft units**. This log contains ${termRecords.length} terminology/sense decisions and ${correctionRecords.length} source-correction decisions. Every item remains open to optional specialist review, but **no item is a translation hold**. Work continues even when a dictionary or expert is unavailable.`,'','“Attested” means only that the specifically listed native page was actually inspected for the stated scope. It does not mean a human expert endorsed the final edition. The terminology rationales below were reconstructed retrospectively from primary records and exact current files; source-correction entries come from the contemporaneous audit.','','Machine-readable companion: `EXPERT_REVIEW_LOG.jsonl`.',''];
for(const r of records){
 md.push(`## ${r.review_id} — ${r.source_term??r.finding_id}`,'',`- Status: ${r.expert_review_status}`,'',`- Chosen wording/treatment: ${r.chosen_wording??r.rationale}`,'',`- Exact implementation: ${r.implementation_locations.map(x=>`${x.source_locator} ↔ ${x.target_locator} (${x.segment_id})`).join('; ')}`,'',`- Authorities actually checked: ${r.actual_authorities_checked.map(x=>x.passage_id?`${x.passage_id}, PDF ${x.pdf_page}, printed ${x.printed_page}, ${x.region}`:`${x.audit_id??x.source_revision}`).join('; ')}`,'',`- Not checked/not found: ${r.not_checked_or_not_found.join(' ')}`,'',`- Rationale: ${r.rationale}`,'',`- Alternatives: ${r.alternatives_considered_or_recorded.join('; ')}`,'',`- Uncertainty: ${r.uncertainty}`,'',`- Review question: ${r.precise_review_questions.join(' ')}`,'');
}
fs.writeFileSync(path.join(dataDir,'EXPERT_REVIEW_LOG.md'),md.join('\n').trimEnd()+'\n');
console.log(JSON.stringify({records:records.length,terminology:termRecords.length,source_corrections:correctionRecords.length,json_bytes:Buffer.byteLength(jsonText),status:'partial_no_holds'}));

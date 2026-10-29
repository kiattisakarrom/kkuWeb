// Offline consistency checks on captured audit evidence; never opens a DB.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../tmp/requisition-sql-audit');
const records=fs.readdirSync(root).filter(name=>name.endsWith('.json')).map(name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'))).filter(row=>row.scope&&row.variant);
const comparison=[];
for(const scope of ['ipd','dc','er','iv','fixed-stock','ivrad'])for(const kind of ['hospital','antibiotic','floor4','narcotic']){
  const find=variant=>records.find(row=>row.scope===scope&&row.kind===kind&&row.variant===variant&&row.from==='2026-09-01'&&row.to==='2026-09-30'&&!row.tag);
  const current=find('current'),candidate=find('hash-group');
  assert.ok(current&&candidate,`${scope}/${kind} missing evidence`);
  const equal=current.rows===candidate.rows&&current.digest===candidate.digest;
  assert.ok(equal,`${scope}/${kind} month result changed`);
  comparison.push({scope,kind,rows:current.rows,strictResultEqual:equal,currentMs:current.queryMs,candidateMs:candidate.queryMs});
}
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
const warm={};
for(const variant of ['current','hash-group']){
  const set=records.filter(row=>row.scope==='ipd'&&row.variant===variant&&row.tag?.startsWith('warm-'));
  assert.equal(set.length,3);
  const timings=set.map(row=>row.queryMs);warm[variant]={timings,medianMs:median(timings)};
}
const quarter=JSON.parse(fs.readFileSync(path.join(root,'equivalence-ipd-floor4-2026-07-01-2026-09-30.json'),'utf8'));
const base=quarter.comparisons[0];
assert.ok(quarter.comparisons.every(row=>row.rows===base.rows&&row.caseAndTrailingSpaceInsensitiveDigest===base.caseAndTrailingSpaceInsensitiveDigest));
assert.ok(quarter.comparisons[2].digest!==base.digest);
assert.ok(quarter.comparisons.slice(2).every(row=>row.differences.length===6&&row.differences.every(diff=>diff.field==='orderitemname'&&diff.caseOnly)));
const result={monthlyComparisons:comparison,warmIpd:warm,quarter:{rows:base.rows,strictEqual:false,normalizedEqual:true,caseOnlyNameDifferences:6},actualPlanFiles:fs.readdirSync(root).filter(name=>name.endsWith('.sqlplan')).length};
fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));

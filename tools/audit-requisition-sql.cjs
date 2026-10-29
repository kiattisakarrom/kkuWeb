// Manual MSSQL-only audit. SELECT + session STATISTICS settings only.
// Never creates/changes indexes, statistics, schema, or application data.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const sql=require('../back/node_modules/mssql'),config=require('../back/config/dbConfig');
const {requisitionKinds,requisitionWindow}=require('../back/services/reportRequisitionIpd');
const scopes={ipd:'Ipd',dc:'Dc',er:'Er',iv:'Iv','fixed-stock':'FixedStock',ivrad:'IvRad'};
const root=path.resolve(__dirname,'../tmp/requisition-sql-audit');
const pool=new sql.ConnectionPool({...config,requestTimeout:120000,pool:{max:1,min:0}});
const canonical=rows=>rows.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))))).sort();
const digest=rows=>crypto.createHash('sha256').update(JSON.stringify(canonical(rows))).digest('hex');
async function metadata(){
  const result=await pool.request().query(`
    SELECT CAST(SERVERPROPERTY('ProductVersion') AS varchar(40)) AS version,
      CAST(SERVERPROPERTY('Edition') AS varchar(100)) AS edition,d.compatibility_level,d.is_auto_create_stats_on,d.is_auto_update_stats_on,
      d.is_read_committed_snapshot_on,HAS_PERMS_BY_NAME(DB_NAME(),'DATABASE','SHOWPLAN') AS canShowplan
      FROM sys.databases d WHERE d.database_id=DB_ID();
    SELECT o.name AS tableName,c.column_id,c.name AS columnName,t.name AS type,c.max_length,c.precision,c.scale,c.is_nullable,c.collation_name
      FROM sys.columns c JOIN sys.objects o ON c.object_id=o.object_id JOIN sys.types t ON c.user_type_id=t.user_type_id
      WHERE o.name IN ('prescriptiondetail','prescription','ms_drug','drugname') ORDER BY o.name,c.column_id;
    SELECT o.name AS tableName,i.name AS indexName,i.index_id,i.type_desc,i.is_unique,i.is_disabled,i.has_filter,i.filter_definition,
      c.name AS columnName,ic.key_ordinal,ic.is_included_column,ic.is_descending_key
      FROM sys.indexes i JOIN sys.objects o ON i.object_id=o.object_id
      JOIN sys.index_columns ic ON i.object_id=ic.object_id AND i.index_id=ic.index_id
      JOIN sys.columns c ON c.object_id=ic.object_id AND c.column_id=ic.column_id
      WHERE o.name IN ('prescriptiondetail','prescription','ms_drug','drugname') ORDER BY o.name,i.index_id,ic.key_ordinal,c.column_id;
    SELECT o.name AS tableName,i.name AS indexName,SUM(CASE WHEN a.type=1 THEN p.rows ELSE 0 END) AS [rowCount],SUM(a.total_pages)*8 AS totalKB,SUM(a.used_pages)*8 AS usedKB
      FROM sys.partitions p JOIN sys.objects o ON p.object_id=o.object_id
      JOIN sys.indexes i ON i.object_id=p.object_id AND i.index_id=p.index_id
      JOIN sys.allocation_units a ON (a.type IN (1,3) AND a.container_id=p.hobt_id) OR (a.type=2 AND a.container_id=p.partition_id)
      WHERE o.name IN ('prescriptiondetail','prescription','ms_drug','drugname') GROUP BY o.name,i.name ORDER BY o.name,i.name;
    SELECT o.name AS tableName,s.name AS statisticsName,s.stats_id,s.auto_created,s.user_created,s.has_filter,s.filter_definition,
      STATS_DATE(s.object_id,s.stats_id) AS lastUpdated,sp.rows,sp.rows_sampled,sp.steps,sp.modification_counter
      FROM sys.stats s JOIN sys.objects o ON s.object_id=o.object_id
      OUTER APPLY sys.dm_db_stats_properties(s.object_id,s.stats_id) sp
      WHERE o.name IN ('prescriptiondetail','prescription','ms_drug','drugname') ORDER BY o.name,s.stats_id;
    SELECT o.name AS tableName,s.name AS statisticsName,c.name AS columnName,sc.stats_column_id
      FROM sys.stats s JOIN sys.objects o ON s.object_id=o.object_id
      JOIN sys.stats_columns sc ON s.object_id=sc.object_id AND s.stats_id=sc.stats_id
      JOIN sys.columns c ON c.object_id=sc.object_id AND c.column_id=sc.column_id
      WHERE o.name IN ('prescriptiondetail','prescription','ms_drug','drugname') ORDER BY o.name,s.stats_id,sc.stats_column_id;
  `);
  const data={capturedAt:new Date().toISOString(),server:result.recordsets[0],columns:result.recordsets[1],indexes:result.recordsets[2],sizes:result.recordsets[3],statistics:result.recordsets[4],statisticsColumns:result.recordsets[5]};
  fs.writeFileSync(path.join(root,'metadata.json'),JSON.stringify(data,null,2));
  const groups=new Map();
  for(const r of data.indexes){const key=`${r.tableName}/${r.indexName}`;if(!groups.has(key))groups.set(key,{table:r.tableName,index:r.indexName,unique:r.is_unique,filter:r.filter_definition,keys:[],includes:[]});
    const g=groups.get(key);(r.is_included_column?g.includes:g.keys).push(r.columnName);}
  console.log(JSON.stringify({metadata:data.server,indexes:[...groups.values()].map(({includes,...rest})=>({...rest,includeCount:includes.length})),sizes:data.sizes}));
}
async function capture(scope,kind,variant='current'){
  if(!Object.hasOwn(scopes,scope)||!Object.hasOwn(requisitionKinds,kind))throw Error('Invalid scope or kind');
  const {rowsSql}=require(`../back/services/reportRequisition${scopes[scope]}`);
  const from=process.env.AUDIT_FROM||'2026-09-01',to=process.env.AUDIT_TO||'2026-09-30';
  // Freeze the native 08:00 branch and report date across all comparison runs.
  const params={...requisitionWindow(from,to,new Date('2026-10-23T02:00:00Z')),...(scope==='er'?{}:{sendStore:requisitionKinds[kind].sendStore,sendF3F4:requisitionKinds[kind].sendF3F4})};
  let query=rowsSql;
  if(variant==='hash-group')query=query.replace('OPTION (RECOMPILE)','OPTION (HASH GROUP, RECOMPILE)');
  if(variant==='order-group')query=query.replace('OPTION (RECOMPILE)','OPTION (ORDER GROUP, RECOMPILE)');
  if(variant==='inner')query=query.replace('LEFT JOIN dbo.ms_drug','INNER JOIN dbo.ms_drug');
  if(variant.startsWith('index:')){
    const index=variant.slice(6);
    if(!/^[A-Za-z_0-9]+$/.test(index))throw Error('Invalid existing index hint');
    query=query.replace(/(FROM dbo\.prescription(?:detail)? pt)/,`$1 WITH (INDEX([${index}]))`);
  }
  const request=pool.request(),messages=[];
  request.on('info',info=>messages.push(info.message));
  for(const [key,value] of Object.entries(params))request.input(key,key.startsWith('send')?sql.Int:sql.VarChar(32),value);
  const started=performance.now();
  const tag=(process.argv[5]||'').replace(/[^A-Za-z_0-9-]/g,'_');
  const stem=`${scope}-${kind}-${variant.replace(/[^A-Za-z_0-9-]/g,'_')}-${from}-${to}${tag?`-${tag}`:''}`;
  try{
    const result=await request.query(`SET STATISTICS IO ON; SET STATISTICS TIME ON; SET STATISTICS XML ON; ${query} SET STATISTICS XML OFF; SET STATISTICS TIME OFF; SET STATISTICS IO OFF;`);
    const queryMs=Math.round(performance.now()-started);
    const rows=result.recordsets.find(set=>set.length&&Object.hasOwn(set[0],'orderitemcode'))||[];
    const plans=result.recordsets.flatMap(set=>set.flatMap(row=>Object.values(row).filter(value=>typeof value==='string'&&value.includes('<ShowPlanXML'))));
    plans.forEach((xml,i)=>fs.writeFileSync(path.join(root,`${stem}-${i}.sqlplan`),xml));
    const details={scope,kind,variant,tag,from,to,params,capturedAt:new Date().toISOString(),queryMs,rows:rows.length,digest:digest(rows),planCount:plans.length,messages};
    fs.writeFileSync(path.join(root,`${stem}.json`),JSON.stringify(details,null,2));
    console.log(JSON.stringify({...details,messages:messages.filter(line=>/Table |SQL Server Execution Times|CPU time/.test(line))}));
  }catch(error){console.log(JSON.stringify({scope,kind,variant,queryMs:Math.round(performance.now()-started),errorCode:error.code,error:error.message}));process.exitCode=1;}
}
(async()=>{
  fs.mkdirSync(root,{recursive:true});await pool.connect();
  if(process.argv[2]==='metadata')return metadata();
  if(process.argv[2]==='equivalence'){
    const scope=process.argv[3]||'ipd',kind=process.argv[4]||'floor4';
    if(!Object.hasOwn(scopes,scope)||!Object.hasOwn(requisitionKinds,kind))throw Error('Invalid scope or kind');
    const from=process.env.AUDIT_FROM||'2026-07-01',to=process.env.AUDIT_TO||'2026-09-30';
    const {rowsSql}=require(`../back/services/reportRequisition${scopes[scope]}`);
    const params={...requisitionWindow(from,to,new Date('2026-10-23T02:00:00Z')),...(scope==='er'?{}:{sendStore:requisitionKinds[kind].sendStore,sendF3F4:requisitionKinds[kind].sendF3F4})};
    const sets=[];
    for(const mode of ['current-1','current-2','hash-group-1','hash-group-2']){
      const r=pool.request();for(const [key,value] of Object.entries(params))r.input(key,key.startsWith('send')?sql.Int:sql.VarChar(32),value);
      const result=await r.query(mode.startsWith('hash')?rowsSql.replace('OPTION (RECOMPILE)','OPTION (HASH GROUP, RECOMPILE)'):rowsSql);
      sets.push({mode,rows:result.recordset});
    }
    const normalize=rows=>rows.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,typeof value==='string'?value.toLocaleLowerCase('th').trimEnd():value])));
    const keyFor=row=>JSON.stringify(Object.fromEntries(Object.entries(row).filter(([key])=>key!=='orderqty').sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,typeof value==='string'?value.toLocaleLowerCase('th').trimEnd():value])));
    const baseline=new Map(sets[0].rows.map(row=>[keyFor(row),row]));
    const result={scope,kind,from,to,comparisons:sets.map(set=>{
      const differences=[];
      for(const row of set.rows){const base=baseline.get(keyFor(row));if(!base){differences.push({unmatched:true});continue;}
        for(const key of Object.keys(base))if(base[key]!==row[key])differences.push({field:key,
          caseOnly:typeof row[key]==='string'&&base[key].toLocaleLowerCase('th')===row[key].toLocaleLowerCase('th'),
          trailingSpaceOnly:typeof row[key]==='string'&&base[key].trimEnd()===row[key].trimEnd()});
      }
      return {mode:set.mode,rows:set.rows.length,digest:digest(set.rows),caseAndTrailingSpaceInsensitiveDigest:digest(normalize(set.rows)),differences};
    })};
    fs.writeFileSync(path.join(root,`equivalence-${scope}-${kind}-${from}-${to}.json`),JSON.stringify(result,null,2));console.log(JSON.stringify(result));return;
  }
  if(process.argv[2]==='masters'){
    for(const [name,text] of Object.entries({master:require('../back/services/reportRequisitionEr').masterSql,mapping:require('../back/services/reportRequisitionEr').mappingSql})){
      const messages=[],r=pool.request();r.on('info',info=>messages.push(info.message));const started=performance.now();
      const result=await r.query(`SET STATISTICS IO ON; SET STATISTICS XML ON; ${text} SET STATISTICS XML OFF; SET STATISTICS IO OFF;`);
      const plans=result.recordsets.flatMap(set=>set.flatMap(row=>Object.values(row).filter(value=>typeof value==='string'&&value.includes('<ShowPlanXML'))));
      plans.forEach((xml,i)=>fs.writeFileSync(path.join(root,`er-${name}-${i}.sqlplan`),xml));
      const rows=result.recordsets[0],details={scope:`er/opdrad-${name}`,queryMs:Math.round(performance.now()-started),rows:rows.length,digest:digest(rows),planCount:plans.length,messages};
      fs.writeFileSync(path.join(root,`er-${name}.json`),JSON.stringify(details,null,2));console.log(JSON.stringify(details));
    }return;
  }
  for(const scope of process.argv[2]==='all'?Object.keys(scopes):[process.argv[2]||'ipd'])
    for(const kind of (process.argv[3]||'floor4').split(','))await capture(scope,kind,process.argv[4]||'current');
})().catch(error=>{console.error(error.code||error.name,error.message);process.exitCode=1;}).finally(()=>pool.close());

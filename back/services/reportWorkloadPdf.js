const path = require('node:path');
const PDFDocument = require('@foliojs-fork/pdfkit');
const collator = new Intl.Collator('en', {sensitivity:'accent'});
const key = value => String(value ?? '').trim().toLocaleLowerCase('en');

// clsWorkloadNew groups CrossTab rows by Fname, not user code. Two users with
// the same displayed name therefore share a row, including the top grand total.
function workloadCrossTab(rows) {
  const groups = new Map(), people = new Map();
  for (const row of rows) {
    const name = String(row.Fname ?? '').trim(), care = String(row.GroupOfCare ?? '').trim();
    if (!groups.has(key(care))) groups.set(key(care),care);
    if (!people.has(key(name))) people.set(key(name), {name, values:new Map()});
    const person = people.get(key(name));
    person.values.set(key(care),(person.values.get(key(care)) || 0) + row.CAn);
  }
  const columns = [...groups.values()].sort(collator.compare);
  const data = [...people.values()].sort((a,b)=>collator.compare(a.name,b.name)).map(person=>{
    const values=columns.map(column=>person.values.get(key(column)) || 0);
    return {name:person.name,values,total:values.reduce((a,b)=>a+b,0)};
  });
  const totals=columns.map((_,index)=>data.reduce((sum,person)=>sum+person.values[index],0));
  return {columns,people:data,totals,total:totals.reduce((a,b)=>a+b,0)};
}

function workloadColumnBands(count) {
  const bands=[{identity:true,indices:Array.from({length:Math.min(6,count)},(_,i)=>i)}];
  for(let i=6;i<count;i+=8)bands.push({identity:false,indices:Array.from({length:Math.min(8,count-i)},(_,n)=>i+n)});
  return bands;
}
const dateLabel = day => day.split('-').reverse().join('/');
function createWorkloadReportPdf({rows,filters},now=new Date()) {
  return new Promise((resolve,reject)=>{
    const doc=new PDFDocument({size:[842,595],margin:0,autoFirstPage:false,info:{Title:'Workload Report'}});
    const chunks=[];doc.on('data',chunk=>chunks.push(chunk));doc.on('error',reject);
    const assetRoot=path.join(__dirname,'../assets/reports/workload');
    doc.registerFont('Regular',path.join(__dirname,'../assets/fonts/Sarabun-Regular.ttf'));
    doc.registerFont('Bold',path.join(__dirname,'../assets/fonts/Sarabun-Bold.ttf'));
    // Measurement uses the same fonts and wrapping as drawing. All horizontal
    // continuations share row heights, so their names and counts stay aligned.
    doc.font('Regular').fontSize(12.6);
    const pivot=workloadCrossTab(rows),bands=workloadColumnBands(pivot.columns.length);
    const rowHeights=pivot.people.map(person=>Math.max(28.8,doc.heightOfString(person.name,{width:141.5,lineGap:0})+8));
    doc.font('Bold').fontSize(14.3);
    const headerHeight=Math.max(31.6,doc.heightOfString('ยอดรวม',{width:52,lineGap:0})+8,
      ...pivot.columns.map(label=>doc.heightOfString(label,{width:88,lineGap:0})+8));
    const pages=[];
    let first=0,block=0;
    do {
      const top=block===0?146.05:8.4;
      let height=headerHeight+(block===0?31:0),end=first;
      while(end<pivot.people.length && top+height+rowHeights[end]<=540){height+=rowHeights[end];end++;}
      if(end===first && end<pivot.people.length)throw Error('Workload row is too tall to fit the report');
      for(const band of bands)pages.push({band,first,end,top,block});
      first=end;block++;
    }while(first<pivot.people.length);
    const stamp=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',dateStyle:'short',timeStyle:'medium',hourCycle:'h23'}).format(now);
    const drawCell=(text,x,y,width,height,{bold=false,header=false,align='center',border=true}={})=>{
      if(border)doc.lineWidth(0.5).rect(x,y,width,height).stroke();
      doc.font(bold?'Bold':'Regular').fontSize(header?14.3:12.6);
      const value=String(text),textHeight=doc.heightOfString(value,{width:width-8,lineGap:0});
      doc.text(value,x+4,y+Math.max(4,(height-textHeight)/2),{width:width-8,lineGap:0,align});
    };
    pages.forEach((page,index)=>{
      doc.addPage();
      if(index===0){
        doc.image(path.join(assetRoot,'header.png'),0,0,{width:842,height:120});
        doc.font('Bold').fontSize(14.3).text(`วันที่ :  ${dateLabel(filters.from)}  ถึง  ${dateLabel(filters.to)}`,24,122.4,{width:650});
      }
      const x=page.band.identity?24:15;
      const fields=[...(page.band.identity?[{label:'',width:149.5,type:'name'},{label:'ยอดรวม',width:60,type:'total'}]:[]),
        ...page.band.indices.map(column=>({label:pivot.columns[column],width:96,column,type:'care'}))];
      let y=page.top,cellX=x;
      for(const field of fields){drawCell(field.label,cellX,y,field.width,headerHeight,{bold:true,header:true,border:field.type!=='name'});cellX+=field.width;}
      y+=headerHeight;
      const drawRow=(person,height,bold=false)=>{
        let cellX=x;
        for(const field of fields){
          const value=field.type==='name'?person.name:field.type==='total'?person.total:person.values[field.column];
          drawCell(value,cellX,y,field.width,height,{bold:bold&&field.type==='name',align:field.type==='name'&&!bold?'left':'center'});cellX+=field.width;
        }
        y+=height;
      };
      if(page.block===0)drawRow({name:'Pharmacist',total:pivot.total,values:pivot.totals},31,true);
      for(let row=page.first;row<page.end;row++)drawRow(pivot.people[row],rowHeights[row]);
      // Horizontal Crystal continuation pages omit row labels, logo and date.
      // Keep their page footer visible so all downloaded sheets are identifiable.
      doc.lineWidth(0.8).moveTo(18.6,552).lineTo(822,552).stroke();
      doc.font('Regular').fontSize(10).text(`วันที่พิมพ์ : ${stamp}`,24,562,{width:500});
      doc.text(`หน้า : ${index+1} / ${pages.length}`,712,562,{width:100,align:'right'});
    });
    doc.on('end',()=>resolve({buffer:Buffer.concat(chunks),pageCount:pages.length}));
    doc.end();
  });
}
module.exports={workloadCrossTab,workloadColumnBands,createWorkloadReportPdf};

const path=require('node:path');
const PdfPrinter=require('pdfmake');
const {columns}=require('./reportPharmcareSummary');
const normal=path.join(__dirname,'../assets/fonts/Sarabun-Regular.ttf');
const fonts={Sarabun:{normal,bold:path.join(__dirname,'../assets/fonts/Sarabun-Bold.ttf'),italics:normal,bolditalics:normal}};
const bands=[
  {title:'ข้อมูลผู้ป่วยและประเภทการดูแล',indices:Array.from({length:13},(_,i)=>i)},
  {title:'การจำหน่าย ผลการดูแล และปัญหาการใช้ยา',indices:[0,1,2,3,...Array.from({length:11},(_,i)=>i+13)]},
  {title:'ยาที่เกี่ยวข้อง ความรุนแรง และสาเหตุ',indices:[0,1,2,3,...Array.from({length:9},(_,i)=>i+24)]},
  {title:'การดำเนินการ การยอมรับ ผลลัพธ์ และผู้เกี่ยวข้อง',indices:[0,1,2,3,...Array.from({length:8},(_,i)=>i+33)]},
  {title:'บันทึกเภสัชกรและแผนการดูแล',indices:[0,1,2,3,41,42]},
];
function pharmcareSummaryPdfDefinition({rows,filters},now=new Date()){
  const width=1190.55,height=841.89,area=width-48;
  const stamp=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',dateStyle:'short',timeStyle:'medium',hourCycle:'h23'}).format(now);
  const content=bands.map((band,index)=>{
    const cols=band.indices.map(i=>columns[i]),count=cols.length+1;
    const available=area-count*6-(count+1)*0.35-25,totalWidth=cols.reduce((sum,col)=>sum+col[2],0);
    return {pageBreak:index?'before':undefined,table:{headerRows:2,
      widths:[25,...cols.map(col=>available*col[2]/totalWidth)],
      body:[
        [{text:`ส่วน ${index+1}/${bands.length} · ${band.title} · ${rows.length} รายการ`,colSpan:count,bold:true,fontSize:10,fillColor:'#e5e7eb'},...cols.map(()=>({}))],
        [{text:'แถว',bold:true,fillColor:'#f3f4f6'},...cols.map(([,title])=>({text:title,bold:true,fillColor:'#f3f4f6'}))],
        ...rows.map((row,ordinal)=>[{text:String(ordinal+1),alignment:'center'},...cols.map(([key])=>({text:row[key]}))]),
      ]},layout:{hLineWidth:()=>0.35,vLineWidth:()=>0.35,hLineColor:()=> '#aaa',vLineColor:()=> '#aaa',paddingLeft:()=>3,paddingRight:()=>3,paddingTop:()=>3,paddingBottom:()=>3}};
  });
  return {info:{title:'รายงานสรุปการทำ Pharmcare'},pageSize:{width,height},pageMargins:[24,70,24,40],
    defaultStyle:{font:'Sarabun',fontSize:8.5,lineHeight:1.1},
    header:{stack:[{text:'รายงานสรุปการทำ Pharmcare',fontSize:16,bold:true},
      {text:`${filters.type} · วันที่ ${filters.from} ถึง ${filters.to}`,fontSize:10,margin:[0,2,0,0]},
      {text:'เลขแถวและข้อมูลผู้ป่วยใช้เชื่อมรายการระหว่างส่วน ตารางครบ 43 คอลัมน์ตามโปรแกรมเดิม',fontSize:8,margin:[0,2,0,0]}],margin:[24,14,24,0]},
    footer:(page,pages)=>({columns:[{text:stamp},{text:`${page} / ${pages}`,alignment:'right'}],margin:[24,10,24,0],fontSize:8}),content};
}
function createPharmcareSummaryPdf(data,now){
  return new Promise((resolve,reject)=>{
    const document=new PdfPrinter(fonts).createPdfKitDocument(pharmcareSummaryPdfDefinition(data,now));
    const chunks=[];document.on('data',chunk=>chunks.push(chunk));document.on('error',reject);
    document.on('end',()=>resolve(Buffer.concat(chunks)));document.end();
  });
}
module.exports={bands,pharmcareSummaryPdfDefinition,createPharmcareSummaryPdf};

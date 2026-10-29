const path=require('node:path');
const PdfPrinter=require('pdfmake');
const {PDFDocument}=require('pdf-lib');
const layout=require('../assets/reports/med-transfer/layout.json');
const fontPath=path.join(__dirname,'../assets/fonts/Sarabun-Regular.ttf');
const fonts={Sarabun:{normal:fontPath,bold:path.join(__dirname,'../assets/fonts/Sarabun-Bold.ttf'),italics:fontPath,bolditalics:fontPath}};
const columns=[['no','No.'],['prescriptionno','เลขที่ใบสั่งยา'],['hn','HN'],['an','AN'],['patientname','ชื่อผู้ป่วย'],['wardname','หอผู้ป่วย'],['username','ผู้บรรจุยา'],['cartname','รถเข็น']];
function medTransferPdfDefinition({rows},now=new Date()){
  const width=842,height=595;
  const {left,right,top,bottom}=Object.fromEntries(Object.entries(layout.margins).map(([key,value])=>[key,value/20]));
  const headerHeight=layout.sections.find(section=>section.kind==='ReportHeader').height/20;
  const contentWidth=width-left-right;
  const bounds=[0,43.75,164.5,242.65,323,484.5,597,731.15,contentWidth];
  const stamp=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',dateStyle:'short',timeStyle:'medium',hourCycle:'h23'}).format(now);
  return {
    info:{title:'Medicine Cart Report'},pageSize:{width,height},pageMargins:[left,top,right,bottom+25.3],
    defaultStyle:{font:'Sarabun',fontSize:10,bold:true},
    content:[
      {image:path.join(__dirname,'../assets/reports/med-transfer/header.png'),width,height:top+headerHeight,margin:[-left,-top,-right,0]},
      {table:{headerRows:1,widths:columns.map((_,i)=>bounds[i+1]-bounds[i]),heights:index=>index===0?25.8:21.75,
        body:[columns.map(([,text])=>({text,alignment:'center',fontSize:11,margin:[0,3,0,0]})),
          ...rows.map(row=>columns.map(([key])=>({text:String(row[key]??''),alignment:'center',margin:[2,2,2,2]})))],
      },layout:{hLineWidth:index=>index===0||index===1?0.8:0,vLineWidth:()=>0,
        paddingTop:()=>0,paddingBottom:()=>0,paddingLeft:()=>0,paddingRight:()=>0}},
    ],
    footer:(page,pages)=>({margin:[left,0,right,0],stack:[
      {canvas:[{type:'line',x1:0,y1:0,x2:contentWidth,y2:0,lineWidth:0.8}]},
      {columns:[{text:stamp},{text:`${page} / ${pages}`,alignment:'right'}],fontSize:9,bold:false,margin:[8.8,5.45,8.8,0]},
    ]}),
  };
}
async function createMedTransferReportPdf(data,now){
  const buffer=await new Promise((resolve,reject)=>{
    const document=new PdfPrinter(fonts).createPdfKitDocument(medTransferPdfDefinition(data,now));
    const chunks=[];document.on('data',chunk=>chunks.push(chunk));document.on('error',reject);
    document.on('end',()=>resolve(Buffer.concat(chunks)));document.end();
  });
  return {buffer,pageCount:(await PDFDocument.load(buffer)).getPageCount()};
}
module.exports={columns,medTransferPdfDefinition,createMedTransferReportPdf};

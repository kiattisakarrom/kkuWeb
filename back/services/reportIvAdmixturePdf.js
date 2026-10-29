const path=require('node:path');
const PdfPrinter=require('pdfmake');
const {ivModes}=require('./reportIvAdmixture');
const normal=path.join(__dirname,'../assets/fonts/Sarabun-Regular.ttf');
const fonts={Sarabun:{normal,bold:path.join(__dirname,'../assets/fonts/Sarabun-Bold.ttf'),italics:normal,bolditalics:normal}};
const layouts={ward:require('../assets/reports/iv/ward-layout.json'),total:require('../assets/reports/iv/total-layout.json')};
function ivPdfDefinition({rows,mode='ward-wait'},now=new Date()) {
  const variant=ivModes[mode]?.total?'total':'ward';
  const layout=layouts[variant];
  const left=layout.margins.left/20,top=layout.margins.top/20;
  const right=variant==='total'?19:9.4,reportHeight=layout.sections[0].height/20;
  const width=595-left-right;
  const day=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now);
  // Exported from each original RPT, including its embedded hospital logo.
  const groups=new Map();
  for(const row of rows) {
    const key=JSON.stringify([row.an,row.prescriptionno]);
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(row);
  }
  const ordered=[...groups.values()].sort((a,b)=>a[0].an.localeCompare(b[0].an,'en')||a[0].prescriptionno.localeCompare(b[0].prescriptionno,'en'));
  const blank=()=>({});
  const body=[
    [{colSpan:5,columns:[
      {width:variant==='total'?198:192,text:`เวลาส่ง : ${day}  ${time}`},
      {text:`บันทึกโดย : ${rows[0]?.username||''}`},
    ],bold:true,fontSize:10.5,margin:[6,6,0,0],border:[true,true,true,false]},blank(),blank(),blank(),blank()],
    ['ชื่อผู้ป่วย','AN','Medicine','วิธีใช้','เลขที่ใบสั่งยา'].map((text,i)=>({text,bold:true,alignment:'center',fontSize:11.5,border:[i===0,false,i===4,true]})),
  ];
  const groupSeparators=new Set();
  for(const items of ordered) {
    const first=items[0];
    body.push([first.patientname,first.an,first.wardname,first.status,first.prescriptionno].map((text,i)=>({
      text,bold:i===0||i>=3,alignment:i>=2?'center':'left',margin:[i===0?2:0,0,2,3],fontSize:10.5,border:[false,false,false,true],
    })));
    groupSeparators.add(body.length);
    for(const item of items) body.push([{text:'',border:[false,false,false,false]},{
      colSpan:4,stack:[
        {text:item.orderitemname,bold:true},
        {text:item.dosage},
        {text:item.freetext3||' '},
      ],fontSize:10.5,lineHeight:1.05,margin:[0,0,0,3],border:[false,false,false,false],
    },blank(),blank(),blank()]);
    const footer=layout.sections.find(section=>section.kind==='GroupFooter'&&section.height>0);
    const line=footer.objects.find(object=>object.kind==='LineObject');
    body.push([{colSpan:5,canvas:[{type:'line',x1:0,y1:0,x2:line.width/20,y2:0,lineWidth:0.4}],margin:[0,0,0,2],border:[false,false,false,false]},blank(),blank(),blank(),blank()]);
  }
  return {
    info:{title:'IV Admixture Report'},pageSize:{width:595,height:842},
    pageMargins:[left,top,right,layout.margins.bottom/20+30],
    defaultStyle:{font:'Sarabun',fontSize:10.5},
    footer:(page,pages)=>({
      margin:[left,0,right,0],stack:[
        {canvas:[{type:'line',x1:0,y1:0,x2:width,y2:0,lineWidth:0.8}]},
        {columns:[{text:`${day}   ${time}`},{text:`${page} / ${pages}`,alignment:'right'}],margin:[6,6,12,0],fontSize:8},
      ],
    }),
    content:[
      {image:path.join(__dirname,`../assets/reports/iv/${variant}-header.png`),width:595,
        height:top+reportHeight,margin:[-left,-top,-right,0]},
      {table:{headerRows:2,widths:[150,72,126,126,width-474],heights:row=>row===0?24:row===1?31.8:undefined,body},layout:{
        hLineWidth:i=>i===0||i===2?0.8:groupSeparators.has(i)?0.4:0,
        vLineWidth:()=>0.8,
        hLineColor:()=> '#000000',
        paddingLeft:()=>0,paddingRight:()=>0,paddingTop:()=>0,paddingBottom:()=>0,
      }},
    ],
  };
}
function createIvAdmixturePdf(data,now) {
  return new Promise((resolve,reject)=>{
    const document=new PdfPrinter(fonts).createPdfKitDocument(ivPdfDefinition(data,now));
    const chunks=[];
    document.on('data',(chunk)=>chunks.push(chunk));document.on('error',reject);
    document.on('end',()=>resolve(Buffer.concat(chunks)));document.end();
  });
}
module.exports={createIvAdmixturePdf,ivPdfDefinition};

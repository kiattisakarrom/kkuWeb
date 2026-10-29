const path=require('node:path');
const PDFDocument=require('@foliojs-fork/pdfkit');
const layout=require('../assets/reports/requisition-ipd/layout.json');
const {groupRequisitionRows,bangkokParts}=require('./reportRequisitionIpd');
// Original Detail TextObjects, in points relative to the 18 pt left margin.
const fields=[
  {key:'no',left:1.8,width:21.6,align:'center'},
  {key:'INV_Code',left:24,width:44.4,align:'center'},
  {key:'orderitemcode',left:72,width:43.8,align:'left'},
  {key:'orderitemname',left:118.8,width:210.6,align:'left'},
  {key:'minStock',left:330,width:36,align:'left'},
  {key:'orderqty',left:366,width:47.4,align:'center'},
  {key:'rate',left:414,width:46.2,align:'left'},
  {key:'Pack',left:462,width:45,align:'center',bold:true},
  {key:'dosageunitcode',left:507.6,width:48.6,align:'center'},
];
function createRequisitionIpdPdf({rows,sourceWarning=''},now=new Date()){
  return new Promise((resolve,reject)=>{
    const doc=new PDFDocument({size:[595,842],margin:0,autoFirstPage:false,info:{Title:'Requisition Report'}});
    const chunks=[];doc.on('data',chunk=>chunks.push(chunk));doc.on('error',reject);
    doc.registerFont('Regular',path.join(__dirname,'../assets/fonts/Sarabun-Regular.ttf'));
    doc.registerFont('Bold',path.join(__dirname,'../assets/fonts/Sarabun-Bold.ttf'));
    const assetRoot=path.join(__dirname,'../assets/reports/requisition-ipd');
    const left=layout.margins.left/20,right=576,bottom=794;
    const reportHeader=layout.sections.find(section=>section.kind==='ReportHeader').height/20;
    const pageHeader=layout.sections.find(section=>section.kind==='PageHeader');
    const measure=(value,width,size=10.35,bold=false)=>{
      doc.font(bold?'Bold':'Regular').fontSize(size);
      return doc.heightOfString(String(value),{width:width-2,lineGap:0});
    };
    const warningHeight=sourceWarning?measure(sourceWarning,558,9,true)+6:0;
    const groups=groupRequisitionRows(rows),pages=[];
    const startPage=()=>{
      const page={first:pages.length===0,items:[]};pages.push(page);
      page.warningY=page.first?left+reportHeader:left;
      page.headerY=page.warningY+warningHeight;
      page.y=page.headerY+pageHeader.height/20;
      return page;
    };
    let page=startPage();
    for(const group of groups){
      const height=Math.max(30,measure(group.drugform,258,11.55,true)+10);
      const firstRowHeight=Math.max(18,...fields.map(field=>measure(group.rows[0][field.key]??'',field.width,10.35,field.bold)+3));
      if(page.y+height+firstRowHeight>bottom)page=startPage();
      page.items.push({type:'group',group,y:page.y,height});page.y+=height;
      for(const row of group.rows){
        const height=Math.max(18,...fields.map(field=>measure(row[field.key]??'',field.width,10.35,field.bold)+3));
        if(height>bottom-left-pageHeader.height/20-warningHeight)throw Error('Requisition row is too tall to fit the report');
        if(page.y+height>bottom)page=startPage();
        page.items.push({type:'row',row,y:page.y,height});page.y+=height;
      }
    }
    if(page.y+192>bottom)page=startPage();
    page.items.push({type:'summary',y:page.y});
    const {day,month,year}=bangkokParts(now),printed=`${day}/${month}/${year}`;
    const draw=(value,x,y,width,{size=10.35,bold=false,align='left'}={})=>{
      doc.font(bold?'Bold':'Regular').fontSize(size).text(String(value),x+1,y,{width:width-2,lineGap:0,align});
    };
    pages.forEach((page,index)=>{
      doc.addPage();
      if(page.first)doc.image(path.join(assetRoot,'header.png'),0,0,{width:595,height:left+reportHeader});
      if(sourceWarning)draw(sourceWarning,left,page.warningY,558,{size:9,bold:true});
      const y=page.headerY,first=rows[0];
      doc.lineWidth(1).rect(left,y,558.6,72).stroke();
      draw(`ใบเบิกเลขที่ : ${first?.RequisitionNo || ''}`,390,y+1,181.8,{size:11.5,bold:true});
      draw(`ใบเบิกเวชภัณฑ์ยา : ${first?.Room || ''}`,30,y+24,360,{size:13,bold:true});
      draw('วันที่พิมพ์ :',390,y+24,64.2,{size:11.5,bold:true});
      draw(printed,456,y+24,114,{size:11.5,bold:true});
      for(const object of pageHeader.objects.filter(object=>object.kind==='TextObject'&&object.top===960)){
        const caption=object.text.trim(),width=object.width/20;
        doc.font('Bold').fontSize(11.5);
        const size=Math.min(11.5,11.5*(width-2)/doc.widthOfString(caption));
        draw(caption,left+object.left/20,y+48,width,{size,bold:true,align:'center'});
      }
      for(const item of page.items){
        if(item.type==='group')draw(item.group.drugform,left,item.y+6,258,{size:11.55,bold:true});
        else if(item.type==='row'){
          for(const field of fields)draw(item.row[field.key]??'',left+field.left,item.y,field.width,field);
          doc.lineWidth(0.35).moveTo(left,item.y+item.height).lineTo(right,item.y+item.height).stroke();
        }else{
          draw('รวมทั้งหมด',228,item.y+6,66,{size:13,bold:true,align:'right'});
          draw(rows.length,294,item.y+6,40.85,{size:13,bold:true,align:'center'});
          draw('รายการ',336,item.y+6,48,{size:13,bold:true});
          doc.image(path.join(assetRoot,'signatures.png'),0,item.y+80,{width:595,height:112});
        }
      }
      doc.lineWidth(0.8).moveTo(left,bottom+0.6).lineTo(right,bottom+0.6).stroke();
      draw(`หน้า ${index+1} จาก ${pages.length}`,486,bottom+6,78,{size:11.55,bold:true,align:'right'});
    });
    doc.on('end',()=>resolve({buffer:Buffer.concat(chunks),pageCount:pages.length}));doc.end();
  });
}
module.exports={fields,createRequisitionIpdPdf};

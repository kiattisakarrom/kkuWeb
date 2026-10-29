const path=require('node:path');
const PDFDocument=require('@foliojs-fork/pdfkit');
const {bangkokParts}=require('./reportRequisitionIpd');
// crpRequisitionDrug.rpt uses US Letter, unlike the main A4 requisition.
function createRequisitionMissingPdf({missingDrugs,sourceWarning=''},now=new Date()){
  return new Promise((resolve,reject)=>{
    const doc=new PDFDocument({size:[612,792],margin:0,autoFirstPage:false,info:{Title:'Drug Report'}});
    const chunks=[];doc.on('data',chunk=>chunks.push(chunk));doc.on('error',reject);
    doc.registerFont('Regular',path.join(__dirname,'../assets/fonts/Sarabun-Regular.ttf'));
    doc.registerFont('Bold',path.join(__dirname,'../assets/fonts/Sarabun-Bold.ttf'));
    const width=575.25,bottom=727.5,pages=[];
    const measure=(value,w)=>doc.font('Regular').fontSize(10.35).heightOfString(String(value),{width:w});
    const warningHeight=sourceWarning?measure(sourceWarning,width)+6:0;
    function nextPage(){const first=!pages.length,p={first,headerY:(first?118.5:18)+warningHeight,items:[]};p.y=p.headerY+36;pages.push(p);return p;}
    let page=nextPage();
    [...missingDrugs].sort((a,b)=>a.orderitemname.localeCompare(b.orderitemname,'th',{sensitivity:'accent'})).forEach((row,i)=>{
      const height=Math.max(24,measure(row.orderitemcode,60)+8,measure(row.orderitemname,450)+8);
      if(height>bottom-18-warningHeight-36)throw Error('Missing drug row is too tall to fit the report');
      if(page.y+height>bottom)page=nextPage();
      page.items.push({row,no:i+1,y:page.y,height});page.y+=height;
    });
    const {day,month,year}=bangkokParts(now);
    const draw=(value,x,y,w,bold=false)=>doc.font(bold?'Bold':'Regular').fontSize(bold?11.5:10.35).text(String(value),x,y,{width:w});
    pages.forEach((page,index)=>{
      doc.addPage();
      if(page.first)doc.image(path.join(__dirname,'../assets/reports/requisition-missing/header.png'),0,0,{width:612,height:118.5});
      if(sourceWarning)draw(sourceWarning,18,page.headerY-warningHeight,width);
      doc.lineWidth(1).rect(18,page.headerY,width,36).stroke();
      draw('รายการยา',24,page.headerY+6,78,true);draw('วันที่พิมพ์ :',408,page.headerY+6,64.2,true);draw(`${day}/${month}/${year}`,474,page.headerY+6,114,true);
      for(const item of page.items){
        draw(`${item.no}.`,24,item.y+6,24);draw(item.row.orderitemcode,54,item.y+6,60);draw(item.row.orderitemname,120,item.y+6,450);
        doc.lineWidth(0.35).moveTo(18,item.y+item.height).lineTo(593.25,item.y+item.height).stroke();
      }
      doc.lineWidth(0.8).moveTo(19.5,733.75).lineTo(594,733.75).stroke();
      draw(`หน้า ${index+1} จาก ${pages.length}`,516,739.5,78,true);
    });
    doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.end();
  });
}
module.exports={createRequisitionMissingPdf};

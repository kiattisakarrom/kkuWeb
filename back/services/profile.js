const sql = require("mssql");
const dbConfig = require("../config/dbConfig"); // นำเข้าค่าการกำหนดค่าฐานข้อมูล
const moment = require("moment");

// ฟังก์ชันสำหรับการดึงข้อมูลจากฐานข้อมูล
async function profile(req, res) {
  const { orderitemcode, prescriptionno } = req.body; // รับค่า orderitemcode และ prescriptionno จาก request body

  // Get current time
  const now = moment();

  // Define start and end dates
  let startDate;
  let endDate;

  if (now.hour() > 8 || (now.hour() === 8 && now.minute() > 0)) {
    // Current time is after 08:00:00
    startDate = now
      .startOf("day")
      .add(8, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = now
      .startOf("day")
      .add(1, "days")
      .add(7, "hours")
      .add(59, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
  } else {
    // Current time is before or equal to 08:00:00
    startDate = now
      .startOf("day")
      .subtract(1, "days")
      .add(8, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = now
      .startOf("day")
      .add(7, "hours")
      .add(59, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
  }

  try {
    await sql.connect(dbConfig); // เชื่อมต่อกับฐานข้อมูลโดยใช้ค่าการกำหนดที่ได้รับ

    let query = `
        SELECT 
            med.meditemindex, 
            med.seq, 
            med.seqmax, 
            med.hn, 
            med.an, 
            med.prioritycode, 
            pr.prioritydesc, 
            FORMAT(med.ordercreatedate,'dd/MM/yyyy') As takedate, 
            med.ordercreatedate, 
            med.orderitemcode, 
            med.orderitemname, 
            dg.orderitemENname, 
            dg.displaycolour,
            convert(float,ISNULL(med.orderqty,0)) as orderqty, 
            med.orderunitcode, 
            dou.DispensedTotalUnitTH, 
            med.instructioncode, 
            Ins.InstructionNameTH, 
            convert(float,ISNULL(med.dosage,0)) as dosage, 
            med.dosageunitcode, 
            dos.DispensedUnitTH, 
            med.frequencycode, 
            fc.frequency_nameTH, 
            ISNULL(fc.qty_per_day,0) As qty_per_day, 
            fc.frequency_onlydays, 
            fc.oddday, 
            med.timecode, 
            ft.timeTH, 
            med.timecount, 
            ISNULL(med.durationcode,'0') As durationcode, 
            med.usercreatecode, 
            us.fullname, 
            med.orderacceptfromip, 
            med.computername, 
            med.departmentcode, 
            med.itemlotcode, 
            med.itemlotexpire, 
            med.doctorcode, 
            med.doctorname, 
            med.freetext1, 
            med.freetext2, 
            med.lastmodified, 
            med.[language], 
            med.ordertype, 
            med.highalert, 
            med.shelfzone, 
            med.shelfname, 
            med.varymeal, 
            med.varymealtime, 
            med.voiddatetime, 
            Convert(float, ISNULL(med.price,'0')) As price,  
            Convert(float, ISNULL(med.totalprice,'0')) As totalprice,  
            med.sendmachine, 
            med.sendmix, 
            med.drugusagecode, 
            med.tmtcode, 
            med.startdate, 
            med.enddate, 
            med.offstatus, 
            med.groupdrug, 
            med.sendmixcode, 
            med.sendmixname, 
            convert(float,med.vol) as vol, 
            med.dosageunitforVol, 
            med.pricetype, 
            med.printstatus, 
            med.itemidentify, 
            med.printdrp, 
            convert(float,ISNULL(med.firstdose,0)) As firstdose, 
            med.diluentadd,
            med.orderfrom,
            med.holddatetime,
            ISNULL(med.varymealstatus,'N') As varymealstatus, 
            med.freetext3, 
            med.odddatetime, 
            med.oddday as odd, 
            med.paytype, 
            ISNULL(med.firstdosestatus,'0') As firstdosestatus, 
            ISNULL(med.firsttimecount,1) As firsttimecount, 
            med.DIDcode, 
            ISNULL(med.continuestatus,'N') as continuestatus, 
            ISNULL(med.pass,'N') as pass, 
            ISNULL(med.stop,'N') as stop, 
            ISNULL(med.hold,'N') as hold, 
            med.wardcode, 
            med.change, 
            ISNULL(med.sendchemo,'N') as sendchemo, 
            ISNULL(med.sendtpn,'N') as sendtpn 
         From 
            dbo.ms_medicationrecconcile med 
            Left Join dbo.ms_dosageunit dos On med.dosageunitcode = dos.DispensedUnitCd 
            Left Join dbo.ms_orderunit  dou On med.orderunitcode = dou.DispensedTotalUnitCd 
            Left Join dbo.ms_frequency_code fc On med.frequencycode = fc.frequency_code 
            Left Join dbo.ms_time ft On med.timecode = ft.timecode 
            Left Join dbo.ms_Instruction Ins On med.instructioncode = Ins.InstructionCd 
            Left Join dbo.ms_priority pr On med.prioritycode = pr.prioritycode 
            Left Join dbo.ms_users us On us.userID = med.usercreatecode 
            Left Join dbo.ms_drug dg On dg.orderitemcode = med.orderitemcode  
        ORDER BY med.voiddatetime ASC, 
            med.prioritycode ASC, 
            med.ordercreatedate ASC


            WHERE an =  '6746098' 
            AND dbo.prescription.ordercreatedate BETWEEN @startDate AND @endDate AND ordertype='0'

            Select TOP 10 ordertype 
            FROM prescriptiondetail 
        `;

    // If e.RowIndex > -1 Then
    //     If checkordertype() = True Then
    //         ordertypecodemain = "3"
    //         ordertypedescmain = "ใบสั่งยาเพิ่มเติม"
    //     Else
    //         ordertypecodemain = "0"
    //         ordertypedescmain = "ใบสั่งยาผู้ป่วยใน"
    //     End If

    // dt = clsaddpatient.Getcheckordertype(condition)
    // If dt.Rows.Count > 0 Then
    //     checkordertype = True
    // End If
    // Return checkordertype

    // Dim daydiff As Integer
    // Dim dt As New DataTable
    // Dim dt2 As New DataTable
    // Dim approvestartdate As DateTime
    // Dim approveenddate As DateTime
    // Dim dispensestatus As String = ""
    // Dim sendaddsheet As Boolean = False
    // Dim sendMac As Boolean = False
    // Dim sendMix As Boolean = False
    // Dim sendchemo As Boolean = False
    // Dim sendtpn As Boolean = False
    // Dim sendPrint As Boolean = False

    // Dim pass As Boolean = False
    // Dim stopd As Boolean = False
    // Dim hold As Boolean = False
    // Dim change As Boolean = False

    // Dim sendprintDPR As Boolean = False
    // Dim statusdiluent As String
    // Dim groupdrugusage As String
    // Dim groupdrugusagecode As String
    // Dim ordertype As String = ""
    // Dim ordercreatedate As DateTime
    // Dim takedate As DateTime
    // Dim dstart As DateTime = Date.Now
    // Dim dend As DateTime = Date.Now
    // Dim orderitemname As String = ""
    // Dim varymeal As String = 0
    // Dim orderqty As Double = 0
    // Dim odddatetime As DateTime
    // Dim datediffodd As Integer = 0
    // Dim allow As String = ""
    // Dim allowstartdate As String = ""
    // Dim allowenddate As String = ""

    // Dim checkstat As Boolean = False

    // Dim strStartdate As String = ""
    // Dim strEnddate As String = ""

    // Dim strStartdate2 As Integer = 0
    // Dim strEnddate2 As Integer = 0
    // Dim codition As String

    // Dim AGE As Date
    //     AGE = dt.Rows(0).Item("patientdob").ToString
    //     txtAge.Text = genAGE(AGE.ToString("dd/MM/yyyy", cultureInfo))

    //     If dt.Rows(0).Item("sex").ToString() = "1" Then
    //         txtSex.Text = "ชาย"
    //     ElseIf dt.Rows(0).Item("sex").ToString() = "2" Then
    //         txtSex.Text = "หญิง"
    //     Else
    //         txtSex.Text = dt.Rows(0).Item("sex").ToString
    //     End If

    //     Dim DOB As Date
    //     DOB = dt.Rows(0).Item("patientdob").ToString
    //     txtDOB.Text = DOB.ToString("dd/MM/yyyy", cultureInfo)
    //     txtroomcode.Text = dt.Rows(0).Item("toroom").ToString
    //     txtbedcode.Text = dt.Rows(0).Item("tobed").ToString
    //     txtwardcode.Text = dt.Rows(0).Item("wardcode").ToString
    //     txtWardname.Text = dt.Rows(0).Item("warddesc").ToString
    //     txtPatientRights.Text = dt.Rows(0).Item("rightname").ToString
    //     txtPatientRightscode.Text = dt.Rows(0).Item("rightid").ToString
    //     txtdoctorcode.Text = ""
    //     txtdoctorname.Text = ""
    //     txtaddress.Text = "บ้านเลขที่ " & dt.Rows(0).Item("address").ToString() & " หมู่ " &
    //                                   dt.Rows(0).Item("moo").ToString() & " ต." &
    //                                   dt.Rows(0).Item("tambol").ToString() & " อ." &
    //                                   dt.Rows(0).Item("amp").ToString() & " จ. " &
    //                                   dt.Rows(0).Item("provname").ToString()
    //     If txtweight.Text = "" Then w = 0 Else w = txtweight.Text
    //     If txtheight.Text = "" Then h = 0 Else h = txtheight.Text

    //     txtBSA.Text = Math.Sqrt((w * h) / 3600).ToString("####.00")

    //     txtidcard.Text = dt.Rows(0).Item("id_card").ToString

    //     showadr(dt.Rows(0).Item("hn").ToString)

    //     dt = clsshow.get_ms_patientlabresult("where an='" & an & "'")

    //     If dt.Rows.Count > 0 Then
    //         'มีเพิ่มข้อมูลแล้ว

    //         txtpatientlabcode.Text = dt.Rows(0).Item("patientlabcode").ToString()

    //         txtscr.Text = dt.Rows(0).Item("scr").ToString()
    //         txteGFR.Text = dt.Rows(0).Item("eGFR").ToString()
    //         If dt.Rows(0).Item("wbc").ToString() = "" Then
    //             txtwbc.Text = 0
    //         Else
    //             txtwbc.Text = dt.Rows(0).Item("wbc").ToString()
    //         End If
    //         If dt.Rows(0).Item("Neutrophil").ToString() = "" Then
    //             txtNeutrophil.Text = 0
    //         Else
    //             txtNeutrophil.Text = dt.Rows(0).Item("Neutrophil").ToString()
    //         End If
    //         If dt.Rows(0).Item("BandformNeutrophil").ToString() = "" Then
    //             txtBandformNeutrophil.Text = 0
    //         Else
    //             txtBandformNeutrophil.Text = dt.Rows(0).Item("BandformNeutrophil").ToString()
    //         End If

    //         txtanc.Text = 0

    //         If dt.Rows(0).Item("weight").ToString() = "" Then
    //             w = 0
    //             txtweight.Text = 0
    //         Else
    //             w = dt.Rows(0).Item("weight").ToString()
    //             txtweight.Text = dt.Rows(0).Item("weight").ToString()
    //         End If
    //         If dt.Rows(0).Item("height").ToString() = "" Then
    //             h = 0
    //         Else
    //             h = dt.Rows(0).Item("height").ToString()
    //             txtheight.Text = dt.Rows(0).Item("height").ToString()
    //         End If

    //         txtBSA.Text = Math.Sqrt((w * h) / 3600).ToString("####.00")

    //         If dt.Rows(0).Item("scr").ToString() = "" Then
    //             txtscr.Text = showdruglabscr(txtHn.Text)
    //         Else
    //             Dim strscr As String = checklastupdatedscr(txtHn.Text)
    //             If strscr <> "" Then
    //                 'เทียบค่า lab ให้อันอันใหม่เสมอ SCR
    //                 scrdatetime1 = strscr ' ค่า lab จากรพ
    //                 scrdatetime2 = dt.Rows(0).Item("lastmodified").ToString() ' ค่า lab ที่เพิ่มเข้าไป

    //                 If scrdatetime1 > scrdatetime2 Then
    //                     txtscr.Text = showdruglabscr(txtHn.Text)
    //                 End If

    //             End If

    //         End If

    //         If dt.Rows(0).Item("eGFR").ToString() = "" Then
    //             txteGFR.Text = showdruglabegfr(txtHn.Text)
    //         Else
    //             Dim stregfr As String = checklastupdatedegfr(txtHn.Text)
    //             If stregfr <> "" Then
    //                 'เทียบค่า lab ให้อันอันใหม่เสมอ eGFR
    //                 egfrdatetime1 = stregfr ' ค่า lab จากรพ
    //                 egfrdatetime2 = dt.Rows(0).Item("lastmodified").ToString() ' ค่า lab ที่เพิ่มเข้าไป

    //                 If egfrdatetime1 > egfrdatetime2 Then
    //                     txteGFR.Text = showdruglabegfr(txtHn.Text)
    //                 End If

    //             End If
    //         End If
    //         txtdoctorcode.Text = dt.Rows(0).Item("DoctorCd").ToString()
    //         txtdoctorname.Text = dt.Rows(0).Item("DoctorTH").ToString()

    //         If dt.Rows(0).Item("wbc").ToString() = "" Then
    //             txtwbc.Text = showdruglabwbc(txtHn.Text)
    //             Else
    //             Dim strwbc As String = checklastupdatedWBC(txtHn.Text)

    //             If strwbc <> "" Then
    //                 'เทียบค่า lab ให้อันอันใหม่เสมอ eGFR
    //                 wbcdatetime1 = strwbc ' ค่า lab จากรพ
    //                 wbcdatetime2 = dt.Rows(0).Item("lastmodified").ToString() ' ค่า lab ที่เพิ่มเข้าไป

    //                 If wbcdatetime1 > wbcdatetime2 Then
    //                     txtwbc.Text = showdruglabwbc(txtHn.Text)
    //                 End If

    //             End If
    //         End If

    // dt = clsrecon.GetDataMedreconcile(codition)

    const request = new sql.Request();
    request.input("startDate", sql.VarChar, startDate);
    request.input("endDate", sql.VarChar, endDate);

    const result = await request.query(query);

    const finalResults = result.recordset.map((record) => {
      return {
        takedate: record.takedate,
        ordertype: record.ordertype,
        prescriptionno: record.prescriptionno,
        hn: record.hn,
        an: record.an,
        patientname: record.patientname,
        wardcode: record.wardcode,
        wardname: record.wardname,
        bedcode: record.bedcode,
        prioritycode: record.prioritycode,
        genorderdatetime: record.genorderdatetime,
        fromlocationname: record.fromlocationname,
        orderitemcode: record.orderitemcode,
      };
    });

    res.status(200).json(finalResults);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Internal Server Error");
  } finally {
    sql.close(); // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
  }
}

module.exports = {
  profile,
};

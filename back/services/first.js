const sql = require("mssql");
const { pool, poolConnect } = require("../models/db");

async function first(req, res) {
  const { wardcode, search = "", ptstatus = "", orderdate = "" } = req.body;
  console.log("Request body from frontend:", req.body); // เพิ่มตรงนี้

  await poolConnect;

  try {
    // สร้าง ptstatus condition ตามค่าที่ส่งมาจาก frontend
    let ptStatusCondition = "";

    if (ptstatus === "admit") {
      ptStatusCondition = " AND dbo.ms_patientadmit.DCdatetime IS NULL";
    } else if (ptstatus === "discharged" && orderdate) {
      ptStatusCondition = ` AND dbo.ms_patientadmit.DCdatetime BETWEEN '${orderdate} 00:00:00' AND '${orderdate} 23:59:59'`;
    } else if (ptstatus === "all" && orderdate) {
      ptStatusCondition = ` AND (dbo.ms_patientadmit.DCdatetime >= '${orderdate} 00:00:00' OR dbo.ms_patientadmit.DCdatetime IS NULL)`;
    }

    let query = `
      SELECT    
          dbo.ms_ward.wardcode,    
          ('[' + dbo.ms_ward.wardcode + '] ' + dbo.ms_ward.warddesc) AS warddesc,     
          COUNT(DISTINCT dbo.ms_patientadmit.an) AS countadmit     
      FROM    
          dbo.ms_patient    
          LEFT JOIN dbo.ms_patientadmit ON dbo.ms_patient.hn = dbo.ms_patientadmit.hn     
          LEFT JOIN dbo.ms_bedmove ON dbo.ms_patientadmit.an = dbo.ms_bedmove.an     
          LEFT JOIN dbo.ms_ward ON dbo.ms_bedmove.towardcode = dbo.ms_ward.wardcode     
          LEFT JOIN dbo.ms_patientDischarge ON dbo.ms_patientadmit.an = dbo.ms_patientDischarge.an 
              AND dbo.ms_patientadmit.hn = dbo.ms_patientDischarge.hn     
      WHERE   
          dbo.ms_bedmove.status = 0   
          AND dbo.ms_ward.wardcode NOT IN ('1420')
          ${ptStatusCondition}
      GROUP BY   
          dbo.ms_ward.wardcode,    
          dbo.ms_ward.warddesc
      ORDER BY 
          CONVERT(INT, dbo.ms_ward.wardcode) ASC;
    `;

    // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
    const result = await pool
      .request()
      .input("wardcode", sql.NVarChar, wardcode)
      .query(query);

    const finalResults = result.recordset.map((record) => ({
      wardcode: record.wardcode,
      warddesc: record.warddesc,
      countadmit: record.countadmit,
    }));

    res.status(200).json(finalResults);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Internal Server Error");
  }
}

const axios = require("axios");

async function second(req, res) {
  const { ptstatus, wardcode } = req.body;

  try {
    await poolConnect;

    const orderdate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // ส่งคำขอไปยัง API แรกเพื่อดึงข้อมูล wardcode
    const firstApiResponse = await axios.post(
      "http://localhost:3000/api/first",
      { wardcode }
    );
    const firstApiData = firstApiResponse.data;

    // ตรวจสอบว่า wardcode ถูกต้องหรือไม่
    const wardExists = firstApiData.some((item) => item.wardcode === wardcode);
    if (!wardExists) {
      return res.status(404).send("Ward not found in the first API data");
    }

    // สร้างเงื่อนไขตาม ptstatus
    let ptStatusCondition = "";
    if (ptstatus === "admit") {
      ptStatusCondition = " AND dbo.ms_patientadmit.DCdatetime IS NULL";
    } else if (ptstatus === "discharged") {
      ptStatusCondition = ` AND dbo.ms_patientadmit.DCdatetime BETWEEN '${orderdate} 00:00:00' AND '${orderdate} 23:59:59'`;
    } else if (ptstatus === "all") {
      ptStatusCondition = ` AND (dbo.ms_patientadmit.DCdatetime >= '${orderdate} 00:00:00' OR dbo.ms_patientadmit.DCdatetime IS NULL)`;
    }

    // Query ข้อมูลผู้ป่วย
    let query = `
            SELECT
                ms_patientadmit.admitteddate,
                ms_patientDischarge.dischargeddate,
                ms_patientadmit.hn,
                ms_patientadmit.an,
                CASE WHEN ms_patient.patientlanguage = 'TH' THEN ms_patient.patientnameTH ELSE ms_patient.patientnameEN END AS patientname,
                ms_ward.wardcode,
                ('[' + ms_ward.wardcode + '] ' + ms_ward.warddesc) AS warddesc,
                count(DISTINCT prescriptionno) AS SumPresc
            FROM
                dbo.ms_patient
                LEFT JOIN dbo.ms_patientadmit ON dbo.ms_patient.hn = dbo.ms_patientadmit.hn
                LEFT JOIN dbo.ms_bedmove ON dbo.ms_patientadmit.an = dbo.ms_bedmove.an
                LEFT JOIN dbo.ms_ward ON dbo.ms_bedmove.towardcode = dbo.ms_ward.wardcode
                LEFT JOIN dbo.ms_patientDischarge ON dbo.ms_patientadmit.an = dbo.ms_patientDischarge.an 
                    AND dbo.ms_patientadmit.hn = dbo.ms_patientDischarge.hn
                LEFT JOIN prescriptionheader ON dbo.ms_patientadmit.hn = prescriptionheader.hn
                    AND dbo.ms_patientadmit.an = prescriptionheader.an
                    AND prescriptionheader.ordercreatedate = '${orderdate}'
            WHERE
                dbo.ms_bedmove.status = 0
                ${ptStatusCondition}
                AND ms_ward.wardcode = '${wardcode}'
            GROUP BY
                ms_patientadmit.admitteddate,
                ms_patientDischarge.dischargeddate,
                ms_patientadmit.hn,
                ms_patientadmit.an,
                ms_patient.patientlanguage,
                ms_patient.patientnameTH,
                ms_patient.patientnameEN,
                ms_ward.wardcode,
                ms_ward.warddesc
            ORDER BY
                ms_patientadmit.admitteddate ASC
        `;

    const result = await pool.request().query(query);

    const finalResults = result.recordset.map((record) => ({
      admitteddate: record.admitteddate,
      dischargeddate: record.dischargeddate,
      hn: record.hn,
      an: record.an,
      patientname: record.patientname,
      SumPresc: record.SumPresc,
      warddesc: record.warddesc,
    }));

    res.status(200).json(finalResults);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  first,
  second,
};

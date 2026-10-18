const { pool, poolConnect, sql } = require("../../models/db");

const f5createorder = async (req, res) => {
  await poolConnect;

  try {
    const text = req.body.text; // รับค่า text จาก Body
    const request = pool.request();

    const result = await request.input("text", sql.VarChar, `${text}%`).query(`
        SELECT
        dbo.ms_drug.orderitemcode,
        dbo.ms_drug.orderitemTHname,
        dbo.ms_drug.orderitemENname,
        dbo.ms_drug.genericname,
        ISNULL(dbo.ms_drug.sendmachine, 'N') AS sendmachine,
        ISNULL(dbo.ms_drug.sendmix, 'N') AS sendmix,
        dbo.ms_drug.instructioncode_ipd,
        CONVERT(float, ISNULL(dbo.ms_drug.dispensedose_ipd, 0)) AS dispensedose_ipd,
        dbo.ms_drug.dosageunitcode_ipd,
        dbo.ms_drug.frequencycode_ipd,
        dbo.ms_drug.timecode_ipd,
        dbo.ms_drug.instructioncode_opd,
        CONVERT(float, ISNULL(dbo.ms_drug.dispensedose_opd, 0)) AS dispensedose_opd,
        dbo.ms_drug.dosageunitcode_opd,
        dbo.ms_drug.frequencycode_opd,
        dbo.ms_drug.timecode_opd,
        CONVERT(float, ISNULL(dbo.ms_drug.cost, 0)) AS cost,
        CONVERT(float, ISNULL(dbo.ms_drug.IPDprice, 0)) AS IPDprice,
        CONVERT(float, ISNULL(dbo.ms_drug.OPDprice, 0)) AS OPDprice,
        dbo.ms_drug.orderunitcode,
        dbo.ms_orderunit.DispensedTotalUnitTH,
        dbo.ms_drug.dosageunitcode,
        dbo.ms_drug.diluentstatus,
        CONVERT(FLOAT, ISNULL(dbo.ms_drug.capacity, 0)) AS capacity,
        dbo.ms_drug.capacity_unit,
        dbo.ms_drug.pricedoseunitstatus,
        dbo.ms_drug.priceunitstatus,
        dbo.ms_drug.priceunittotalstatus,
        dbo.ms_drug.paystatus,
        dbo.ms_drug.displaycolour,
        dbo.ms_drug.printstatus,
        dbo.ms_drug.edned,
        ISNULL(dbo.ms_drug.continuestatus, 'N') AS continuestatus,
        dbo.ms_drug.DIDcode
        FROM dbo.ms_drug
        LEFT JOIN dbo.ms_drugindex ON dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
        LEFT JOIN dbo.ms_orderunit ON dbo.ms_orderunit.DispensedTotalUnitCd = dbo.ms_drug.orderunitcode
        WHERE 
          (dbo.ms_drug.unused = 'Y' AND 
           (dbo.ms_drugindex.drugindexname LIKE @text 
            OR dbo.ms_drug.orderitemTHname LIKE @text 
            OR dbo.ms_drug.orderitemENname LIKE @text))
          OR 
          (dbo.ms_drug.unused = 'Y' AND 
           dbo.ms_drug.orderitemcode LIKE @text AND 
           dbo.ms_drug.searchindex = 'Y')
        GROUP BY
          dbo.ms_drug.orderitemcode,
          dbo.ms_drug.orderitemTHname,
          dbo.ms_drug.orderitemENname,
          dbo.ms_drug.genericname,
          dbo.ms_drug.sendmachine,
          dbo.ms_drug.sendmix,
          dbo.ms_drug.instructioncode_ipd,
          dbo.ms_drug.dispensedose_ipd,
          dbo.ms_drug.dosageunitcode_ipd,
          dbo.ms_drug.frequencycode_ipd,
          dbo.ms_drug.timecode_ipd,
          dbo.ms_drug.instructioncode_opd,
          dbo.ms_drug.dispensedose_opd,
          dbo.ms_drug.dosageunitcode_opd,
          dbo.ms_drug.frequencycode_opd,
          dbo.ms_drug.timecode_opd,
          dbo.ms_drug.cost,
          dbo.ms_drug.IPDprice,
          dbo.ms_drug.OPDprice,
          dbo.ms_drug.orderunitcode,
          dbo.ms_orderunit.DispensedTotalUnitTH,
          dbo.ms_drug.dosageunitcode,
          dbo.ms_drug.diluentstatus,
          dbo.ms_drug.capacity,
          dbo.ms_drug.capacity_unit,
          dbo.ms_drug.pricedoseunitstatus,
          dbo.ms_drug.priceunitstatus,
          dbo.ms_drug.priceunittotalstatus,
          dbo.ms_drug.paystatus,
          dbo.ms_drug.displaycolour,
          dbo.ms_drug.printstatus,
          dbo.ms_drug.edned,
          dbo.ms_drug.continuestatus,
          dbo.ms_drug.DIDcode
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  f5createorder,
};

//show_Search
// Select
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         ISNULL(dbo.ms_drug.sendmachine,'N') As sendmachine,
//         ISNULL(dbo.ms_drug.sendmix,'N') As sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         convert(float,ISNULL(dbo.ms_drug.dispensedose_ipd,0)) As dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         convert(float,ISNULL(dbo.ms_drug.dispensedose_opd,0)) As dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         convert(float,ISNULL(dbo.ms_drug.cost,0)) As cost,
//         convert(float,ISNULL(dbo.ms_drug.IPDprice,0)) As IPDprice,
//         convert(float,ISNULL(dbo.ms_drug.OPDprice,0)) As OPDprice,
//         dbo.ms_drug.orderunitcode,
//         dbo.ms_orderunit.DispensedTotalUnitTH,
//         dbo.ms_drug.dosageunitcode,
//         dbo.ms_drug.diluentstatus,
//         CONVERT(FLOAT,ISNULL( dbo.ms_drug.capacity,0)) AS capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.pricedoseunitstatus,
//         dbo.ms_drug.priceunitstatus,
//         dbo.ms_drug.priceunittotalstatus,
//         dbo.ms_drug.paystatus,
//         dbo.ms_drug.displaycolour,
//         dbo.ms_drug.printstatus,
//         dbo.ms_drug.edned,
//         ISNULL(dbo.ms_drug.continuestatus,'N') As continuestatus,
//         dbo.ms_drug.DIDcode,
//         dbo.ms_drug.fontBold
//         FROM dbo.ms_drug
//         LEFT JOIN dbo.ms_drugindex ON dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode
//         LEFT JOIN dbo.ms_orderunit ON dbo.ms_orderunit.DispensedTotalUnitCd = dbo.ms_drug.orderunitcode

//         where dbo.ms_drug.unused = 'Y' AND (dbo.ms_drugindex.drugindexname Like 'm%' OR dbo.ms_drug.orderitemTHname LIKE 'm%' OR dbo.ms_drug.orderitemENname LIKE 'm%') OR (dbo.ms_drug.unused = 'Y' AND dbo.ms_drug.orderitemcode LIKE 'm%' AND dbo.ms_drug.searchindex = 'Y')
//         GROUP BY

//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         dbo.ms_drug.sendmachine,
//         dbo.ms_drug.sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         dbo.ms_drug.dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         dbo.ms_drug.dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         dbo.ms_drug.cost,
//         dbo.ms_drug.IPDprice,
//         dbo.ms_drug.OPDprice,
//         dbo.ms_drug.orderunitcode,
//         dbo.ms_orderunit.DispensedTotalUnitTH,
//         dbo.ms_drug.dosageunitcode,
//         dbo.ms_drug.diluentstatus,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.pricedoseunitstatus,
//         dbo.ms_drug.priceunitstatus,
//         dbo.ms_drug.priceunittotalstatus,
//         dbo.ms_drug.paystatus,
//         dbo.ms_drug.displaycolour,
//         dbo.ms_drug.printstatus,
//         dbo.ms_drug.edned,
//         dbo.ms_drug.continuestatus,
//         dbo.ms_drug.DIDcode,
//         dbo.ms_drug.fontBold

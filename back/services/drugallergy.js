const { pool, poolConnect, sql } = require("../../back/models/db");

const drugallergy = async (req, res) => {
  await poolConnect;

  try {
    const hn = req.body.hn; // รับค่า hn จาก Body
    const request = pool.request();

    const result = await request.input("hn", sql.VarChar, `${hn}`).query(`
    SELECT
        dbo.ms_adr.AllergyGroupCd,
        dbo.ms_adr.AllergyGroupNm,
        dbo.ms_adr.adversereactions,
        dbo.ms_adr.typeofadr,
        dbo.ms_adr.naranjoscore,
        dbo.ms_adr.propability,
        dbo.ms_adr.policy,
        dbo.ms_adr.startadrddatetime,
        dbo.ms_adrgeneric.genericname,
        dbo.ms_allergygroupdetail.ingredientcode,
        CASE
          WHEN dbo.ms_adr.AllergyGroupCd IS NULL THEN dbo.ms_adrgeneric.genericname
          ELSE dbo.ms_ingredient.ingredientname
        END AS patadr
    FROM
        dbo.ms_adr
    LEFT JOIN dbo.ms_adrgeneric ON dbo.ms_adr.adrcode = dbo.ms_adrgeneric.adrcode
    LEFT JOIN dbo.ms_allergygroupdetail ON dbo.ms_adr.AllergyGroupCd = dbo.ms_allergygroupdetail.AllergyGroupCd
    LEFT JOIN dbo.ms_ingredient ON dbo.ms_ingredient.ingredientcode = dbo.ms_allergygroupdetail.ingredientcode
    WHERE
        dbo.ms_adr.hn = @hn
    ORDER BY
        dbo.ms_adr.AllergyGroupCd
    `);

    // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
    const formattedData = result.recordset.map((row, index) => {
      return {
        id: index + 1,
        description1: `${index + 1}. วันที่ ${new Date(
          row.startadrddatetime
        ).toLocaleString("th-TH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`,
        description2: `แพ้ยา ${row.genericname}`,
        description3: `อาการ: ${row.adversereactions} ${row.typeofadr} ความน่าจะเป็น:${row.propability}`,
      };
    });

    // ส่งข้อมูลที่แปลงแล้วกลับไป
    res.status(200).json(formattedData);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  drugallergy,
};

// const drugallergy = async (req, res) => {
//   await poolConnect;

//   try {
//     const hn = req.body.text; // เปลี่ยน text เป็น hn
//     const request = pool.request();

//     const result = await request.input("hn", sql.VarChar, `${hn}`).query(`
//     SELECT
//         dbo.ms_adr.AllergyGroupCd,
//         dbo.ms_adr.AllergyGroupNm,
//         dbo.ms_adr.adversereactions,
//         dbo.ms_adr.typeofadr,
//         dbo.ms_adr.naranjoscore,
//         dbo.ms_adr.propability,
//         dbo.ms_adr.policy,
//         dbo.ms_adr.startadrddatetime,
//         dbo.ms_adrgeneric.genericname,
//         dbo.ms_allergygroupdetail.ingredientcode,
//         CASE
//           WHEN dbo.ms_adr.AllergyGroupCd IS NULL THEN dbo.ms_adrgeneric.genericname
//           ELSE dbo.ms_ingredient.ingredientname
//         END AS patadr
//     FROM
//         dbo.ms_adr
//     LEFT JOIN dbo.ms_adrgeneric ON dbo.ms_adr.adrcode = dbo.ms_adrgeneric.adrcode
//     LEFT JOIN dbo.ms_allergygroupdetail ON dbo.ms_adr.AllergyGroupCd = dbo.ms_allergygroupdetail.AllergyGroupCd
//     LEFT JOIN dbo.ms_ingredient ON dbo.ms_ingredient.ingredientcode = dbo.ms_allergygroupdetail.ingredientcode
//     WHERE
//         dbo.ms_adr.hn = @hn
//     ORDER BY
//         dbo.ms_adr.AllergyGroupCd
//     `);

//     const formattedData = result.recordset.map((row, index) => ({
//       id: index + 1,
//       description1: `${index + 1}. วันที่ ${new Date(
//         row.startadrddatetime
//       ).toLocaleString("th-TH", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//       })}`,
//       description2: `แพ้ยา ${row.genericname}`,
//       description3: `อาการ: ${row.adversereactions} ${row.typeofadr} ความน่าจะเป็น:${row.propability}`,
//     }));

//     res.status(200).json(formattedData);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("Server error");
//   }
// };

// module.exports = {
//   drugallergy,
// };

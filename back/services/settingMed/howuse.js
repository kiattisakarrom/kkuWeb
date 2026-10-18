const { pool, poolConnect, sql } = require("../../models/db");

const howuse = async (req, res) => {
  await poolConnect; // รอจนกระทั่งการเชื่อมต่อสำเร็จ

  try {
    const request = pool.request(); // สร้างคำขอ SQL

    const result = await request.query(
      `
      SELECT
        dbo.ms_Instruction.InstructionCd,
        dbo.ms_Instruction.InstructionNameTH,
        dbo.ms_Instruction.InstructionNameEN,
        dbo.ms_Instruction.dose
      FROM
        dbo.ms_Instruction
      WHERE dbo.ms_Instruction.InstructionCd Like 'IVD3H%';

      SELECT
        dbo.ms_dosageunit.DispensedUnitCd,
        dbo.ms_dosageunit.DispensedUnitTH,
        dbo.ms_dosageunit.DispensedUnitEN
      FROM
        dbo.ms_dosageunit
      WHERE dbo.ms_dosageunit.DispensedUnitCd Like 'GM%';

      SELECT
        dbo.ms_frequency_code.frequency_code,
        dbo.ms_frequency_code.frequency_nameTH,
        dbo.ms_frequency_code.frequency_nameEN,
        dbo.ms_frequency_code.qty_per_day,
        dbo.ms_frequency_code.frequency_count,
        dbo.ms_frequency_code.lastmodify,
        dbo.ms_frequency_code.status,
        dbo.ms_frequency_code.frequency_onlydays,
        dbo.ms_frequency_code.oddday,
        dbo.ms_frequency_code.EveryOtherDay,
        dbo.ms_frequency_code.qty_per_day2
      FROM
        dbo.ms_frequency_code
      WHERE dbo.ms_frequency_code.frequency_code Like 'E8%';

      SELECT
        dbo.ms_time.timecode,
        dbo.ms_time.timeTH,
        dbo.ms_time.timeEN,
        dbo.ms_time.timecount
      FROM
        dbo.ms_time
      WHERE
        dbo.ms_time.timecode Like 'E8T%' OR
        dbo.ms_time.timeTH Like 'E8T%' OR
        dbo.ms_time.timeEN Like 'E8T%';

      SELECT
        dbo.ms_mapdrugusage.drugusagecode,
        dbo.ms_mapdrugusage.drugusagedesc
      FROM
        dbo.ms_mapdrugusage
      WHERE
        dbo.ms_mapdrugusage.drugusagecode Like '1GIVD3HQ8H%' OR
        dbo.ms_mapdrugusage.drugusagedesc Like '1GIVD3HQ8H%';
      `
    );

    // แยกผลลัพธ์ตามตาราง
    const data = {
      instruction: result.recordsets[0],
      dosageUnit: result.recordsets[1],
      frequencyCode: result.recordsets[2],
      timeData: result.recordsets[3],
      drugUsage: result.recordsets[4],
    };

    res.status(200).json(data); // ส่งข้อมูลกลับในรูปแบบ JSON
  } catch (err) {
    console.error("SQL error", err); // แสดงข้อผิดพลาดใน console
    res.status(500).send("Server error"); // ส่งข้อผิดพลาดกลับไปยังผู้เรียกใช้
  }
};

module.exports = {
  howuse,
};

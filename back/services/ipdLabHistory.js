function validLabDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "1753-01-01" &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

function labCalendarBounds(from, to) {
  if (!validLabDate(from) || !validLabDate(to) || from > to)
    throw Object.assign(new Error("Invalid LAB dates"), { code: "LAB_DATES" });
  // Match frmShowLab's calendar cutoff literally, independently of IPD rounds.
  return { start: `${from} 00:00:00`, end: `${to} 23:59:00` };
}

function createLabHistoryReader(execute) {
  return {
    async getPatientLabDates(patient, { from, to }) {
      const { start, end } = labCalendarBounds(from, to);
      const [dates] = await execute(
        {
          sql: `SELECT LEFT(l.date_result, 10) AS date
            FROM view_lab_result l
            WHERE l.hn = ? AND l.date_result >= ? AND l.date_result <= ?
            GROUP BY LEFT(l.date_result, 10) ORDER BY date DESC`,
          timeout: 10000,
        },
        [patient.hn, start, end],
      );
      return dates;
    },
    async getPatientLabResults(patient, { date }) {
      const { start, end } = labCalendarBounds(date, date);
      const [items] = await execute(
        {
          sql: `SELECT l.lab_no, l.rax_no, l.type, l.lab_code, l.lab_name,
            l.result, l.type_result, l.unit, l.minresult, l.maxresult,
            l.date_res, l.time_res, l.remark,
            CAST(l.result_obj AS CHAR(10000) CHARACTER SET tis620) AS result_obj,
            l.type_obj, l.\`name\`, l.detail, l.date_result, l.lastupdate, l.ref
            FROM view_lab_result l
            WHERE l.hn = ? AND l.date_result >= ? AND l.date_result <= ?
            ORDER BY l.lab_code, l.date_result, l.lab_no, l.rax_no`,
          timeout: 10000,
        },
        [patient.hn, start, end],
      );
      return items;
    },
  };
}

module.exports = { createLabHistoryReader, labCalendarBounds, validLabDate };

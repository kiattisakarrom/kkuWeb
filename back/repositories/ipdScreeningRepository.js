const { sql, pool } = require("../models/db");
const { screeningDisplayRows } = require("../services/ipdScreeningDisplay");

async function displayTimeDetails(items) {
  const codes = [
    ...new Set(
      items
        .filter(
          (row) =>
            row.sendmachine === "Y" &&
            !String(row.frequencycode || "").includes("PRN"),
        )
        .map((row) => String(row.timecode || "")),
    ),
  ];
  const details = [];
  for (let start = 0; start < codes.length; start += 500) {
    const query = pool.request();
    const values = codes.slice(start, start + 500).map((code, index) => {
      query.input(`time${index}`, sql.VarChar(50), code);
      return `@time${index}`;
    });
    const result =
      await query.query(`SELECT t.timecode,t.timetype,d.timedetailcode,d.timedetailTH
      FROM dbo.ms_time t LEFT JOIN dbo.ms_timedetail d ON d.timecode=t.timecode
      WHERE t.timecode IN (${values.join(",")});`);
    details.push(...result.recordset);
  }
  return details;
}
const { allWardsSql, allHeadersSql } = require("../services/ipdScreeningAll");
const {
  takeHomeWardsSql,
  takeHomeHeadersSql,
  takeHomeItemsSql,
} = require("../services/ipdScreeningTakeHome");
const {
  screeningWardsSql,
  screeningHeadersSql,
  screeningItemsSql,
} = require("../services/ipdScreening");
const {
  robotWardsSql,
  robotHeadersSql,
  robotItemsSql,
} = require("../services/ipdScreeningRobot");

function querySet(mode) {
  if (["take-home-wait", "take-home-finished"].includes(mode))
    return {
      wards: takeHomeWardsSql,
      headers: takeHomeHeadersSql,
      items: takeHomeItemsSql,
    };
  if (mode === "robot-wait")
    return {
      wards: robotWardsSql,
      headers: robotHeadersSql,
      items: robotItemsSql,
    };
  if (mode === "screen-all")
    return { wards: allWardsSql, headers: allHeadersSql };
  return {
    wards: screeningWardsSql,
    headers: screeningHeadersSql,
    items: screeningItemsSql,
  };
}

function headerFilters(filters) {
  return ["take-home-wait", "take-home-finished"].includes(filters.mode)
    ? {
        ...filters,
        window: { ...filters.window, end: filters.window.headerEnd },
      }
    : filters;
}

async function request(
  context,
  filters,
  wardCode,
  prescriptionno = null,
  patient,
) {
  await pool.connect();
  const query = pool
    .request()
    .input("roomCode", sql.VarChar(20), context.roomCode)
    .input("mode", sql.VarChar(20), filters.mode)
    .input("search", sql.NVarChar(32), filters.search)
    .input("start", sql.VarChar(19), filters.window.start)
    .input("end", sql.VarChar(19), filters.window.end)
    .input("wardCode", sql.VarChar(20), wardCode || null)
    .input("prescriptionno", sql.VarChar(20), prescriptionno);
  if (filters.mode === "screen-all")
    query
      .input("screenStatus", sql.VarChar(10), filters.screenStatus)
      .input("orderType", sql.VarChar(4), filters.orderType)
      .input(
        "orderTypeCode",
        sql.VarChar(1),
        ["0", "1", "3"].includes(filters.orderType) ? filters.orderType : null,
      )
      .input(
        "roomPattern",
        sql.VarChar(40),
        context.roomCode.replace(/[~%_\[]/g, "~$&"),
      );
  if (patient)
    query
      .input("hn", sql.VarChar(32), patient.hn)
      .input("an", sql.VarChar(32), patient.an);
  return query;
}

async function getScreeningWards(context, filters) {
  const query = await request(context, {
    ...filters,
    window: { ...filters.window, end: filters.window.wardEnd },
  });
  return (await query.query(querySet(filters.mode).wards)).recordset;
}

async function getScreeningPrescriptions(context, filters, wardCode) {
  const query = await request(context, headerFilters(filters), wardCode);
  return (await query.query(querySet(filters.mode).headers)).recordset;
}

async function getScreeningPrescription(
  context,
  filters,
  wardCode,
  prescriptionno,
) {
  // ucScreenAll has headers and a send basket, not a medication-detail table.
  // Its read-only double-click opens the existing patient prescription view.
  if (filters.mode === "screen-all") return null;
  const query = await request(
    context,
    headerFilters(filters),
    wardCode,
    prescriptionno,
  );
  const headers = (await query.query(querySet(filters.mode).headers)).recordset;
  if (!headers.length) return null;
  if (
    new Set(headers.map((row) => JSON.stringify([row.hn, row.an]))).size !== 1
  )
    throw Object.assign(
      new Error("Ambiguous screening prescription identity"),
      { code: "SCREENING_IDENTITY" },
    );
  const detailQuery = await request(
    context,
    filters,
    wardCode,
    prescriptionno,
    headers[0],
  );
  const items = (await detailQuery.query(querySet(filters.mode).items))
    .recordset;
  const displayItems =
    filters.mode === "robot-wait"
      ? undefined
      : screeningDisplayRows(
          items,
          await displayTimeDetails(items),
          filters.mode,
        );
  // A valid home header can have only Stat/Off rows: native legitimately shows no drugs.
  return items.length ||
    ["take-home-wait", "take-home-finished"].includes(filters.mode)
    ? { header: headers[0], items, ...(displayItems ? { displayItems } : {}) }
    : null;
}

async function getScreeningRooms() {
  await pool.connect();
  return (
    await pool
      .request()
      .query(
        "SELECT RTRIM(roomcode) AS code, RTRIM(roomname) AS name FROM dbo.ms_room ORDER BY roomcode;",
      )
  ).recordset;
}

async function findScreeningRoom(code) {
  await pool.connect();
  return (
    (
      await pool
        .request()
        .input("roomCode", sql.VarChar(20), code)
        .query(
          "SELECT TOP 1 RTRIM(roomcode) AS code, RTRIM(roomname) AS name FROM dbo.ms_room WHERE roomcode = @roomCode;",
        )
    ).recordset[0] || null
  );
}

module.exports = {
  getScreeningRooms,
  findScreeningRoom,
  getScreeningWards,
  getScreeningPrescriptions,
  getScreeningPrescription,
};

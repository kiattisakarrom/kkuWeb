const axios = require("axios");

const IHOS_DUE_URL = "https://interface.kkh.go.th/v1/pharmacy/restricted-drug";

function sourceError(code) {
  return Object.assign(new Error(code), { code });
}

function scalar(row, key) {
  const value = row[key];
  if (value === null || value === undefined) return "";
  if (!["string", "number"].includes(typeof value))
    throw sourceError("IHOS_DUE_INVALID_RESPONSE");
  return String(value);
}

function parseIhosDue(payload, an) {
  if (
    !payload ||
    !Array.isArray(payload.data) ||
    payload.success === false ||
    payload.status === false ||
    Boolean(payload.error)
  )
    throw sourceError("IHOS_DUE_INVALID_RESPONSE");
  return payload.data.map((row) => {
    if (
      !row ||
      typeof row !== "object" ||
      Array.isArray(row) ||
      !["datetime", "status", "drugcode"].every((key) =>
        Object.hasOwn(row, key),
      )
    )
      throw sourceError("IHOS_DUE_INVALID_RESPONSE");
    for (const key of ["an", "AN"]) {
      if (row[key] !== undefined && scalar(row, key).trim() !== an)
        throw sourceError("IHOS_DUE_INVALID_RESPONSE");
    }
    const status = scalar(row, "status").trim();
    const drugcode = scalar(row, "drugcode").trim();
    if (drugcode.length > 100) throw sourceError("IHOS_DUE_INVALID_RESPONSE");
    return {
      datetime: scalar(row, "datetime"),
      status,
      statusText:
        status === ""
          ? "รออนุมัติ"
          : status === "1"
            ? "อนุมัติ"
            : status === "2"
              ? "ไม่อนุมัติ"
              : `ไม่ทราบสถานะ (${status})`,
      drugcode,
      confirm_inp_id: scalar(row, "confirm_inp_id"),
      // The original viewer leaves the confirmer-name column empty.
      confirm: "",
      confirm_date: scalar(row, "confirm_date"),
      confirm_note: scalar(row, "confirm_note"),
      request_note: scalar(row, "request_note"),
      inp_type: scalar(row, "inp_type"),
    };
  });
}

function createIhosDueReader({
  httpGet = axios.get,
  apiKey = () => process.env.IHOS_DUE_API_KEY,
  lookupDrugNames,
}) {
  return async (patient) => {
    const key = apiKey();
    if (!key) throw sourceError("IHOS_DUE_NOT_CONFIGURED");
    let response;
    try {
      response = await httpGet(IHOS_DUE_URL, {
        params: { an: patient.an },
        headers: { "x-api-key": key, Accept: "application/json" },
        timeout: 6000,
        maxRedirects: 0,
        maxContentLength: 2 * 1024 * 1024,
        responseType: "json",
      });
    } catch {
      // Axios errors can contain the key, URL and clinical response: never log them.
      throw sourceError("IHOS_DUE_UNAVAILABLE");
    }
    const items = parseIhosDue(response.data, patient.an);
    const codes = [
      ...new Set(items.map((row) => row.drugcode).filter(Boolean)),
    ];
    const names = codes.length ? await lookupDrugNames(codes) : new Map();
    return items.map((row) => ({
      ...row,
      drugname: names.get(row.drugcode) || "",
    }));
  };
}

module.exports = { createIhosDueReader, parseIhosDue, IHOS_DUE_URL };

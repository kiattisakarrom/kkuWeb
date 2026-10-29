const express = require("express");

const validCode = (value) =>
  typeof value === "string" && /^[A-Za-z0-9-]{1,32}$/.test(value);
function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "1753-01-01" &&
    value <= "9999-12-30" &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
function filtersFor(input, history = false) {
  const allowed = history
    ? ["from", "to", "hn"]
    : ["an", "useDate", "from", "to"];
  if (!input || Object.keys(input).some((key) => !allowed.includes(key)))
    return null;
  if (history) {
    if (input.hn !== undefined && input.hn !== "" && !validCode(input.hn))
      return null;
  } else if (
    !validCode(input.an) ||
    !["0", "1", 0, 1, false, true, undefined].includes(input.useDate)
  )
    return null;
  const useDate = history || ["1", 1, true].includes(input.useDate);
  if (
    useDate &&
    (!validDate(input.from) || !validDate(input.to) || input.from > input.to)
  )
    return null;
  if (
    !useDate &&
    ((input.from !== undefined && !validDate(input.from)) ||
      (input.to !== undefined && !validDate(input.to)))
  )
    return null;
  return history
    ? { from: input.from, to: input.to, hn: input.hn || "" }
    : {
        an: input.an,
        useDate: useDate ? 1 : 0,
        from: useDate ? input.from : "1753-01-01",
        to: useDate ? input.to : "1753-01-01",
      };
}
function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
function reportAdrRoutes(repository) {
  const router = express.Router();
  const sendPdf = (res, buffer, name) =>
    res
      .type("pdf")
      .set("Content-Disposition", `attachment; filename="${name}.pdf"`)
      .send(buffer);
  router.get("/medications", async (req, res, next) => {
    const filters = filtersFor(req.query);
    if (!filters)
      return res
        .status(400)
        .json({ message: "กรุณากรอก AN และช่วงวันที่ให้ถูกต้อง" });
    try {
      res.json({
        ...(await repository.getAdrReportMedications(filters, today())),
        filters,
      });
    } catch (error) {
      next(error);
    }
  });
  router.get("/history", async (req, res, next) => {
    const filters = filtersFor(req.query, true);
    if (!filters)
      return res
        .status(400)
        .json({ message: "กรุณาเลือกช่วงวันที่และ HN ให้ถูกต้อง" });
    try {
      res.json({
        items: await repository.getAdrReportHistory(filters),
        filters,
      });
    } catch (error) {
      next(error);
    }
  });
  // POST carries only report selection. It performs SELECTs and renders an in-memory PDF.
  router.post("/pdf", async (req, res, next) => {
    const { selections, ...input } = req.body || {};
    const filters = filtersFor(input);
    if (
      !filters ||
      !Array.isArray(selections) ||
      !selections.length ||
      selections.length > 200 ||
      selections.some(
        (item) =>
          !item ||
          Object.keys(item).some((key) => !["id", "soi"].includes(key)) ||
          typeof item.id !== "string" ||
          !item.id ||
          item.id.length > 64 ||
          !["", "S", "O", "I"].includes(item.soi),
      ) ||
      new Set(selections.map(({ id }) => id)).size !== selections.length
    )
      return res
        .status(400)
        .json({
          message:
            "กรุณาเลือกรายการยาและ S,O,I ให้ถูกต้อง (ไม่เกิน 200 รายการ)",
        });
    try {
      sendPdf(
        res,
        await require("../services/reportAdrPdf").createAdrPdf(
          await repository.getAdrReportPdfData(filters, selections),
        ),
        "ADR",
      );
    } catch (error) {
      next(error);
    }
  });
  router.get("/history/pdf", async (req, res, next) => {
    const filters = filtersFor(req.query, true);
    if (!filters)
      return res
        .status(400)
        .json({ message: "กรุณาเลือกช่วงวันที่และ HN ให้ถูกต้อง" });
    try {
      const rows = await repository.getAdrReportHistory(filters);
      if (!rows.length)
        return res.status(404).json({ message: "ไม่พบข้อมูลสำหรับออกรายงาน" });
      sendPdf(
        res,
        await require("../services/reportAdrPdf").createAdrHistoryPdf(
          rows,
          filters,
        ),
        "ADR-history",
      );
    } catch (error) {
      next(error);
    }
  });
  router.use((error, _req, res, next) => {
    if (["ADR_AMBIGUOUS_PATIENT", "ADR_SELECTION_CHANGED"].includes(error.code))
      return res
        .status(409)
        .json({
          message:
            "ข้อมูลรายการยามีการเปลี่ยนแปลงหรือไม่ตรงกัน กรุณาค้นหาและเลือกใหม่",
        });
    next(error);
  });
  return router;
}
module.exports = { reportAdrRoutes, filtersFor };

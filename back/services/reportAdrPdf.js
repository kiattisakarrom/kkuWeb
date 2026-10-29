const fs = require("node:fs/promises");
const path = require("node:path");
const PdfPrinter = require("pdfmake");
const { PDFDocument } = require("pdf-lib");
const adrFields = require("../assets/reports/adr-fields.json");

const fontPath = path.join(__dirname, "../assets/fonts/Sarabun-Regular.ttf");
const fonts = {
  Sarabun: {
    normal: fontPath,
    bold: path.join(__dirname, "../assets/fonts/Sarabun-Bold.ttf"),
    italics: fontPath,
    bolditalics: fontPath,
  },
};
const date = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value || "")
    ? value.split("-").reverse().join("/")
    : "";
function renderPdf(definition) {
  return new Promise((resolve, reject) => {
    const document = new PdfPrinter(fonts).createPdfKitDocument({
      defaultStyle: { font: "Sarabun", fontSize: 9 },
      ...definition,
    });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("error", reject);
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.end();
  });
}
function age(dob, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || "")) return "";
  const [year, month, day] = dob.split("-").map(Number);
  const now = new Date(
    today.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
  );
  // Match the Windows genAGE year/month/day representation.
  let months = 12 * (now.getFullYear() - year) + (now.getMonth() + 1 - month);
  let days = now.getDate() - day;
  if (now.getDate() < day) {
    months -= 1;
    days =
      new Date(Date.UTC(year, month, 0)).getUTCDate() - day + now.getDate();
  }
  if (months < 0) return "";
  const years = Math.floor(months / 12);
  months -= years * 12;
  return [
    years ? `${years} ปี` : "",
    months ? `${months} เดือน` : "",
    days ? `${days} วัน` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

async function createAdrPdf({ patient, items }) {
  const output = await PDFDocument.create();
  output.setTitle("ADR");
  output.setLanguage("th-TH");
  // Original RPT sections, in points: report header 277, detail 33.75, footer 432.25.
  const width = 595,
    height = 842,
    headerEnd = 295,
    detailHeight = 33.75,
    footerStart = 328.75,
    footerHeight = 432.25;
  // 300 DPI crops of the original blank Crystal form avoid duplicated hidden text
  // from clipped full-page PDF XObjects. Patient/medication text remains selectable.
  const background = async (name) =>
    output.embedPng(
      await fs.readFile(
        path.join(__dirname, `../assets/reports/adr-${name}.png`),
      ),
    );
  const [header, detail, footer] = await Promise.all(
    ["header", "detail", "footer"].map(background),
  );
  const overlays = [];
  const overflow = [];
  let page = output.addPage([width, height]),
    cursor = headerEnd;
  page.drawImage(header, {
    x: 0,
    y: height - headerEnd,
    width,
    height: headerEnd,
  });
  const pages = [page];
  const newPage = () => {
    page = output.addPage([width, height]);
    pages.push(page);
    cursor = 18;
  };
  const dynamic = Object.fromEntries(
    adrFields.map((field) => [field.Name, field]),
  );
  const measuring = new PdfPrinter(fonts).createPdfKitDocument({
    content: [],
    defaultStyle: { font: "Sarabun" },
  });
  measuring.font(fontPath);
  measuring.resume();
  const graphemes = new Intl.Segmenter("th", { granularity: "grapheme" });
  function wrap(value, boxWidth, size) {
    measuring.fontSize(size);
    const lines = [];
    for (const paragraph of String(value).split("\n")) {
      let line = "";
      for (const { segment } of graphemes.segment(paragraph)) {
        if (line && measuring.widthOfString(line + segment) > boxWidth) {
          lines.push(line);
          line = "";
        }
        line += segment;
      }
      lines.push(line);
    }
    return lines;
  }
  function put(field, value, top) {
    const x = 18 + field.Left / 20,
      y = top + field.Top / 20,
      w = field.Width / 20,
      h = field.Height / 20;
    let size = 8,
      lines = wrap(value, w - 2, size);
    while (size > 6 && lines.length * size * 1.55 > h) {
      size -= 0.5;
      lines = wrap(value, w - 2, size);
    }
    if (lines.length * size * 1.55 > h) {
      overflow.push({
        label: String(value).split("\n")[0],
        value: String(value),
      });
      lines = lines.slice(0, Math.max(1, Math.floor(h / (size * 1.55))));
      lines[lines.length - 1] = "…";
    }
    lines.forEach((line, index) =>
      overlays.push({
        page: pages.length - 1,
        text: line,
        fontSize: size,
        absolutePosition: { x: x + 0.5, y: y + 0.5 + index * size * 1.55 },
      }),
    );
  }
  const values = {
    patientdob: date(patient.dob),
    address: patient.address,
    hn: patient.hn,
    an: patient.an,
    idcard: patient.idcard,
    patientname: patient.name,
    age: age(patient.dob),
    sexM: patient.sex === "1" ? "x" : "",
    sexF: patient.sex === "2" ? "x" : "",
    adrNH: patient.allergy ? "" : "x",
    adrH: patient.allergy ? "x" : "",
    adrDe: patient.allergy,
  };
  const headerFields = adrFields.filter(
    (field) =>
      field.Top >= 0 &&
      !["Text111", "Text112", "Text122", "Text140", "Text172"].includes(
        field.Name,
      ),
  );
  // Dynamic RPT text objects are already suppressed in the blank template; retain all rules and checkboxes.
  for (const field of headerFields)
    put(
      field,
      field.Text.replace(
        /\{ADR\.(\w+)\}/g,
        (_match, key) => values[key] || "",
      ).trimEnd(),
      18,
    );
  for (const item of items) {
    if (cursor + detailHeight > height - 18) newPage();
    page.drawImage(detail, {
      x: 0,
      y: height - cursor - detailHeight,
      width,
      height: detailHeight,
    });
    for (const [fieldName, value] of [
      ["Text111", item.name],
      ["Text112", item.usage],
      ["Text122", date(item.start)],
      ["Text140", date(item.end)],
      ["Text172", item.soi],
    ])
      put(dynamic[fieldName], value, cursor);
    cursor += detailHeight;
  }
  if (cursor + footerHeight > height - 18) newPage();
  page.drawImage(footer, {
    x: 0,
    y: height - cursor - footerHeight,
    width,
    height: footerHeight,
  });
  measuring.end();
  const overlayContent = [];
  for (let index = 0; index < pages.length; index++) {
    if (index) overlayContent.push({ text: "", pageBreak: "before" });
    overlayContent.push(
      ...overlays
        .filter((entry) => entry.page === index)
        .map(({ page: _page, ...entry }) => entry),
    );
    overlayContent.push({
      text: `HN ${patient.hn}  AN ${patient.an}    ${index + 1}/${pages.length}`,
      fontSize: 7,
      absolutePosition: { x: 18, y: 827 },
    });
  }
  const overlayDoc = await PDFDocument.load(
    await renderPdf({
      pageSize: { width, height },
      pageMargins: 0,
      content: overlayContent,
    }),
  );
  const embedded = await output.embedPages(overlayDoc.getPages());
  for (let index = 0; index < pages.length; index++)
    pages[index].drawPage(embedded[index], { x: 0, y: 0 });
  if (overflow.length) {
    const appendix = await PDFDocument.load(
      await renderPdf({
        pageSize: "A4",
        pageMargins: 30,
        content: [
          {
            text: "ข้อมูลประกอบแบบรายงาน ADR",
            bold: true,
            fontSize: 13,
            margin: [0, 0, 0, 10],
          },
          {
            text: `HN ${patient.hn}  AN ${patient.an}  ${patient.name}`,
            margin: [0, 0, 0, 10],
          },
          ...overflow.map(({ value }) => ({
            text: value,
            margin: [0, 0, 0, 12],
          })),
        ],
      }),
    );
    for (const appendixPage of await output.copyPages(
      appendix,
      appendix.getPageIndices(),
    ))
      output.addPage(appendixPage);
  }
  return Buffer.from(await output.save());
}

const historyColumns = [
  ["hn", "HN"],
  ["patientnameTH", "ชื่อผู้ป่วย"],
  ["createdate", "วันที่"],
  ["typeofadr", "Type of ADR"],
  ["destination", "ประวัติแพ้ยา"],
  ["AllergyGroupNm", "กลุ่มยา"],
  ["genericname", "genericname"],
  ["ingredientname", "ingredientname"],
  ["startadrddatetime", "วันที่เกิด"],
  ["adversereactions", "อาการไม่พึงประสงค์"],
  ["pharmacistnote", "Pharmacist note"],
  ["onsetofadr", "Onset of ADR"],
  ["unitonset", "หน่วยของ Onset"],
  ["naranjoscore", "Naranjo's score"],
  ["propability", "Propability"],
  ["policy", "Policy"],
  ["pharmacyname", "ผู้ประเมิน"],
  ["username", "ผู้บันทึก"],
];
function createAdrHistoryPdf(rows, filters) {
  return renderPdf({
    pageSize: "A3",
    pageOrientation: "landscape",
    pageMargins: [24, 30, 24, 32],
    defaultStyle: { font: "Sarabun", fontSize: 7 },
    footer: (page, pages) => ({
      text: `${page}/${pages}`,
      alignment: "right",
      margin: [0, 0, 24, 0],
      fontSize: 8,
    }),
    content: [
      { text: "ประวัติ ADR", fontSize: 14, bold: true },
      {
        text: `วันที่ ${date(filters.from)} ถึง ${date(filters.to)}${filters.hn ? "   HN " + filters.hn : ""}   จำนวน ${rows.length} รายการ`,
        margin: [0, 4, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: [
            35, 62, 40, 40, 50, 50, 50, 50, 40, 80, 80, 29, 33, 33, 40, 50, 50,
            50,
          ],
          body: [
            historyColumns.map(([, label]) => ({
              text: label,
              bold: true,
              fillColor: "#dcecf7",
            })),
            ...rows.map((row) =>
              historyColumns.map(([key]) =>
                key === "createdate" || key === "startadrddatetime"
                  ? date(row[key])
                  : (row[key] ?? ""),
              ),
            ),
          ],
        },
        layout: "lightHorizontalLines",
      },
    ],
  });
}
module.exports = { createAdrPdf, createAdrHistoryPdf, historyColumns, age };

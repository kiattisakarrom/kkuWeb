const ExcelJS = require('exceljs');
const { columns } = require('./reportPharmcareSummary');
const headers = require('../assets/reports/pharmcare-summary/excel-headers.json');

async function createPharmcareSummaryExcel({ rows }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Pharmcare', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  // Windows exports DataGridViewColumn.Name (not HeaderText) to the Pharmcare
  // DataTable. Keep these unique native names, order, and all-string cell values.
  sheet.addTable({
    name: 'Pharmcare', ref: 'A1', headerRow: true, totalsRow: false,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: headers.map(name => ({ name, filterButton: true })),
    rows: rows.map(row => columns.map(([key]) => String(row[key] ?? ''))),
  });
  sheet.columns.forEach((column, index) => {
    column.width = Math.max(12, Math.min(50, columns[index][2] / 7));
    column.numFmt = '@';
    column.alignment = { vertical: 'top', wrapText: true };
  });
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

module.exports = { createPharmcareSummaryExcel, headers };

# IPD requisition report assets

Source: `Report/Sendmix/crpRequisitionNew.rpt` in the supplied Windows project.

- `layout.json`: native report sections, objects, coordinates and form grouping, in twips.
- `template.pdf`: native form exported with clinical/drug fields, running totals and dynamic text suppressed, using an in-memory synthetic DataTable.
- `header.png`: first 128.6 pt of that form, including the exact original logo/title/hospital address, rasterized at 180 dpi.
- `signatures.png`: the four original signature blocks, isolated from the same blank form; no entered signatures or identifying data.

Prepared with local 32-bit Crystal `ReportDocument`, `SetDataSource(DataTable)`, `NoPrinter=true` and `ExportToDisk(PDF)`. No database, physical printer, execution-policy change or live patient data is involved. The deployed server builds the report with Node and reads these static assets only.

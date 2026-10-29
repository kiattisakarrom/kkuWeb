# Workload report assets

Source: `Report/Workload/clsWorkloadNew.rpt` from the supplied Windows project.

- `layout.json`: report section positions and paper margins in twips.
- `template.pdf`: native form with CrossTab and dynamic date/footer text suppressed; contains only the original hospital logo, title, address and rules.
- `header.png`: first 120 pt of the native blank PDF, rasterized at 180 dpi. Used at its original 842 pt width.

Prepared by `tools/export-workload-template.ps1` using local 32-bit Crystal with an in-memory synthetic Pharmcare DataTable and `NoPrinter=true`. No database or real printer is used. No live patient or employee data is embedded. The script is a preparation tool only; the deployed server reads these static assets and builds the PDF in Node.

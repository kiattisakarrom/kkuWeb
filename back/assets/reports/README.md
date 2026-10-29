# ADR PDF assets

The blank form comes from the user's Windows source, `Report/Sendmix/crpADR.rpt`.
It contains no patient data. The input DataTable has one entirely blank row; dynamic
TextObjects are suppressed and their original twip coordinates saved in `adr-fields.json`.
Tahoma at 70% of the RPT font size fixes missing Thai glyphs and label overflow during
Crystal PDF export while preserving section geometry. These assets are generated once;
the web server needs neither Windows nor Crystal Reports at runtime.

The server composites these 300 DPI PNG regions of the blank form:

| Image | Vertical range in original A4 PDF, points |
| --- | --- |
| adr-header.png | 0–295 |
| adr-detail.png | 295–328.75 |
| adr-footer.png | 328.75–761 |

Each medication repeats the detail region. The footer moves to a new page when it
does not fit. Text is overlaid as selectable, embedded Sarabun text using pdfmake.
The raster background avoids hidden full-page text duplicates when cropping Crystal
PDF XObjects. Values that cannot fit a field at a readable size continue in an appendix.
No clinical assessment or additional drug information is inferred to fill blank fields.

To regenerate on a development Windows machine with the Crystal runtime, use
32-bit Windows PowerShell to run `tools/export-adr-template.ps1 -NativeRoot <Interface source>`.
Render `adr-template.pdf` using Poppler `pdftoppm -r 300 -png -singlefile`, then crop
with Pillow using the above ranges and image.width / 595 pixels per point.
The script never queries a database or calls a printer.

The Sarabun fonts in `../fonts` are from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/sarabun)
and distributed with their SIL Open Font License. PDF generation uses
[pdfmake](https://pdfmake.github.io/docs/0.1/getting-started/server-side/) and
[pdf-lib](https://pdf-lib.js.org/docs/api/classes/pdfdocument).

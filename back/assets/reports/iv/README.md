# Original IV Admixture artwork

`ward-*` comes from the user's `Report/Sendmix/crpSendmix.rpt`.
`total-*` comes from `Report/Sendmix/crpSendmixTotalward.rpt`.
The corresponding waiting and completed views share that native report variant.

`tools/export-iv-templates.ps1` reads these files with the installed 32-bit Crystal
runtime, replaces their data with one blank in-memory `IVmix`-shaped row, suppresses
dynamic FieldObjects and exports each blank PDF plus section/object metadata.
It does not connect to a database, printer, or shared destination.

The `*-header.png` files contain the original ReportHeader artwork, including the
embedded Khon Kaen Hospital logo, title, address and line. They are 300 DPI crops
of the blank PDFs, with no patient data:

| Variant | Original A4 vertical range (points) |
| --- | --- |
| ward | 0–125.6 |
| total | 0–135.2 |

Regenerate with 32-bit Windows PowerShell and the native source directory:

```powershell
tools/export-iv-templates.ps1 -NativeRoot '<Interface source>'
```

Render the exported PDFs with `pdftoppm -r 300 -png -singlefile`, then crop the
full page width to the above height using Pillow and 300/72 pixels per point.
Only ReportHeader artwork is used at runtime. Thai data and page/group headings
are composed as selectable text using embedded Sarabun, preserving the native
section layout while wrapping long values. The server does not need Crystal.

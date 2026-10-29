# Med Transfer report artwork

Source: the user's `Report/Medtransfer/PharmacyReport.rpt` (Medicine Cart Report).
`tools/export-med-transfer-template.ps1` uses the installed 32-bit Crystal runtime
to export a blank synthetic DataTable and section/object metadata to `template.pdf`
and `layout.json`. It never queries a database or calls a printer/shared folder.

`header.png` is the original full-width ReportHeader, including its hospital logo,
title and address. It is a 300 DPI crop of the landscape 842x595 pt blank PDF,
from vertical point 0 through 125.95. It contains no patient data.

To regenerate, run the PowerShell script with the Interface source as NativeRoot,
render the resulting PDF with `pdftoppm -r 300 -png -singlefile`, and crop to the
above vertical range using Pillow and 300/72 pixels per point. The server uses
the resulting PNG plus embedded Sarabun text and does not require Crystal.

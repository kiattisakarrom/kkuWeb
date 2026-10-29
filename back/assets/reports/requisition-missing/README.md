# Missing-drug report assets

Source: `Report/Sendmix/crpRequisitionDrug.rpt` in the supplied Windows project, opened by `frmMessageDrug` > Print.

- `layout.json`: native section/object positions in twips.
- `native-sample.pdf`: native PDF with one synthetic code/name, no database connection or printer access.
- `header.png`: first 118.5 pt of that report at 180 dpi, containing the original logo and Drug Report title/address only.

This template uses US Letter 612 × 792 pt with 18 pt margins. The main ER requisition uses the shared A4 template in `requisition-ipd/`. Node renders dynamic rows at runtime without Crystal.

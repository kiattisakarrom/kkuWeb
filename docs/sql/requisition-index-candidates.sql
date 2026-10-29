/*
REVIEW ONLY - NOT EXECUTED - 2026-10-23
All SQL below is commented out deliberately. This file changes nothing if run.
See ../REQUISITION-SQL-AUDIT-2026-10-23.md for actual-plan evidence and limits.

Candidate A (highest priority): shared by IPD, D/C, ER, Fixed Stock, IVRAD.
Existing date indexes omit departmentcode/status fields and cause lookups or
full clustered scans. Start with this single general covering candidate;
do not create every missing-index recommendation for every page.

CREATE NONCLUSTERED INDEX IX_prescriptiondetail_Requisition_DepartmentDate
ON dbo.prescriptiondetail (departmentcode, ordercreatedate)
INCLUDE (orderitemcode, orderitemname, orderqty, ordertype, sendmachine, printstatus);

Candidate B: IV preparation in prescription, NOT prescriptiondetail.
INDEXIV1 already seeks by date but fetches saved name/quantity from the clustered
table for each qualifying row. A covering filtered alternative can avoid those
lookups and exclude non-IV rows. Keep IVStatus in the leaf as well as the filter.

CREATE NONCLUSTERED INDEX IX_prescription_Requisition_IVDate
ON dbo.prescription (ordercreatedate, orderitemcode)
INCLUDE (orderitemname, orderqty, IVStatus)
WHERE IVStatus IS NOT NULL;

Not proposed in this pass: another index on ms_drug or drugname. Their reads
are small; the required master/mapping rows are returned in full to the native
mapping algorithm. Do not make mc_id UNIQUE or remove duplicate mappings as a
performance shortcut: that could change the native first-match behavior.

Before any future application: test on an isolated restored copy, compare all
raw result fields and duplicate multiplicities plus CInt/pack final rows for
all four categories, one-day/month/quarter and both 08:00 clock branches.
Measure logical reads, CPU, spills, memory grants, elapsed time, index size,
write overhead and other Windows/web workloads. Existing index names alone
do not establish redundancy: do not drop/rebuild/replace existing indexes.

No CREATE INDEX / UPDATE STATISTICS / ALTER / DBCC / cache flush was executed
in this audit. There is no performance percentage claim for these unbuilt indexes.
*/

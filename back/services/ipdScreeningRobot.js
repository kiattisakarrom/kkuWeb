// Read the saved Robot queue. No OCS generation, file access, or status update.
const robotWhere = `p.locationcode = '1'
  AND p.dosage > 0 AND p.orderqty > 0
  AND p.instructioncode NOT IN ('PAY')
  AND p.printstatus = 0
  AND p.voiddatetime IS NULL AND p.holddatetime IS NULL
  AND p.genOCSdatetime IS NULL
  AND p.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  AND (@roomCode = 'all' OR EXISTS (SELECT 1 FROM dbo.ms_room room WHERE room.roomcode = @roomCode
    AND p.fromlocationname = RTRIM(room.roomname) + '[' + RTRIM(room.roomcode) + ']'))
  AND (@search = '' OR p.an = @search OR p.hn = @search OR p.prescriptionno = @search)`;

const robotWardsSql = `SELECT RTRIM(p.wardcode) AS code, p.wardname AS name,
    COUNT(DISTINCT p.prescriptionno) AS prescriptionCount
  FROM dbo.packagemaster p WHERE ${robotWhere}
  GROUP BY p.wardcode, p.wardname
  ORDER BY CASE WHEN p.wardcode NOT LIKE '%[^0-9]%' AND LEN(p.wardcode) BETWEEN 1 AND 9
    THEN CONVERT(int, p.wardcode) ELSE 2147483647 END, p.wardcode, p.wardname;`;

const robotHeadersSql = `WITH headers AS (
  SELECT CONVERT(char(10), p.ordercreatedate, 23) AS orderDay,
    p.prescriptionno, p.hn, p.an, p.patientname, RTRIM(p.wardcode) AS wardcode,
    p.wardname, p.bedcode, p.ordertype,
    CASE WHEN COUNT(DISTINCT p.fromlocationname) > 1 THEN N'หลายห้องยา'
      ELSE MAX(p.fromlocationname) END AS fromlocationname,
    CONVERT(char(10), p.genOCSdatetime, 23) AS screenDay, COUNT(*) AS itemCount
  FROM dbo.packagemaster p
  WHERE ${robotWhere} AND p.wardcode = @wardCode
    AND (@prescriptionno IS NULL OR p.prescriptionno = @prescriptionno)
  GROUP BY CONVERT(char(10), p.ordercreatedate, 23), p.prescriptionno, p.hn, p.an,
    p.patientname, p.wardcode, p.wardname, p.bedcode, p.ordertype,
    CONVERT(char(10), p.genOCSdatetime, 23)
) SELECT headers.*, currentWard.code AS currentWardCode FROM headers
  OUTER APPLY (
    SELECT TOP 1 RTRIM(b.towardcode) AS code FROM dbo.ms_bedmove b
    INNER JOIN dbo.ms_patientadmit a ON a.an = b.an AND a.hn = headers.hn
    INNER JOIN dbo.ms_ward w ON w.wardcode = b.towardcode
    WHERE b.an = headers.an AND b.status = 0 AND w.wardstatus = 'Y'
      AND w.wardcode NOT IN ('', '000', '1420')
    ORDER BY b.lastmodified DESC
  ) currentWard
  ORDER BY headers.prescriptionno, headers.orderDay, headers.an, headers.hn;`;

const robotItemsSql = `SELECT p.itemindex, p.itemidentify, p.prescriptionno, p.seq,
    p.takedate, p.frequencyTime, p.frequencyTimedesc,
    p.orderitemcode, p.orderitemname, p.dosage, p.dosageunitdesc,
    p.orderqty, p.orderunitdesc, p.instructioncode, p.instructiondesc,
    p.frequencycode, p.frequencydesc, p.timecode, p.timedesc,
    p.freetext1, p.freetext2, p.freetext3, p.prioritycode, p.prioritydesc,
    p.bedcode, p.wardcode, p.wardname, p.fromlocationname,
    p.locationcode, p.shelfzone, p.shelfname, p.printstatus, p.printdatetime,
    p.genOCSdatetime, p.voiddatetime, p.holddatetime, p.sendmachine,
    p.ordercreatedate, p.enddate, p.lastmodified, p.ordertype,
    p.doctorname, p.usercreatename
  FROM dbo.packagemaster p
  WHERE ${robotWhere} AND p.wardcode = @wardCode AND p.prescriptionno = @prescriptionno
    AND p.hn = @hn AND p.an = @an
  ORDER BY p.takedate, p.frequencyTime, p.seq, p.itemindex, p.itemidentify;`;

module.exports = { robotWardsSql, robotHeadersSql, robotItemsSql };

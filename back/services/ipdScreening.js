function dayOffset(day, amount) {
  const value = new Date(`${day}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

function screeningWindow(orderdate, workdate, now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
  // Native shifts the selected calendar day before 08:00, including past days.
  const startDay =
    workdate ?? (hour < 8 ? dayOffset(orderdate, -1) : orderdate);
  return {
    workdate: startDay,
    start: `${startDay} 08:00:00`,
    wardEnd: `${dayOffset(startDay, 1)} 07:59:00`,
    end: `${dayOffset(startDay, 1)} 07:59:59`,
  };
}

function screeningWhere(allContinueWards = false) {
  // Native Continue-finished Showward aggregates every room; headers/items still filter the chosen room.
  return `((@mode = 'stat-wait' AND p.genorderdatetime IS NULL
      AND ISNULL(p.frequencycode, '') IN ('S', 'E', 'STAT'))
    OR (@mode = 'stat-finished' AND p.genorderdatetime IS NOT NULL
      AND ISNULL(p.frequencycode, '') IN ('S', 'E', 'STAT'))
    OR (@mode = 'continue-wait' AND p.genorderdatetime IS NULL
      AND ISNULL(p.frequencycode, '') NOT IN ('S', 'E', 'STAT'))
    OR (@mode = 'continue-finished' AND p.genorderdatetime IS NOT NULL
      AND ISNULL(p.frequencycode, '') NOT IN ('S', 'E', 'STAT')))
  AND p.ordertype <> '1'
  AND p.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  AND (${allContinueWards ? "@mode = 'continue-finished' OR " : ""}EXISTS (SELECT 1 FROM dbo.ms_room room WHERE room.roomcode = @roomCode
    AND p.fromlocationname = RTRIM(room.roomname) + '[' + RTRIM(room.roomcode) + ']'))
  AND (@search = '' OR p.an = @search OR p.hn = @search OR p.prescriptionno = @search)`;
}

const screeningWardsSql = `SELECT RTRIM(p.wardcode) AS code, p.wardname AS name,
    COUNT(DISTINCT p.prescriptionno) AS prescriptionCount
  FROM dbo.prescription p WHERE ${screeningWhere(true)}
    AND (@mode <> 'stat-finished' OR p.prioritycode NOT LIKE '%C%')
  GROUP BY p.wardcode, p.wardname
  ORDER BY CASE WHEN p.wardcode NOT LIKE '%[^0-9]%' AND LEN(p.wardcode) BETWEEN 1 AND 9
    THEN CONVERT(int, p.wardcode) ELSE 2147483647 END, p.wardcode, p.wardname;`;

const screeningHeadersSql = `WITH headers AS (
  SELECT CONVERT(char(10), p.ordercreatedate, 23) AS orderDay,
    p.prescriptionno, p.hn, p.an, p.patientname, RTRIM(p.wardcode) AS wardcode,
    p.wardname, p.bedcode, p.ordertype, p.fromlocationname,
    CONVERT(char(10), p.genorderdatetime, 23) AS screenDay,
    COUNT(*) AS itemCount
  FROM dbo.prescription p
  WHERE ${screeningWhere()} AND p.wardcode = @wardCode
    AND EXISTS (SELECT 1 FROM dbo.ms_ward w WHERE w.wardcode = p.wardcode AND w.wardstatus = 'Y')
    AND (@prescriptionno IS NULL OR p.prescriptionno = @prescriptionno)
  GROUP BY CONVERT(char(10), p.ordercreatedate, 23), p.prescriptionno, p.hn, p.an,
    p.patientname, p.wardcode, p.wardname, p.bedcode, p.ordertype, p.fromlocationname,
    CONVERT(char(10), p.genorderdatetime, 23)
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

const screeningItemsSql = `SELECT p.itemindex, p.prescriptionno, p.seq,
    p.orderitemcode, p.orderitemname, p.dosage, p.dosageunitdesc,
    p.orderqty, p.orderunitdesc, p.instructioncode, p.instructiondesc,
    p.frequencycode, p.frequencydesc, p.timecode, p.timedesc, p.timecount,
    p.takedate, p.startdate, p.enddate, p.ordercreatedate,
    p.freetext1, p.freetext2, p.freetext3, p.prioritycode, p.prioritydesc,
    p.bedcode, p.wardcode, p.wardname, p.fromlocationname,
    p.voiddatetime, p.holddatetime, p.genorderdatetime, p.printstatus,
    p.sendmachine, p.sendmix, p.sendchemo, p.doctorname, p.usercreatename,
    p.ordertype, p.statuscode, p.varymeal, p.varymealtime, p.statustimeend, p.timestart, p.timeend,
    drug.drugform, drug.unused AS drugUnused,
    location.location AS configuredLocation, location.locationcode AS configuredLocationCode,
    CASE WHEN p.sendmachine = 'Y' THEN N'JVM'
      WHEN p.sendmix = 'Y' THEN N'ส่งผลิต'
      ELSE COALESCE(location.location, N'จัดมือ') END AS locationName
  FROM dbo.prescription p
  OUTER APPLY (SELECT TOP 1 d.drugform, d.sendmachine, d.unused FROM dbo.ms_drug d
    WHERE d.orderitemcode = p.orderitemcode ORDER BY d.orderitemcode) drug
  OUTER APPLY (SELECT TOP 1 l.location, l.locationcode FROM dbo.ms_grouplocation l
    WHERE l.orderitemcode = p.orderitemcode AND l.roomcode = @roomCode
    ORDER BY l.grouplocationcode) location
  WHERE ${screeningWhere()} AND p.wardcode = @wardCode AND p.prescriptionno = @prescriptionno
    AND p.hn = @hn AND p.an = @an
    AND EXISTS (SELECT 1 FROM dbo.ms_ward w WHERE w.wardcode = p.wardcode AND w.wardstatus = 'Y')
  ORDER BY p.printstatus DESC, drug.sendmachine, p.seq, p.itemindex;`;

module.exports = {
  screeningWindow,
  dayOffset,
  screeningWardsSql,
  screeningHeadersSql,
  screeningItemsSql,
};

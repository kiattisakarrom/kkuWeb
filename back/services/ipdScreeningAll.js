const { screeningWindow } = require("./ipdScreening");

// ucScreenAll stops at 23:59 on the selected day after 08:00. Before
// 08:00 it reads yesterday 08:00 through selected-day 07:59 (seconds = 00).
function screeningAllWindow(orderdate, workdate, now = new Date()) {
  const round = screeningWindow(orderdate, workdate, now);
  const end =
    round.workdate === orderdate
      ? `${orderdate} 23:59:00`
      : `${orderdate} 07:59:00`;
  return { ...round, end, wardEnd: end };
}

const allWhere = `p.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  AND EXISTS (SELECT 1 FROM dbo.ms_ward w WHERE w.wardcode = p.wardcode AND w.wardstatus = 'Y')
  AND p.fromlocationname LIKE '%' + @roomPattern + '%' ESCAPE '~'
  AND (@screenStatus = 'all'
    OR (@screenStatus = 'pending' AND p.genorderdatetime IS NULL)
    OR (@screenStatus = 'screened' AND p.genorderdatetime IS NOT NULL))
  AND (@orderType = 'all' OR p.ordertype = @orderTypeCode
    OR (@orderType = 'stat' AND ISNULL(p.frequencycode, '') IN ('S', 'E', 'STAT')))
  AND (@search = '' OR p.an = @search OR p.hn = @search OR p.prescriptionno = @search)`;

const allWardsSql = `SELECT RTRIM(p.wardcode) AS code, p.wardname AS name,
    COUNT(DISTINCT p.prescriptionno) AS prescriptionCount
  FROM dbo.prescription p WHERE ${allWhere}
  GROUP BY p.wardcode, p.wardname
  ORDER BY CASE WHEN p.wardcode NOT LIKE '%[^0-9]%' AND LEN(p.wardcode) BETWEEN 1 AND 9
    THEN CONVERT(int, p.wardcode) ELSE 2147483647 END, p.wardcode, p.wardname;`;

const allHeadersSql = `WITH headers AS (
  SELECT CONVERT(char(10), p.ordercreatedate, 23) AS orderDay,
    p.prescriptionno, p.hn, p.an, p.patientname, RTRIM(p.wardcode) AS wardcode,
    p.wardname, p.bedcode, p.ordertype, p.fromlocationname,
    CONVERT(char(10), p.genorderdatetime, 23) AS screenDay
  FROM dbo.prescription p
  WHERE ${allWhere} AND (@wardCode IS NULL OR p.wardcode = @wardCode)
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

module.exports = { screeningAllWindow, allWardsSql, allHeadersSql };

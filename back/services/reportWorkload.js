const { dayOffset } = require('./ipdScreening');
const text = value => value == null ? '' : String(value).trim();
const usersSql = `SELECT userID,(firstname+' '+lastname) AS fname
  FROM dbo.ms_users WHERE userID<>'0201' AND (firstname+' '+lastname) IS NOT NULL ORDER BY userID ASC;`;
const careSql = `SELECT dh.Usercreatecode,(u.firstname+' '+u.lastname) AS Fname,
  COUNT(DISTINCT dh.OrderNo) AS CAn,dh.GroupOfCareCd,gc.GroupOfCare
  FROM dbo.ms_drpheader dh LEFT JOIN dbo.ms_users u ON u.userid=dh.Usercreatecode
  LEFT JOIN dbo.TblOfGrOfCare gc ON gc.CODE=dh.GroupOfCareCd
  WHERE dh.GroupOfCareCd IS NOT NULL AND dh.Usercreatecode IS NOT NULL AND dh.TypeOfPt='IPD'
    AND dh.[DateD/C] BETWEEN CAST(@from AS datetime) AND CAST(@to AS datetime)
    AND (@userId='' OR u.userID=@userId)
  GROUP BY dh.Usercreatecode,u.firstname,u.lastname,dh.GroupOfCareCd,gc.GroupOfCare
  ORDER BY Fname ASC;`;

function workloadWindow(from, to, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(part => [part.type, part.value]));
  const hhmm = Number(parts.hour) * 100 + Number(parts.minute);
  // Preserve ucWorkload.Showdata, including its unfiltered 00:00 minute.
  if (hhmm === 0) return null;
  return hhmm >= 800
    ? { start: `${from} 08:00:00`, end: `${dayOffset(to, 1)} 07:59:59` }
    : { start: `${dayOffset(from, -1)} 08:00:00`, end: `${to} 07:59:59` };
}

function activitySql(backup, hasWindow = true) {
  const prefix = backup ? '[BACKUP].dbo.' : 'dbo.';
  const metrics = [
    { key: 'Screening_WL', field: 'p.confirmuserid', join: '', extra: '' },
    { key: 'Checkout', field: 'pa.checkoutuserid', extra: 'AND pa.checkoutuserid IS NOT NULL' },
    { key: 'LED', field: 'pa.leduserid', extra: 'AND pa.leduserid IS NOT NULL AND ISNULL(pa.leduserid,0)<>0 AND pa.leddispensedatetime IS NOT NULL' },
    { key: 'HAD', field: 'pa.haduserid', extra: 'AND pa.haduserid IS NOT NULL AND ISNULL(pa.haduserid,0)<>0 AND pa.haddispensedatetime IS NOT NULL' },
  ];
  const joins = metrics.map((metric, i) => `LEFT JOIN (
    SELECT x.userId,COUNT(x.prescriptionno) AS total FROM (
      SELECT DISTINCT p.prescriptionno,${metric.field} AS userId FROM ${prefix}prescription p
      ${i ? `LEFT JOIN ${prefix}packagemaster pa ON p.prescriptionno=pa.prescriptionno` : ''}
      WHERE p.genorderdatetime IS NOT NULL AND p.fromlocationname=N'ห้องยา IPD[001]' AND p.confirmuserid IS NOT NULL
      ${hasWindow ? 'AND p.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)' : ''}
      ${metric.extra}
    ) x GROUP BY x.userId
  ) t${i} ON u.userID=t${i}.userId`).join('\n');
  return `SELECT p.Usercreatecode,p.Fname,p.CAn,'' AS GroupOfCareCd,p.GroupOfCare FROM (
    SELECT u.userID AS Usercreatecode,(u.firstname+' '+u.lastname) AS Fname,
      ${metrics.map((m,i)=>`ISNULL(t${i}.total,0) AS ${m.key}`).join(',')}
    FROM dbo.ms_users u ${joins}
    WHERE (@userId<>'' AND u.userID=@userId) OR (@userId='' AND (${metrics.map((_,i)=>`ISNULL(t${i}.total,0)<>0`).join(' OR ')}))
  ) s UNPIVOT (CAn FOR GroupOfCare IN (Screening_WL,Checkout,LED,HAD)) p
  ORDER BY p.Usercreatecode ASC;`;
}

function mergeWorkloadRows(recordsets) {
  const rows = [], byUser = new Map();
  for (const record of recordsets.flat()) {
    const userId = text(record.Usercreatecode), care = text(record.GroupOfCare);
    const userKey = userId.toLocaleLowerCase('th'), careKey = care.toLocaleLowerCase('th');
    if (!byUser.has(userKey)) byUser.set(userKey, new Map());
    const group = byUser.get(userKey), count = Number(record.CAn) || 0;
    if (group.has(careKey)) group.get(careKey).CAn += count;
    else {
      const row = { Usercreatecode: userId, Fname: text(record.Fname), CAn: count, SAn: 0,
        GroupOfCareCd: text(record.GroupOfCareCd), GroupOfCare: care };
      rows.push(row); group.set(careKey, row);
    }
  }
  return rows;
}

function createWorkloadReportReader(query) {
  return {
    async getWorkloadReportUsers() {
      return (await query(usersSql, {})).recordset.map(row => ({ code: text(row.userID), name: text(row.fname) }));
    },
    async getWorkloadReport(filters, now = new Date()) {
      const window = workloadWindow(filters.from, filters.to, now);
      const params = { ...filters, start: window?.start ?? null, end: window?.end ?? null };
      const result = await query(`${careSql}\n${activitySql(false, !!window)}\n${activitySql(true, !!window)}`, params);
      return { rows: mergeWorkloadRows(result.recordsets), filters };
    },
  };
}
module.exports = { usersSql, careSql, workloadWindow, activitySql, mergeWorkloadRows, createWorkloadReportReader };

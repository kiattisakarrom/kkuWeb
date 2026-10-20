function mrcHistory(rows) {
  const totals = new Map();
  for (const row of rows)
    totals.set(row.historyId, (totals.get(row.historyId) || 0) + 1);
  const unique = new Map();
  let previousAn = "";
  // ucMedReconcile.showorderdetail walks rows sorted by Off/priority/order date,
  // adds a date when AN changes, then removes duplicate date/AN pairs.
  for (const row of rows) {
    if (row.historyDate && row.historyId !== previousAn)
      unique.set(JSON.stringify([row.historyId, row.historyDate]), {
        ...row,
        itemCount: totals.get(row.historyId),
      });
    previousAn = row.historyId;
  }
  return [...unique.values()].sort(
    (a, b) =>
      b.historyDate.localeCompare(a.historyDate) ||
      b.historyId.localeCompare(a.historyId),
  );
}

module.exports = { mrcHistory };

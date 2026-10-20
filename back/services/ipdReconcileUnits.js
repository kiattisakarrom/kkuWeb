// Native OPD/MRC history retains the recorded code/name, but looks up the
// dispensing unit using drugname -> active Sum_MCID -> ms_drug. Batch that
// lookup without querying the master once per medication.
async function reconcileUnits(items, readUnits) {
  if (!items.length) return items;
  const codes = [
    ...new Set(items.map((row) => String(row.orderitemcode ?? ""))),
  ];
  const units = new Map();
  for (let offset = 0; offset < codes.length; offset += 500) {
    for (const row of await readUnits(codes.slice(offset, offset + 500)))
      units.set(String(row.code), row.orderunit);
  }
  return items.map((row) =>
    units.has(String(row.orderitemcode ?? ""))
      ? { ...row, orderunit: units.get(String(row.orderitemcode ?? "")) }
      : row,
  );
}
module.exports = { reconcileUnits };

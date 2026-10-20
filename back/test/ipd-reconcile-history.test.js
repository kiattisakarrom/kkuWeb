const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mrcHistory } = require("../services/ipdReconcileHistory");

test("MRC retains native dates when the same AN reappears after another AN", () => {
  const rows = [
    { historyId: "old-A", historyDate: "2025-06-01" },
    { historyId: "old-A", historyDate: "2025-06-02" },
    { historyId: "old-B", historyDate: "2025-06-03" },
    { historyId: "old-A", historyDate: "2025-06-04" },
    { historyId: "old-B", historyDate: "2025-06-03" },
  ];
  assert.deepEqual(mrcHistory(rows), [
    { historyId: "old-A", historyDate: "2025-06-04", itemCount: 3 },
    { historyId: "old-B", historyDate: "2025-06-03", itemCount: 2 },
    { historyId: "old-A", historyDate: "2025-06-01", itemCount: 3 },
  ]);
});

test("MRC does not invent dates for undated records, but counts all drugs in the selected AN", () => {
  assert.deepEqual(
    mrcHistory([
      { historyId: "old-A", historyDate: "2025-06-01" },
      { historyId: "old-A", historyDate: null },
      { historyId: "old-B", historyDate: null },
    ]),
    [{ historyId: "old-A", historyDate: "2025-06-01", itemCount: 2 }],
  );
  assert.deepEqual(mrcHistory([]), []);
});

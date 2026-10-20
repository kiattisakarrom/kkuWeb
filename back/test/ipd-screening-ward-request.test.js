const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const modulePromise = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/screening/screeningWardRequest.js",
    ),
  ).href
);

test("first ward click pins the returned round without invalidating any Screening mode ward response", async () => {
  const {
    screeningWardRequest: request,
    matchesScreeningWardResponse: matches,
  } = await modulePromise;
  for (const mode of [
    "stat-wait",
    "stat-finished",
    "continue-wait",
    "continue-finished",
    "robot-wait",
    "screen-all",
    "take-home-wait",
    "take-home-finished",
  ]) {
    const filters = {
      mode,
      roomCode: "001",
      orderdate: "2026-10-19",
      search: "",
    };
    if (mode === "screen-all")
      Object.assign(filters, { screenStatus: "pending", orderType: "all" });
    const response = {
      request: request(filters, 0),
      data: { window: { workdate: "2026-10-18" }, wards: [{ code: "1" }] },
    };
    assert.equal(matches(response, request(filters, 0)), true);
    assert.equal(
      matches(response, request({ ...filters, workdate: "2026-10-18" }, 0)),
      true,
    );
    assert.equal(
      matches(response, request({ ...filters, workdate: "2026-10-19" }, 0)),
      false,
    );
  }
});

test("a different room/date/search/mode/status/type and explicit reload never reuse stale wards", async () => {
  const {
    screeningWardRequest: request,
    matchesScreeningWardResponse: matches,
  } = await modulePromise;
  const filters = {
    mode: "screen-all",
    roomCode: "001",
    orderdate: "2026-10-19",
    search: "",
    screenStatus: "pending",
    orderType: "all",
  };
  const response = {
    request: request(filters, 2),
    data: { window: { workdate: "2026-10-18" } },
  };
  for (const change of [
    { roomCode: "002" },
    { orderdate: "2026-10-18" },
    { search: "DEMO" },
    { mode: "stat-wait" },
    { screenStatus: "screened" },
    { orderType: "1" },
  ]) {
    assert.equal(
      matches(
        response,
        request({ ...filters, ...change, workdate: "2026-10-18" }, 2),
      ),
      false,
    );
  }
  assert.equal(
    matches(response, request({ ...filters, workdate: "2026-10-18" }, 3)),
    false,
  );
  assert.equal(matches(null, request(filters, 2)), false);
  assert.equal(
    matches(
      { request: request(filters, 2), data: {} },
      request({ ...filters, workdate: "2026-10-18" }, 2),
    ),
    false,
  );
});

test("equivalent query field order preserves the request identity and no local clock guesses the native round", async () => {
  const {
    screeningWardRequest: request,
    matchesScreeningWardResponse: matches,
  } = await modulePromise;
  const filters = {
    roomCode: "001",
    mode: "stat-wait",
    orderdate: "2026-01-01",
    search: "",
  };
  assert.equal(
    request(filters, 0).key,
    request(
      {
        search: "",
        orderdate: "2026-01-01",
        mode: "stat-wait",
        roomCode: "001",
      },
      0,
    ).key,
  );
  const response = {
    request: request(filters, 0),
    data: { window: { workdate: "2025-12-31" } },
  };
  assert.equal(
    matches(response, request({ ...filters, workdate: "2025-12-31" }, 0)),
    true,
  );
  assert.equal(
    matches(response, request({ ...filters, workdate: "" }, 0)),
    false,
  );
});

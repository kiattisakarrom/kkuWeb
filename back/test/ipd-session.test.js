const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

const secret = "local-test-secret-not-used-by-the-application";
const credentials = {
  username: "tester",
  password: "test-password",
  roomCode: "001",
};

const screeningRx = (mode) =>
  ({
    "stat-wait": "STAT-A",
    "stat-finished": "STAT-DONE",
    "continue-wait": "CONT-A",
    "continue-finished": "CONT-DONE",
    "robot-wait": "ROBOT-A",
    "take-home-wait": "HOME-A",
    "take-home-finished": "HOME-DONE",
  })[mode];

test("Screen All defaults and validates status/type, supports unselected wards, propagates every combination and remains read only", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const base = "/api/ipd/screening";
  assert.equal(
    (await send(base + "/prescriptions?mode=screen-all")).status,
    401,
  );
  for (const status of ["pending", "screened", "all"])
    for (const type of ["all", "0", "1", "3", "stat"]) {
      for (const path of ["/wards", "/prescriptions"]) {
        const response = await send(
          base +
            path +
            `?mode=screen-all&roomCode=002&orderdate=2026-10-18&workdate=2026-10-18&screenStatus=${status}&orderType=${type}`,
          { token },
        );
        assert.equal(response.status, 200);
        assert.equal(response.body.screenStatus, status);
        assert.equal(response.body.orderType, type);
        assert.equal(response.body.context.roomCode, "002");
        assert.equal(response.body.window.end, "2026-10-18 23:59:00");
      }
    }
  const result = await send(base + "/prescriptions?mode=screen-all", { token });
  assert.equal(result.status, 200);
  assert.equal(result.body.screenStatus, "pending");
  assert.equal(result.body.orderType, "all");
  assert.equal(result.body.context.roomCode, "001");
  assert.equal(calls.at(-1).wardCode, undefined);
  assert.equal(
    (await send(base + "/prescriptions?mode=screen-all&wardCode=2", { token }))
      .status,
    200,
  );
  assert.equal(calls.at(-1).wardCode, "2");
  const before = calls.length;
  for (const extra of [
    "screenStatus=bad",
    "orderType=2",
    "screenStatus=",
    "orderType=",
    "screenStatus[]=pending",
    "orderType[]=0",
    "screenStatus=all&screenStatus=pending",
    "wardCode=",
    "wardCode[]=1",
    "roomCode[]=all",
    "hn=DEMO",
    "workdate=2026-10-16",
  ]) {
    assert.equal(
      (
        await send(
          base + "/prescriptions?mode=screen-all&orderdate=2026-10-18&" + extra,
          { token },
        )
      ).status,
      400,
      extra,
    );
  }
  assert.equal(
    (
      await send(
        base + "/prescriptions?mode=stat-wait&wardCode=1&screenStatus=all",
        { token },
      )
    ).status,
    400,
  );
  assert.equal(calls.length, before);
  for (const method of ["POST", "PUT", "PATCH", "DELETE"])
    assert.equal(
      (await send(base + "/prescriptions?mode=screen-all", { token, method }))
        .status,
      403,
    );
});

async function fixture(t, overrides = {}) {
  const calls = [];
  const repository = {
    getLoginOptions: async () => ({
      rooms: [
        { code: "000", name: "Placeholder" },
        { code: "001", name: "IPD" },
        { code: "010", name: "IPD radiation" },
        { code: "002", name: "Production" },
      ],
    }),
    getWards: async (filters) => {
      calls.push({ type: "wards", filters });
      return [
        { code: "1", name: "Ward A", patientCount: 1 },
        { code: "2", name: "Ward B", patientCount: 1 },
      ];
    },
    findWard: async (code) =>
      [
        { code: "1", name: "Ward A" },
        { code: "2", name: "Ward B" },
      ].find((ward) => ward.code === code),
    findUser: async (username) =>
      username === "tester"
        ? {
            id: "test-id",
            name: "Test User",
            password: "test-password",
            positionCode: "test",
            positionName: "Test Role",
          }
        : undefined,
    getPatients: async (context, filters) => {
      calls.push({ context, filters });
      return [
        {
          an: "test-admission",
          hn: "test-patient",
          wardcode: context.wardCode,
          SumPresc: 2,
        },
      ];
    },
    getScreeningRooms: async () => [
      { code: "001", name: "IPD" },
      { code: "002", name: "Production" },
      { code: "010", name: "IPD radiation" },
    ],
    findScreeningRoom: async (code) =>
      [
        { code: "001", name: "IPD" },
        { code: "002", name: "Production" },
        { code: "010", name: "IPD radiation" },
      ].find((room) => room.code === code) || null,
    getScreeningWards: async (context, filters) => {
      calls.push({ type: "screening-wards", context, filters });
      return [{ code: "1", name: "Synthetic ward", prescriptionCount: 1 }];
    },
    getScreeningPrescriptions: async (context, filters, wardCode) => {
      calls.push({ type: "screening-headers", context, filters, wardCode });
      return wardCode === "1" && context.roomCode === "001"
        ? [
            {
              prescriptionno: screeningRx(filters.mode),
              an: "admission-A",
              hn: "server-hn-A",
              currentWardCode: "1",
            },
          ]
        : [];
    },
    getScreeningPrescription: async (
      context,
      filters,
      wardCode,
      prescriptionno,
    ) => {
      calls.push({
        type: "screening-detail",
        context,
        filters,
        wardCode,
        prescriptionno,
      });
      return context.roomCode === "001" &&
        wardCode === "1" &&
        prescriptionno === screeningRx(filters.mode)
        ? {
            header: {
              prescriptionno,
              an: "admission-A",
              hn: "server-hn-A",
              currentWardCode: "1",
            },
            items: [
              {
                itemindex: "STAT-ITEM",
                frequencycode: filters.mode.startsWith("continue-")
                  ? null
                  : "S",
                genorderdatetime: filters.mode.endsWith("-finished")
                  ? "2026-10-18T11:30:00Z"
                  : null,
                orderqty: 0,
                voiddatetime: "2026-10-18T09:00:00Z",
                ...(filters.mode === "robot-wait"
                  ? {
                      itemindex: "ROBOT-ITEM",
                      itemidentify: "ROBOT-PACKET",
                      frequencyTime: "0800",
                      locationcode: "1",
                      dosage: 1,
                      orderqty: 2,
                      instructioncode: "AC",
                      printstatus: 0,
                      voiddatetime: null,
                      holddatetime: null,
                      genOCSdatetime: null,
                    }
                  : {}),
              },
            ],
          }
        : null;
    },
    getPatientSummary: async (context, an, orderdate, options) => {
      calls.push({ type: "summary", context, an, orderdate, options });
      const assignments = {
        "admission-A": ["server-hn-A", "1"],
        "admission-B": ["server-hn-B", "2"],
      };
      const assignment = assignments[an];
      if (!assignment || assignment[1] !== context.wardCode) return undefined;
      return {
        an,
        hn: assignment[0],
        wardcode: assignment[1],
        warddesc: "Test Ward",
        prescriptionCount: 3,
      };
    },
    getPatientMedications: async (patient, filters) => {
      calls.push({ type: "medications", patient, filters });
      return { medications: [{ meditemindex: "test-med" }], filters };
    },
    getPrescriptionDates: async (patient) => {
      calls.push({ type: "prescription-dates", patient });
      return [{ workdate: "2025-06-06", prescriptionCount: 2 }];
    },
    getPatientPrescriptions: async (patient, workdate) => {
      calls.push({ type: "prescriptions", patient, workdate });
      return {
        workdate,
        prescriptions:
          workdate === "2025-06-06"
            ? [
                {
                  prescriptionno:
                    patient.an === "admission-A" ? "RX-A" : "RX-B",
                },
              ]
            : [],
      };
    },
    getPatientInteractions: async (patient) => {
      calls.push({ type: "drug-interactions", patient });
      return [
        {
          DDIhiscode: "synthetic-ddi",
          drugname: "Synthetic A กับ Synthetic B",
          username: "Saved user",
          screenusername: "",
        },
      ];
    },
    getPatientPrescription: async (patient, prescriptionno, workdate) => {
      calls.push({ type: "prescription", patient, prescriptionno, workdate });
      if (
        workdate !== "2025-06-06" ||
        prescriptionno !== (patient.an === "admission-A" ? "RX-A" : "RX-B")
      )
        return null;
      return {
        workdate,
        header: { prescriptionno },
        items: [{ itemindex: "item-1", prescriptionno }],
      };
    },
    getPatientOperatingRoomAlert: async (patient) => {
      calls.push({ type: "operating-room-alert", patient });
      return [{ medicationCount: 2, prescriptionCount: 1 }];
    },
    getPatientAllergies: async (patient) => {
      calls.push({ type: "allergies", patient });
      return [
        {
          source: patient.hn,
          adrcode: patient.hn === "server-hn-A" ? "ADR-A" : "ADR-B",
          typeofadr: "Type A",
          typeLabel: "มี S/E จากยา",
          genericNames: ["Synthetic generic"],
          groupIngredients: [],
          adversereactions: "Recorded reaction\n" + "ก".repeat(500),
          pharmacistnote: "Saved note\nSecond line",
          naranjoscore: 0,
        },
      ];
    },
    getPatientLabDates: async (patient, filters) => {
      calls.push({ type: "lab-dates", patient, filters });
      return filters.from === "2026-10-11"
        ? [{ date: "2026-10-18" }, { date: "2026-10-17" }]
        : [];
    },
    getPatientLabResults: async (patient, filters) => {
      calls.push({ type: "lab-results", patient, filters });
      return filters.date === "2026-10-18"
        ? [
            {
              lab_no: "TEST-LAB",
              result: "<5",
              type_result: "L",
              result_obj: "Text report\n" + "ก".repeat(500),
            },
          ]
        : [];
    },
    getPatientIhosDue: async (patient) => {
      calls.push({ type: "ihos-due", patient });
      return [
        {
          drugcode: "TEST",
          status: "1",
          request_note: "Full request\n" + "ก".repeat(500),
        },
      ];
    },
    getPatientPharmacistNotes: async (patient) => {
      calls.push({ type: "pharmacist-notes", patient });
      return [
        {
          id: patient.hn === "server-hn-A" ? "NOTE-A" : "NOTE-B",
          an: "previous-admission",
          problem: "Recorded problem\nSecond line",
          note: "First line\n" + "ก".repeat(250) + "\nEnd of note",
        },
      ];
    },
    getPatientPharmacistNote: async (patient, noteId) => {
      calls.push({ type: "pharmacist-note", patient, noteId });
      if (noteId !== (patient.hn === "server-hn-A" ? "NOTE-A" : "NOTE-B"))
        return null;
      return {
        id: noteId,
        an: "previous-admission",
        problem: "Recorded problem\nSecond line",
        note: "First line\n" + "ก".repeat(250) + "\nEnd of note",
        recorder: null,
      };
    },
    getPatientPharmcareEvents: async (patient) => {
      calls.push({ type: "pharmcare-events", patient });
      return [
        {
          OrderNo: patient.hn === "server-hn-A" ? "EVENT-A" : "EVENT-B",
          AN: "previous-admission",
          TypeOfPt: "IPD",
        },
      ];
    },
    getPatientPharmcareRecords: async (patient, orderNo, resource) => {
      calls.push({ type: "pharmcare-records", patient, orderNo, resource });
      if (orderNo !== (patient.hn === "server-hn-A" ? "EVENT-A" : "EVENT-B"))
        return null;
      return {
        event: { OrderNo: orderNo, AN: "previous-admission" },
        items:
          resource === "due"
            ? []
            : [
                {
                  DRPItemNo: "DRP-1",
                  problem: "Test problem",
                  PharmacistNote: "Line one\nLine two",
                  PlanNote: "Recorded plan",
                  Severity: "0",
                },
              ],
      };
    },
    getPatientDrugProfile: async (patient, filters) => {
      calls.push({ type: "drug-profile", patient, filters });
      return {
        ...filters,
        items:
          filters.from === "2025-06-01"
            ? [
                {
                  orderitemcode: "test-drug",
                  takedate: filters.from,
                  orderqty: 0,
                  voiddatetime: "2025-06-01T10:00:00Z",
                },
              ]
            : [],
      };
    },
    getReconcileHistory: async (patient, source) => {
      calls.push({ type: "reconcile-history", patient, source });
      return [
        {
          historyId: patient.hn === "server-hn-A" ? "old-A" : "old-B",
          historyDate: "2025-06-06",
          itemCount: 1,
        },
      ];
    },
    getReconcileItems: async (patient, source, selection) => {
      calls.push({ type: "reconcile-items", patient, source, selection });
      if (
        selection.historyId !==
          (patient.hn === "server-hn-A" ? "old-A" : "old-B") ||
        selection.historyDate !== "2025-06-06"
      )
        return null;
      return { items: [{ orderitemcode: "example" }] };
    },
    ...Object.fromEntries(
      ["Labs", "Notes"].map((name) => [
        `getPatient${name}`,
        async (patient) => {
          calls.push({ type: name.toLowerCase(), patient });
          return [{ source: patient.hn }];
        },
      ]),
    ),
    ...overrides,
  };
  const server = createApp({ repository, jwtSecret: secret }).listen(
    0,
    "127.0.0.1",
  );
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const url = `http://127.0.0.1:${server.address().port}`;
  const send = async (
    path,
    { body, token, method = body ? "POST" : "GET" } = {},
  ) => {
    const response = await fetch(url + path, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return {
      status: response.status,
      body: await response.json(),
      headers: response.headers,
    };
  };
  const login = async (selection = {}) =>
    (await send("/api/login", { body: { ...credentials, ...selection } })).body
      .token;
  return { send, login, calls, url };
}

test("Screen All empty and unavailable lists stay distinct without leaking source errors", async (t) => {
  const f = await fixture(t, {
    getScreeningWards: async () => [],
    getScreeningPrescriptions: async () => [],
  });
  const token = await f.login();
  for (const [path, key] of [
    ["wards", "wards"],
    ["prescriptions", "prescriptions"],
  ]) {
    const empty = await f.send(
      "/api/ipd/screening/" + path + "?mode=screen-all",
      { token },
    );
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body[key], []);
  }
  const fail = () => {
    throw Object.assign(new Error("private connection details"), {
      code: "ETIMEOUT",
    });
  };
  const e = await fixture(t, {
    getScreeningWards: fail,
    getScreeningPrescriptions: fail,
  });
  const et = await e.login();
  for (const path of ["wards", "prescriptions"]) {
    const response = await e.send(
      "/api/ipd/screening/" + path + "?mode=screen-all",
      { token: et },
    );
    assert.equal(response.status, 503);
    assert.equal(response.body[path], undefined);
    assert.ok(
      !JSON.stringify(response.body).includes("private connection details"),
    );
  }
});

test("Take-home waiting API authenticates, pins all native cutoffs, isolates mode/room/ward/prescription and prohibits writes", async (t) => {
  const { send, login, calls } = await fixture(t),
    token = await login();
  const root = "/api/ipd/screening",
    q =
      "?mode=take-home-wait&roomCode=001&wardCode=1&orderdate=2026-10-18&workdate=2026-10-18&search=HOME-A";
  for (const path of ["/wards", "/prescriptions", "/prescriptions/HOME-A"]) {
    assert.equal((await send(root + path + q)).status, 401);
    const r = await send(root + path + q, { token });
    assert.equal(r.status, 200);
    assert.equal(r.body.mode, "take-home-wait");
    assert.equal(r.body.context.roomCode, "001");
    assert.equal(r.body.window.wardEnd, "2026-10-19 07:59:00");
    assert.equal(r.body.window.headerEnd, "2026-10-18 23:59:00");
    assert.equal(r.body.window.end, "2026-10-19 07:59:59");
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal(
        (await send(root + path + q, { token, method })).status,
        403,
      );
  }
  for (const call of calls.filter((c) => c.type.startsWith("screening-"))) {
    assert.equal(call.filters.mode, "take-home-wait");
    assert.equal(call.filters.search, "HOME-A");
  }
  for (const [rx, mode, room, ward] of [
    ["STAT-A", "take-home-wait", "001", "1"],
    ["CONT-A", "take-home-wait", "001", "1"],
    ["HOME-A", "stat-wait", "001", "1"],
    ["HOME-A", "continue-wait", "001", "1"],
    ["HOME-A", "take-home-wait", "002", "1"],
    ["HOME-A", "take-home-wait", "001", "2"],
  ])
    assert.equal(
      (
        await send(
          root +
            `/prescriptions/${rx}?mode=${mode}&roomCode=${room}&wardCode=${ward}`,
          { token },
        )
      ).status,
      404,
    );
  for (const extra of [
    "wardCode=",
    "wardCode[]=1",
    "roomCode[]=all",
    "roomCode=missing",
    "workdate=2026-10-16",
    "orderType=1",
    "screenStatus=all",
    "hn=DEMO",
    "AN=DEMO",
    "orderdate=2026-02-30",
  ])
    assert.equal(
      (
        await send(root + "/prescriptions?mode=take-home-wait&" + extra, {
          token,
        })
      ).status,
      400,
      extra,
    );
  assert.equal(
    (await send(root + "/prescriptions?mode=take-home-wait", { token })).status,
    400,
  );
  assert.equal(
    (await send(root + "/wards?mode=take-home-wait&roomCode=002", { token }))
      .body.context.roomCode,
    "002",
  );
  const signed = await send("/api/auth", { token });
  assert.equal(signed.body.context.roomCode, "001");
});

test("Take-home waiting empty lists/empty saved drugs and database failures remain distinct at every stage", async (t) => {
  const f = await fixture(t, {
    getScreeningWards: async () => [],
    getScreeningPrescriptions: async () => [],
    getScreeningPrescription: async () => ({
      header: { prescriptionno: "HOME-A" },
      items: [],
    }),
  });
  const token = await f.login(),
    root = "/api/ipd/screening",
    query = "?mode=take-home-wait&wardCode=1";
  for (const [path, key] of [
    ["/wards", "wards"],
    ["/prescriptions", "prescriptions"],
    ["/prescriptions/HOME-A", "items"],
  ]) {
    const result = await f.send(root + path + query, { token });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body[key], []);
  }
  const fail = () => {
    throw Object.assign(new Error("private connection details"), {
      code: "ETIMEOUT",
    });
  };
  const e = await fixture(t, {
      getScreeningWards: fail,
      getScreeningPrescriptions: fail,
      getScreeningPrescription: fail,
    }),
    et = await e.login();
  for (const path of ["/wards", "/prescriptions", "/prescriptions/HOME-A"]) {
    const result = await e.send(root + path + query, { token: et });
    assert.equal(result.status, 503);
    assert.ok(
      !JSON.stringify(result.body).includes("private connection details"),
    );
  }
});

test("Take-home finished API preserves its mode/room/three cutoffs, rejects waiting or unrelated prescriptions and remains readonly", async (t) => {
  const { send, login, calls } = await fixture(t),
    token = await login();
  const root = "/api/ipd/screening",
    q =
      "?mode=take-home-finished&roomCode=001&wardCode=1&orderdate=2026-10-18&workdate=2026-10-18&search=HOME-DONE";
  for (const path of ["/wards", "/prescriptions", "/prescriptions/HOME-DONE"]) {
    assert.equal((await send(root + path + q)).status, 401);
    const r = await send(root + path + q, { token });
    assert.equal(r.status, 200);
    assert.equal(r.body.mode, "take-home-finished");
    assert.equal(r.body.context.roomCode, "001");
    assert.equal(r.body.window.wardEnd, "2026-10-19 07:59:00");
    assert.equal(r.body.window.headerEnd, "2026-10-18 23:59:00");
    assert.equal(r.body.window.end, "2026-10-19 07:59:59");
    if (path.endsWith("HOME-DONE")) assert.ok(r.body.items[0].genorderdatetime);
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal(
        (await send(root + path + q, { token, method })).status,
        403,
      );
  }
  for (const call of calls.filter((c) => c.type.startsWith("screening-"))) {
    assert.equal(call.filters.mode, "take-home-finished");
    assert.equal(call.filters.search, "HOME-DONE");
  }
  for (const [rx, mode, room, ward] of [
    ["HOME-A", "take-home-finished", "001", "1"],
    ["HOME-DONE", "take-home-wait", "001", "1"],
    ["STAT-DONE", "take-home-finished", "001", "1"],
    ["CONT-DONE", "take-home-finished", "001", "1"],
    ["HOME-DONE", "stat-finished", "001", "1"],
    ["HOME-DONE", "continue-finished", "001", "1"],
    ["HOME-DONE", "take-home-finished", "002", "1"],
    ["HOME-DONE", "take-home-finished", "001", "2"],
  ])
    assert.equal(
      (
        await send(
          root +
            `/prescriptions/${rx}?mode=${mode}&roomCode=${room}&wardCode=${ward}`,
          { token },
        )
      ).status,
      404,
    );
  for (const extra of [
    "wardCode=",
    "wardCode[]=1",
    "roomCode[]=all",
    "roomCode=missing",
    "workdate=2026-10-16",
    "orderType=1",
    "screenStatus=all",
    "hn=DEMO",
    "AN=DEMO",
    "orderdate=2026-02-30",
  ])
    assert.equal(
      (
        await send(root + "/prescriptions?mode=take-home-finished&" + extra, {
          token,
        })
      ).status,
      400,
      extra,
    );
  assert.equal(
    (await send(root + "/prescriptions?mode=take-home-finished", { token }))
      .status,
    400,
  );
  const other = await send(
    root + "/wards?mode=take-home-finished&roomCode=002",
    { token },
  );
  assert.equal(other.status, 200);
  assert.equal(other.body.context.roomCode, "002");
  assert.equal(
    (await send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
});

test("Take-home finished distinguishes empty lists, a valid header with no drugs, missing prescription and unavailable sources", async (t) => {
  const f = await fixture(t, {
    getScreeningWards: async () => [],
    getScreeningPrescriptions: async () => [],
    getScreeningPrescription: async () => ({
      header: { prescriptionno: "HOME-DONE" },
      items: [],
    }),
  });
  const token = await f.login(),
    root = "/api/ipd/screening",
    query = "?mode=take-home-finished&wardCode=1";
  for (const [path, key] of [
    ["/wards", "wards"],
    ["/prescriptions", "prescriptions"],
    ["/prescriptions/HOME-DONE", "items"],
  ]) {
    const result = await f.send(root + path + query, { token });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body[key], []);
  }
  const missing = await fixture(t, {
    getScreeningPrescription: async () => null,
  });
  const mt = await missing.login();
  assert.equal(
    (
      await missing.send(root + "/prescriptions/HOME-DONE" + query, {
        token: mt,
      })
    ).status,
    404,
  );
  const fail = () => {
    throw Object.assign(new Error("private connection details"), {
      code: "ETIMEOUT",
    });
  };
  const e = await fixture(t, {
      getScreeningWards: fail,
      getScreeningPrescriptions: fail,
      getScreeningPrescription: fail,
    }),
    et = await e.login();
  for (const path of ["/wards", "/prescriptions", "/prescriptions/HOME-DONE"]) {
    const result = await e.send(root + path + query, { token: et });
    assert.equal(result.status, 503);
    assert.ok(
      !JSON.stringify(result.body).includes("private connection details"),
    );
  }
});

test("both Take-home pages default to all rooms like native, retain wards from other or unmapped rooms, and still allow explicit room filtering", async (t) => {
  const source = [
    { code: "1", room: "001" },
    { code: "2", room: "002" },
    { code: "3", room: null },
  ];
  const rows = (ctx, ward) =>
    source.filter(
      (r) =>
        (!ward || r.code === ward) &&
        (ctx.roomCode === "all" || r.room === ctx.roomCode),
    );
  const f = await fixture(t, {
    getScreeningWards: async (ctx) =>
      rows(ctx).map((r) => ({
        code: r.code,
        name: "Synthetic ward " + r.code,
        prescriptionCount: 1,
      })),
    getScreeningPrescriptions: async (ctx, _f, ward) =>
      rows(ctx, ward).map((r) => ({
        prescriptionno: "DEMO-" + r.code,
        wardcode: r.code,
      })),
    getScreeningPrescription: async (ctx, f, ward, rx) =>
      rows(ctx, ward).some((r) => "DEMO-" + r.code === rx)
        ? {
            header: { prescriptionno: rx },
            items: [
              {
                itemindex: "DEMO-I",
                genorderdatetime:
                  f.mode === "take-home-wait" ? null : "2026-10-18T10:00:00Z",
              },
            ],
          }
        : null,
  });
  const token = await f.login(),
    root = "/api/ipd/screening";
  for (const mode of ["take-home-wait", "take-home-finished"]) {
    for (const roomQuery of ["", "&roomCode=all"]) {
      const response = await f.send(root + "/wards?mode=" + mode + roomQuery, {
        token,
      });
      assert.equal(response.status, 200);
      assert.equal(response.body.context.roomCode, "all");
      assert.deepEqual(
        response.body.wards.map((r) => r.code),
        ["1", "2", "3"],
      );
    }
    for (const ward of ["1", "2", "3"]) {
      const q = "?mode=" + mode + "&roomCode=all&wardCode=" + ward;
      const headers = await f.send(root + "/prescriptions" + q, { token });
      assert.equal(headers.status, 200);
      assert.equal(headers.body.prescriptions[0].wardcode, ward);
      assert.equal(
        (await f.send(root + "/prescriptions/DEMO-" + ward + q, { token }))
          .status,
        200,
      );
    }
    const explicit = await f.send(
      root + "/wards?mode=" + mode + "&roomCode=001",
      { token },
    );
    assert.equal(explicit.status, 200);
    assert.deepEqual(
      explicit.body.wards.map((r) => r.code),
      ["1"],
    );
    assert.equal(
      (
        await f.send(
          root +
            "/prescriptions/DEMO-2?mode=" +
            mode +
            "&roomCode=001&wardCode=2",
          { token },
        )
      ).status,
      404,
    );
  }
  assert.equal(
    (await f.send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
  for (const mode of [
    "stat-wait",
    "stat-finished",
    "continue-wait",
    "continue-finished",
    "screen-all",
  ]) {
    assert.equal(
      (await f.send(root + "/wards?mode=" + mode + "&roomCode=all", { token }))
        .status,
      400,
    );
  }
});

test("removed problem menu has no clinical queue: an unsupported problem mode never queries or returns queue data", async (t) => {
  let sourceReads = 0;
  const unexpected = () => {
    sourceReads++;
    throw new Error("unexpected source read");
  };
  const f = await fixture(t, {
    findScreeningRoom: unexpected,
    getScreeningWards: unexpected,
    getScreeningPrescriptions: unexpected,
    getScreeningPrescription: unexpected,
  });
  const token = await f.login(),
    root = "/api/ipd/screening";
  for (const path of ["/wards", "/prescriptions", "/prescriptions/DEMO-RX"]) {
    const url =
      root + path + "?mode=drug-problems&roomCode=all&orderdate=2026-10-18";
    assert.equal((await f.send(url)).status, 401);
    const response = await f.send(url, { token });
    assert.equal(response.status, 400);
    for (const key of ["wards", "prescriptions", "header", "items"])
      assert.equal(response.body[key], undefined);
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal((await f.send(url, { token, method })).status, 403);
  }
  assert.equal(sourceReads, 0);
  assert.equal(
    (await f.send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
});

test("login options expose real repository options and only supported IPD rooms", async (t) => {
  const { send } = await fixture(t);
  const result = await send("/api/login-options");
  assert.equal(result.status, 200);
  assert.deepEqual(
    result.body.rooms.map((item) => item.code),
    ["001", "010"],
  );
  assert.equal(result.body.wards, undefined);
  assert.equal(result.headers.get("cache-control"), "no-store");
});

test("login requires credentials and room; no ward is required", async (t) => {
  const { send } = await fixture(t);
  for (const change of [
    { username: "" },
    { password: "" },
    { roomCode: "" },
    { roomCode: "000" },
    { roomCode: "002" },
  ]) {
    const result = await send("/api/login", {
      body: { ...credentials, ...change },
    });
    assert.equal(result.status, 400);
    assert.equal(result.body.token, undefined);
  }
});

test("wrong credentials fail without exposing account data", async (t) => {
  const { send } = await fixture(t);
  for (const change of [{ username: "missing" }, { password: "wrong" }]) {
    const result = await send("/api/login", {
      body: { ...credentials, ...change },
    });
    assert.equal(result.status, 401);
    assert.equal(result.body.session, undefined);
  }
});

test("successful login signs server-resolved context and never includes a password", async (t) => {
  const { send } = await fixture(t);
  const result = await send("/api/login", {
    body: {
      ...credentials,
      roomCode: "010",
      wardCode: "2",
      access: "admin",
      context: { wardCode: "999" },
    },
  });
  assert.equal(result.status, 200);
  const payload = jwt.verify(result.body.token, secret);
  assert.deepEqual(payload.context, {
    roomCode: "010",
    roomName: "IPD radiation",
  });
  assert.equal(payload.access, "ipd-readonly");
  assert.equal(payload.version, 2);
  assert.equal(payload.exp - payload.iat, 12 * 60 * 60);
  assert.equal(payload.user.positionName, "Test Role");
  assert.equal(JSON.stringify(result.body).includes("test-password"), false);
});

test("missing, forged, expired and legacy tokens cannot access patient data", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const payload = jwt.verify(token, secret);
  delete payload.iat;
  delete payload.exp;
  const candidates = [
    undefined,
    "invalid",
    jwt.sign(payload, "wrong-key"),
    jwt.sign(payload, secret, { expiresIn: -1 }),
    jwt.sign({ id: "old-user" }, secret),
    jwt.sign({ ...payload, version: 1 }, secret),
  ];
  for (const candidate of candidates) {
    assert.equal(
      (await send("/api/ipd/patients", { token: candidate })).status,
      401,
    );
    assert.equal(
      (await send("/api/ipd/wards", { token: candidate })).status,
      401,
    );
  }
  assert.equal(calls.length, 0);
});

test("auth restores the pharmacy without locking a ward at login", async (t) => {
  const { send, login } = await fixture(t);
  const result = await send("/api/auth", {
    token: await login({ roomCode: "010" }),
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.context.roomCode, "010");
  assert.equal(result.body.context.wardCode, undefined);
  assert.equal(result.body.access, "ipd-readonly");
});

test("ward selected inside IPD is validated; patient query uses signed room and requested date", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login({ roomCode: "010", wardCode: "2" });
  const result = await send(
    "/api/ipd/patients?wardCode=2&orderdate=2025-01-15&ptstatus=discharged&search=000123",
    { token },
  );
  assert.equal(result.status, 200);
  assert.equal(calls[0].context.wardCode, "2");
  assert.equal(calls[0].context.roomCode, "010");
  assert.deepEqual(calls[0].filters, {
    orderdate: "2025-01-15",
    ptstatus: "discharged",
    search: "000123",
    prescription: "all",
  });
  assert.equal(result.body.patientCount, 1);
});

test("client cannot override signed room or use ambiguous ward aliases", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const name of [
    "wardcode",
    "ward",
    "roomCode",
    "roomcode",
    "room",
    "selectroom",
  ]) {
    assert.equal(
      (await send(`/api/ipd/patients?${name}=2`, { token })).status,
      403,
    );
  }
  assert.equal(calls.length, 0);
});

test("invalid calendar dates, statuses and arrays are rejected before SQL", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const query of [
    "orderdate=2026-02-30",
    "orderdate=2026-13-01",
    "orderdate=0001-01-01",
    "orderdate=",
    "ptstatus=other",
    "ptstatus=all&ptstatus=admit",
    "search=x&search=y",
    "prescription=other",
    "prescription=with&prescription=without",
  ]) {
    assert.equal(
      (await send(`/api/ipd/patients?wardCode=1&${query}`, { token })).status,
      400,
    );
  }
  assert.equal(calls.length, 0);
  assert.equal(
    (await send("/api/ipd/patients?wardCode=1&orderdate=2024-02-29", { token }))
      .status,
    200,
  );
});

test("viewer blocks legacy creation, editing, registration, device and unscoped APIs", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const path of [
    "/api/f5createorder",
    "/api/register",
    "/api/createMedIPD",
    "/api/first",
    "/api/second",
    "/api/medIPD",
    "/api/screen",
    "/dose/getDoseBySearch",
    "/api/ipd/patients",
  ]) {
    assert.equal(
      (await send(path, { token, body: { wardcode: "2" } })).status,
      403,
    );
  }
  assert.equal((await send("/dose/getDoseBySearch", { token })).status, 403);
  assert.equal(calls.length, 0);
});

test("repository outage is a retryable error, not an empty patient list or leaked SQL", async (t) => {
  const { send, login } = await fixture(t, {
    getPatients: async () => {
      throw new Error("private-database-details");
    },
  });
  const result = await send("/api/ipd/patients?wardCode=1", {
    token: await login(),
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.patients, undefined);
  assert.equal(
    JSON.stringify(result.body).includes("private-database-details"),
    false,
  );
});

test("malformed JSON is rejected cleanly", async (t) => {
  const { url } = await fixture(t);
  const response = await fetch(url + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
});

test("wards and counts are protected and receive the selected date/status", async (t) => {
  const { send, login, calls } = await fixture(t);
  const result = await send(
    "/api/ipd/wards?orderdate=2025-06-06&ptstatus=discharged",
    { token: await login() },
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.wards.length, 2);
  assert.deepEqual(calls[0], {
    type: "wards",
    filters: {
      orderdate: "2025-06-06",
      ptstatus: "discharged",
      search: "",
      prescription: "all",
    },
  });
});

test("missing, inactive, unknown, array and SQL-like ward codes never reach patient SQL", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const query of [
    "",
    "wardCode=",
    "wardCode=999",
    "wardCode=1&wardCode=2",
    "wardCode=1%27%20OR%201%3D1--",
  ])
    assert.equal(
      (await send(`/api/ipd/patients?${query}`, { token })).status,
      400,
    );
  assert.equal(calls.length, 0);
});

test("the same login can switch wards without leaking the previous selection", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const wardCode of ["1", "2", "1"]) {
    const result = await send(`/api/ipd/patients?wardCode=${wardCode}`, {
      token,
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.context.wardCode, wardCode);
    assert.equal(result.body.patients[0].wardcode, wardCode);
  }
  assert.deepEqual(
    calls.map((call) => call.context.wardCode),
    ["1", "2", "1"],
  );
});

test("global AN search forwards no selected ward and uses identical filters for wards and patients", async (t) => {
  let wardFilters;
  const { send, login, calls } = await fixture(t, {
    getWards: async (filters) => {
      wardFilters = filters;
      return filters.search === "000123"
        ? [{ code: "2", name: "Ward B", patientCount: 1 }]
        : [];
    },
  });
  const token = await login();
  // Start in a different ward, then search independently of that selection.
  await send("/api/ipd/patients?wardCode=1", { token });
  const query =
    "orderdate=2025-06-06&ptstatus=all&search=000123&prescription=without";
  const wards = await send(`/api/ipd/wards?${query}`, { token });
  assert.equal(wards.status, 200);
  assert.deepEqual(
    wards.body.wards.map((ward) => ward.code),
    ["2"],
  );
  const result = await send(`/api/ipd/patients?wardCode=2&${query}`, { token });
  assert.equal(result.status, 200);
  assert.deepEqual(calls[1].filters, wardFilters);
  assert.equal(wardFilters.wardCode, undefined);
  assert.equal(result.body.context.wardCode, "2");
  assert.equal(
    (await send("/api/ipd/wards?search=NO_MATCH", { token })).body.wards.length,
    0,
  );
});

test("patient summary restores direct links with signed pharmacy and validated admission", async (t) => {
  const { send, login, calls } = await fixture(t);
  const result = await send(
    "/api/ipd/patients/admission-A?wardCode=1&orderdate=2025-06-06",
    { token: await login({ roomCode: "010" }) },
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.patient.an, "admission-A");
  assert.equal(result.body.patient.hn, "server-hn-A");
  assert.equal(result.body.context.roomCode, "010");
  assert.equal(result.body.context.wardCode, "1");
  assert.equal(calls[0].orderdate, "2025-06-06");
  assert.equal(calls[0].options.includeClinical, true);
  assert.equal(result.headers.get("cache-control"), "no-store");
});

test("patient subresources validate admission without repeating the summary LAB scan", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const suffix of ["/medications", "/labs", "/allergies", "/ihos-due"]) {
    const result = await send(
      `/api/ipd/patients/admission-A${suffix}?wardCode=1`,
      { token },
    );
    assert.equal(result.status, 200);
  }
  assert.ok(
    calls
      .filter((call) => call.type === "summary")
      .every((call) => call.options.includeClinical === false),
  );
});

test("all patient resources require authentication and block stale/wrong-ward admissions", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const suffix of ["", "/medications", "/labs", "/notes", "/allergies"]) {
    assert.equal(
      (await send(`/api/ipd/patients/admission-A${suffix}?wardCode=1`)).status,
      401,
    );
    assert.equal(
      (
        await send(`/api/ipd/patients/admission-A${suffix}?wardCode=2`, {
          token,
        })
      ).status,
      404,
    );
    assert.equal(
      (await send(`/api/ipd/patients/unknown${suffix}?wardCode=1`, { token }))
        .status,
      404,
    );
    assert.equal(
      (
        await send(`/api/ipd/patients/admission-A${suffix}?wardCode=1`, {
          token,
          body: { hn: "spoofed-hn" },
        })
      ).status,
      403,
    );
  }
  assert.equal(
    calls.every((call) => call.type === "summary"),
    true,
  );
});

test("subresources derive HN from the admission; client HN and malformed identities are rejected", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const resource of ["labs", "notes", "allergies"]) {
    const result = await send(
      `/api/ipd/patients/admission-B/${resource}?wardCode=2`,
      { token },
    );
    assert.equal(result.status, 200);
    assert.equal(result.body[resource][0].source, "server-hn-B");
  }
  const count = calls.length;
  for (const query of [
    "wardCode=2&hn=spoofed",
    "wardCode=2&HN=spoofed",
    "wardCode=2&patientId=spoofed",
    "wardCode=1&wardCode=2",
    "",
  ])
    assert.equal(
      (await send(`/api/ipd/patients/admission-B/labs?${query}`, { token }))
        .status,
      400,
    );
  assert.equal(
    (await send("/api/ipd/patients/invalid%27AN?wardCode=1", { token })).status,
    400,
  );
  assert.equal(calls.length, count);
});

test("medication filters preserve the selected AN, date, category and off mode", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const category of ["IPD", "IV", "Chemo", "TPN"]) {
    const result = await send(
      `/api/ipd/patients/admission-A/medications?wardCode=1&orderdate=2025-06-06&workdate=2024-02-29&category=${category}&includeOff=true`,
      { token },
    );
    assert.equal(result.status, 200);
    const call = calls.at(-1);
    assert.equal(call.patient.an, "admission-A");
    assert.equal(call.patient.hn, "server-hn-A");
    assert.deepEqual(call.filters, {
      workdate: "2024-02-29",
      category,
      includeOff: true,
    });
  }
});

test("invalid medication filters never reach SQL", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const query of [
    "category=invalid",
    "category=IPD&category=IV",
    "includeOff=1",
    "includeOff=true&includeOff=false",
    "workdate=2026-02-30",
    "workdate=1753-01-01",
    "workdate=9999-12-31",
  ])
    assert.equal(
      (
        await send(
          `/api/ipd/patients/admission-A/medications?wardCode=1&${query}`,
          { token },
        )
      ).status,
      400,
    );
  assert.equal(calls.length, 0);
});

test("a failed allergy source is an error, never a claim that the patient has no allergy", async (t) => {
  const { send, login } = await fixture(t, {
    getPatientAllergies: async () => {
      throw new Error("private-source");
    },
  });
  const result = await send(
    "/api/ipd/patients/admission-A/allergies?wardCode=1",
    { token: await login() },
  );
  assert.equal(result.status, 503);
  assert.equal(result.body.allergies, undefined);
  assert.equal(JSON.stringify(result.body).includes("private-source"), false);
});

test("prescription dates, headers and details derive identity from validated admission", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const dates = await send(
    "/api/ipd/patients/admission-A/prescription-dates?wardCode=1",
    { token },
  );
  assert.equal(dates.status, 200);
  assert.equal(dates.body.dates[0].prescriptionCount, 2);
  assert.equal(calls.at(-1).patient.hn, "server-hn-A");
  const headers = await send(
    "/api/ipd/patients/admission-A/prescriptions?wardCode=1&workdate=2025-06-06",
    { token },
  );
  assert.equal(headers.status, 200);
  assert.equal(headers.body.prescriptions[0].prescriptionno, "RX-A");
  assert.equal(calls.at(-1).workdate, "2025-06-06");
  const detail = await send(
    "/api/ipd/patients/admission-A/prescriptions/RX-A?wardCode=1&workdate=2025-06-06",
    { token },
  );
  assert.equal(detail.status, 200);
  assert.equal(detail.body.header.prescriptionno, "RX-A");
  assert.equal(detail.body.items[0].prescriptionno, "RX-A");
  assert.equal(calls.at(-1).patient.hn, "server-hn-A");
  assert.equal(detail.headers.get("cache-control"), "no-store");
});

test("a prescription from another admission or round cannot be opened by number", async (t) => {
  const { send, login } = await fixture(t);
  const token = await login();
  for (const suffix of [
    "RX-B?wardCode=1&workdate=2025-06-06",
    "RX-A?wardCode=1&workdate=2025-06-07",
    "UNKNOWN?wardCode=1&workdate=2025-06-06",
  ]) {
    const result = await send(
      `/api/ipd/patients/admission-A/prescriptions/${suffix}`,
      { token },
    );
    assert.equal(result.status, 404);
    assert.equal(result.body.items, undefined);
  }
  const moved = await send(
    "/api/ipd/patients/admission-A/prescriptions/RX-A?wardCode=2&workdate=2025-06-06",
    { token },
  );
  assert.equal(moved.status, 404);
});

test("all prescription endpoints require login, reject HN overrides and block mutations", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const suffix of [
    "prescription-dates",
    "drug-interactions",
    "prescriptions",
    "prescriptions/RX-A",
  ]) {
    const path = `/api/ipd/patients/admission-A/${suffix}?wardCode=1`;
    assert.equal((await send(path)).status, 401);
    assert.equal((await send(path + "&hn=spoofed", { token })).status, 400);
    for (const method of ["POST", "PUT", "DELETE"])
      assert.equal(
        (await send(path, { token, method, body: { prescriptionno: "RX-A" } }))
          .status,
        403,
      );
  }
  assert.equal(calls.length, 0);
});

test("saved drug interactions resolve the current ward/HN, reject other contexts and distinguish failure from empty", async (t) => {
  const app = await fixture(t);
  const token = await app.login();
  const path = "/api/ipd/patients/admission-A/drug-interactions?wardCode=1";
  const result = await app.send(path, { token });
  assert.equal(result.status, 200);
  assert.equal(result.body["drug-interactions"][0].DDIhiscode, "synthetic-ddi");
  const read = app.calls.find((call) => call.type === "drug-interactions");
  assert.equal(read.patient.hn, "server-hn-A");
  assert.equal(read.patient.an, "admission-A");
  assert.equal(
    (await app.send(path.replace("wardCode=1", "wardCode=2"), { token }))
      .status,
    404,
  );
  assert.equal(
    (await app.send(path.replace("admission-A", "missing"), { token })).status,
    404,
  );
  assert.equal(
    app.calls.filter((call) => call.type === "drug-interactions").length,
    1,
  );
  const empty = await fixture(t, { getPatientInteractions: async () => [] });
  const emptyResult = await empty.send(path, { token: await empty.login() });
  assert.equal(emptyResult.status, 200);
  assert.deepEqual(emptyResult.body["drug-interactions"], []);
  const failed = await fixture(t, {
    getPatientInteractions: async () => {
      throw new Error("private-source");
    },
  });
  const failure = await failed.send(path, { token: await failed.login() });
  assert.equal(failure.status, 503);
  assert.equal(failure.body["drug-interactions"], undefined);
  assert.ok(!JSON.stringify(failure.body).includes("private-source"));
});

test("OR entry alert authenticates and resolves only the current patient's HN/AN, with errors distinct from matching counts", async (t) => {
  const app = await fixture(t);
  const token = await app.login();
  const path = "/api/ipd/patients/admission-A/operating-room-alert?wardCode=1";
  assert.equal((await app.send(path)).status, 401);
  assert.equal((await app.send(path + "&hn=spoof", { token })).status, 400);
  assert.equal(
    (await app.send(path.replace("wardCode=1", "wardCode=2"), { token }))
      .status,
    404,
  );
  for (const method of ["POST", "PUT", "DELETE"])
    assert.equal(
      (await app.send(path, { token, method, body: {} })).status,
      403,
    );
  assert.equal(
    app.calls.filter((call) => call.type === "operating-room-alert").length,
    0,
  );
  const result = await app.send(path, { token });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body["operating-room-alert"], [
    { medicationCount: 2, prescriptionCount: 1 },
  ]);
  const read = app.calls.find((call) => call.type === "operating-room-alert");
  assert.equal(read.patient.hn, "server-hn-A");
  assert.equal(read.patient.an, "admission-A");
  const failed = await fixture(t, {
    getPatientOperatingRoomAlert: async () => {
      throw new Error("private-or-query");
    },
  });
  const error = await failed.send(path, { token: await failed.login() });
  assert.equal(error.status, 503);
  assert.equal(error.body["operating-room-alert"], undefined);
  assert.ok(!JSON.stringify(error.body).includes("private-or-query"));
});

test("invalid prescription date, arrays and SQL-like numbers are rejected before reads", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const query of [
    "workdate=2026-02-30",
    "workdate=1753-01-01",
    "workdate=9999-12-31",
    "workdate=2025-06-06&workdate=2025-06-07",
    "workdate=",
  ])
    assert.equal(
      (
        await send(
          `/api/ipd/patients/admission-A/prescriptions?wardCode=1&${query}`,
          { token },
        )
      ).status,
      400,
    );
  for (const code of ["RX%27%20OR%201=1--", "A".repeat(21)])
    assert.equal(
      (
        await send(
          `/api/ipd/patients/admission-A/prescriptions/${code}?wardCode=1`,
          { token },
        )
      ).status,
      400,
    );
  assert.equal(calls.length, 0);
});

test("empty prescription round differs from database failure", async (t) => {
  const good = await fixture(t);
  const token = await good.login();
  const empty = await good.send(
    "/api/ipd/patients/admission-A/prescriptions?wardCode=1&workdate=2025-06-07",
    { token },
  );
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.prescriptions, []);
  const failed = await fixture(t, {
    getPatientPrescriptions: async () => {
      throw Error("private-sql");
    },
  });
  const error = await failed.send(
    "/api/ipd/patients/admission-A/prescriptions?wardCode=1",
    { token: await failed.login() },
  );
  assert.equal(error.status, 503);
  assert.equal(error.body.prescriptions, undefined);
  assert.equal(JSON.stringify(error.body).includes("private-sql"), false);
});

test("reconcile sources use server-resolved patient identity and remain read only", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const source of ["OPD", "IPD", "MRC"]) {
    const path = `/api/ipd/patients/admission-A/reconcile/${source}`;
    assert.equal((await send(path + "?wardCode=1")).status, 401);
    const history = await send(path + "?wardCode=1", { token });
    assert.equal(history.status, 200);
    assert.equal(history.body.source, source);
    assert.equal(
      (
        await send(
          path + "/items?wardCode=1&historyId=old-A&historyDate=2025-06-06",
          { token },
        )
      ).body.items.length,
      1,
    );
    assert.equal(
      (
        await send(path + "?wardCode=1", {
          token,
          method: "POST",
          body: { copy: true },
        })
      ).status,
      403,
    );
  }
  const reads = calls.filter((c) => c.type.startsWith("reconcile-"));
  assert.equal(reads.length, 6);
  assert.ok(reads.every((c) => c.patient.hn === "server-hn-A"));
});

test("reconcile rejects changed ward, client HN, invalid source and selection before history reads", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const base = "/api/ipd/patients/admission-A/reconcile/";
  for (const [path, status] of [
    ["OPD?wardCode=2", 404],
    ["OPD?wardCode=1&hn=someone", 400],
    ["wrong?wardCode=1", 400],
    ["IPD/items?wardCode=1&historyId=old-A&historyDate=2025-02-30", 400],
    [
      "MRC/items?wardCode=1&historyId=old-A&historyId=old-B&historyDate=2025-06-06",
      400,
    ],
    [
      "OPD/items?wardCode=1&historyId=old-A&historyDate=2025-06-06&historyDate=2025-06-07",
      400,
    ],
    ["MRC/items?wardCode=1&historyId=%27%3BDROP&historyDate=2025-06-06", 400],
    ["IPD/items?wardCode=1&historyId=old-A&historyDate=9999-12-31", 400],
  ])
    assert.equal((await send(base + path, { token })).status, status);
  assert.equal(calls.filter((c) => c.type.startsWith("reconcile-")).length, 0);
});

test("reconcile cannot retrieve another patient history or a mismatched date", async (t) => {
  const { send, login } = await fixture(t);
  const token = await login();
  for (const source of ["OPD", "IPD", "MRC"]) {
    for (const selection of [
      "historyId=old-B&historyDate=2025-06-06",
      "historyId=old-A&historyDate=2025-06-07",
    ]) {
      const result = await send(
        `/api/ipd/patients/admission-A/reconcile/${source}/items?wardCode=1&${selection}`,
        { token },
      );
      assert.equal(result.status, 404);
      assert.equal(result.body.items, undefined);
    }
  }
});

test("separate reconcile source failures are errors, while another source stays usable", async (t) => {
  const { send, login } = await fixture(t, {
    getReconcileHistory: async (_patient, source) => {
      if (source === "OPD")
        throw Object.assign(new Error("sensitive connection details"), {
          code: "ETIMEDOUT",
        });
      return [];
    },
  });
  const token = await login();
  const failure = await send(
    "/api/ipd/patients/admission-A/reconcile/OPD?wardCode=1",
    { token },
  );
  assert.equal(failure.status, 503);
  assert.equal(failure.body.history, undefined);
  assert.ok(!JSON.stringify(failure.body).includes("sensitive"));
  const success = await send(
    "/api/ipd/patients/admission-A/reconcile/IPD?wardCode=1",
    { token },
  );
  assert.equal(success.status, 200);
  assert.deepEqual(success.body.history, []);
});

test("Drug Profile authenticates, resolves HN on the server and preserves recorded Off/zero quantity", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const path =
    "/api/ipd/patients/admission-A/drug-profile?wardCode=1&from=2025-06-01&to=2025-06-10";
  assert.equal((await send(path)).status, 401);
  const response = await send(path, { token });
  assert.equal(response.status, 200);
  assert.equal(response.body.items.length, 1);
  assert.equal(response.body.items[0].orderqty, 0);
  assert.ok(response.body.items[0].voiddatetime);
  const read = calls.find((c) => c.type === "drug-profile");
  assert.equal(read.patient.hn, "server-hn-A");
  assert.deepEqual(read.filters, { from: "2025-06-01", to: "2025-06-10" });
  for (const method of ["POST", "PUT", "DELETE"])
    assert.equal((await send(path, { token, method })).status, 403);
});

test("Drug Profile rejects stale admission, wrong ward and HN overrides before history reads", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const [path, status] of [
    ["admission-A/drug-profile?wardCode=2", 404],
    ["admission-B/drug-profile?wardCode=1", 404],
    ["unknown/drug-profile?wardCode=1", 404],
    ["admission-A/drug-profile?wardCode=1&hn=another", 400],
  ])
    assert.equal(
      (await send("/api/ipd/patients/" + path, { token })).status,
      status,
    );
  assert.equal(calls.filter((c) => c.type === "drug-profile").length, 0);
});

test("Drug Profile validates both inclusive range dates and arrays before querying", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const dates of [
    "from=2025-02-30&to=2025-03-01",
    "from=2025-06-02&to=2025-06-01",
    "from=1752-12-31&to=2025-06-01",
    "from=2025-06-01&to=10000-01-01",
    "from=2025-06-01&from=2025-06-02&to=2025-06-03",
    "from=2025-06-01&to=2025-06-02&to=2025-06-03",
    "from=%27%3BDROP&to=2025-06-03",
    "from=&to=2025-06-03",
  ])
    assert.equal(
      (
        await send(
          "/api/ipd/patients/admission-A/drug-profile?wardCode=1&" + dates,
          { token },
        )
      ).status,
      400,
    );
  assert.equal(calls.filter((c) => c.type === "drug-profile").length, 0);
  const upper = await send(
    "/api/ipd/patients/admission-A/drug-profile?wardCode=1&from=9999-12-31&to=9999-12-31",
    { token },
  );
  assert.equal(upper.status, 200);
  assert.deepEqual(upper.body.items, []);
});

test("Drug Profile defaults to the selected calendar day and distinguishes empty history from failure", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const response = await send(
    "/api/ipd/patients/admission-A/drug-profile?wardCode=1&orderdate=2025-06-15",
    { token },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.items, []);
  assert.deepEqual(calls.find((c) => c.type === "drug-profile").filters, {
    from: "2025-06-15",
    to: "2025-06-15",
  });
  const other = await fixture(t, {
    getPatientDrugProfile: async () => {
      throw Object.assign(new Error("private SQL and connection detail"), {
        code: "ETIMEOUT",
      });
    },
  });
  const failure = await other.send(
    "/api/ipd/patients/admission-A/drug-profile?wardCode=1",
    { token: await other.login() },
  );
  assert.equal(failure.status, 503);
  assert.equal(failure.body.items, undefined);
  assert.ok(!JSON.stringify(failure.body).includes("private"));
});

test("Pharmcare lists HN history including other admissions and reads all four sources with server identity", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const base = "/api/ipd/patients/admission-A/pharmcare/events";
  const events = await send(base + "?wardCode=1", { token });
  assert.equal(events.status, 200);
  assert.equal(events.body.events[0].AN, "previous-admission");
  for (const source of ["drp", "due", "side-effects", "me"]) {
    const path = base + "/EVENT-A/" + source + "?wardCode=1";
    assert.equal((await send(path)).status, 401);
    const result = await send(path, { token });
    assert.equal(result.status, 200);
    assert.equal(result.body.resource, source);
    assert.equal(result.body.event.OrderNo, "EVENT-A");
    if (source === "due") assert.deepEqual(result.body.items, []);
    else {
      assert.equal(result.body.items[0].PharmacistNote, "Line one\nLine two");
      assert.equal(result.body.items[0].Severity, "0");
    }
    for (const method of ["POST", "PUT", "DELETE"])
      assert.equal((await send(path, { token, method })).status, 403);
  }
  const reads = calls.filter((c) => c.type.startsWith("pharmcare-"));
  assert.equal(reads.length, 5);
  assert.ok(reads.every((c) => c.patient.hn === "server-hn-A"));
});

test("Pharmcare cannot open events belonging to another HN or a stale/wrong-ward admission", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const base = "/api/ipd/patients/admission-A/pharmcare/events";
  for (const resource of ["drp", "due", "side-effects", "me"]) {
    const result = await send(base + "/EVENT-B/" + resource + "?wardCode=1", {
      token,
    });
    assert.equal(result.status, 404);
    assert.equal(result.body.items, undefined);
  }
  const before = calls.filter((c) => c.type.startsWith("pharmcare-")).length;
  for (const [path, status] of [
    [base + "?wardCode=2", 404],
    [base + "/EVENT-A/drp?wardCode=2", 404],
    [base + "?wardCode=1&hn=foreign", 400],
    [base + "/EVENT-A/me?wardCode=1&patientId=foreign", 400],
    ["/api/ipd/patients/unknown/pharmcare/events?wardCode=1", 404],
  ])
    assert.equal((await send(path, { token })).status, status);
  assert.equal(
    calls.filter((c) => c.type.startsWith("pharmcare-")).length,
    before,
  );
});

test("Pharmcare rejects malformed event keys and unknown categories before repository reads", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const path of [
    "%27%3BDROP/drp",
    "EVENT-A/unknown",
    "EVENT-A/constructor",
    "EVENT-A/DRP",
    "a".repeat(33) + "/drp",
  ]) {
    assert.equal(
      (
        await send(
          "/api/ipd/patients/admission-A/pharmcare/events/" +
            path +
            "?wardCode=1",
          { token },
        )
      ).status,
      400,
    );
  }
  assert.equal(calls.filter((c) => c.type.startsWith("pharmcare-")).length, 0);
});

test("a Pharmcare source outage is not an empty history and does not prevent other sources from being read", async (t) => {
  const { send, login } = await fixture(t, {
    getPatientPharmcareRecords: async (_p, orderNo, resource) => {
      if (resource === "me")
        throw Object.assign(new Error("private SQL parameters"), {
          code: "ETIMEOUT",
        });
      return { event: { OrderNo: orderNo }, items: [] };
    },
  });
  const token = await login();
  const base = "/api/ipd/patients/admission-A/pharmcare/events/EVENT-A/";
  const failure = await send(base + "me?wardCode=1", { token });
  assert.equal(failure.status, 503);
  assert.equal(failure.body.items, undefined);
  assert.ok(!JSON.stringify(failure.body).includes("private"));
  const ok = await send(base + "drp?wardCode=1", { token });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.body.items, []);
});

test("pharmacist Note history is separate from DRP and includes earlier admissions of the server-resolved HN", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const base = "/api/ipd/patients/admission-A/pharmacist-notes";
  for (const path of [base, base + "/NOTE-A"])
    assert.equal((await send(path + "?wardCode=1")).status, 401);
  const history = await send(base + "?wardCode=1", { token });
  assert.equal(history.status, 200);
  assert.equal(history.body.notes[0].an, "previous-admission");
  assert.equal(history.body.notes[0].problem, "Recorded problem\nSecond line");
  assert.ok(history.body.notes[0].note.length > 200);
  assert.ok(history.body.notes[0].note.endsWith("\nEnd of note"));
  const detail = await send(base + "/NOTE-A?wardCode=1", { token });
  assert.equal(detail.status, 200);
  assert.equal(detail.body.note.an, "previous-admission");
  assert.equal(detail.body.note.problem, "Recorded problem\nSecond line");
  assert.ok(detail.body.note.note.length > 200);
  assert.ok(detail.body.note.note.endsWith("\nEnd of note"));
  assert.equal(detail.body.note.recorder, null);
  const reads = calls.filter((c) => c.type.startsWith("pharmacist-note"));
  assert.equal(reads.length, 2);
  assert.ok(reads.every((c) => c.patient.hn === "server-hn-A"));
  assert.equal(calls.filter((c) => c.type === "notes").length, 0);
});

test("pharmacist Note cannot be opened by an ID belonging to a different HN", async (t) => {
  const { send, login } = await fixture(t);
  const token = await login();
  for (const id of ["NOTE-B", "unknown"]) {
    const result = await send(
      "/api/ipd/patients/admission-A/pharmacist-notes/" + id + "?wardCode=1",
      { token },
    );
    assert.equal(result.status, 404);
    assert.equal(result.body.note, undefined);
  }
});

test("pharmacist Note rejects invalid identity/context and never permits mutations", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const base = "/api/ipd/patients/admission-A/pharmacist-notes";
  for (const [path, status] of [
    [base + "?wardCode=2", 404],
    [base + "/NOTE-A?wardCode=2", 404],
    [base + "?wardCode=1&hn=foreign", 400],
    [base + "/NOTE-A?wardCode=1&HN=foreign", 400],
    [base + "/%27%3BDROP?wardCode=1", 400],
    [base + "/" + "a".repeat(21) + "?wardCode=1", 400],
    ["/api/ipd/patients/unknown/pharmacist-notes?wardCode=1", 404],
  ])
    assert.equal((await send(path, { token })).status, status);
  assert.equal(
    calls.filter((c) => c.type.startsWith("pharmacist-note")).length,
    0,
  );
  for (const path of [base, base + "/NOTE-A"])
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal(
        (await send(path + "?wardCode=1", { token, method })).status,
        403,
      );
});

test("pharmacist Note distinguishes empty history, a blank saved note and database failure", async (t) => {
  const empty = await fixture(t, {
    getPatientPharmacistNotes: async () => [],
    getPatientPharmacistNote: async () => ({
      id: "BLANK",
      problem: "",
      note: null,
    }),
  });
  const token = await empty.login();
  const base = "/api/ipd/patients/admission-A/pharmacist-notes";
  const history = await empty.send(base + "?wardCode=1", { token });
  assert.equal(history.status, 200);
  assert.deepEqual(history.body.notes, []);
  const blank = await empty.send(base + "/BLANK?wardCode=1", { token });
  assert.equal(blank.status, 200);
  assert.equal(blank.body.note.problem, "");
  assert.equal(blank.body.note.note, null);
  const failed = await fixture(t, {
    getPatientPharmacistNotes: async () => {
      throw new Error("private connection details");
    },
    getPatientPharmacistNote: async () => {
      throw new Error("private SQL values");
    },
  });
  const failedToken = await failed.login();
  for (const path of [base, base + "/NOTE-A"]) {
    const result = await failed.send(path + "?wardCode=1", {
      token: failedToken,
    });
    assert.equal(result.status, 503);
    assert.equal(result.body.notes, undefined);
    assert.equal(result.body.note, undefined);
    assert.ok(!JSON.stringify(result.body).includes("private"));
  }
});

test("IHOS DUE authenticates and resolves ward/admission before reading", async (t) => {
  const { send, login, calls } = await fixture(t);
  const path = "/api/ipd/patients/admission-A/ihos-due?wardCode=1";
  assert.equal((await send(path)).status, 401);
  const token = await login();
  const result = await send(path, { token });
  assert.equal(result.status, 200);
  assert.equal(result.body.an, "admission-A");
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.ok(result.body.items[0].request_note.length > 500);
  assert.equal(
    calls.find((item) => item.type === "ihos-due").patient.hn,
    "server-hn-A",
  );
  for (const suffix of [
    "wardCode=2",
    "wardCode=1&hn=other",
    "wardCode=1&roomCode=010",
  ]) {
    assert.ok(
      [400, 403, 404].includes(
        (
          await send("/api/ipd/patients/admission-A/ihos-due?" + suffix, {
            token,
          })
        ).status,
      ),
    );
  }
  assert.equal(calls.filter((item) => item.type === "ihos-due").length, 1);
  for (const method of ["POST", "PUT", "DELETE"]) {
    assert.equal((await send(path, { token, method })).status, 403);
  }
});

test("IHOS DUE distinguishes empty, configuration, outage and malformed responses", async (t) => {
  for (const code of [
    null,
    "IHOS_DUE_NOT_CONFIGURED",
    "IHOS_DUE_UNAVAILABLE",
    "IHOS_DUE_INVALID_RESPONSE",
  ]) {
    const { send, login } = await fixture(t, {
      getPatientIhosDue: async () => {
        if (code)
          throw Object.assign(
            new Error("must not expose source/key/patient details"),
            { code },
          );
        return [];
      },
    });
    const token = await login();
    const result = await send(
      "/api/ipd/patients/admission-A/ihos-due?wardCode=1",
      { token },
    );
    assert.equal(result.status, code ? 503 : 200);
    if (code) {
      assert.equal(result.body.items, undefined);
      assert.ok(result.body.message.includes("IHOS DUE"));
      assert.ok(!JSON.stringify(result.body).includes("must not expose"));
    } else assert.deepEqual(result.body.items, []);
  }
});

test("LAB dates/results authenticate and use only the patient HN resolved on the server", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/patients/admission-A/lab-history/";
  const range = "?wardCode=1&from=2026-10-11&to=2026-10-18";
  assert.equal((await send(root + "dates" + range)).status, 401);
  const dates = await send(root + "dates" + range, { token });
  assert.equal(dates.status, 200);
  assert.equal(dates.body.an, "admission-A");
  assert.equal(dates.headers.get("cache-control"), "no-store");
  assert.deepEqual(dates.body.dates, [
    { date: "2026-10-18" },
    { date: "2026-10-17" },
  ]);
  const results = await send(root + "results" + range + "&date=2026-10-18", {
    token,
  });
  assert.equal(results.status, 200);
  assert.equal(results.body.date, "2026-10-18");
  assert.equal(results.body.items[0].result, "<5");
  assert.ok(results.body.items[0].result_obj.length > 500);
  assert.ok(
    calls
      .filter((r) => r.type === "lab-dates" || r.type === "lab-results")
      .every((r) => r.patient.hn === "server-hn-A"),
  );
});

test("LAB rejects malformed/reversed dates, arrays and selected dates outside the range before source reads", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/patients/admission-A/lab-history/";
  for (const suffix of [
    "dates?wardCode=1&from=2026-02-30&to=2026-10-18",
    "dates?wardCode=1&from=2026-10-19&to=2026-10-18",
    "dates?wardCode=1&from=2026-10-11&from=2026-10-12",
    "dates?wardCode=1&from=1752-12-31&to=1753-01-01",
    "results?wardCode=1&from=2026-10-11&to=2026-10-18",
    "results?wardCode=1&from=2026-10-11&to=2026-10-18&date=2026-10-19",
    "results?wardCode=1&from=2026-10-11&to=2026-10-18&date=2026-10-10",
    "results?wardCode=1&date=2026-10-18&date=2026-10-17",
  ])
    assert.equal((await send(root + suffix, { token })).status, 400);
  assert.equal(
    calls.filter((r) => r.type === "lab-dates" || r.type === "lab-results")
      .length,
    0,
  );
});

test("LAB wrong ward, missing patient and client HN overrides cannot read history; mutations stay closed", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/patients/admission-A/lab-history/";
  for (const resource of ["dates", "results"]) {
    for (const suffix of [
      "wardCode=2",
      "wardCode=1&hn=other",
      "wardCode=1&roomCode=010",
    ]) {
      const result = await send(
        root +
          resource +
          "?" +
          suffix +
          "&from=2026-10-11&to=2026-10-18&date=2026-10-18",
        { token },
      );
      assert.ok([400, 403, 404].includes(result.status));
    }
    for (const method of ["POST", "PUT", "DELETE"])
      assert.equal(
        (await send(root + resource + "?wardCode=1", { token, method })).status,
        403,
      );
  }
  assert.equal(
    (
      await send("/api/ipd/patients/missing/lab-history/dates?wardCode=1", {
        token,
      })
    ).status,
    404,
  );
  assert.equal(
    calls.filter((r) => r.type === "lab-dates" || r.type === "lab-results")
      .length,
    0,
  );
});

test("LAB defaults to the current Bangkok calendar week and permits the maximum date without overflow", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/patients/admission-A/lab-history/";
  assert.equal((await send(root + "dates?wardCode=1", { token })).status, 200);
  const filters = calls.find((r) => r.type === "lab-dates").filters;
  assert.equal(Date.parse(filters.to) - Date.parse(filters.from), 7 * 86400000);
  assert.equal(
    (
      await send(
        root +
          "results?wardCode=1&from=9999-12-31&to=9999-12-31&date=9999-12-31",
        { token },
      )
    ).status,
    200,
  );
});

test("LAB MySQL unavailable is an error rather than empty history and other resources stay usable", async (t) => {
  const { send, login } = await fixture(t, {
    getPatientLabDates: async () => {
      throw Object.assign(new Error("private credentials and server details"), {
        code: "ETIMEDOUT",
      });
    },
  });
  const token = await login();
  const unavailable = await send(
    "/api/ipd/patients/admission-A/lab-history/dates?wardCode=1",
    { token },
  );
  assert.equal(unavailable.status, 503);
  assert.ok(unavailable.body.message.includes("MySQL"));
  assert.equal(unavailable.body.dates, undefined);
  assert.ok(!JSON.stringify(unavailable.body).includes("private credentials"));
  assert.equal(
    (await send("/api/ipd/patients/admission-A/labs?wardCode=1", { token }))
      .status,
    200,
  );
  const empty = await send(
    "/api/ipd/patients/admission-A/lab-history/results?wardCode=1&from=2026-10-11&to=2026-10-18&date=2026-10-17",
    { token },
  );
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.items, []);
});

test("full ADR history preserves all saved classifications and long text for only the server-resolved patient", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  for (const [an, ward, code] of [
    ["admission-A", "1", "ADR-A"],
    ["admission-B", "2", "ADR-B"],
  ]) {
    const response = await send(
      `/api/ipd/patients/${an}/allergies?wardCode=${ward}`,
      { token },
    );
    assert.equal(response.status, 200);
    assert.equal(response.body.an, an);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.body.allergies[0].adrcode, code);
    assert.equal(response.body.allergies[0].typeLabel, "มี S/E จากยา");
    assert.equal(response.body.allergies[0].naranjoscore, 0);
    assert.ok(response.body.allergies[0].adversereactions.length > 500);
  }
  assert.deepEqual(
    calls.filter((r) => r.type === "allergies").map((r) => r.patient.hn),
    ["server-hn-A", "server-hn-B"],
  );
  for (const method of ["POST", "PUT", "PATCH", "DELETE"])
    assert.equal(
      (
        await send("/api/ipd/patients/admission-A/allergies?wardCode=1", {
          token,
          method,
        })
      ).status,
      403,
    );
});

test("empty ADR history and failed history remain distinct; errors do not expose source details", async (t) => {
  const emptyFixture = await fixture(t, {
    getPatientAllergies: async () => [],
  });
  const token = await emptyFixture.login();
  const empty = await emptyFixture.send(
    "/api/ipd/patients/admission-A/allergies?wardCode=1",
    { token },
  );
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.allergies, []);
  const failedFixture = await fixture(t, {
    getPatientAllergies: async () => {
      throw Object.assign(
        new Error("private medical data and connection details"),
        { code: "ADR_INVALID_RESPONSE" },
      );
    },
  });
  const failure = await failedFixture.send(
    "/api/ipd/patients/admission-A/allergies?wardCode=1",
    { token: await failedFixture.login() },
  );
  assert.equal(failure.status, 503);
  assert.equal(failure.body.allergies, undefined);
  assert.ok(!JSON.stringify(failure.body).includes("private medical"));
});

test("Stat waiting endpoints authenticate and use the signed pharmacy and selected round at all levels", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  const params = "?orderdate=2026-10-18&workdate=2026-10-17&mode=stat-wait";
  for (const resource of ["/wards", "/prescriptions", "/prescriptions/STAT-A"])
    assert.equal(
      (await send(root + resource + params + "&wardCode=1")).status,
      401,
    );
  const wards = await send(root + "/wards" + params, { token });
  assert.equal(wards.status, 200);
  assert.equal(wards.body.window.workdate, "2026-10-17");
  assert.equal(wards.body.window.wardEnd, "2026-10-18 07:59:00");
  const headers = await send(root + "/prescriptions" + params + "&wardCode=1", {
    token,
  });
  assert.equal(headers.status, 200);
  const detail = await send(
    root + "/prescriptions/STAT-A" + params + "&wardCode=1",
    { token },
  );
  assert.equal(detail.status, 200);
  assert.equal(detail.headers.get("cache-control"), "no-store");
  assert.equal(detail.body.items[0].orderqty, 0);
  assert.ok(detail.body.items[0].voiddatetime);
  for (const call of calls.filter((r) => r.type.startsWith("screening-"))) {
    assert.equal(call.context.roomCode, "001");
    assert.equal(call.filters.window.workdate, "2026-10-17");
  }
});

test("Stat waiting rejects unsupported mode, malformed dates, room/HN overrides and invalid identifiers before queue reads", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  for (const suffix of [
    "/wards?mode=continue",
    "/wards?mode=stat-wait&mode=other",
    "/wards?orderdate=2026-02-30",
    "/wards?orderdate=1753-01-01",
    "/wards?orderdate=9999-12-31",
    "/wards?orderdate=2026-10-18&workdate=2026-10-16",
    "/wards?orderdate=2026-10-18&workdate=2026-10-18&workdate=2026-10-17",
    "/wards?roomCode=MISSING",
    "/wards?roomCode=001&roomCode=002",
    "/wards?hn=another",
    "/wards?fromlocationname=other",
    "/prescriptions",
    "/prescriptions?wardCode=1&wardCode=2",
    "/prescriptions/bad.id?wardCode=1",
  ]) {
    assert.ok(
      [400, 403].includes((await send(root + suffix, { token })).status),
      suffix,
    );
  }
  assert.equal(calls.filter((r) => r.type.startsWith("screening-")).length, 0);
});

test("Stat waiting cannot read another pharmacy/ward/prescription and never permits writes or hardware routes", async (t) => {
  const { send, login } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  for (const path of [
    "/prescriptions/STAT-B?wardCode=1",
    "/prescriptions/STAT-A?wardCode=2",
  ])
    assert.equal((await send(root + path, { token })).status, 404);
  const other = await login({ roomCode: "010" });
  assert.equal(
    (await send(root + "/prescriptions/STAT-A?wardCode=1", { token: other }))
      .status,
    404,
  );
  for (const path of ["/wards", "/prescriptions", "/prescriptions/STAT-A"])
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal(
        (await send(root + path + "?wardCode=1", { token, method })).status,
        403,
      );
  for (const path of [
    "/api/screenStat_1",
    "/api/screenthree",
    "/api/ipd/screening/generate",
    "/api/ipd/screening/print",
    "/api/ipd/screening/send-robot",
  ])
    assert.equal((await send(path, { token, method: "POST" })).status, 403);
});

test("Stat waiting empty queue, removed prescription and database failure remain separate", async (t) => {
  const f = await fixture(t, { getScreeningWards: async () => [] });
  const token = await f.login();
  const result = await f.send("/api/ipd/screening/wards", { token });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.wards, []);
  const e = await fixture(t, {
    getScreeningWards: async () => {
      throw Object.assign(new Error("private connection data"), {
        code: "ETIMEOUT",
      });
    },
  });
  const failed = await e.send("/api/ipd/screening/wards", {
    token: await e.login(),
  });
  assert.equal(failed.status, 503);
  assert.equal(failed.body.wards, undefined);
  assert.ok(!JSON.stringify(failed.body).includes("private connection data"));
});

test("Screening exposes all real rooms and allows its own room selection without changing the login pharmacy", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  assert.equal((await send("/api/ipd/screening/options")).status, 401);
  const options = await send("/api/ipd/screening/options", { token });
  assert.equal(options.status, 200);
  assert.deepEqual(
    options.body.rooms.map((r) => r.code),
    ["001", "002", "010"],
  );
  const result = await send(
    "/api/ipd/screening/wards?roomCode=002&mode=stat-finished&orderdate=2026-10-18",
    { token },
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.context.roomCode, "002");
  assert.equal(result.body.mode, "stat-finished");
  const call = calls.find((r) => r.type === "screening-wards");
  assert.equal(call.context.roomCode, "002");
  assert.equal(call.filters.mode, "stat-finished");
  assert.equal(
    (await send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
  assert.equal(
    (
      await send("/api/ipd/patients/admission-A?wardCode=1&roomCode=002", {
        token,
      })
    ).status,
    403,
  );
});

test("Stat finished is a separate query mode and cannot retrieve waiting prescriptions", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  const headers = await send(
    root + "/prescriptions?mode=stat-finished&wardCode=1&roomCode=001",
    { token },
  );
  assert.equal(headers.status, 200);
  assert.equal(headers.body.prescriptions[0].prescriptionno, "STAT-DONE");
  const detail = await send(
    root +
      "/prescriptions/STAT-DONE?mode=stat-finished&wardCode=1&roomCode=001",
    { token },
  );
  assert.equal(detail.status, 200);
  assert.equal(
    (
      await send(
        root +
          "/prescriptions/STAT-A?mode=stat-finished&wardCode=1&roomCode=001",
        { token },
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await send(
        root +
          "/prescriptions/STAT-DONE?mode=stat-wait&wardCode=1&roomCode=001",
        { token },
      )
    ).status,
    404,
  );
  assert.ok(
    calls
      .filter((r) => r.type === "screening-detail")
      .some((r) => r.filters.mode === "stat-finished"),
  );
});

test("Finished Screening returns to the same room, mode, date, ward and prescription from patient detail", async () => {
  const { screeningPatientPath, screeningReturnPath } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  const url = new URL(
    screeningPatientPath(
      { an: "DEMO-AN", currentWardCode: "2", prescriptionno: "DEMO-DONE" },
      {
        orderdate: "2026-10-18",
        search: "",
        wardCode: "1",
        workdate: "2026-10-17",
        roomCode: "002",
        mode: "stat-finished",
      },
    ),
    "http://localhost",
  );
  const back = new URL(
    screeningReturnPath(url.searchParams),
    "http://localhost",
  );
  assert.equal(back.searchParams.get("mode"), "stat-finished");
  assert.equal(back.searchParams.get("roomCode"), "002");
  assert.equal(back.searchParams.get("rx"), "DEMO-DONE");
  assert.equal(back.searchParams.get("wardCode"), "1");
});

test("Continue waiting uses the selected room, round and search at every read level and never mixes Stat prescriptions", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  const query =
    "?mode=continue-wait&roomCode=001&orderdate=2026-10-18&workdate=2026-10-17&search=CONT-A";
  for (const path of ["/wards", "/prescriptions", "/prescriptions/CONT-A"]) {
    assert.equal((await send(root + path + query + "&wardCode=1")).status, 401);
    const result = await send(root + path + query + "&wardCode=1", { token });
    assert.equal(result.status, 200);
    assert.equal(result.body.mode, "continue-wait");
    assert.equal(result.body.context.roomCode, "001");
    assert.equal(result.body.window.start, "2026-10-17 08:00:00");
    if (path.endsWith("CONT-A")) {
      assert.equal(result.body.items[0].frequencycode, null);
      assert.equal(result.body.items[0].orderqty, 0);
      assert.ok(result.body.items[0].voiddatetime);
    }
  }
  for (const call of calls.filter((r) => r.type.startsWith("screening-"))) {
    assert.equal(call.filters.mode, "continue-wait");
    assert.equal(call.filters.search, "CONT-A");
    assert.equal(call.context.roomCode, "001");
  }
  for (const [rx, mode, room, ward] of [
    ["STAT-A", "continue-wait", "001", "1"],
    ["STAT-DONE", "continue-wait", "001", "1"],
    ["CONT-A", "stat-wait", "001", "1"],
    ["CONT-A", "stat-finished", "001", "1"],
    ["CONT-A", "continue-wait", "002", "1"],
    ["CONT-A", "continue-wait", "001", "2"],
  ])
    assert.equal(
      (
        await send(
          root +
            "/prescriptions/" +
            rx +
            "?mode=" +
            mode +
            "&roomCode=" +
            room +
            "&wardCode=" +
            ward,
          { token },
        )
      ).status,
      404,
    );
  const other = await send(root + "/wards?mode=continue-wait&roomCode=002", {
    token,
  });
  assert.equal(other.status, 200);
  assert.equal(other.body.context.roomCode, "002");
  assert.equal(
    (await send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
  for (const path of [
    "/wards",
    "/prescriptions",
    "/prescriptions/CONT-A",
    "/generate",
    "/send-robot",
    "/print",
  ])
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal(
        (await send(root + path + query + "&wardCode=1", { token, method }))
          .status,
        403,
      );
});

test("Continue waiting distinguishes empty and unavailable sources at every level", async (t) => {
  const empty = await fixture(t, {
    getScreeningWards: async () => [],
    getScreeningPrescriptions: async () => [],
    getScreeningPrescription: async () => null,
  });
  const token = await empty.login();
  assert.deepEqual(
    (await empty.send("/api/ipd/screening/wards?mode=continue-wait", { token }))
      .body.wards,
    [],
  );
  assert.deepEqual(
    (
      await empty.send(
        "/api/ipd/screening/prescriptions?mode=continue-wait&wardCode=1",
        { token },
      )
    ).body.prescriptions,
    [],
  );
  assert.equal(
    (
      await empty.send(
        "/api/ipd/screening/prescriptions/CONT-A?mode=continue-wait&wardCode=1",
        { token },
      )
    ).status,
    404,
  );
  const fail = async () => {
    throw Object.assign(new Error("private database details"), {
      code: "ETIMEOUT",
    });
  };
  const failed = await fixture(t, {
    getScreeningWards: fail,
    getScreeningPrescriptions: fail,
    getScreeningPrescription: fail,
  });
  const failedToken = await failed.login();
  for (const path of ["/wards", "/prescriptions", "/prescriptions/CONT-A"]) {
    const response = await failed.send(
      "/api/ipd/screening" + path + "?mode=continue-wait&wardCode=1",
      { token: failedToken },
    );
    assert.equal(response.status, 503);
    assert.equal(response.body.wards, undefined);
    assert.equal(response.body.prescriptions, undefined);
    assert.equal(response.body.items, undefined);
    assert.ok(
      !JSON.stringify(response.body).includes("private database details"),
    );
  }
});

test("Continue finished keeps the same all-room ward totals when switching pharmacy but scopes headers and details", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  const suffix = "&orderdate=2026-10-18&workdate=2026-10-17";
  const first = await send(
    root + "/wards?mode=continue-finished&roomCode=001" + suffix,
    { token },
  );
  const other = await send(
    root + "/wards?mode=continue-finished&roomCode=002" + suffix,
    { token },
  );
  assert.equal(first.status, 200);
  assert.equal(other.status, 200);
  assert.deepEqual(first.body.wards, other.body.wards);
  assert.equal(other.body.context.roomCode, "002");
  assert.equal(other.body.window.workdate, "2026-10-17");
  const headers = await send(
    root +
      "/prescriptions?mode=continue-finished&roomCode=002&wardCode=1" +
      suffix,
    { token },
  );
  assert.equal(headers.status, 200);
  assert.deepEqual(headers.body.prescriptions, []);
  assert.equal(
    (
      await send(
        root +
          "/prescriptions/CONT-DONE?mode=continue-finished&roomCode=002&wardCode=1" +
          suffix,
        { token },
      )
    ).status,
    404,
  );
  const before = calls.length;
  assert.equal(
    (
      await send(root + "/wards?mode=continue-finished&roomCode=unknown", {
        token,
      })
    ).status,
    400,
  );
  assert.equal(calls.length, before);
  assert.equal(
    (await send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
});

test("Continue finished reads only its own mode and preserves room, round and patient context without permitting writes", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  const params =
    "?mode=continue-finished&roomCode=001&orderdate=2026-10-18&workdate=2026-10-17&search=CONT-DONE&wardCode=1";
  for (const path of ["/wards", "/prescriptions", "/prescriptions/CONT-DONE"]) {
    assert.equal((await send(root + path + params)).status, 401);
    const response = await send(root + path + params, { token });
    assert.equal(response.status, 200);
    assert.equal(response.body.context.roomCode, "001");
    assert.equal(response.body.mode, "continue-finished");
    assert.equal(response.body.window.workdate, "2026-10-17");
    if (path.endsWith("CONT-DONE")) {
      assert.equal(response.body.items[0].frequencycode, null);
      assert.ok(response.body.items[0].genorderdatetime);
      assert.equal(response.body.items[0].orderqty, 0);
      assert.ok(response.body.items[0].voiddatetime);
    }
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal(
        (await send(root + path + params, { token, method })).status,
        403,
      );
  }
  for (const [rx, mode, room, ward] of [
    ["CONT-A", "continue-finished", "001", "1"],
    ["STAT-A", "continue-finished", "001", "1"],
    ["STAT-DONE", "continue-finished", "001", "1"],
    ["CONT-DONE", "continue-wait", "001", "1"],
    ["CONT-DONE", "stat-finished", "001", "1"],
    ["CONT-DONE", "continue-finished", "002", "1"],
    ["CONT-DONE", "continue-finished", "001", "2"],
  ])
    assert.equal(
      (
        await send(
          root +
            "/prescriptions/" +
            rx +
            "?mode=" +
            mode +
            "&roomCode=" +
            room +
            "&wardCode=" +
            ward,
          { token },
        )
      ).status,
      404,
    );
  for (const call of calls.filter(
    (r) => r.type.startsWith("screening-") && r.filters.search === "CONT-DONE",
  )) {
    assert.equal(call.filters.mode, "continue-finished");
    assert.equal(call.context.roomCode, "001");
    assert.equal(call.filters.window.workdate, "2026-10-17");
  }
  const room = await send(root + "/wards?mode=continue-finished&roomCode=002", {
    token,
  });
  assert.equal(room.status, 200);
  assert.equal(room.body.context.roomCode, "002");
  assert.equal(
    (await send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
  const empty = await fixture(t, {
    getScreeningWards: async () => [],
    getScreeningPrescriptions: async () => [],
    getScreeningPrescription: async () => null,
  });
  const emptyToken = await empty.login();
  assert.deepEqual(
    (
      await empty.send(root + "/wards?mode=continue-finished", {
        token: emptyToken,
      })
    ).body.wards,
    [],
  );
  assert.deepEqual(
    (
      await empty.send(
        root + "/prescriptions?mode=continue-finished&wardCode=1",
        { token: emptyToken },
      )
    ).body.prescriptions,
    [],
  );
  assert.equal(
    (
      await empty.send(
        root + "/prescriptions/CONT-DONE?mode=continue-finished&wardCode=1",
        { token: emptyToken },
      )
    ).status,
    404,
  );
  const fail = async () => {
    throw Object.assign(new Error("private connection details"), {
      code: "ETIMEOUT",
    });
  };
  const failed = await fixture(t, {
    getScreeningWards: fail,
    getScreeningPrescriptions: fail,
    getScreeningPrescription: fail,
  });
  const failedToken = await failed.login();
  for (const path of ["/wards", "/prescriptions", "/prescriptions/CONT-DONE"]) {
    const response = await failed.send(root + path + params, {
      token: failedToken,
    });
    assert.equal(response.status, 503);
    assert.equal(response.body.items, undefined);
    assert.equal(response.body.wards, undefined);
    assert.equal(response.body.prescriptions, undefined);
    assert.ok(
      !JSON.stringify(response.body).includes("private connection details"),
    );
  }
});

test("Robot viewer authenticates, propagates its room and round, isolates prescription context and forbids every send/write route", async (t) => {
  const { send, login, calls } = await fixture(t);
  const token = await login();
  const root = "/api/ipd/screening";
  const query =
    "?mode=robot-wait&roomCode=001&wardCode=1&orderdate=2026-10-18&workdate=2026-10-17&search=ROBOT-A";
  for (const path of ["/wards", "/prescriptions", "/prescriptions/ROBOT-A"]) {
    assert.equal((await send(root + path + query)).status, 401);
    const response = await send(root + path + query, { token });
    assert.equal(response.status, 200);
    assert.equal(response.body.mode, "robot-wait");
    assert.equal(response.body.context.roomCode, "001");
    assert.equal(response.body.window.workdate, "2026-10-17");
    if (path.endsWith("ROBOT-A")) {
      assert.equal(response.body.items[0].genOCSdatetime, null);
      assert.equal(response.body.items[0].frequencyTime, "0800");
    }
    for (const method of ["POST", "PUT", "PATCH", "DELETE"])
      assert.equal(
        (await send(root + path + query, { token, method })).status,
        403,
      );
  }
  for (const call of calls.filter((c) => c.type.startsWith("screening-"))) {
    assert.equal(call.filters.mode, "robot-wait");
    assert.equal(call.filters.search, "ROBOT-A");
    assert.equal(call.context.roomCode, "001");
  }
  for (const [rx, mode, room, ward] of [
    ["STAT-A", "robot-wait", "001", "1"],
    ["CONT-DONE", "robot-wait", "001", "1"],
    ["ROBOT-A", "stat-wait", "001", "1"],
    ["ROBOT-A", "continue-finished", "001", "1"],
    ["ROBOT-A", "robot-wait", "002", "1"],
    ["ROBOT-A", "robot-wait", "001", "2"],
  ])
    assert.equal(
      (
        await send(
          root +
            "/prescriptions/" +
            rx +
            "?mode=" +
            mode +
            "&roomCode=" +
            room +
            "&wardCode=" +
            ward,
          { token },
        )
      ).status,
      404,
    );
  assert.equal(
    (await send(root + "/wards?mode=robot-wait&roomCode=002", { token })).body
      .context.roomCode,
    "002",
  );
  assert.equal(
    (await send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
  for (const path of [
    "/send-robot",
    "/generate",
    "/ocs-file",
    "/send-by-ward",
    "/print",
  ])
    for (const method of ["GET", "POST"])
      assert.equal(
        (await send(root + path + query, { token, method })).status,
        403,
      );
});
test("Robot unavailable and empty queues remain distinct at every level", async (t) => {
  const root = "/api/ipd/screening";
  const empty = await fixture(t, {
    getScreeningWards: async () => [],
    getScreeningPrescriptions: async () => [],
    getScreeningPrescription: async () => null,
  });
  const token = await empty.login();
  assert.deepEqual(
    (await empty.send(root + "/wards?mode=robot-wait", { token })).body.wards,
    [],
  );
  assert.deepEqual(
    (
      await empty.send(root + "/prescriptions?mode=robot-wait&wardCode=1", {
        token,
      })
    ).body.prescriptions,
    [],
  );
  assert.equal(
    (
      await empty.send(
        root + "/prescriptions/ROBOT-A?mode=robot-wait&wardCode=1",
        { token },
      )
    ).status,
    404,
  );
  const fail = async () => {
    throw Object.assign(new Error("private Robot source data"), {
      code: "ETIMEOUT",
    });
  };
  const failed = await fixture(t, {
    getScreeningWards: fail,
    getScreeningPrescriptions: fail,
    getScreeningPrescription: fail,
  });
  const failedToken = await failed.login();
  for (const path of ["/wards", "/prescriptions", "/prescriptions/ROBOT-A"]) {
    const response = await failed.send(
      root + path + "?mode=robot-wait&wardCode=1",
      { token: failedToken },
    );
    assert.equal(response.status, 503);
    assert.equal(response.body.items, undefined);
    assert.equal(response.body.wards, undefined);
    assert.equal(response.body.prescriptions, undefined);
    assert.ok(!JSON.stringify(response.body).includes("private Robot"));
  }
});

test("Robot defaults to all rooms and all wards with packets, while an explicit room still filters and other Screening modes retain their login scope", async (t) => {
  const source = [
    { code: "1", room: "001" },
    { code: "2", room: "002" },
    { code: "3", room: null },
  ];
  const seen = [];
  const f = await fixture(t, {
    getScreeningWards: async (context, filters) => {
      seen.push({ context, filters });
      return source
        .filter(
          (r) => context.roomCode === "all" || r.room === context.roomCode,
        )
        .map((r) => ({
          code: r.code,
          name: "Synthetic ward " + r.code,
          prescriptionCount: 1,
        }));
    },
    getScreeningPrescriptions: async (context, filters, wardCode) => {
      seen.push({ context, filters });
      return source
        .filter(
          (r) =>
            r.code === wardCode &&
            (context.roomCode === "all" || r.room === context.roomCode),
        )
        .map((r) => ({ prescriptionno: "DEMO-" + r.code, wardcode: r.code }));
    },
  });
  const token = await f.login();
  const root = "/api/ipd/screening";
  const all = await f.send(root + "/wards?mode=robot-wait", { token });
  assert.equal(all.status, 200);
  assert.equal(all.body.context.roomCode, "all");
  assert.deepEqual(
    all.body.wards.map((r) => r.code),
    ["1", "2", "3"],
  );
  for (const code of ["1", "2", "3"]) {
    const h = await f.send(
      root + "/prescriptions?mode=robot-wait&roomCode=all&wardCode=" + code,
      { token },
    );
    assert.equal(h.status, 200);
    assert.equal(h.body.prescriptions[0].wardcode, code);
  }
  const selected = await f.send(root + "/wards?mode=robot-wait&roomCode=002", {
    token,
  });
  assert.deepEqual(
    selected.body.wards.map((r) => r.code),
    ["2"],
  );
  assert.equal(
    (await f.send("/api/auth", { token })).body.context.roomCode,
    "001",
  );
  for (const mode of [
    "stat-wait",
    "stat-finished",
    "continue-wait",
    "continue-finished",
  ])
    assert.equal(
      (await f.send(root + "/wards?mode=" + mode + "&roomCode=all", { token }))
        .status,
      400,
    );
  assert.equal(
    (await f.send(root + "/wards?mode=stat-wait", { token })).body.context
      .roomCode,
    "001",
  );
  assert.ok(
    seen.some(
      (r) => r.context.roomCode === "all" && r.filters.mode === "robot-wait",
    ),
  );
});

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { defaultMedicationDate } = require("./services/ipdMedicationWindow");
const { validLabDate } = require("./services/ipdLabHistory");
const { screeningWindow, dayOffset } = require("./services/ipdScreening");
const { screeningAllWindow } = require("./services/ipdScreeningAll");
const { takeHomeWindow } = require("./services/ipdScreeningTakeHome");
const { checkoutWindow } = require("./services/ipdCheckout");
const { medTransferWindow } = require("./services/ipdMedTransfer");
const { reportAdrRoutes } = require("./routes/reportAdrRoutes");
const { reportIvAdmixtureRoutes } = require("./routes/reportIvAdmixtureRoutes");
const { reportMedTransferRoutes } = require("./routes/reportMedTransferRoutes");
const { reportPharmcareSummaryRoutes } = require("./routes/reportPharmcareSummaryRoutes");
const { reportWorkloadRoutes } = require("./routes/reportWorkloadRoutes");
const { reportRequisitionIpdRoutes } = require("./routes/reportRequisitionIpdRoutes");
const { reportRequisitionDcRoutes } = require("./routes/reportRequisitionDcRoutes");
const { reportRequisitionErRoutes } = require("./routes/reportRequisitionErRoutes");
const { reportRequisitionIvRoutes } = require("./routes/reportRequisitionIvRoutes");
const { reportRequisitionFixedStockRoutes } = require("./routes/reportRequisitionFixedStockRoutes");
const { reportRequisitionIvRadRoutes } = require("./routes/reportRequisitionIvRadRoutes");
const { reportRequisitionOpdRadRoutes } = require("./routes/reportRequisitionOpdRadRoutes");

const IPD_ROOMS = ["001", "010"];

function bangkokDate() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "1753-01-01" &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

function validCode(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 20;
}

function createApp({ repository, jwtSecret }) {
  if (!jwtSecret) throw new Error("JWT_SECRET is required");
  const app = express();
  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "16kb" }));
  // Container liveness only; no database reads or patient data.
  app.get("/healthz", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ status: "ok" });
  });
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  app.get("/api/login-options", async (_req, res, next) => {
    try {
      const options = await repository.getLoginOptions();
      res.json({
        rooms: options.rooms.filter((room) => IPD_ROOMS.includes(room.code)),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    const { username, password, roomCode } = req.body || {};
    if (
      typeof username !== "string" ||
      !username.trim() ||
      username.length > 100 ||
      typeof password !== "string" ||
      !password ||
      password.length > 100 ||
      !validCode(roomCode)
    ) {
      return res.status(400).json({
        message: "กรุณากรอกชื่อผู้ใช้ รหัสผ่าน และเลือกห้องยา",
      });
    }
    try {
      const user = await repository.findUser(username.trim());
      // Preserve existing Windows credentials without changing the database.
      if (!user || password !== user.password) {
        return res
          .status(401)
          .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
      const options = await repository.getLoginOptions();
      const room = options.rooms.find(
        (item) => item.code === roomCode && IPD_ROOMS.includes(item.code),
      );
      if (!room)
        return res.status(400).json({
          message: "ห้องยาที่เลือกไม่เปิดใช้งาน กรุณาเลือกใหม่",
        });
      const session = {
        user: {
          id: user.id,
          name: user.name,
          positionCode: user.positionCode,
          positionName: user.positionName,
        },
        context: {
          roomCode: room.code,
          roomName: room.name,
        },
        access: "ipd-readonly",
        version: 2,
      };
      const token = jwt.sign(session, jwtSecret, {
        algorithm: "HS256",
        expiresIn: "12h",
      });
      res.json({ token, session });
    } catch (error) {
      next(error);
    }
  });

  app.use(["/api", "/dose"], (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.get("Authorization") || "");
    if (!match) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
    try {
      const session = jwt.verify(match[1], jwtSecret, {
        algorithms: ["HS256"],
      });
      if (
        session.access !== "ipd-readonly" ||
        session.version !== 2 ||
        !session.user?.id ||
        !IPD_ROOMS.includes(session.context?.roomCode)
      ) {
        return res
          .status(401)
          .json({ message: "กรุณาเข้าสู่ระบบและเลือกห้องยาใหม่" });
      }
      req.session = session;
      next();
    } catch {
      res
        .status(401)
        .json({ message: "การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
    }
  });

  app.get("/api/auth", (req, res) => {
    const { user, context, access, version } = req.session;
    res.json({ user, context, access, version });
  });

  app.use('/api/reports/adr', reportAdrRoutes(repository));
  app.use('/api/reports/iv-admixture', reportIvAdmixtureRoutes(repository));
  app.use('/api/reports/med-transfer', reportMedTransferRoutes(repository));
  app.use('/api/reports/pharmcare-summary', reportPharmcareSummaryRoutes(repository));
  app.use('/api/reports/workload', reportWorkloadRoutes(repository));
  app.use('/api/reports/requisition-ipd', reportRequisitionIpdRoutes(repository));
  app.use('/api/reports/requisition-dc', reportRequisitionDcRoutes(repository));
  app.use('/api/reports/requisition-er', reportRequisitionErRoutes(repository));
  app.use('/api/reports/requisition-iv', reportRequisitionIvRoutes(repository));
  app.use('/api/reports/requisition-fixed-stock', reportRequisitionFixedStockRoutes(repository));
  app.use('/api/reports/requisition-ivrad', reportRequisitionIvRadRoutes(repository));
  app.use('/api/reports/requisition-opdrad', reportRequisitionOpdRadRoutes(repository));

  app.use("/api/ipd", (req, res, next) => {
    // IPD keeps its login pharmacy. Screening has its own validated room picker.
    for (const key of [
      "roomCode",
      "roomcode",
      "room",
      "selectroom",
      "wardcode",
      "ward",
    ]) {
      if (key === "roomCode" && req.path.startsWith("/screening/")) continue;
      if (req.query[key] !== undefined)
        return res.status(403).json({
          message: "เปลี่ยนห้องยาผ่านหน้าเข้าสู่ระบบ และเลือกวอร์ดในหน้า IPD",
        });
    }
    const orderdate = req.query.orderdate ?? bangkokDate();
    const ptstatus = req.query.ptstatus ?? "all";
    const search = req.query.search ?? "";
    const prescription = req.query.prescription ?? "all";
    if (
      !validDate(orderdate) ||
      !["all", "admit", "discharged"].includes(ptstatus) ||
      !["all", "with", "without"].includes(prescription) ||
      typeof search !== "string" ||
      search.length > 32
    ) {
      return res
        .status(400)
        .json({ message: "วันที่ สถานะผู้ป่วย หรือเลข AN ไม่ถูกต้อง" });
    }
    req.ipdFilters = {
      orderdate,
      ptstatus,
      search: search.trim(),
      prescription,
    };
    next();
  });

  app.get("/api/ipd/wards", async (req, res, next) => {
    try {
      const wards = await repository.getWards(req.ipdFilters);
      res.json({ wards, filters: req.ipdFilters });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/ipd/patients", async (req, res, next) => {
    if (!validCode(req.query.wardCode))
      return res.status(400).json({ message: "กรุณาเลือกวอร์ดในหน้า IPD" });
    try {
      const ward = await repository.findWard(req.query.wardCode);
      if (!ward)
        return res
          .status(400)
          .json({ message: "วอร์ดที่เลือกไม่เปิดใช้งาน กรุณาเลือกใหม่" });
      const context = {
        ...req.session.context,
        wardCode: ward.code,
        wardName: ward.name,
      };
      const filters = req.ipdFilters;
      const patients = await repository.getPatients(context, filters);
      res.json({
        context,
        filters,
        patients,
        patientCount: new Set(patients.map((patient) => patient.an)).size,
      });
    } catch (error) {
      next(error);
    }
  });

  const medTransferFilters = (req, res, next) => {
    const { orderdate } = req.ipdFilters;
    const transferStatus = req.query.transferStatus ?? "pending";
    const workdate = req.query.workdate;
    if (
      !["pending", "transferred"].includes(transferStatus) ||
      orderdate < "1753-01-02" ||
      orderdate > "9999-12-30" ||
      (workdate !== undefined &&
        (!validDate(workdate) ||
          ![orderdate, dayOffset(orderdate, -1)].includes(workdate))) ||
      (req.route.path.endsWith("/prescriptions") &&
        !validCode(req.query.wardCode)) ||
      ["hn", "HN", "an", "AN", "medtransferdatetime", "sql", "search"].some(
        (key) => req.query[key] !== undefined,
      )
    )
      return res
        .status(400)
        .json({ message: "วันที่ สถานะ หรือวอร์ด Med Transfer ไม่ถูกต้อง" });
    req.medTransferFilters = {
      orderdate,
      transferStatus,
      window: medTransferWindow(orderdate, workdate),
    };
    next();
  };
  app.get("/api/ipd/med-transfer/options", async (_req, res, next) => {
    try {
      res.json({ carts: await repository.getMedTransferCarts() });
    } catch (error) {
      next(error);
    }
  });
  app.get(
    "/api/ipd/med-transfer/wards",
    medTransferFilters,
    async (req, res, next) => {
      try {
        res.json({
          ...req.medTransferFilters,
          wards: await repository.getMedTransferWards(req.medTransferFilters),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/med-transfer/prescriptions",
    medTransferFilters,
    async (req, res, next) => {
      try {
        res.json({
          ...req.medTransferFilters,
          wardCode: req.query.wardCode,
          prescriptions: await repository.getMedTransferPrescriptions(
            req.medTransferFilters,
            req.query.wardCode,
          ),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/med-transfer/prescriptions/:prescriptionno",
    async (req, res, next) => {
      if (
        !/^[A-Za-z0-9-]{1,20}$/.test(req.params.prescriptionno) ||
        typeof req.query.cartName !== "string" ||
        !req.query.cartName.trim() ||
        req.query.cartName.length > 100 ||
        [
          "hn",
          "HN",
          "an",
          "AN",
          "medtransferdatetime",
          "sql",
          "transferStatus",
          "wardCode",
        ].some((key) => req.query[key] !== undefined)
      )
        return res
          .status(400)
          .json({ message: "กรุณาเลือกรถเข็นและระบุเลขที่ใบสั่งยาให้ถูกต้อง" });
      try {
        const lookup = await repository.getMedTransferPrescription(
          req.query.cartName,
          req.params.prescriptionno,
        );
        if (lookup.state === "invalid-cart")
          return res
            .status(400)
            .json({ message: "ไม่พบข้อมูลรถเข็น กรุณาเลือกใหม่" });
        res.json({ prescriptionno: req.params.prescriptionno, ...lookup });
      } catch (error) {
        if (error.code === "MED_TRANSFER_AMBIGUOUS_PATIENT")
          return res
            .status(409)
            .json({
              message:
                "เลขใบสั่งยานี้มีข้อมูลผู้ป่วยมากกว่าหนึ่งราย กรุณาตรวจสอบเลขใบ",
            });
        next(error);
      }
    },
  );

  const checkoutFilters = (req, res, next) => {
    const { orderdate, search } = req.ipdFilters;
    const checkoutStatus = req.query.checkoutStatus ?? "pending";
    const workdate = req.query.workdate;
    if (
      !["pending", "finished", "all"].includes(checkoutStatus) ||
      orderdate < "1753-01-02" ||
      orderdate > "9999-12-30" ||
      (workdate !== undefined &&
        (!validDate(workdate) ||
          ![orderdate, dayOffset(orderdate, -1)].includes(workdate))) ||
      ["an", "hn", "AN", "HN", "checkoutuserid", "completed", "sql"].some(
        (key) => req.query[key] !== undefined,
      ) ||
      (req.route.path.includes("/prescriptions") &&
        !validCode(req.query.wardCode)) ||
      (req.params.prescriptionno !== undefined &&
        (!/^[A-Za-z0-9-]{1,20}$/.test(req.params.prescriptionno) ||
          typeof req.query.headerKey !== "string" ||
          !/^[A-Za-z0-9_-]{1,1024}$/.test(req.query.headerKey)))
    )
      return res
        .status(400)
        .json({ message: "วันที่ สถานะ หรือบริบท Check out ไม่ถูกต้อง" });
    req.checkoutFilters = {
      orderdate,
      search,
      checkoutStatus,
      window: checkoutWindow(orderdate, workdate),
    };
    next();
  };
  app.get(
    "/api/ipd/checkout/wards",
    checkoutFilters,
    async (req, res, next) => {
      try {
        res.json({
          ...req.checkoutFilters,
          wards: await repository.getCheckoutWards(req.checkoutFilters),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/checkout/prescriptions",
    checkoutFilters,
    async (req, res, next) => {
      try {
        res.json({
          ...req.checkoutFilters,
          wardCode: req.query.wardCode,
          prescriptions: await repository.getCheckoutPrescriptions(
            req.checkoutFilters,
            req.query.wardCode,
          ),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/checkout/prescriptions/:prescriptionno",
    checkoutFilters,
    async (req, res, next) => {
      try {
        const detail = await repository.getCheckoutDetail(
          req.checkoutFilters,
          req.query.wardCode,
          req.params.prescriptionno,
          req.query.headerKey,
        );
        if (!detail)
          return res.status(404).json({
            message:
              "ไม่พบใบสั่งยาในเงื่อนไข Check out ที่เลือก กรุณาโหลดรายการใหม่",
          });
        res.json({ ...req.checkoutFilters, ...detail });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get("/api/ipd/screening/options", async (_req, res, next) => {
    try {
      res.json({ rooms: await repository.getScreeningRooms() });
    } catch (error) {
      next(error);
    }
  });

  const screeningFilters = async (req, res, next) => {
    const orderdate = req.ipdFilters.orderdate;
    const workdate = req.query.workdate;
    if (
      (req.query.mode !== undefined &&
        ![
          "stat-wait",
          "stat-finished",
          "continue-wait",
          "continue-finished",
          "robot-wait",
          "screen-all",
          "take-home-wait",
          "take-home-finished",
        ].includes(req.query.mode)) ||
      orderdate < "1753-01-02" ||
      orderdate > "9999-12-30" ||
      (workdate !== undefined &&
        (!validDate(workdate) ||
          ![orderdate, dayOffset(orderdate, -1)].includes(workdate)))
    )
      return res
        .status(400)
        .json({ message: "โหมดหรือวันที่ Screening ไม่ถูกต้อง" });
    const isAll = req.query.mode === "screen-all";
    const screenStatus = req.query.screenStatus ?? "pending";
    const orderType = req.query.orderType ?? "all";
    if (
      (isAll &&
        (!["pending", "screened", "all"].includes(screenStatus) ||
          !["all", "0", "1", "3", "stat"].includes(orderType))) ||
      (!isAll &&
        (req.query.screenStatus !== undefined ||
          req.query.orderType !== undefined))
    )
      return res
        .status(400)
        .json({ message: "ตัวกรองสถานะหรือประเภท Screening ไม่ถูกต้อง" });
    if (
      [
        "hn",
        "HN",
        "an",
        "AN",
        "patientId",
        "selectroom",
        "fromlocationname",
      ].some((key) => req.query[key] !== undefined)
    )
      return res.status(400).json({ message: "เลือกบริบทจากรายการ Screening" });
    if (
      (req.route.path.includes("/prescriptions") &&
        !(
          isAll &&
          req.params.prescriptionno === undefined &&
          req.query.wardCode === undefined
        ) &&
        !validCode(req.query.wardCode)) ||
      (req.params.prescriptionno !== undefined &&
        !/^[A-Za-z0-9-]{1,20}$/.test(req.params.prescriptionno))
    )
      return res
        .status(400)
        .json({ message: "รหัสวอร์ดหรือใบสั่งยาไม่ถูกต้อง" });
    const supportsAllRooms = [
      "robot-wait",
      "take-home-wait",
      "take-home-finished",
    ].includes(req.query.mode);
    const roomCode =
      req.query.roomCode ??
      (supportsAllRooms ? "all" : req.session.context.roomCode);
    if (!validCode(roomCode))
      return res
        .status(400)
        .json({ message: "รหัสห้องยา Screening ไม่ถูกต้อง" });
    try {
      const room =
        supportsAllRooms && roomCode === "all"
          ? { code: "all", name: "ทุกห้องยา" }
          : await repository.findScreeningRoom(roomCode);
      if (!room)
        return res
          .status(400)
          .json({ message: "ไม่พบห้องยา Screening ที่เลือก กรุณาเลือกใหม่" });
      req.screeningContext = { roomCode: room.code, roomName: room.name };
    } catch (error) {
      return next(error);
    }
    req.screeningFilters = {
      orderdate,
      search: req.ipdFilters.search,
      mode: req.query.mode ?? "stat-wait",
      ...(isAll ? { screenStatus, orderType } : {}),
      window: (isAll
        ? screeningAllWindow
        : ["take-home-wait", "take-home-finished"].includes(req.query.mode)
          ? takeHomeWindow
          : screeningWindow)(orderdate, workdate),
    };
    next();
  };

  app.get(
    "/api/ipd/screening/wards",
    screeningFilters,
    async (req, res, next) => {
      try {
        res.json({
          ...req.screeningFilters,
          context: req.screeningContext,
          wards: await repository.getScreeningWards(
            req.screeningContext,
            req.screeningFilters,
          ),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/screening/prescriptions",
    screeningFilters,
    async (req, res, next) => {
      try {
        res.json({
          ...req.screeningFilters,
          context: req.screeningContext,
          wardCode: req.query.wardCode,
          prescriptions: await repository.getScreeningPrescriptions(
            req.screeningContext,
            req.screeningFilters,
            req.query.wardCode,
          ),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/screening/prescriptions/:prescriptionno",
    screeningFilters,
    async (req, res, next) => {
      try {
        const detail = await repository.getScreeningPrescription(
          req.screeningContext,
          req.screeningFilters,
          req.query.wardCode,
          req.params.prescriptionno,
        );
        if (!detail)
          return res.status(404).json({
            message:
              "ไม่พบใบสั่งยาตามสถานะ ห้องยา และวันที่ที่เลือก กรุณาโหลดใหม่",
          });
        res.json({
          ...req.screeningFilters,
          context: req.screeningContext,
          wardCode: req.query.wardCode,
          ...detail,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const resolvePatient = async (req, res, next) => {
    if (
      !/^[A-Za-z0-9-]{1,32}$/.test(req.params.an) ||
      !validCode(req.query.wardCode)
    )
      return res
        .status(400)
        .json({ message: "รหัสผู้ป่วยหรือวอร์ดไม่ถูกต้อง" });
    if (["hn", "HN", "patientId"].some((key) => req.query[key] !== undefined))
      return res
        .status(400)
        .json({ message: "เปิดข้อมูลด้วย AN ที่เลือกจากรายการผู้ป่วย" });
    try {
      const context = { ...req.session.context, wardCode: req.query.wardCode };
      const patient = await repository.getPatientSummary(
        context,
        req.params.an,
        req.ipdFilters.orderdate,
        { includeClinical: req.route.path === "/api/ipd/patients/:an" },
      );
      if (!patient)
        return res.status(404).json({
          message:
            "ไม่พบผู้ป่วยในวอร์ดนี้ หรือผู้ป่วยย้ายวอร์ดแล้ว กรุณาโหลดรายการใหม่",
        });
      req.patient = patient;
      next();
    } catch (error) {
      next(error);
    }
  };

  app.get("/api/ipd/patients/:an", resolvePatient, (req, res) => {
    res.json({
      patient: req.patient,
      context: {
        ...req.session.context,
        wardCode: req.patient.wardcode,
        wardName: req.patient.warddesc,
      },
      orderdate: req.ipdFilters.orderdate,
      medicationDate: defaultMedicationDate(req.ipdFilters.orderdate),
    });
  });

  app.get(
    "/api/ipd/patients/:an/medications",
    (req, res, next) => {
      const workdate =
        req.query.workdate ?? defaultMedicationDate(req.ipdFilters.orderdate);
      const category = req.query.category ?? "IPD";
      const includeOff = req.query.includeOff ?? "false";
      if (
        !validDate(workdate) ||
        workdate < "1753-01-02" ||
        workdate > "9999-12-30" ||
        !["IPD", "IV", "Chemo", "TPN"].includes(category) ||
        !["true", "false"].includes(includeOff)
      )
        return res
          .status(400)
          .json({ message: "วันที่รอบยา ห้องยา หรือตัวกรอง Off ไม่ถูกต้อง" });
      req.medicationFilters = {
        workdate,
        category,
        includeOff: includeOff === "true",
      };
      next();
    },
    resolvePatient,
    async (req, res, next) => {
      try {
        const result = await repository.getPatientMedications(
          req.patient,
          req.medicationFilters,
        );
        res.json({
          an: req.patient.an,
          wardCode: req.patient.wardcode,
          ...result,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  for (const [resource, method] of [
    ["labs", "getPatientLabs"],
    ["allergies", "getPatientAllergies"],
    ["notes", "getPatientNotes"],
    ["drug-interactions", "getPatientInteractions"],
    ["operating-room-alert", "getPatientOperatingRoomAlert"],
  ]) {
    app.get(
      `/api/ipd/patients/:an/${resource}`,
      resolvePatient,
      async (req, res, next) => {
        try {
          const rows = await repository[method](req.patient);
          res.json({
            an: req.patient.an,
            wardCode: req.patient.wardcode,
            [resource]: rows,
          });
        } catch (error) {
          next(error);
        }
      },
    );
  }

  app.get(
    "/api/ipd/patients/:an/prescription-dates",
    resolvePatient,
    async (req, res, next) => {
      try {
        res.json({
          an: req.patient.an,
          dates: await repository.getPrescriptionDates(req.patient),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const labHistoryFilters = (req, res, next) => {
    const today = bangkokDate();
    const weekAgo = new Date(Date.parse(today) - 7 * 86400000)
      .toISOString()
      .slice(0, 10);
    const from = req.query.from ?? weekAgo;
    const to = req.query.to ?? today;
    const date = req.query.date;
    if (
      !validLabDate(from) ||
      !validLabDate(to) ||
      from > to ||
      (req.route.path.endsWith("/results") &&
        (!validLabDate(date) || date < from || date > to))
    )
      return res
        .status(400)
        .json({ message: "วันที่หรือช่วงวันที่ LAB ไม่ถูกต้อง" });
    req.labHistoryFilters = {
      from,
      to,
      ...(date !== undefined ? { date } : {}),
    };
    next();
  };
  for (const [resource, method] of [
    ["dates", "getPatientLabDates"],
    ["results", "getPatientLabResults"],
  ]) {
    app.get(
      `/api/ipd/patients/:an/lab-history/${resource}`,
      labHistoryFilters,
      resolvePatient,
      async (req, res) => {
        try {
          const rows = await repository[method](
            req.patient,
            req.labHistoryFilters,
          );
          res.json({
            an: req.patient.an,
            ...req.labHistoryFilters,
            [resource === "dates" ? "dates" : "items"]: rows,
          });
        } catch (error) {
          console.error(
            "LAB history read failed:",
            error.code || error.name || "Error",
          );
          res.status(503).json({
            message:
              error.code === "LAB_NOT_CONFIGURED"
                ? "ยังไม่ได้ตั้งค่าการเชื่อมต่อประวัติ LAB ที่เซิร์ฟเวอร์"
                : "เชื่อมต่อประวัติ LAB ไม่ได้ กรุณาลองใหม่เมื่อเซิร์ฟเวอร์เข้าถึง MySQL ภายในโรงพยาบาลได้",
          });
        }
      },
    );
  }

  const prescriptionFilters = (req, res, next) => {
    const workdate =
      req.query.workdate ?? defaultMedicationDate(req.ipdFilters.orderdate);
    if (
      !validDate(workdate) ||
      workdate < "1753-01-02" ||
      workdate > "9999-12-30" ||
      (req.params.prescriptionno !== undefined &&
        !/^[A-Za-z0-9-]{1,20}$/.test(req.params.prescriptionno))
    )
      return res
        .status(400)
        .json({ message: "วันที่หรือเลขที่ใบสั่งยาไม่ถูกต้อง" });
    req.prescriptionWorkdate = workdate;
    next();
  };

  app.get(
    "/api/ipd/patients/:an/prescriptions",
    prescriptionFilters,
    resolvePatient,
    async (req, res, next) => {
      try {
        res.json({
          an: req.patient.an,
          ...(await repository.getPatientPrescriptions(
            req.patient,
            req.prescriptionWorkdate,
          )),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/patients/:an/prescriptions/:prescriptionno",
    prescriptionFilters,
    resolvePatient,
    async (req, res, next) => {
      try {
        const result = await repository.getPatientPrescription(
          req.patient,
          req.params.prescriptionno,
          req.prescriptionWorkdate,
        );
        if (!result)
          return res.status(404).json({
            message: "ไม่พบใบสั่งยาของผู้ป่วยในวันที่เลือก กรุณาโหลดรายการใหม่",
          });
        res.json({ an: req.patient.an, ...result });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get(
    "/api/ipd/patients/:an/drug-profile",
    (req, res, next) => {
      const from = req.query.from ?? req.ipdFilters.orderdate;
      const to = req.query.to ?? from;
      if (!validDate(from) || !validDate(to) || from > to)
        return res
          .status(400)
          .json({ message: "ช่วงวันที่ Drug Profile ไม่ถูกต้อง" });
      req.drugProfileFilters = { from, to };
      next();
    },
    resolvePatient,
    async (req, res, next) => {
      try {
        res.json({
          an: req.patient.an,
          ...(await repository.getPatientDrugProfile(
            req.patient,
            req.drugProfileFilters,
          )),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const reconcileFilters = (req, res, next) => {
    if (!["OPD", "IPD", "MRC"].includes(req.params.source))
      return res.status(400).json({ message: "แหล่งประวัติยาไม่ถูกต้อง" });
    if (req.route.path.endsWith("/items")) {
      const { historyId, historyDate } = req.query;
      if (
        typeof historyId !== "string" ||
        !/^[A-Za-z0-9-]{1,32}$/.test(historyId) ||
        !validDate(historyDate) ||
        historyDate > "9999-12-30"
      )
        return res
          .status(400)
          .json({ message: "วันที่หรือรหัสประวัติยาไม่ถูกต้อง" });
      req.reconcileSelection = { historyId, historyDate };
    }
    next();
  };
  app.get(
    "/api/ipd/patients/:an/reconcile/:source",
    reconcileFilters,
    resolvePatient,
    async (req, res, next) => {
      try {
        res.json({
          an: req.patient.an,
          source: req.params.source,
          history: await repository.getReconcileHistory(
            req.patient,
            req.params.source,
          ),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/patients/:an/reconcile/:source/items",
    reconcileFilters,
    resolvePatient,
    async (req, res, next) => {
      try {
        const result = await repository.getReconcileItems(
          req.patient,
          req.params.source,
          req.reconcileSelection,
        );
        if (!result)
          return res.status(404).json({
            message:
              "ไม่พบประวัติยาของผู้ป่วยตามรายการที่เลือก กรุณาโหลดประวัติใหม่",
          });
        res.json({
          an: req.patient.an,
          source: req.params.source,
          ...req.reconcileSelection,
          ...result,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get(
    "/api/ipd/patients/:an/pharmcare/events",
    resolvePatient,
    async (req, res, next) => {
      try {
        res.json({
          an: req.patient.an,
          events: await repository.getPatientPharmcareEvents(req.patient),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/patients/:an/pharmcare/events/:orderNo/:resource",
    (req, res, next) => {
      if (
        !/^[A-Za-z0-9-]{1,32}$/.test(req.params.orderNo) ||
        !["drp", "due", "side-effects", "me"].includes(req.params.resource)
      )
        return res
          .status(400)
          .json({ message: "เหตุการณ์หรือประเภทข้อมูล ME/DRP ไม่ถูกต้อง" });
      next();
    },
    resolvePatient,
    async (req, res, next) => {
      try {
        const result = await repository.getPatientPharmcareRecords(
          req.patient,
          req.params.orderNo,
          req.params.resource,
        );
        if (!result)
          return res.status(404).json({
            message: "ไม่พบเหตุการณ์ของผู้ป่วยนี้ กรุณาโหลดประวัติใหม่",
          });
        res.json({
          an: req.patient.an,
          resource: req.params.resource,
          ...result,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get(
    "/api/ipd/patients/:an/pharmacist-notes",
    resolvePatient,
    async (req, res, next) => {
      try {
        res.json({
          an: req.patient.an,
          notes: await repository.getPatientPharmacistNotes(req.patient),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    "/api/ipd/patients/:an/pharmacist-notes/:noteId",
    (req, res, next) => {
      if (!/^[A-Za-z0-9-]{1,20}$/.test(req.params.noteId))
        return res.status(400).json({ message: "รหัสบันทึกเภสัชกรไม่ถูกต้อง" });
      next();
    },
    resolvePatient,
    async (req, res, next) => {
      try {
        const note = await repository.getPatientPharmacistNote(
          req.patient,
          req.params.noteId,
        );
        if (!note)
          return res
            .status(404)
            .json({ message: "ไม่พบบันทึกของผู้ป่วยนี้ กรุณาโหลดประวัติใหม่" });
        res.json({ an: req.patient.an, note });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get(
    "/api/ipd/patients/:an/ihos-due",
    resolvePatient,
    async (req, res, next) => {
      try {
        res.json({
          an: req.patient.an,
          items: await repository.getPatientIhosDue(req.patient),
        });
      } catch (error) {
        const messages = {
          IHOS_DUE_NOT_CONFIGURED:
            "ยังไม่ได้ตั้งค่าการเชื่อมต่อ IHOS DUE ที่เซิร์ฟเวอร์",
          IHOS_DUE_UNAVAILABLE:
            "เชื่อมต่อ IHOS DUE ของโรงพยาบาลไม่ได้ กรุณาลองใหม่เมื่อเซิร์ฟเวอร์เข้าถึงระบบโรงพยาบาลได้",
          IHOS_DUE_INVALID_RESPONSE:
            "ข้อมูลตอบกลับจาก IHOS DUE ไม่ตรงรูปแบบ กรุณาลองใหม่หรือตรวจสอบแหล่งข้อมูล",
        };
        if (Object.hasOwn(messages, error.code || ""))
          return res.status(503).json({ message: messages[error.code] });
        next(error);
      }
    },
  );

  // Do not mount legacy routers that contain writes or hardware actions in this viewer.
  app.use(["/api", "/dose"], (_req, res) =>
    res.status(403).json({ message: "ระบบนี้เปิดให้ดูข้อมูล IPD เท่านั้น" }),
  );
  app.use((error, req, res, _next) => {
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ message: "รูปแบบคำขอไม่ถูกต้อง" });
    console.error(
      "IPD viewer request failed:",
      error.code || error.name || "Error",
    );
    if (req.path.startsWith('/api/reports/requisition-') && error.code === 'ETIMEOUT')
      return res.status(504).json({ message: 'การรวมข้อมูลใบเบิกใช้เวลาเกินกำหนด กรุณาลองใหม่หรือลดช่วงวันที่' });
    res.status(503).json({ message: "เชื่อมต่อข้อมูลไม่ได้ กรุณาลองใหม่" });
  });
  return app;
}

module.exports = { createApp };

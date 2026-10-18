// back/routes/userRoutes.js
// Path DB ประวัติใช้ยาChemo //  192.168.0.201/data/data/ctx/Data/ctx.dbc

const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authenticateJWT.js");
const { first, second } = require("../services/first.js");
// const { second } = require("../services/second.js");

const { checkdispens } = require("../services/checkdispens.js");
const { screen } = require("../services/screen.js");
const {
  screenstatFinish1,
} = require("../services/screen/screenstatFinish1.js");
const {
  screenstatFinish2,
} = require("../services/screen/screenstatFinish2.js");
const {
  screenStat_Finish_1,
} = require("../services/screen/screenStat_Finish_1.js");
const {
  screenStat_Finish_2,
} = require("../services/screen/screenStat_Finish_2.js");

const { screentwo } = require("../services/screentwo.js");
const { screenthree } = require("../services/screenthree.js");
const { profile } = require("../services/profile.js");
const {
  ucHouse,
  stockHouse,
  balancestockHouse,
  filterStockByDate,
  Exp,
} = require("../services/ucHouse.js");
const { test } = require("../services/dockertest.js");

const { medIPD } = require("../services/medicationProfile/med.js"); // IPD IV TPN Chemo
const {
  createMedIPD,
} = require("../services/medicationProfile/createMedIPD.js"); // IPD IV TPN Chemo

// const { medIV } = require("../services/medicationProfile/iv.js");

const { labResult, noteDrp } = require("../services/medicationProfile/lab.js");

const {
  Profile_private_an,
  Profile_private_hn,
} = require("../services/medicationProfile/Profile_from_an_hn.js");
const { mainMed } = require("../services/settingMed/mainMed.js");
const { grouplocation } = require("../services/settingMed/grouplocation.js");
const { howuse } = require("../services/settingMed/howuse.js");
const { f5createorder } = require("../services/funtion/f5createorder.js");
// const { drugallergy } = require("../services/drugallergy.js");
const { btnsearch } = require("../services/btnsearch.js");
const {
  screen_TakeHome_1,
} = require("../services/screen/screen_TakeHome_1.js");
const {
  screen_TakeHome_2,
} = require("../services/screen/screen_TakeHome_2.js");
const {
  screen_TakeHome_Finish_1,
} = require("../services/screen/screen_TakeHome_Finish_1.js");
const {
  screen_TakeHome_Finish_2,
} = require("../services/screen/screen_TakeHome_Finish_2.js");
const { screen_Wait_1 } = require("../services/screen/screen_Wait_1.js");
const { screen_Wait_2 } = require("../services/screen/screen_Wait_2.js");
const { screenStat_1 } = require("../services/screen/screenStat_1.js");
const { screenStat_2 } = require("../services/screen/screenStat_2.js");
``;
const {
  screen_Send_Robot_1,
} = require("../services/screen/screen_Send_Robot_1.js");
const {
  screen_Send_Robot_2,
} = require("../services/screen/screen_Send_Robot_2.js");

// const {  } = require("../services/Profile/Lab/");

router.post("/register", register);
router.post("/login", login);
router.get("/auth", authenticateJWT, (req, res, next) => {
  res.json({ msg: "Token Check" });
});
router.post("/first", first);
router.post("/second", second);
// router.post("/doubleClickIPDProfile", doubleClickIPDProfile);

// router.post("/room", room);
router.post("/screen", screen);
router.post("/screentwo", screentwo);
router.post("/screenthree", screenthree);
router.post("/screenstatFinish1", screenstatFinish1); // 280
router.post("/screenstatFinish2", screenstatFinish2);
router.post("/screenStat_Finish_1", screenStat_Finish_1); // one day 529
router.post("/screenStat_Finish_2", screenStat_Finish_2);
router.post("/screen_TakeHome_1", screen_TakeHome_1);
router.post("/screen_TakeHome_2", screen_TakeHome_2);
router.post("/screen_TakeHome_Finish_1", screen_TakeHome_Finish_1);
router.post("/screen_TakeHome_Finish_2", screen_TakeHome_Finish_2);
router.post("/screen_Wait_1", screen_Wait_1);
router.post("/screen_Wait_2", screen_Wait_2);
router.post("/screenStat_1", screenStat_1); // 256
router.post("/screenStat_2", screenStat_2);
router.post("/screen_Send_Robot_1", screen_Send_Robot_1);
router.post("/screen_Send_Robot_2", screen_Send_Robot_2);
// router.post("/profile", profile);

router.post("/ucHouse", ucHouse);
router.post("/stockHouse", stockHouse);
router.post("/balancestockHouse", balancestockHouse);
router.post("/filterStockByDate", filterStockByDate);
router.post("/Exp", Exp);
router.get("/test", test);
router.post("/checkdispens", checkdispens);

// router.post("/Profile/:an", Profile);
// router.post("/Profile_private", Profile_private);

router.post("/btnsearch", btnsearch);

router.post("/medIPD", medIPD); // ข้อมูลส่วนของ L M C T V
// router.post("/createMedIPD", createMedIPD);
// router.post("/medIV", medIV); // ข้อมูลส่วนของ L M C T V

router.post("/labResult", labResult);
router.post("/noteDrp", noteDrp);

router.post("/Profile_private_an", Profile_private_an);
router.post("/Profile_private_hn", Profile_private_hn);

router.post("/mainMed", mainMed);
router.post("/grouplocation", grouplocation);
// router.post("/howuse", howuse);
router.post("/f5createorder", f5createorder);

// router.post("/drugallergy", drugallergy); //ป็อปอัพแจ้งเตือนแพ้ยา

// const { pool, poolConnect, sql } = require("../models/db"); // นำเข้า pool และ poolConnect
// router.get("/private-lab-result", async (req, res) => {
//   await poolConnect; // รอจนกระทั่งเชื่อมต่อเสร็จสมบูรณ์

//   try {
//     const request = pool.request(); // สร้างคำขอเพื่อ query ข้อมูล
//     const result = await request.query(
//       "SELECT * FROM ms_privatelabresult WHERE an = '6727582'"
//     );

//     res.status(200).json(result.recordset); // ส่งข้อมูลกลับในรูปแบบ JSON
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("Server error");
//   }
// });

module.exports = router;

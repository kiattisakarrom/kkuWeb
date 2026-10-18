const express = require("express");
const router = express.Router();
const doseController = require("../controllers/doseController");
const doseModal = require("../models/doseModal");
//(url+/dose/.....)
//------------------------หน้า F5 คีย์ยา---------------------------------------------
router.get("/getDoseBySearch", doseController.getSearch); // ค้นหาชื่อยา ที่หน้าเพิ่มรายการยา [chkKeydrug ,txtorderitemname]
router.get("/getDiluentname", doseController.getDiluentname); // ค้นหาตัวทำละลาย { txtdiluentname, diluentnameID }
router.get("/getDoseUnit", doseController.getDosageUnit); // หน่วยของยา และหน่ยอของตัวทำละลาย { txtNameUnit }
router.get("/getInstruction", doseController.getInstructionController); // วิธีใช้ยา { txtInstructionName }
router.get("/getFrequency", doseController.getFrequencyController); // ความถี่ { txtFrequencycode }
router.get("/getTimeCode", doseController.getTimeCodeController); // เวลา { txttimecode }
router.get("/getOrderUnit", doseController.getOrderUnitController); // หน่วย { txtOrderUnit }

//---------------------------API ที่ใช้เยอะในการหาข้อมูลยาจากรหัส---------------------------------------
router.get("/getUnitByID", doseController.dtdosageunit); // หน่วย { txtOrderUnit }
router.get("/getOrderUnitByID", doseController.dtOrderUnitController); // หน่วย { txtOrderUnit }

//------------------------หน้า Setting จัดการข้อมูลยา----------------------------------
router.get(
  "/getSearchDoseManager",
  doseController.getShearchDrugListController
);
router.get("/getDrugById", doseController.getDrugByIdController); //ค้นหายาจากรหัส {drugID}
router.get("/get_ms_Instruction", doseController.get_ms_Instruction);
router.get("/get_ms_frequency_code", doseController.get_ms_frequency_code); // ความถี่ { txtSearch }
router.get("/get_ms_time_code", doseController.get_ms_time_code); // เวลา { txtSearch, checkboxStatus }
router.get("/get_ms_drug", doseController.get_ms_drug); // ค้นหา { txtSearch } / array ของ object หน้า TMT MainTMT.jsx
router.get("/get_ms_druginteraction", doseController.get_ms_druginteraction); // ค้นหา { txtSearch }
router.get("/get_ms_dosageunit", doseController.get_ms_dosageunit); // ค้นหา { txtSearch }
router.get("/get_ms_orderunit", doseController.get_ms_orderunit); // ค้นหา { txtSearch }
router.get("/show_Searchdrug", doseController.show_Searchdrug); // ค้นหา { txtSearch } / recordset  MainPharmocology.jsx หน้า ผูกวิธีใช้กับยา MainLinkHowUseDrug.jsx หน้า ผูกยากับสิทธิ์ห้ามใช้ MainLinkDontUse.jsx หน้า MainPharmocology
router.get("/show_SearchDrugUsage", doseModal.show_SearchDrugUsage); // ค้นหา { txtSearch } / array ของ object หน้า ผูกวิธีใช้ MainLinkHowUse.jsx
router.get("/get_ms_allergygroup", doseController.get_ms_allergygroup); // ค้นหา { txtSearch } / array ของ object หน้า กลุ่มแพ้ยา MainAllergyGroup.jsx
router.get("/show_ms_approvetype", doseController.show_ms_approvetype); // ค้นหา { txtSearch } / array ของ object หน้า ประเภทยาตามระเบียบPTC MainApprovetypePTC.jsx
router.get("/get_drugname", doseController.get_drugname); // ค้นหา { txtSearch } / array ของ object หน้า MAP รหัสยาโปรแกรม Unitdose.jsx

module.exports = router;

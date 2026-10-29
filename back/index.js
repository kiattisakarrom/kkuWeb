require("dotenv").config();
const { createApp } = require("./app");
const repository = {
  ...require("./repositories/ipdReadRepository"),
  ...require("./repositories/ipdPatientRepository"),
  ...require("./repositories/ipdPrescriptionRepository"),
  ...require("./repositories/ipdReconcileRepository"),
  ...require("./repositories/ipdDrugProfileRepository"),
  ...require("./repositories/ipdPharmcareRepository"),
  ...require("./repositories/ipdPharmacistNoteRepository"),
  ...require("./repositories/ipdIhosDueRepository"),
  ...require("./repositories/ipdLabHistoryRepository"),
  ...require("./repositories/ipdScreeningRepository"),
  ...require("./repositories/ipdCheckoutRepository"),
  ...require("./repositories/ipdMedTransferRepository"),
  ...require("./repositories/reportAdrRepository"),
  ...require("./repositories/reportIvAdmixtureRepository"),
  ...require("./repositories/reportMedTransferRepository"),
  ...require("./repositories/reportPharmcareSummaryRepository"),
  ...require("./repositories/reportWorkloadRepository"),
  ...require("./repositories/reportRequisitionIpdRepository"),
  ...require("./repositories/reportRequisitionDcRepository"),
  ...require("./repositories/reportRequisitionErRepository"),
  ...require("./repositories/reportRequisitionIvRepository"),
  ...require("./repositories/reportRequisitionFixedStockRepository"),
  ...require("./repositories/reportRequisitionIvRadRepository"),
  ...require("./repositories/reportRequisitionOpdRadRepository"),
};
const app = createApp({ repository, jwtSecret: process.env.JWT_SECRET });
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`IPD read-only server is running on port ${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the existing backend before running npm start again.`,
    );
  } else {
    console.error("Unable to start the IPD server:", error);
  }
  process.exit(1);
});

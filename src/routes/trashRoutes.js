const express = require("express");
const router = express.Router();
const trashController = require("../controllers/trashController");
const upload = require("../config/multer");

// Define routes for trash features
router.post("/predict", upload.single("image"), trashController.predictTrash);
router.get("/history", trashController.getHistory);

module.exports = router;

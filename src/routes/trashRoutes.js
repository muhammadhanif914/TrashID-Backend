const express = require("express");
const router = express.Router();
const trashController = require("../controllers/trashController");

// Define routes for trash features
router.post("/predict", trashController.predictTrash);
router.get("/history", trashController.getHistory);

module.exports = router;

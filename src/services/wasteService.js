const WasteScan = require("../models/WasteScan");
const mlService = require("./mlService");

const EDUCATION_MAP = {
  organik: "Buang ke kompos",
  anorganik: "Daur ulang",
  residu: "Buang ke TPA",
};

exports.processImageScan = async (image, userId) => {
  const mlResult = await mlService.predict(image);
  const classification = (mlResult.prediction || "").toLowerCase();
  const confidence = Math.round((mlResult.confidence || 0) * 100);
  const edukasi = EDUCATION_MAP[classification] || "Kategori tidak dikenal";

  const newScan = await WasteScan.create({
    user_id: userId,
    image: image,
    classification: classification,
    confidence: confidence,
  });

  return {
    scanData: newScan,
    edukasi: edukasi,
  };
};

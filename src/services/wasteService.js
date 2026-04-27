const WasteScan = require("../models/WasteScan");

exports.processImageScan = async (image, userId) => {
  // Simulasi ML Model
  const classifications = ["organik", "anorganik", "residu"];
  const classification =
    classifications[Math.floor(Math.random() * classifications.length)];
  const confidence = Math.floor(Math.random() * 26) + 70; // Random 70 - 95

  // Tentukan edukasi
  let edukasi = "";
  switch (classification) {
    case "organik":
      edukasi = "Buang ke kompos";
      break;
    case "anorganik":
      edukasi = "Daur ulang";
      break;
    case "residu":
      edukasi = "Buang ke TPA";
      break;
  }

  // Simpan riwayat scan
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

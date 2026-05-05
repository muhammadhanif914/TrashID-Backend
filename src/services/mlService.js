/**
 * Service ini menangani logika pemanggilan model Machine Learning.
 * Memanggil Python Flask API untuk inference pada model Keras.
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5000";
const ML_TIMEOUT = 30000; // 30 seconds

// Deskripsi untuk setiap kategori sampah
const CLASS_DESCRIPTIONS = {
  'Anorganik': 'Sampah anorganik seperti plastik, logam, kaca yang dapat didaur ulang.',
  'Organik': 'Sampah organik seperti sisa makanan, daun, kulit buah yang bisa dijadikan kompos.',
  'Residu': 'Sampah residu yang sulit didaur ulang dan perlu penanganan khusus.'
};

/**
 * Classify image menggunakan Python ML Service
 * @param {string} imagePath - Path ke file gambar
 * @returns {Promise<Object>} - Hasil klasifikasi
 */
exports.predict = async (imagePath) => {
  try {
    const formData = new FormData();

    // Cek apakah imagePath adalah URL (seperti dari Cloudinary) atau path file lokal
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      // Ambil file dari URL
      const imageResponse = await axios.get(imagePath, {
        responseType: "stream",
      });
      formData.append("image", imageResponse.data, "image.jpg");
    } else {
      // File lokal
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }
      const fileStream = fs.createReadStream(imagePath);
      formData.append("image", fileStream);
    }

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: formData.getHeaders(),
      timeout: ML_TIMEOUT,
    });

    const payload = response.data;

    if (!payload.success) {
      throw new Error(payload.error || 'Prediction failed');
    }

    // Mengambil label prediksi (Contoh: "Organik")
    const predictionLabel = payload.prediction;

    return {
      success: true,
      prediction: predictionLabel,
      label: predictionLabel, // Alias untuk compatibility
      confidence: payload.confidence,
      probabilities: payload.probabilities || payload.scores || null,
      description: CLASS_DESCRIPTIONS[predictionLabel] || 'Unknown waste type',
      timestamp: new Date()
    };
  } catch (error) {
    console.error("ML Service Error:", error.message);
    throw error;
  }
};

/**
 * Check kesehatan ML Service
 * @returns {Promise<Boolean>}
 */
exports.checkHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    return response.data.model_loaded === true || response.data.status === 'ok';
  } catch (error) {
    console.error("ML Service Health Check Failed:", error.message);
    return false;
  }
};

/**
 * Get informasi tentang ML Service
 * @returns {Promise<Object|null>}
 */
exports.getInfo = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/info`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get ML Service info:", error.message);
    return null;
  }
};

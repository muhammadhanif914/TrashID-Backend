/**
 * Service ini menangani logika pemanggilan model Machine Learning.
 * Memanggil Python Flask API untuk inference pada model Keras.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
const ML_TIMEOUT = 30000; // 30 seconds

// Deskripsi untuk setiap kategori sampah
const CLASS_DESCRIPTIONS = {
  anorganik: 'Sampah anorganik seperti plastik, logam, kaca yang dapat didaur ulang.',
  organik: 'Sampah organik seperti sisa makanan, daun, kulit buah yang bisa dijadikan kompos.',
  b3: 'Sampah B3 yang berbahaya dan perlu penanganan khusus.'
};

/**
 * Classify image menggunakan Python ML Service
 * @param {string} imagePath - Path ke file gambar
 * @returns {Promise<Object>} - Hasil klasifikasi
 */
exports.predict = async (imagePath) => {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    const formData = new FormData();
    const fileStream = fs.createReadStream(imagePath);
    formData.append('image', fileStream);

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: formData.getHeaders(),
      timeout: ML_TIMEOUT
    });

    const payload = response.data || {};
    if (payload.error) {
      throw new Error(payload.error);
    }

    if (!payload.prediction) {
      throw new Error('Prediction failed: missing prediction in ML response');
    }

    const normalizedPrediction = String(payload.prediction).toLowerCase();
    const probabilities = payload.probabilities || payload.scores || null;

    // Transform response untuk format yang diharapkan oleh controller
    return {
      success: true,
      prediction: normalizedPrediction,
      label: normalizedPrediction, // Alias untuk compatibility
      confidence: payload.confidence,
      probabilities: probabilities,
      description: CLASS_DESCRIPTIONS[normalizedPrediction] || 'Unknown waste type',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('ML Service Error:', error.message);
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
      timeout: 5000
    });
    return response.data.model_loaded === true || response.data.status === 'ok';
  } catch (error) {
    console.error('ML Service Health Check Failed:', error.message);
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
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get ML Service info:', error.message);
    return null;
  }
};

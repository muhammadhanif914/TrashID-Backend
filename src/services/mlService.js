/**
 * Service ini menangani logika pemanggilan model Machine Learning.
 * Jika ML menggunakan TensorFlow.js, model dapat dimuat di sini.
 * Jika ML berupa API terpisah (Flask/FastAPI), maka di sini dilakukan fetch/axios request.
 */

exports.predict = async (imageInput) => {
  // TODO: Implementasi logika ML disini

  // Mock response untuk saat ini
  return {
    label: "Organik",
    confidence: 0.95,
    description: "Sampah jenis organik yang bisa dijadikan pupuk kompos.",
  };
};

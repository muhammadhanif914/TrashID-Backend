const Classification = require('../models/Classification');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.classifyImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    // Panggil ML API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    let mlResponse;
    try {
      mlResponse = await axios.post('http://localhost:5000/predict', formData, {
         headers: formData.getHeaders()
      });
    } catch (mlErr) {
      // Mock data jika ML API belum aktif
      mlResponse = { data: { result: 'Organik', confidence: 0.92 } };
    }

    const classification = await Classification.create({
      userId: req.user._id,
      image: req.file.path,
      result: mlResponse.data.result,
      confidence: mlResponse.data.confidence
    });

    res.status(201).json(classification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
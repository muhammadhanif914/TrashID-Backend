const Classification = require('../models/Classification');
const mlService = require('../services/mlService');
const fs = require('fs');

exports.classifyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Image file is required' 
      });
    }

    // Call ML Service to classify image
    let mlResult;
    try {
      mlResult = await mlService.predict(req.file.path);
    } catch (mlErr) {
      console.error('ML Service Error:', mlErr.message);
      return res.status(503).json({
        success: false,
        message: 'ML Service is unavailable',
        error: mlErr.message
      });
    }

    // Save classification result to database
    const classification = await Classification.create({
      userId: req.user._id,
      image: req.file.path,
      result: mlResult.prediction,
      label: mlResult.label,
      confidence: mlResult.confidence,
      description: mlResult.description,
      probabilities: mlResult.probabilities,
      classifiedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Classification successful',
      data: {
        _id: classification._id,
        result: classification.result,
        label: classification.label,
        confidence: classification.confidence,
        description: classification.description,
        probabilities: classification.probabilities,
        classifiedAt: classification.classifiedAt
      }
    });

  } catch (error) {
    console.error('Classification Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Classification failed',
      error: error.message 
    });
  }
};
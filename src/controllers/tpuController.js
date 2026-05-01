const TPU = require('../models/TPU');

exports.getTPUs = async (req, res) => {
  try {
    const tpus = await TPU.find({});
    res.json(tpus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTPU = async (req, res) => {
  try {
    const { name, location, status } = req.body;
    const tpu = await TPU.create({ name, location, status });
    res.status(201).json(tpu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTPU = async (req, res) => {
  try {
    const { status } = req.body;
    const tpu = await TPU.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!tpu) return res.status(404).json({ message: 'TPU not found' });
    res.json(tpu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Report = require('../models/Report');
const User = require('../models/User');

exports.createReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });
    
    // Parse coordinates properly
    const lat = req.body['location.lat'] || req.body.lat;
    const lng = req.body['location.lng'] || req.body.lng;
    const { description, status } = req.body;

    const report = await Report.create({
      userId: req.user._id,
      image: req.file.path,
      location: { lat: Number(lat), lng: Number(lng) },
      description,
      status: status || 'normal'
    });

    // Gamifikasi: Tambah XP ketika user submit laporan (10 XP)
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({}).populate('userId', 'name email xp');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.verified = true;
    await report.save();

    // Gamifikasi: Tambah XP ketika laporan diverifikasi admin (20 XP)
    await User.findByIdAndUpdate(report.userId, { $inc: { xp: 20 } });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
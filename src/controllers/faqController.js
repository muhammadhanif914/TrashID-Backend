const FAQ = require("../models/FAQ");

// Get all FAQs (Bisa diakses User & Admin)
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ status: "success", data: faqs });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Create FAQ (Hanya Admin)
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;
    const newFAQ = await FAQ.create({ question, answer, category, order });
    res.status(201).json({ status: "success", data: newFAQ });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Update FAQ (Hanya Admin)
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFAQ = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ status: "success", data: updatedFAQ });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Delete FAQ (Hanya Admin)
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "FAQ berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

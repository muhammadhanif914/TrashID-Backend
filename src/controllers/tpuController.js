const tpuService = require("../services/tpuService");

exports.getTPU = async (req, res) => {
  try {
    const tpus = await tpuService.getAllTPU();
    res.status(200).json({ status: "success", data: tpus });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateTPU = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["penuh", "kosong"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status tidak valid. Gunakan penuh/kosong" });
    }

    const updatedTPU = await tpuService.updateTPUStatus(req.params.id, status);
    if (!updatedTPU)
      return res.status(404).json({ message: "TPU tidak ditemukan" });

    res.status(200).json({
      status: "success",
      message: "Status TPU diperbarui",
      data: updatedTPU,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const TPULocation = require("../models/TPULocation");

exports.getAllTPU = async () => {
  return await TPULocation.find();
};

exports.updateTPUStatus = async (id, status) => {
  return await TPULocation.findByIdAndUpdate(
    id,
    { status: status },
    { new: true },
  );
};

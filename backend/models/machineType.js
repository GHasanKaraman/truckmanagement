const mongoose = require("mongoose");

const machineTypeSchema = new mongoose.Schema({
  machineType: { type: String, required: true },
});

const machineType = mongoose.model("machineType", machineTypeSchema);

module.exports = machineType;

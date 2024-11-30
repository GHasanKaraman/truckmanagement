const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  target: { type: String, required: true },
  machineTypeID: { type: mongoose.Types.ObjectId, required: true },
  facility: { type: String, required: true, default: "V" },
  IP: { type: String, default: "" },
});

const target = mongoose.model("target", targetSchema);

module.exports = target;

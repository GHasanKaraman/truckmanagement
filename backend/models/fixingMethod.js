const mongoose = require("mongoose");

const fixingMethodSchema = new mongoose.Schema({
  fixingMethod: { type: String, required: true },
  issueType: { type: String, required: true },
});

const fixingMethod = mongoose.model("fixingMethod", fixingMethodSchema);

module.exports = fixingMethod;

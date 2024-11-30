const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
});

const vendor = mongoose.model("vendor", vendorSchema);

module.exports = vendor;

const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  location: { type: String, required: true },
  facility: { type: String, requires: true },
});

const location = mongoose.model("location", locationSchema);

module.exports = location;

const mongoose = require("mongoose");

const superiorSchema = new mongoose.Schema({
  superior: { type: String, required: true },
  targets: [{ type: mongoose.Types.ObjectId, required: true }],
});

const superior = mongoose.model("superior", superiorSchema);

module.exports = superior;

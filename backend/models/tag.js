const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
});

const tag = mongoose.model("tag", tagSchema);

module.exports = tag;

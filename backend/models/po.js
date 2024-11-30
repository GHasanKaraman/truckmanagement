const mongoose = require("mongoose");

const poSchema = new mongoose.Schema(
  {
    doc: { type: String, required: true },
    parts: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: String, required: true },
    vendor: { type: String, required: true },
  },
  { timestamps: true },
);

const po = mongoose.model("po", poSchema);

module.exports = po;

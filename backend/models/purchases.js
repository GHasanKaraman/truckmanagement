const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    parts: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: String, required: true },
    vendor: { type: String, required: true },
  },
  { timestamps: true },
);

const purchase = mongoose.model("purchase", purchaseSchema);

module.exports = purchase;

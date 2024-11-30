const mongoose = require("mongoose");

const partSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    partName: { type: String, required: true },
    count: { type: Number, required: true },
    price: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    vendorsID: [{ type: mongoose.Types.ObjectId, required: true }],
    minQuantity: { type: Number, required: true },
    locationID: { type: mongoose.Types.ObjectId, required: true },
    tagsID: [{ type: mongoose.Types.ObjectId }],
  },
  { timestamps: true },
);

const part = mongoose.model("part", partSchema);

module.exports = part;

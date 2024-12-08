const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
  {
    truck: { type: String, required: true },
    facility: { type: String, required: true, default: "V" },
  },
  { timestamps: true },
);

const truck = mongoose.model("truck", truckSchema);

module.exports = truck;

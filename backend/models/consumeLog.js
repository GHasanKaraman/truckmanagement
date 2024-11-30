const mongoose = require("mongoose");

const consumeLogSchema = new mongoose.Schema(
  {
    technicianID: { type: mongoose.Types.ObjectId, required: true },
    userID: { type: mongoose.Types.ObjectId },
    itemID: { type: mongoose.Types.ObjectId, required: true },
    outputQuantity: { type: Number, required: true },
    locationID: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

const consumeLog = mongoose.model("consumeLog", consumeLogSchema);

module.exports = consumeLog;

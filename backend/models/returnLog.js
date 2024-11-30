const mongoose = require("mongoose");

const returnLogSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Types.ObjectId, required: true },
    returnQuantity: { type: Number, required: true },
    giveLogID: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

const returnLog = mongoose.model("returnLog", returnLogSchema);

module.exports = returnLog;

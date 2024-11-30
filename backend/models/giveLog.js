const mongoose = require("mongoose");

const giveLogSchema = new mongoose.Schema(
  {
    technicianID: { type: mongoose.Types.ObjectId, required: true },
    userID: { type: mongoose.Types.ObjectId },
    itemID: { type: mongoose.Types.ObjectId, required: true },
    count: { type: Number, required: true },
    returnQuantity: { type: Number, default: 0 },
    isReturned: { type: Boolean, default: false },
    outputQuantity: { type: Number, required: true },
    locationID: { type: mongoose.Types.ObjectId, required: true },
    issueID: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

const giveLog = mongoose.model("giveLog", giveLogSchema);

module.exports = giveLog;

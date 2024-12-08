const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
  {
    truck: { type: String, required: true },
    userID: { type: mongoose.Types.ObjectId, required: true },
    imageIDs: [{ type: mongoose.Types.ObjectId }],

    isCabinClean: { type: String, required: true },
    isBackClean: { type: String, required: true },
    isThereProblem: { type: String, required: true },
    areLightsWorking: { type: String, required: true },
    areThereDEF: { type: String, required: true },

    status: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const form = mongoose.model("forms", formSchema);

module.exports = form;

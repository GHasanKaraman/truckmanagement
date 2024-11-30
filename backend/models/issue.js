const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    problemID: { type: mongoose.Types.ObjectId, default: null },
    targetID: { type: mongoose.Types.ObjectId, required: true },
    status: { type: Number, default: 1 }, //opened = 0, working = 1, closed = 2
    issueType: { type: Number, default: 0 }, //regular = 0, waiting = 1, warning 2
    fixingMethodID: { type: mongoose.Types.ObjectId, default: null },
    comment: { type: String, default: "" },
    techniciansID: [{ type: mongoose.Types.ObjectId }],
    extraTechnicians: [{ type: String }],
    paused: { type: Number, default: 0 },
    pauseStart: { type: Date, default: 2023 },
    pauseStop: { type: Date, default: 2023 },
    start: {
      type: Date,
      default: 2023,
    },
    stop: {
      type: Date,
      default: 2023,
    },
  },
  { timestamps: true },
);

const issue = mongoose.model("issues", issueSchema);

module.exports = issue;

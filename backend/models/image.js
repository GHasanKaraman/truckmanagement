const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    folderIndex: { type: String, required: true },
    fileName: { type: String, required: true },
  },
  { timestamps: true },
);

const imageModel = mongoose.model("images", imageSchema);

module.exports = imageModel;

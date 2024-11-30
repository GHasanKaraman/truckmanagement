const mongoose = require("mongoose");
const essentials = require("../utils/essentials");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userID: { type: mongoose.Types.ObjectId, required: true },
  createdAt: {
    type: Date,
    default: () => essentials.getEST(),
    required: true,
  },
});

const token = mongoose.model("tokens", tokenSchema);

module.exports = token;

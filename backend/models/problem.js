const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  superiorID: { type: mongoose.Types.ObjectId, required: true },
});

const problem = mongoose.model("problem", problemSchema);

module.exports = problem;

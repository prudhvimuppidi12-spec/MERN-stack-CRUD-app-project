const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
  name: String,
  source: String,
  destination: String,
  availableSeats: Number
});

module.exports = mongoose.model("Train", trainSchema);
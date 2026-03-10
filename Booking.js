const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train"
  },
  passengers: [
    {
      name: String,
      age: Number
    }
  ],
  totalPassengers: Number,
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
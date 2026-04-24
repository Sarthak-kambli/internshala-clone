const mongoose = require("mongoose");

const Applicationipschema = new mongoose.Schema({
  company: String,
  category: String,
  coverLetter: String,

  // ✅ FIX: store USER ID instead of object
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },

  Application: Object,
});

module.exports = mongoose.model("Application", Applicationipschema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Firebase UID (for Google login users)
    uid: { type: String, unique: true, sparse: true },

    name: String,

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    photo: String,

    // Password (required only for local users)
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },

    // Distinguish login type
    authProvider: {
      type: String,
      enum: ["google", "local"],
      default: "google",
    },

    // 🔐 Forgot Password tracking
    lastPasswordResetRequest: {
      type: Date,
    },

    // 👥 Friends system
    friends: [
      {
        type: [String],
        default: [],
      },
    ],

    // 📝 Posting limits
    postsToday: {
      type: Number,
      default: 0,
    },

    lastPostDate: {
      type: Date,
    },

    lastResetDate: {
      type: Date,
    },

    // 💳 SUBSCRIPTION SYSTEM (TASK 3)

    // Plan type
    plan: {
      type: String,
      enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
      default: "FREE",
    },

    // Number of internships applied
    applicationsUsed: {
      type: Number,
      default: 0,
    },

    // Plan expiry date
    planExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
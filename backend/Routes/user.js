const express = require("express");
const router = express.Router();
const User = require("../Model/User");

// GOOGLE LOGIN / CREATE USER
router.post("/create", async (req, res) => {
  try {
    const { uid, name, email, photo } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        uid,
        name,
        email,
        photo,
        authProvider: "google",
        plan: "FREE",
        applicationsUsed: 0,
      });

      await user.save();
    }

    res.status(200).json({ user }); // ✅ MUST return user
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
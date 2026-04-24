const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../Model/User");

// LOCAL SIGNUP (Email or Phone + Password)
router.post("/signup", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validation
        if ((!email && !phone) || !password) {
            return res.status(400).json({
                message: "Email or Phone and password are required.",
            });
        }

        // Check if user already exists
        let query = [];

        if (email) {
            query.push({ email });
        }

        if (phone) {
            query.push({ phone });
        }

        const existingUser = await User.findOne({
            $or: query,
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            authProvider: "local",
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error during signup.",
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        if ((!email && !phone) || !password) {
            return res.status(400).json({
                message: "Email or Phone and password are required.",
            });
        }

        let user;

        if (email) {
            user = await User.findOne({ email });
        }

        if (!user && phone) {
            user = await User.findOne({ phone });
        }

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
            });
        }

        if (user.authProvider === "google") {
            return res.status(400).json({
                message: "This account uses Google login.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials.",
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful.",
            token,
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error during login.",
        });
    }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    const user = await User.findOne(email ? { email } : { phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Hash password
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
const express = require("express");
const router = express.Router();
const Application = require("../Model/Application");
const User = require("../Model/User");

// ================= APPLY =================
router.post("/", async (req, res) => {
  try {
    const { user } = req.body;

    if (!user) {
      return res.status(400).json({ message: "User ID required" });
    }

    const foundUser = await User.findById(user);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FIXED DEFAULTS (IMPORTANT)
    if (foundUser.plan === undefined) foundUser.plan = "FREE";
    if (foundUser.applicationsUsed === undefined) foundUser.applicationsUsed = 0;

    // ✅ PLAN LIMIT CHECK
    if (foundUser.plan === "FREE" && foundUser.applicationsUsed >= 1) {
      return res.status(400).json({ message: "Free plan limit reached" });
    }

    if (foundUser.plan === "BRONZE" && foundUser.applicationsUsed >= 3) {
      return res.status(400).json({ message: "Bronze plan limit reached" });
    }

    if (foundUser.plan === "SILVER" && foundUser.applicationsUsed >= 5) {
      return res.status(400).json({ message: "Silver plan limit reached" });
    }

    // ✅ CREATE APPLICATION
    const newApplication = new Application({
      company: req.body.company,
      category: req.body.category,
      coverLetter: req.body.coverLetter,
      user: user,
      Application: req.body.Application,
    });

    const savedData = await newApplication.save();

    // ✅ INCREMENT COUNT
    foundUser.applicationsUsed += 1;
    await foundUser.save();

    res.status(200).json({
      message: "Applied successfully",
      data: savedData,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const data = await Application.find();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================= GET BY ID =================
router.get("/:id", async (req, res) => {
  try {
    const data = await Application.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================= UPDATE STATUS =================
router.put("/:id", async (req, res) => {
  const { action } = req.body;

  let status;
  if (action === "accepted") status = "accepted";
  else if (action === "rejected") status = "rejected";
  else return res.status(400).json({ error: "Invalid action" });

  try {
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
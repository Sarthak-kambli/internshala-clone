const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Post = require("../Model/Post");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

//CREATE POST
router.post("/create", upload.single("media"), async (req, res) => {
  try {
    const { uid, text } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // DAILY LIMIT LOGIC (unchanged)
    const today = new Date().toDateString();
    if (
      !user.lastPostDate ||
      new Date(user.lastPostDate).toDateString() !== today
    ) {
      user.postsToday = 0;
    }

    const friendsCount = user.friends?.length || 0;
    let postLimit = friendsCount >= 10 ? Infinity : friendsCount >= 2 ? 2 : 1;

    if (user.postsToday >= postLimit) {
      return res.status(403).json({ message: "Daily post limit reached" });
    }

    // MEDIA UPLOAD (new)
    let media = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });

      media = {
        type: result.resource_type === "video" ? "video" : "image",
        url: result.secure_url,
      };
    }

    const newPost = new Post({
      userId: user._id,
      text,
      media,
    });

    await newPost.save();

    user.postsToday += 1;
    user.lastPostDate = new Date();
    await user.save();

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL POSTS (PUBLIC FEED)
router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name photo")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// LIKE / UNLIKE POST
router.post("/like/:postId", async (req, res) => {
  try {
    const { uid } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(user._id);

    if (alreadyLiked) {
      post.likes.pull(user._id);
      await post.save();

      return res.status(200).json({
        message: "Post unliked",
        likes: post.likes.length,
      });
    }

    post.likes.push(user._id);
    await post.save();

    return res.status(200).json({
      message: "Post liked",
      likes: post.likes.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD COMMENT TO POST
router.post("/comment/:postId", async (req, res) => {
  try {
    const { uid, text } = req.body;

    if (!uid || !text) {
      return res.status(400).json({ message: "UID and comment text required" });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId: user._id,
      text,
    });

    await post.save();

    res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// SHARE POST
router.post("/share/:postId", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // prevent duplicate share
    if (post.shares.includes(user._id)) {
      return res.status(400).json({ message: "Post already shared" });
    }

    post.shares.push(user._id);
    await post.save();

    res.status(200).json({
      message: "Post shared successfully",
      shares: post.shares.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
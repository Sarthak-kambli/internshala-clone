"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import AuthModal from "@/Component/AuthModal";

export default function FeedPage() {
  const user = useSelector(selectuser);
  const currentUid = user?.uid;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [postText, setPostText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const commentRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("https://internshala-clone-backend-xzpg.onrender.com/api/post/all");
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTH CHECK ================= */
  const requireAuth = () => {
    if (!user) {
      toast.info("Please login to continue");
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  /* ================= ACTIONS ================= */

  const handleLike = async (postId: string) => {
    if (!requireAuth()) return;

    await axios.post(`https://internshala-clone-backend-xzpg.onrender.com/api/post/like/${postId}`, {
      uid: currentUid,
    });

    fetchPosts();
  };

  const handleComment = async (postId: string) => {
    if (!requireAuth()) return;

    if (!commentText[postId]?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    await axios.post(`https://internshala-clone-backend-xzpg.onrender.com/api/post/comment/${postId}`, {
      uid: currentUid,
      text: commentText[postId],
    });

    setCommentText((prev) => ({ ...prev, [postId]: "" }));
    fetchPosts();
  };

  const handleShare = async (postId: string) => {
    if (!requireAuth()) return;

    try {
      await axios.post(`https://internshala-clone-backend-xzpg.onrender.com/api/post/share/${postId}`, {
        uid: currentUid,
      });
      toast.success("Post shared successfully");
      fetchPosts();
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.info("You already shared this post");
      } else {
        toast.error("Share failed");
      }
    }
  };

  const handleCreatePost = async () => {
    if (!requireAuth()) return;

    if (!postText.trim()) {
      toast.error("Post text is required");
      return;
    }

    try {
      setPosting(true);

      const formData = new FormData();
      formData.append("uid", currentUid);
      formData.append("text", postText);
      if (mediaFile) formData.append("media", mediaFile);

      await axios.post("https://internshala-clone-backend-xzpg.onrender.com/api/post/create", formData);

      toast.success("Post created successfully");
      setPostText("");
      setMediaFile(null);
      fetchPosts();
    } catch {
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Public Feed</h1>

      {/* CREATE POST */}
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <textarea
          placeholder="What do you want to share?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm"
          rows={3}
        />

        <div className="flex justify-between mt-3">
          <input
            type="file"
            onChange={(e) => e.target.files && setMediaFile(e.target.files[0])}
          />

          <button
            disabled={!user || posting}
            onClick={handleCreatePost}
            className={`px-5 py-2 rounded text-sm text-white ${
              !user
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* POSTS */}
      {posts.map((post) => {
        const isLiked = post.likes?.includes(currentUid);

        return (
          <div key={post._id} className="bg-white rounded-xl shadow p-4 mb-6">

            {/* USER */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={post.userId?.photo || "/avatar.png"}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-semibold">
                  {post.userId?.name || "Unknown"}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* TEXT */}
            {post.text && <p className="mb-3">{post.text}</p>}

            {/* ACTIONS */}
            <div className="flex gap-6 text-sm mt-3">
              <button
                disabled={!user}
                onClick={() => handleLike(post._id)}
                className={!user ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isLiked ? "❤️" : "🤍"} {post.likes?.length || 0}
              </button>

              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  commentRefs.current[post._id]?.focus();
                }}
              >
                💬 {post.comments?.length || 0}
              </button>

              <button
                disabled={!user}
                onClick={() => handleShare(post._id)}
                className={!user ? "opacity-50 cursor-not-allowed" : ""}
              >
                🔁 {post.shares?.length || 0}
              </button>
            </div>

            {/* COMMENT INPUT */}
            <div className="mt-4 flex gap-2">
              <input
                ref={(el) => {
                  commentRefs.current[post._id] = el;
                }}
                value={commentText[post._id] || ""}
                onChange={(e) =>
                  setCommentText({
                    ...commentText,
                    [post._id]: e.target.value,
                  })
                }
                className="flex-1 border px-3 py-2 rounded"
              />

              <button
                disabled={!user}
                onClick={() => handleComment(post._id)}
                className={`px-3 rounded ${
                  !user
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                }`}
              >
                Post
              </button>
            </div>
          </div>
        );
      })}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
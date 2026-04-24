"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email && !phone) {
      toast.error("Please enter email or phone");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {};
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      const res = await axios.post(
        "https://internshala-clone-86xf.onrender.com/api/auth/forgot-password",
        payload
      );

      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setPhone("");
          }}
          className="w-full mb-3 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />

        <div className="text-center text-gray-500 text-sm mb-2">OR</div>

        <input
          type="text"
          placeholder="Enter phone"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setEmail("");
          }}
          className="w-full mb-4 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
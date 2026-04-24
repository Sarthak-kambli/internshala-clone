"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "@/Feature/Userslice";
import { Eye, EyeOff } from "lucide-react";

export default function AuthModal({ isOpen, onClose }: any) {
    const dispatch = useDispatch();

    const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");

    const [form, setForm] = useState({
        name: "",
        emailOrPhone: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            name: "",
            emailOrPhone: "",
            password: "",
        });
        setShowPassword(false);
    };

    // ================= LOGIN =================
    const handleLogin = async () => {
        try {
            const payload = form.emailOrPhone.includes("@")
                ? { email: form.emailOrPhone, password: form.password }
                : { phone: form.emailOrPhone, password: form.password };

            const res = await axios.post(
                "https://internshala-clone-ciaz.onrender.com/api/auth/login",
                payload
            );

            localStorage.setItem("user", JSON.stringify(res.data.user));
            dispatch(login(res.data.user));

            toast.success("Login successful");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed");
        }
    };

    // ================= SIGNUP =================
    const handleSignup = async () => {
        try {
            const payload = form.emailOrPhone.includes("@")
                ? {
                      name: form.name,
                      email: form.emailOrPhone,
                      password: form.password,
                  }
                : {
                      name: form.name,
                      phone: form.emailOrPhone,
                      password: form.password,
                  };

            await axios.post(
                "https://internshala-clone-ciaz.onrender.com/api/auth/signup",
                payload
            );

            toast.success("Signup successful");

            setMode("login");
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Signup failed");
        }
    };

    // ================= FORGOT PASSWORD =================
    const handleForgot = async () => {
        try {
            const payload = form.emailOrPhone.includes("@")
                ? { email: form.emailOrPhone, newPassword: form.password }
                : { phone: form.emailOrPhone, newPassword: form.password };

            const res = await axios.post(
                "https://internshala-clone-ciaz.onrender.com/api/auth/forgot-password",
                payload
            );

            toast.success(res.data.message);

            setMode("login");
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                >
                    ✖
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold text-center mb-4">
                    {mode === "login" && "Login"}
                    {mode === "signup" && "Sign Up"}
                    {mode === "forgot" && "Reset Password"}
                </h2>

                {/* ================= LOGIN ================= */}
                {mode === "login" && (
                    <>
                        <input
                            type="text"
                            name="emailOrPhone"
                            placeholder="Email or Phone"
                            onChange={handleChange}
                            className="w-full mb-3 border p-2 rounded text-sm"
                        />

                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                className="w-full border p-2 rounded text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 text-white py-2 rounded mb-3"
                        >
                            Login
                        </button>

                        <div className="flex justify-between text-sm text-blue-600">
                            <button onClick={() => { setMode("forgot"); resetForm(); }}>
                                Forgot Password?
                            </button>

                            <button onClick={() => { setMode("signup"); resetForm(); }}>
                                New user? Sign up
                            </button>
                        </div>
                    </>
                )}

                {/* ================= SIGNUP ================= */}
                {mode === "signup" && (
                    <>
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            onChange={handleChange}
                            className="w-full mb-3 border p-2 rounded text-sm"
                        />

                        <input
                            type="text"
                            name="emailOrPhone"
                            placeholder="Email or Phone"
                            onChange={handleChange}
                            className="w-full mb-3 border p-2 rounded text-sm"
                        />

                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                className="w-full border p-2 rounded text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            onClick={handleSignup}
                            className="w-full bg-green-600 text-white py-2 rounded mb-3"
                        >
                            Sign Up
                        </button>

                        <div className="text-center text-sm text-blue-600">
                            <button onClick={() => { setMode("login"); resetForm(); }}>
                                Already have account? Login
                            </button>
                        </div>
                    </>
                )}

                {/* ================= FORGOT ================= */}
                {mode === "forgot" && (
                    <>
                        <input
                            type="text"
                            name="emailOrPhone"
                            placeholder="Email or Phone"
                            onChange={handleChange}
                            className="w-full mb-3 border p-2 rounded text-sm"
                        />

                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter New Password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full border p-2 rounded text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                                let generated = "";
                                for (let i = 0; i < 8; i++) {
                                    generated += chars.charAt(Math.floor(Math.random() * chars.length));
                                }

                                setForm({ ...form, password: generated });
                                toast.success(`Generated: ${generated}`);
                            }}
                            className="w-full bg-gray-200 text-gray-800 py-2 rounded mb-3"
                        >
                            Generate Password
                        </button>

                        <button
                            onClick={handleForgot}
                            className="w-full bg-blue-600 text-white py-2 rounded mb-3"
                        >
                            Reset Password
                        </button>

                        <div className="text-center text-sm text-blue-600">
                            <button onClick={() => { setMode("login"); resetForm(); }}>
                                Back to Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
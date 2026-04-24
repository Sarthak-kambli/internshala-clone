import React, { useState, useEffect } from 'react'
import Link from "next/link";
import { auth, provider } from "../firebase/firebase"
import { Search } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { selectuser, login, logout } from '@/Feature/Userslice';
import axios from 'axios';
import AuthModal from "@/Component/AuthModal";

const Navbar = () => {
    const user = useSelector(selectuser);
    const dispatch = useDispatch();

    const [showAuthModal, setShowAuthModal] = useState(false);

    // ✅ Restore user on refresh
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            // ✅ ONLY accept DB user (must have _id)
            if (parsedUser?._id) {
                dispatch(login(parsedUser));
            } else {
                localStorage.removeItem("user"); // ❌ remove bad data
            }
        }
    }, []);
    // useEffect(() => {
    //     const storedUser = localStorage.getItem("user");
    //     if (storedUser) {
    //         dispatch(login(JSON.parse(storedUser)));
    //     }
    // }, [dispatch]);

    // ✅ Google Login FIXED
    const handlelogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            const res = await axios.post(
                "https://internshala-clone-ciaz.onrender.com/api/user/create",
                {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photo: firebaseUser.photoURL,
                }
            );

            const dbUser = res.data.user;

            console.log("DB USER:", dbUser); // ✅ MUST HAVE _id

            // 🚨 VERY IMPORTANT: REMOVE OLD DATA FIRST
            localStorage.removeItem("user");

            // ✅ STORE CORRECT USER
            localStorage.setItem("user", JSON.stringify(dbUser));
            dispatch(login(dbUser));

            toast.success("Logged in successfully");
        } catch (error) {
            console.error(error);
            toast.error("Login failed");
        }
    };
    // ✅ Logout
    const handlelogout = async () => {
        await signOut(auth);
        localStorage.removeItem("user");
        dispatch(logout());
    };

    return (
        <div className="relative">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Logo */}
                        <div className="shrink-0">
                            <a href="/" className="text-xl font-bold text-blue-600">
                                <img src={"/logo.png"} alt="" className="h-16" />
                            </a>
                        </div>

                        {/* Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/internship">Internships</Link>
                            <Link href="/job">Jobs</Link>
                            <Link href="/feed">Feed</Link>

                            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="ml-2 bg-transparent outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Auth */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link href="/profile">
                                        <img
                                            src={user.photo || "/default.png"}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    </Link>

                                    <button onClick={handlelogout}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="px-4 py-2 border rounded"
                                    >
                                        Sign In
                                    </button>

                                    <button onClick={handlelogin}>
                                        Continue with Google
                                    </button>

                                    <a href="/adminlogin">Admin</a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default Navbar;
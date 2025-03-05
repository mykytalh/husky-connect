"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import Cookies from "js-cookie";

export const HomeNavbar = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        // Set auth cookie when user is signed in
        user.getIdToken().then((token) => {
          Cookies.set("auth-token", token);
        });
      } else {
        // Remove auth cookie when user is signed out
        Cookies.remove("auth-token");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("auth-token");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Now conditionally handles click */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text">
                Husky Connect
              </span>
              <img
                src="https://static.wixstatic.com/media/8cac10_4cab2aa83fe642599baea451dacc96c3~mv2.png/v1/fill/w_560,h_418,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/uw%20logo.png"
                alt="UW Logo"
                className="h-8 w-8"
              />
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text">
                Husky Connect
              </span>
              <img
                src="https://static.wixstatic.com/media/8cac10_4cab2aa83fe642599baea451dacc96c3~mv2.png/v1/fill/w_560,h_418,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/uw%20logo.png"
                alt="UW Logo"
                className="h-8 w-8"
              />
            </Link>
          )}

          {/* Right side - Conditional rendering based on auth state */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-all shadow-md"
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/register"
              className="bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-white px-6 py-2 rounded-md hover:opacity-90 transition-all shadow-md"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

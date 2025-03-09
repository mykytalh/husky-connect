"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import Link from "next/link";
import React from "react";
import Cookies from "js-cookie";

import { auth } from "@/app/firebase/config";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        const token = await userCredential.user.getIdToken();
        // Set auth token cookie first
        Cookies.set("auth-token", token);

        try {
          // Fetch user data to check setup completion
          const response = await fetch(
            `/api/firebase?uid=${userCredential.user.uid}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const userData = await response.json();

          // Set the cookie and redirect
          if (userData && userData.setupComplete === true) {
            Cookies.set("setup-complete", "true");
            // Force a hard navigation to ensure middleware runs
            window.location.href = "/dashboard";
          } else {
            Cookies.set("setup-complete", "false");
            window.location.href = "/setup";
          }
        } catch (fetchError) {
          console.error("Error fetching user data:", fetchError);
          Cookies.set("setup-complete", "false");
          window.location.href = "/setup";
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="h-[100vh] w-full flex items-center justify-center fixed inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100/30 via-transparent to-yellow-100/30 z-0" />

      {/* Static Blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl z-10" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-yellow-200/20 rounded-full mix-blend-multiply filter blur-3xl z-10" />
      <div className="fixed bottom-0 left-50 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl z-10" />

      <Card className="max-w-md w-full backdrop-blur-sm bg-white/30 shadow-2xl relative z-50">
        <CardHeader className="flex flex-col gap-4 items-center p-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text">
            Welcome Back
          </h2>
          {error && (
            <p className="text-red-500 text-center text-sm bg-red-100 px-4 py-2 rounded-full">
              {error}
            </p>
          )}
        </CardHeader>
        <CardBody>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <Input
                required
                className="w-full"
                placeholder="your.email@uw.edu"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Input
                required
                className="w-full"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-white shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300"
              type="submit"
            >
              Log in
            </Button>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                className="font-medium bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text hover:opacity-80"
                href="/register"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Page;

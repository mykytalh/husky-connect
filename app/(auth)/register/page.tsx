"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        // Set auth token cookie
        Cookies.set("auth-token", await userCredential.user.getIdToken());

        // For new registrations, setup is never complete
        Cookies.set("setup-complete", "false");

        router.push("/setup");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="h-[100vh] w-full flex items-center justify-center fixed inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100/30 via-transparent to-yellow-100/30" />

      {/* Static Blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-yellow-200/20 rounded-full mix-blend-multiply filter blur-3xl" />
      <div className="fixed bottom-0 left-50 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl" />

      <Card className="max-w-md w-full backdrop-blur-sm bg-white/10 shadow-2xl relative z-100 mx-4">
        <CardHeader className="flex flex-col gap-4 items-center p-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text">
            Create an Account
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
              Sign up
            </Button>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                className="font-medium bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text hover:opacity-80"
                href="/login"
              >
                Log in
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Page;

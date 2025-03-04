"use client";

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/config";

export default function Home() {
  const [user] = useAuthState(auth);

  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] gap-8 py-8 md:py-10 px-4">
      <div className="inline-block max-w-2xl text-center justify-center animate-fadeIn">
        <h1
          className={`${title()} text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text animate-gradient`}
        >
          Welcome to Husky Connect! 🐺📚
        </h1>

        <div
          className={`${subtitle({ class: "mt-8" })} text-lg md:text-xl leading-relaxed text-gray-600 dark:text-gray-300 backdrop-blur-sm p-6 rounded-xl bg-white/5 shadow-lg`}
        >
          Your ultimate space to connect, collaborate, and thrive within the
          Husky community. Whether you're looking for study groups, networking
          opportunities, campus resources, or just a place to chat with fellow
          students, Husky Connect has you covered.
        </div>

        <div
          className={`${subtitle({ class: "mt-8" })} text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text animate-pulse`}
        >
          Join today and start making meaningful connections! 
        </div>

        <div className="mt-12 flex gap-6 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-[#4b2e83] to-[#85754d] rounded-full hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Add decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </section>
  );
}

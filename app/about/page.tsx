"use client";

import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

interface UserProfile {
  name: string;
  age: string;
  campus: string;
  classStanding: string;
  degreeType: string;
  major: string;
  minor: string;
  gpa: string;
  currentCourses: string[];
  studyPreferences: string[];
  bio: string;
  imageUrl?: string;
  linkedin?: string;
  instagram?: string;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Profile</h1>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

const AboutPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch(`/api/firebase?uid=${user.uid}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setProfile(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [mounted, router]);

  if (!mounted) return null;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!profile) return <ErrorDisplay message="No profile data found" />;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-screen-lg mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text mb-6">
            About Me
          </h1>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-white/90 shadow-xl rounded-lg">
          {/* Profile Picture and Social Media */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-48 h-48 mb-4">
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full border-4 border-purple-200"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-dashed border-purple-200 flex items-center justify-center">
                  <svg
                    className="h-12 w-12 text-purple-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="flex gap-6 mt-4">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#0077b5] transition-colors"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
              {profile.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#E4405F] transition-colors"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl font-semibold text-[#4b2e83] border-b pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{profile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <p className="mt-1 text-gray-900">{profile.age || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl font-semibold text-[#4b2e83] border-b pb-2">
              Academic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Campus</label>
                <p className="mt-1 text-gray-900">{profile.campus}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Degree Type</label>
                <p className="mt-1 text-gray-900">{profile.degreeType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Class Standing</label>
                <p className="mt-1 text-gray-900">{profile.classStanding}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GPA</label>
                <p className="mt-1 text-gray-900">{profile.gpa || "Not specified"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Major</label>
                <p className="mt-1 text-gray-900">{profile.major}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Minor</label>
                <p className="mt-1 text-gray-900">{profile.minor || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Current Courses */}
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl font-semibold text-[#4b2e83] border-b pb-2">
              Current Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.currentCourses.length > 0 ? (
                profile.currentCourses.map((course, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-900">{course}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No courses specified</p>
              )}
            </div>
          </div>

          {/* Study Preferences */}
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl font-semibold text-[#4b2e83] border-b pb-2">
              Study Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.studyPreferences.length > 0 ? (
                profile.studyPreferences.map((pref, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-900">{pref}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No preferences specified</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl font-semibold text-[#4b2e83] border-b pb-2">
              About You
            </h2>
            <div className="p-6 rounded-lg border">
              <p className="text-gray-900 whitespace-pre-wrap">
                {profile.bio || "No bio provided"}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => router.push("/setup")}
            className="w-full bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Edit Profile
          </button>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;

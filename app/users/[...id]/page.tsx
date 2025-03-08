"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";

interface UserProfile {
  uid: string;
  name: string;
  major: string;
  currentCourses: string[];
  imageUrl?: string;
  bio?: string;
  campus?: string;
  age?: string;
  classStanding?: string;
  degreeType?: string;
  gpa?: string;
  linkedin?: string;
  instagram?: string;
  studyPreferences?: string[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/firebase?uid=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <p className="text-xl text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-scree p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-40 h-40 rounded-full object-cover ring-4 ring-purple-100"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-[#4b2e83] to-[#85754d] flex items-center justify-center text-5xl text-white ring-4 ring-purple-100">
                {user.name[0]}
              </div>
            )}

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text">
                {user.name}
              </h1>
              <p className="text-2xl text-gray-600 mt-2">{user.major}</p>
              {user.campus && (
                <p className="text-gray-500 mt-1 flex items-center gap-2 justify-center md:justify-start">
                  <span className="animate-bounce">📍</span> {user.campus} Campus
                </p>
              )}

              {/* Social Links and Message Button */}
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all flex items-center gap-2 group"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
                {user.instagram && (
                  <a
                    href={user.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-all flex items-center gap-2 group"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-8">
            {/* Academic Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Academic Info</h2>
              <div className="space-y-4">
                {user.classStanding && (
                  <div>
                    <h3 className="text-sm text-gray-500">Class Standing</h3>
                    <p className="text-lg text-gray-700">{user.classStanding}</p>
                  </div>
                )}
                {user.degreeType && (
                  <div>
                    <h3 className="text-sm text-gray-500">Degree</h3>
                    <p className="text-lg text-gray-700">{user.degreeType}</p>
                  </div>
                )}
                {user.gpa && (
                  <div>
                    <h3 className="text-sm text-gray-500">GPA</h3>
                    <p className="text-lg text-gray-700">{user.gpa}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio Card */}
            {user.bio && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">About</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Current Courses Card */}
            {user.currentCourses?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Courses</h2>
                <div className="flex flex-wrap gap-2">
                  {user.currentCourses.map((course) => (
                    <span
                      key={course}
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Study Preferences Card */}
            {user.studyPreferences && user.studyPreferences.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Study Preferences</h2>
                <div className="flex flex-wrap gap-2">
                  {user.studyPreferences.map((pref, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
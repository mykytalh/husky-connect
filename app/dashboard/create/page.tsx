"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

import { auth } from "@/app/firebase/config";

interface UserProfile {
  uid: string;
  name: string;
  imageUrl?: string;
}

interface Course {
  code: string;
  name: string;
}

// CourseSelector component from setup page
const CourseSelector = ({
  courses,
  value,
  onSelect,
}: {
  courses: Course[];
  value: string;
  onSelect: (course: Course) => void;
}) => {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearch("");
    onSelect({ code: "", name: "" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("course-dropdown");

      if (dropdown && !dropdown.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCourses = courses
    .filter(
      (c) =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, displayLimit);

  const loadMore = () => {
    setDisplayLimit((prev) => prev + 50);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          className="w-full"
          disabled={courses.length === 0}
          label="Course"
          placeholder={
            courses.length === 0
              ? "Loading courses..."
              : "Search for a course (e.g., CSE 142, Computer Programming)"
          }
          value={search || value}
          onChange={(e) => {
            setSearch(e.target.value);
            setDropdownOpen(true);
            setDisplayLimit(50);
          }}
          onFocus={() => setDropdownOpen(true)}
        />
        {(search || value) && (
          <button
            className="absolute right-2 top-[38px] p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={handleClear}
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                fillRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {dropdownOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          id="course-dropdown"
        >
          {filteredCourses.length > 0 ? (
            <>
              {filteredCourses.map((c) => (
                <div
                  key={c.code}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                  onClick={() => {
                    onSelect(c);
                    setSearch("");
                    setDropdownOpen(false);
                  }}
                >
                  <div className="font-medium">{c.code}</div>
                  <div className="text-sm text-gray-600">{c.name}</div>
                </div>
              ))}
              {filteredCourses.length === displayLimit && (
                <div
                  className="text-center p-2 text-purple-600 hover:bg-gray-50 cursor-pointer border-t"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadMore();
                  }}
                >
                  Load More Results...
                </div>
              )}
            </>
          ) : (
            <div className="p-2 text-gray-500">
              {search
                ? "No matching courses found."
                : "Start typing to search courses"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function CreatePost() {
  const router = useRouter();
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    campus: "",
    major: "",
    course: "",
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add states for majors and courses
  const [majors, setMajors] = useState<Array<{ code: string; name: string }>>(
    []
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [majorSearch, setMajorSearch] = useState("");
  const [isMajorDropdownOpen, setIsMajorDropdownOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch program data when campus changes
  const fetchProgramData = async (campus: string) => {
    setIsLoadingData(true);
    try {
      // Fetch majors
      const majorsRes = await fetch(
        `/api/majors?campus=${encodeURIComponent(campus)}&type=majors`
      );

      if (!majorsRes.ok)
        throw new Error(`Failed to fetch majors: ${majorsRes.statusText}`);
      const majorsData = await majorsRes.json();
      const majorsList = Object.entries(majorsData.majors || {}).map(
        ([code, name]) => ({
          code,
          name: name as string,
        })
      );

      setMajors(majorsList);

      // Fetch courses
      const coursesRes = await fetch(
        `/api/courses?campus=${encodeURIComponent(campus)}&type=courses`
      );

      if (!coursesRes.ok)
        throw new Error(`Failed to fetch courses: ${coursesRes.statusText}`);
      const coursesData = await coursesRes.json();
      const coursesList: Course[] = Object.entries(
        coursesData.courses || {}
      ).map(([code, data]: [string, any]) => ({
        code,
        name: data["Course Name"] ? data["Course Name"] : code,
      }));

      setCourses(coursesList);
    } catch (error) {
      console.error("Failed to fetch program data:", error);
      setMajors([]);
      setCourses([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Filter majors based on search
  const filteredMajors = majors.filter((m) =>
    m.name.toLowerCase().includes(majorSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        const response = await fetch(`/api/firebase?uid=${user.uid}`);
        const data = await response.json();

        setCurrentUser({
          uid: user.uid,
          name: data.name,
          imageUrl: data.imageUrl,
        });
      }
    };

    fetchUserData();
  }, []);

  // Add click outside handler for major dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("major-dropdown");

      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsMajorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmitPost = async () => {
    if (!currentUser) return;
    if (!newPost.title || !newPost.content) {
      alert("Please fill in the title and content");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.name,
          userImage: currentUser.imageUrl,
          title: newPost.title,
          content: newPost.content,
          campus: newPost.campus || null,
          major: newPost.major || null,
          course: newPost.course || null,
          createdAt: Date.now(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="p-6 rounded-lg bg-white/5 border border-white/10 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create a Post</h2>
          <Button
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </div>
        <div className="space-y-6">
          <Input
            className="w-full"
            label="Title *"
            placeholder="What's on your mind?"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />

          {/* Campus Selection - Optional */}
          <select
            className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 p-2"
            value={newPost.campus}
            onChange={(e) => {
              const selectedCampus = e.target.value;
              setNewPost({
                ...newPost,
                campus: selectedCampus,
                major: "",
                course: "",
              });
              setMajorSearch("");
              if (selectedCampus) {
                fetchProgramData(selectedCampus);
              }
            }}
          >
            <option value="">Select Campus (Optional)</option>
            <option value="Seattle">Seattle</option>
            <option value="Bothell">Bothell</option>
            <option value="Tacoma">Tacoma</option>
          </select>

          {/* Major Selection - Optional */}
          <div className="relative">
            <div className="relative">
              <Input
                className="w-full"
                disabled={!newPost.campus || isLoadingData}
                label="Major (Optional)"
                placeholder={
                  isLoadingData
                    ? "Loading majors..."
                    : "Search for your major (Optional)"
                }
                value={majorSearch}
                onChange={(e) => {
                  setMajorSearch(e.target.value);
                  setIsMajorDropdownOpen(true);
                }}
                onFocus={() => setIsMajorDropdownOpen(true)}
              />
              {(majorSearch || newPost.major) && (
                <button
                  className="absolute right-2 top-[38px] p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setMajorSearch("");
                    setNewPost((prev) => ({ ...prev, major: "" }));
                  }}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      fillRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
            {isMajorDropdownOpen && (
              <div
                className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                id="major-dropdown"
              >
                {filteredMajors.length > 0 ? (
                  filteredMajors.map((m) => (
                    <div
                      key={m.code}
                      className="cursor-pointer p-2 hover:bg-gray-100"
                      onClick={() => {
                        setNewPost((prev) => ({ ...prev, major: m.code }));
                        setMajorSearch(m.name);
                        setIsMajorDropdownOpen(false);
                      }}
                    >
                      {m.name} ({m.code})
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No results found.</div>
                )}
              </div>
            )}
          </div>

          {/* Course Selection - Optional */}
          <div className="mb-4">
            <CourseSelector
              courses={courses}
              value={newPost.course}
              onSelect={(selectedCourse) =>
                setNewPost((prev) => ({ ...prev, course: selectedCourse.code }))
              }
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional: Select a related course
            </p>
          </div>

          <Textarea
            className="w-full"
            label="Content *"
            minRows={5}
            placeholder="Share your thoughts..."
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />

          <div className="text-sm text-gray-500 mb-4">* Required fields</div>

          <Button
            className="w-full bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-white py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={isLoading || !newPost.title || !newPost.content}
            onClick={handleSubmitPost}
          >
            {isLoading ? "Creating..." : "Create Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}

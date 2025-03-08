"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";

interface Post {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  title: string;
  content: string;
  campus: string;
  major: string;
  course?: string;
  createdAt: number;
}

interface Course {
  code: string;
  name: string;
}

// Reuse CourseSelector from create page
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
          label="Course"
          value={search || value}
          onChange={(e) => {
            setSearch(e.target.value);
            setDropdownOpen(true);
            setDisplayLimit(50);
          }}
          onFocus={() => setDropdownOpen(true)}
          placeholder={
            courses.length === 0 ? "Loading courses..." : "Filter by course"
          }
          disabled={courses.length === 0}
          className="w-full"
        />
        {(search || value) && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-[38px] p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {dropdownOpen && (
        <div
          id="course-dropdown"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredCourses.length > 0 ? (
            <>
              {filteredCourses.map((c) => (
                <div
                  key={c.code}
                  onClick={() => {
                    onSelect(c);
                    setSearch("");
                    setDropdownOpen(false);
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-100"
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

// First, create a MajorSelector component similar to CourseSelector
const MajorSelector = ({
  majors,
  value,
  onSelect,
}: {
  majors: Array<{ code: string; name: string }>;
  value: string;
  onSelect: (major: { code: string; name: string }) => void;
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
      const dropdown = document.getElementById("major-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMajors = majors
    .filter(
      (m) =>
        m.code.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, displayLimit);

  const loadMore = () => {
    setDisplayLimit((prev) => prev + 50);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          label="Major"
          value={search || value}
          onChange={(e) => {
            setSearch(e.target.value);
            setDropdownOpen(true);
            setDisplayLimit(50);
          }}
          onFocus={() => setDropdownOpen(true)}
          placeholder={
            majors.length === 0 ? "Loading majors..." : "Search for a major"
          }
          disabled={majors.length === 0}
          className="w-full"
        />
        {(search || value) && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-[38px] p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {dropdownOpen && (
        <div
          id="major-dropdown"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredMajors.length > 0 ? (
            <>
              {filteredMajors.map((m) => (
                <div
                  key={m.code}
                  onClick={() => {
                    onSelect(m);
                    setSearch("");
                    setDropdownOpen(false);
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-600">{m.code}</div>
                </div>
              ))}
              {filteredMajors.length === displayLimit && (
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
                ? "No matching majors found."
                : "Start typing to search majors"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    campus: "",
    major: "",
    course: "",
  });
  const [majors, setMajors] = useState<Array<{ code: string; name: string }>>(
    []
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch program data when campus changes
  const fetchProgramData = async (campus: string) => {
    setIsLoadingData(true);
    try {
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        const sortedPosts = data.sort(
          (a: Post, b: Post) => b.createdAt - a.createdAt
        );
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    let result = [...posts];

    if (filters.campus) {
      result = result.filter((post) => post.campus === filters.campus);
    }
    if (filters.major) {
      result = result.filter((post) => post.major === filters.major);
    }
    if (filters.course) {
      result = result.filter((post) => post.course === filters.course);
    }

    setFilteredPosts(result);
  }, [filters, posts]);

  const clearFilters = () => {
    setFilters({ campus: "", major: "", course: "" });
  };

  const handleDeletePost = async (postId: string, postUserId: string) => {
    if (!currentUserId || currentUserId !== postUserId) return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(
        `/api/posts?id=${postId}&userId=${currentUserId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete post");

      setPosts(posts.filter((post) => post.id !== postId));
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4b2e83] to-[#85754d]">
              Recent Posts
            </h1>
          </div>
          <Button
            onClick={() => router.push("/dashboard/create")}
            className="bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
          >
            Create Post
          </Button>
        </div>

        {/* Filters Section */}
        <div className="mb-8 p-6 rounded-xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Filter Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Campus Filter */}
            <select
              value={filters.campus}
              onChange={(e) => {
                const selectedCampus = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  campus: selectedCampus,
                  major: "",
                  course: "",
                }));
                if (selectedCampus) {
                  fetchProgramData(selectedCampus);
                }
              }}
              className="w-full rounded-xl border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-500 p-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <option value="">All Campuses</option>
              <option value="Seattle">Seattle</option>
              <option value="Bothell">Bothell</option>
              <option value="Tacoma">Tacoma</option>
            </select>

            {/* Major Filter */}
            <MajorSelector
              majors={majors}
              value={filters.major}
              onSelect={(selectedMajor) => {
                setFilters((prev) => ({ ...prev, major: selectedMajor.code }));
              }}
            />

            {/* Course Filter */}
            <CourseSelector
              courses={courses}
              value={filters.course}
              onSelect={(course) =>
                setFilters((prev) => ({ ...prev, course: course.code }))
              }
            />
          </div>

          {/* Clear Filters Button */}
          {(filters.campus || filters.major || filters.course) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => router.push(`/users/${post.userId}`)}
                  >
                    {post.userImage ? (
                      <img
                        src={post.userImage}
                        alt={post.userName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4b2e83] to-[#85754d] flex items-center justify-center text-xl text-white ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300">
                        {post.userName[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#4b2e83] transition-colors">
                        {post.userName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {currentUserId === post.userId && (
                    <button
                      onClick={() => handleDeletePost(post.id, post.userId)}
                      className="text-red-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-3 text-gray-900">
                  {post.title}
                </h2>
                <div className="flex gap-2 mb-3">
                  {post.major && (
                    <span className="px-3 py-1 text-sm rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {post.major}
                    </span>
                  )}
                  {post.course && (
                    <span className="px-3 py-1 text-sm rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {post.course}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-600 text-lg">
                No posts match the selected filters
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-[#4b2e83] hover:text-[#85754d] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

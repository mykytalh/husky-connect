"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Textarea } from "@heroui/input";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import Cookies from "js-cookie";

interface Course {
  code: string;
  name: string;
}

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
  const [displayLimit, setDisplayLimit] = useState(50); // Show first 50 results initially

  // Filter courses based on search input (both code and name)
  const filteredCourses = courses
    .filter(
      (c) =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, displayLimit); // Limit the number of displayed results

  // Function to load more results
  const loadMore = () => {
    setDisplayLimit((prev) => prev + 50);
  };

  return (
    <div className="relative">
      <Input
        label="Course"
        value={search || value}
        onChange={(e) => {
          setSearch(e.target.value);
          setDropdownOpen(true);
          setDisplayLimit(50); // Reset display limit when search changes
        }}
        onFocus={() => setDropdownOpen(true)}
        placeholder={
          courses.length === 0
            ? "Loading courses..."
            : "Search for a course (e.g., CSE 142, Computer Programming)"
        }
        disabled={courses.length === 0}
        className="w-full"
      />
      {dropdownOpen && (
        <div
          id="course-dropdown"
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredCourses.length > 0 ? (
            <>
              {filteredCourses.map((c) => (
                <div
                  key={c.code}
                  onClick={() => {
                    onSelect(c);
                    setSearch(""); // reset search after selection
                    setDropdownOpen(false);
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  <div className="font-medium">{c.code}</div>
                  <div className="text-sm text-gray-600">{c.name}</div>
                </div>
              ))}
              {/* Show "Load More" button if there are more results */}
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

const SetupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    image: null as File | null,
    imagePreview: "",
    name: "",
    age: "",
    campus: "",
    classStanding: "",
    degreeType: "",
    major: "",
    minor: "",
    gpa: "",
    currentCourses: [] as string[],
    studyPreferences: [] as string[],
    bio: "",
  });

  const [majors, setMajors] = useState<Array<{ code: string; name: string }>>(
    []
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [majorSearch, setMajorSearch] = useState("");
  const [isMajorDropdownOpen, setIsMajorDropdownOpen] = useState(false);

  // Handle closing dropdown when clicking outside (for majors)
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

  // Fetch majors and courses when campus is selected
  const fetchProgramData = async (campus: string) => {
    setIsLoading(true);
    try {
      // Fetch majors
      const majorsRes = await fetch(
        `/api/majors?campus=${encodeURIComponent(campus)}&type=majors`
      );
      if (!majorsRes.ok) {
        throw new Error(`Failed to fetch majors: ${majorsRes.statusText}`);
      }
      const majorsData = await majorsRes.json();
      const majorsList = Object.entries(majorsData.majors || {}).map(
        ([code, name]) => ({
          code,
          name: name as string,
        })
      );
      setMajors(majorsList);

      // Fetch courses using your endpoint
      const coursesRes = await fetch(
        `/api/courses?campus=${encodeURIComponent(campus)}&type=courses`
      );
      if (!coursesRes.ok) {
        throw new Error(`Failed to fetch courses: ${coursesRes.statusText}`);
      }
      const coursesData = await coursesRes.json();
      // Convert the courses object into an array of { code, name }
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
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // When adding a course, we now add an empty string placeholder
  const addCourse = () => {
    setFormData((prev) => ({
      ...prev,
      currentCourses: [...prev.currentCourses, ""],
    }));
  };

  const removeCourse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      currentCourses: prev.currentCourses.filter((_, i) => i !== index),
    }));
  };

  const addPreference = () => {
    setFormData((prev) => ({
      ...prev,
      studyPreferences: [...prev.studyPreferences, ""],
    }));
  };

  const removePreference = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      studyPreferences: prev.studyPreferences.filter((_, i) => i !== index),
    }));
  };

  // Filter majors based on the search input (case-insensitive)
  const filteredMajors = majors.filter((m) =>
    m.name.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.campus || !formData.major) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push("/");
        return;
      }

      // Create a clean version of formData without File object and imagePreview
      const { image: _, imagePreview: __, ...cleanFormData } = formData;

      // Prepare user data
      const userData = {
        ...cleanFormData,
        setupComplete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Send data to API endpoint instead of direct Firestore access
      const response = await fetch("/api/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          userData: userData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      // Set setup completion cookie
      Cookies.set("setup-complete", "true");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("An error occurred while saving your profile");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text mb-4">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Let's help you to connect with your husky community!
          </p>
        </div>

        <Card className="p-6 backdrop-blur-sm bg-white/90 shadow-xl">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-40 h-40 mb-4">
              {formData.imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={formData.imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover rounded-full border-4 border-purple-200"
                  />
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        image: null,
                        imagePreview: "",
                      }))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
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
                  </button>
                </div>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-dashed border-purple-200 flex items-center justify-center bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-purple-400"
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
                    <p className="mt-2 text-sm text-purple-600">Upload Photo</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#4b2e83] border-b pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your full name"
                className="w-full"
              />
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, age: e.target.value }))
                }
                placeholder="Your age"
                className="w-full"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#4b2e83] border-b pb-2">
              Academic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.campus}
                onChange={(e) => {
                  const selectedCampus = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    campus: selectedCampus,
                    major: "",
                    minor: "",
                  }));
                  // Reset major search input when campus changes
                  setMajorSearch("");
                  if (selectedCampus) {
                    fetchProgramData(selectedCampus);
                  }
                }}
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 p-2"
              >
                <option value="">Select Campus</option>
                <option value="Seattle">Seattle</option>
                <option value="Bothell">Bothell</option>
                <option value="Tacoma">Tacoma</option>
              </select>

              <select
                value={formData.degreeType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    degreeType: e.target.value,
                  }))
                }
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 p-2"
              >
                <option value="">Select Degree Type</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate Master's">Graduate Master's</option>
                <option value="PhD">PhD</option>
              </select>

              <select
                value={formData.classStanding}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    classStanding: e.target.value,
                  }))
                }
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 p-2"
              >
                <option value="">Select Class Standing</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>

              <Input
                label="GPA"
                type="number"
                value={formData.gpa}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData((prev) => ({ ...prev, gpa: "" }));
                    return;
                  }
                  if (!/^\d*\.?\d{0,2}$/.test(value)) {
                    return;
                  }
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue <= 4.0) {
                    setFormData((prev) => ({ ...prev, gpa: value }));
                  }
                }}
                min="0"
                max="4.0"
                step="0.01"
                placeholder="Enter GPA (max 4.0)"
                className="w-full"
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && !isNaN(parseFloat(value))) {
                    const formatted = parseFloat(value).toFixed(2);
                    setFormData((prev) => ({ ...prev, gpa: formatted }));
                  }
                }}
              />

              {/* Replace the major select with a searchable dropdown */}
              <div className="relative">
                <Input
                  label="Major"
                  value={majorSearch}
                  onChange={(e) => {
                    setMajorSearch(e.target.value);
                    setIsMajorDropdownOpen(true);
                  }}
                  onFocus={() => setIsMajorDropdownOpen(true)}
                  placeholder={
                    isLoading ? "Loading majors..." : "Search for your major"
                  }
                  disabled={!formData.campus || isLoading}
                  className="w-full"
                />
                {isMajorDropdownOpen && (
                  <div
                    id="major-dropdown"
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    {filteredMajors.length > 0 ? (
                      filteredMajors.map((m) => (
                        <div
                          key={m.code}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              major: m.code,
                              minor: "",
                            }));
                            setMajorSearch(m.name);
                            setIsMajorDropdownOpen(false);
                          }}
                          className="cursor-pointer p-2 hover:bg-gray-100"
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

              {formData.major && (
                <Input
                  label="Minor (Optional)"
                  value={formData.minor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, minor: e.target.value }))
                  }
                  placeholder="Enter your minor if applicable"
                  className="w-full"
                />
              )}
            </div>
          </div>

          {/* Current Courses using CourseSelector */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#4b2e83] border-b pb-2">
              Current Courses
            </h2>
            <div className="space-y-4">
              {formData.currentCourses.map((courseCode, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <CourseSelector
                    courses={courses}
                    value={courseCode}
                    onSelect={(selectedCourse) =>
                      setFormData((prev) => {
                        const updated = [...prev.currentCourses];
                        updated[index] = selectedCourse.code;
                        return { ...prev, currentCourses: updated };
                      })
                    }
                  />
                  <button
                    onClick={() => removeCourse(index)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    type="button"
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
                </div>
              ))}
              <button
                onClick={addCourse}
                type="button"
                className="w-full py-2 px-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Course
              </button>
            </div>
          </div>

          {/* Study Preferences */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#4b2e83] border-b pb-2">
              Study Preferences
            </h2>
            <div className="space-y-4">
              {formData.studyPreferences.map((pref, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    label={`Preference ${index + 1}`}
                    value={pref}
                    onChange={(e) => {
                      const newPrefs = [...formData.studyPreferences];
                      newPrefs[index] = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        studyPreferences: newPrefs,
                      }));
                    }}
                    placeholder="e.g., Prefer evening study sessions"
                    className="w-full"
                  />
                  <button
                    onClick={() => removePreference(index)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    type="button"
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
                </div>
              ))}

              <button
                onClick={addPreference}
                type="button"
                className="w-full py-2 px-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Preference
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#4b2e83] border-b pb-2">
              About You
            </h2>
            <Textarea
              label="Bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell about yourself..."
              className="w-full"
              minRows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.campus || !formData.major}
          >
            Complete Profile
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default SetupPage;

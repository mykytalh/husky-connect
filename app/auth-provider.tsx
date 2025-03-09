"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { HomeNavbar } from "@/components/homeNavbar";
import { Navbar } from "@/components/navbar";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Use useEffect to trigger the prefetch
  useEffect(() => {
    const prefetchData = async () => {
      const campuses = ["Seattle", "Bothell", "Tacoma"];
    
      try {
        await Promise.all([
          ...campuses.map((campus) =>
            fetch(`/api/majors?campus=${campus}&type=majors`, { priority: "low" })
          ),
          ...campuses.map((campus) =>
            fetch(`/api/courses?campus=${campus}&type=courses`, { priority: "low" })
          ),
        ]);
      } catch (error) {
        // Silently handle prefetch errors
        console.error('Prefetch error:', error);
      }
    };

    prefetchData();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? <Navbar /> : <HomeNavbar />}
      {children}
    </>
  );
}
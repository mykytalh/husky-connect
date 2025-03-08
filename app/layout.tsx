"use client";

import "@/styles/globals.css";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import { HomeNavbar } from "@/components/homeNavbar";
import { Navbar } from "@/components/navbar";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show nothing while checking auth status to prevent flash of wrong navbar
  if (isLoading) {
    return null;
  }

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            {isAuthenticated ? <Navbar /> : <HomeNavbar />}
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            {/* <footer className="fixed bottom-0 w-full flex items-center justify-center py-3 bg-white/5 backdrop-blur-sm border-t border-white/10 shadow-lg z-50">
              <p>
                ©INFO 442: Group 5 (Sirak Yohannes, Aaron Jones, Christopher
                May Chen, Mykyta Lepikash, Sid Jayadev)
              </p>
            </footer> */}
          </div>
        </Providers>
      </body>
    </html>
  );
}

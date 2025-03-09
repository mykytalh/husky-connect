"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Cookies from "js-cookie";

import { auth } from "@/app/firebase/config";

export const Navbar = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        user.getIdToken().then((token) => {
          Cookies.set("auth-token", token);
        });
      } else {
        Cookies.remove("auth-token");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("auth-token");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <HeroUINavbar
      className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
      maxWidth="xl"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex items-center gap-2" href="/dashboard">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#4b2e83] to-[#85754d] text-transparent bg-clip-text">
              Husky Connect
            </span>
            <img
              alt="UW Logo"
              className="h-8 w-8"
              src="https://static.wixstatic.com/media/8cac10_4cab2aa83fe642599baea451dacc96c3~mv2.png/v1/fill/w_560,h_418,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/uw%20logo.png"
            />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Right side content */}
      <NavbarContent className="hidden lg:flex gap-4" justify="end">
        {isAuthenticated && (
          <>
            {/* Profile Dropdown */}
            <NavbarItem>
              <div ref={profileDropdownRef} className="relative">
                <button
                  className="text-gray-700 hover:text-[#4b2e83] transition-colors p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <NextLink
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      href="/about"
                    >
                      View Profile
                    </NextLink>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarContent className="lg:hidden" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="bg-white/90 backdrop-blur-sm pt-6">
        <NavbarMenuItem>
          <NextLink
            className="text-gray-700 hover:text-[#4b2e83] transition-colors w-full py-2 block"
            href="/dashboard"
            onClick={handleMenuItemClick}
          >
            Dashboard
          </NextLink>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <NextLink
            className="text-gray-700 hover:text-[#4b2e83] transition-colors w-full py-2 block"
            href="/about"
            onClick={handleMenuItemClick}
          >
            Profile
          </NextLink>
        </NavbarMenuItem>
        {isAuthenticated && (
          <NavbarMenuItem>
            <button
              className="text-red-500 hover:text-red-600 transition-colors w-full py-2 text-left"
              onClick={() => {
                handleLogout();
                handleMenuItemClick();
              }}
            >
              Log Out
            </button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
};

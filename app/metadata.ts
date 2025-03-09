import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import logo from "@/public/logo.png";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      {
        url: logo.src,
        type: "image/png",
      }
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://husky-connect.vercel.app",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  keywords: [
    "UW",
    "University of Washington",
    "Study Groups",
    "Student Connection",
    "Academic Networking",
    "Husky Community",
  ],
  authors: [
    { name: "Sirak Yohannes" },
    { name: "Aaron Jones" },
    { name: "Christopher May Chen" },
    { name: "Mykyta Lepikash" },
    { name: "Sid Jayadev" },
  ],
  creator: "INFO 442: Group 5",
};
import type { Metadata, Viewport } from "next";
import { Newsreader, Inter } from "next/font/google";
import { ServiceWorkerRegister } from "./components/ServiceWorkerRegister";
import { Toaster } from "./components/Toaster";
import "./globals.css";

// Editorial serif for headlines and brand voice; clean sans for UI chrome.
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-web",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-web",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dusty Email Hub",
  description:
    "Plan, review, and ship the monthly email program for Dusty Joplin.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Email Hub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ServiceWorkerRegister />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

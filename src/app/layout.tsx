import type { Metadata, Viewport } from "next";
// import { Geist } from "next/font/google"; // Online font removed for build stability
import "./globals.css";
import ChatAssistant from "@/components/ChatAssistant";

/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
*/

export const metadata: Metadata = {
  title: "RootCause | Right care. Right time.",
  description: "Stop plants from dying in the first 28 days.",
  applicationName: "RootCause",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Garden Care",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#059669", // Emerald 600
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {children}
        <ChatAssistant />
      </body>
    </html>
  );
}

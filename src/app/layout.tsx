import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google"; // Use Geist
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetterRoots | Garden Care SaaS",
  description: "Foolproof plant care schedules adapted to your local weather.",
  applicationName: "BetterRoots",
  appleWebApp: {
    capable: true,
    title: "BetterRoots",
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
      <body className={`${geistSans.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wize Admin Service",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-white`}>
          <div style={{ display: "flex", height: "100vh" }}>
            <Sidebar />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <header className="border-b-2 border-white flex items-center px-4 py-2 space-x-4">
              <h1 className="text-lg font-bold flex-1"></h1> {/* flex-1 forces this element to take all avaialbe space */}
                <nav className="flex space-x-4">
                  
                </nav>
              </header>

              <div style={{ flex: 1, padding: "20px" }}>{children}</div>

              <footer className="border-t-2 border-white">
                <p className="text-sm text-center">© 2025 Wize Admin Service. All rights reserved.</p>
              </footer>
            </div>
          </div>
      </body>
    </html>
  );
}

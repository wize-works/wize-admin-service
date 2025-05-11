import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Sidebar, Header, Footer, SidebarProvider } from "@/components/layout";
import { Metadata } from "next";
import React, { ReactNode } from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "JobSight",
    description: "JobSight is a job search engine that helps you find jobs and apply to them.",
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
    return (
        <html lang="en" suppressHydrationWarning>
            <Script src="https://kit.fontawesome.com/40c3b5129c.js" crossOrigin="anonymous" />
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen`} >
                <ThemeProvider>
                    <SidebarProvider>
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-screen pb-auto">
                            <Header />
                            <div className="grow p-6 container mx-auto">
                                {children}
                            </div>
                            <Footer />
                        </div>
                    </SidebarProvider>
                </ThemeProvider>
            </body>
        </html >
    );
}
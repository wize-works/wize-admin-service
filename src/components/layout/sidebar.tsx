"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useSidebar } from "./provider";
import Link from "next/link";
import Image from "next/image";
import { NavItem } from "./nav-item";

interface NavSectionProps {
    title: string;
    isCollapsed: boolean;
    children: ReactNode;
}

const NavSection: React.FC<NavSectionProps> = ({ title, isCollapsed, children }) => {
    return (
        <div className="mt-6">
            <h3 className={`px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? "hidden" : ""}`}>{title}</h3>
            <ul className="mt-2 space-y-1 px-2">{children}</ul>
        </div>
    )
}

export const Sidebar: React.FC = () => {
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = (): void => {
            setIsMobile(window.innerWidth < 768);
        };

        // Set initial state
        checkMobile();

        // Add resize listener
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
            {/* Backdrop for mobile */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed lg:static bg-base-100 border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col top-0 bottom-0 z-50
                    ${isCollapsed ? "w-16" : "w-64"}
                    ${isMobile ? (isCollapsed ? "-translate-x-full" : "translate-x-0") : ""}
                `}
            >
                <div className="flex items-center h-16 px-2 border-b border-gray-200">
                    {/* Full logo - visible when not collapsed */}
                    <div className={`flex-1 ${isCollapsed ? "hidden" : "block"}`}>
                        <Link href="/" className="flex items-center">
                            <span className="text-primary text-2xl font-semibold flex items-center">
                                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg mr-4"><Image src="/logo.png" alt="Logo" width={32} height={32} className="m-auto" /></div>
                                Job<span className="text-secondary">Sight</span>
                            </span>
                        </Link>
                    </div>

                    {/* Icon only - visible when collapsed */}
                    <div className={`flex-1 ${isCollapsed ? "block" : "hidden"} text-center`}>
                        <Link href="/" className="mx-auto inline-flex">
                            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg"><Image src="/logo.png" alt="Logo" width={32} height={32} className="m-auto" /></div>
                        </Link>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Navigation items */}
                    <ul className="space-y-1 px-2">
                    </ul>

                    {/* Navigation sections */}
                    <NavSection title="Main" isCollapsed={isCollapsed}>
                        <NavItem href="/databases" key="Database Tools" icon="fa-regular fa-rectangles-mixed" text="Datbase Tools" isCollapsed={isCollapsed} />
                    </NavSection>

                    <div className="mt-6 px-2">
                        <ul className="space-y-2">
                            <NavItem href="/settings" key="settings" icon="fa-regular fa-gear" text="Settings" isCollapsed={isCollapsed} />
                            <NavItem href="/help" key="help" icon="fa-regular fa-circle-question" text="Help & Support" isCollapsed={isCollapsed} />
                        </ul>
                    </div>
                </div>

                {/* User profile - full version */}
                <div className={`flex items-center mt-4 p-2 rounded-lg hover:bg-gray-100 ${isCollapsed ? "hidden" : "flex"}`}>
                    <div className="flex-shrink-0">
                        <div className="avatar">
                            <div className="w-8 rounded-full">
                                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                                    <i className="far fa-user"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">Brandon</p>
                        <p className="text-xs text-gray-500">@JobSight</p>
                    </div>
                </div>

                {/* User profile - collapsed version */}
                <div className={`flex justify-center mt-4 ${isCollapsed ? "block" : "hidden"}`}>
                    <div className="avatar">
                        <div className="w-8 rounded-full">
                            <i className="far fa-user"></i>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
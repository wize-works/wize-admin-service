"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
    icon: string;
    text: string;
    isActive?: boolean;
    isCollapsed: boolean;
    hasChildren?: boolean;
    isNew?: boolean;
    href?: string;
}

export const NavItem: React.FC<NavItemProps> = ({ 
    icon, 
    text, 
    isActive: forcedActive, 
    isCollapsed, 
    hasChildren, 
    isNew, 
    href = "#" 
}) => {
    const pathname = usePathname();
    const isActive = forcedActive !== undefined ? forcedActive : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <li>
            <Link
                href={href}
                className={`flex items-center p-3 ${isActive ? "btn btn-secondary" : "btn bg-base-100 hover:bg-base-300"} rounded-sm shadow-none transition-all duration-200 relative`}
            >
                <i className={`${icon} fa-lg flex-none ${!isCollapsed ? "mr-3" : "mr-0"}`} />
                <span className={`flex-1 text-left ${isCollapsed ? "hidden" : ""}`}>{text}</span>
                {isNew && <span className={`badge badge-xs badge-info absolute -top-1 right-0 text-2xs ${isCollapsed ? "hidden" : ""}`}>New</span>}
                {hasChildren && <i className={`far fa-chevron-right w-3 h-3 ${isCollapsed ? "hidden" : ""}`} />}
            </Link>
        </li>
    )
}

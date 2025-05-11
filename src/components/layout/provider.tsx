"use client";
import React, { useEffect, ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,
    toggleSidebar: () => { },
});

export const useSidebar = (): SidebarContextType => useContext(SidebarContext);

interface SidebarProviderProps {
    children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

    useEffect(() => {
        // Function to check if the device is mobile
        const checkMobile = (): boolean => {
            return window.innerWidth < 768; // 768px is the 'md' breakpoint in Tailwind
        };

        setIsCollapsed(checkMobile());

        const handleResize = (): void => {
            setIsCollapsed(checkMobile());
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = (): void => {
        setIsCollapsed(prevState => !prevState);
    }

    return <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>{children}</SidebarContext.Provider>
}

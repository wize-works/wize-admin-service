"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import React from "react"

export function ThemeToggle(): React.ReactElement {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState<boolean>(false)

    // Avoid hydration mismatch by only showing the toggle after mounting
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="btn btn-ghost btn-circle avatar opacity-0">
                <i className="w-5 h-5 fa-light fa-moon" />
            </div>
        )
    }

    // Get the appropriate icon based on the current theme
    const getThemeIcon = (): React.ReactElement => {
        if (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) {
            return <i className="w-5 h-5 fa-light fa-moon" />
        } else if (theme === "light" || (theme === "system" && resolvedTheme === "light")) {
            return <i className="w-5 h-5 fa-light fa-sun" />
        } else {
            return <i className="w-5 h-5 fa-light fa-desktop" />
        }
    }

    return (
        <details className="dropdown dropdown-end">
            <summary className="btn btn-ghost btn-circle avatar">
                {getThemeIcon()}
            </summary>
            <ul className="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52 z-10">
                <li className={theme === "light" ? "active" : ""}>
                    <a onClick={(e: React.MouseEvent): void => setTheme("light")}>
                        <i className="w-4 h-4 mr-2 fa-light fa-sun" />
                        Light
                    </a>
                </li>
                <li className={theme === "dark" ? "active" : ""}>
                    <a onClick={(e: React.MouseEvent): void => setTheme("dark")}>
                        <i className="w-4 h-4 mr-2 fa-light fa-moon" />
                        Dark
                    </a>
                </li>
                <li className={theme === "system" ? "active" : ""}>
                    <a onClick={(e: React.MouseEvent): void => setTheme("system")}>
                        <i className="w-4 h-4 mr-2 fa-light fa-desktop" />
                        System
                    </a>
                </li>
            </ul>
        </details>
    )
}

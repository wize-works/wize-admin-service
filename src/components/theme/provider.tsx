"use client"
import React, { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ThemeProviderProps {
  children: ReactNode;
  [key: string]: any;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.ReactElement {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="light"
            enableSystem={false}
            themes={["light", "dark"]}
            storageKey="theme"
            enableColorScheme={true}
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}

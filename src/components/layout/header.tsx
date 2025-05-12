"use client"

import React, { useCallback, useEffect, useState } from "react";
import { useSidebar } from "@/components/layout";
import { ThemeToggle } from "@/components/theme/toggle";
import SelectList from "@/components/selectList";
import { setSelectedClientCookie } from "@/context/clientActions";
import { useRouter, usePathname } from "next/navigation";

export const Header: React.FC = () => {
    const { isCollapsed, toggleSidebar } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Load selected client from localStorage on initial render
    useEffect(() => {
        const savedClient = localStorage.getItem('selectedClient');
        if (savedClient) {
            try {
                const parsed = JSON.parse(savedClient);
                setSelectedValue(parsed.value);
                
                // Also set the cookie to ensure server-side state is in sync
                setSelectedClientCookie(parsed).catch(err => {
                    console.error('Failed to set selected client cookie:', err);
                });
            } catch (e) {
                console.error('Failed to parse saved client:', e);
            }
        }
        setIsInitialLoad(false);
    }, []);

    // Also sync when the component mounts and whenever the page changes
    useEffect(() => {
        const syncClientState = async () => {
            const savedClient = localStorage.getItem('selectedClient');
            if (savedClient) {
                try {
                    await setSelectedClientCookie(JSON.parse(savedClient));
                } catch (e) {
                    console.error('Failed to sync client state:', e);
                }
            }
        };
        
        syncClientState();
    }, [pathname]); // Re-sync whenever the pathname changes

    // Fetch client options from API
    useEffect(() => {
        fetch('/api/clients')
            .then(res => res.json())
            .then((keys: Record<string, string>) => {
                const options = Object.entries(keys).map(([key, value]) => ({
                    value: key,
                    label: value,
                }));
                
                // Add hard-coded option to the options list
                options.push({ value: '0', label: 'Admin' });
                
                setClientOptions(options);
                
                // If no client is selected yet and options are loaded, default to the first option
                if (!selectedValue && options.length > 0) {
                    handleClientChange(options[0].value);
                }
            })
            .catch(err => {
                console.error('Error fetching client keys:', err);
                // If API fails, at least add the admin option
                const fallbackOptions = [{ value: '0', label: 'Admin' }];
                setClientOptions(fallbackOptions);
                
                if (!selectedValue) {
                    handleClientChange('0'); // Default to admin if API fails
                }
            });
    }, [selectedValue]);

    // Use memoized callback to prevent unnecessary re-renders
    const handleToggle = useCallback((e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    }, [toggleSidebar]);

    const handleClientChange = async (value: string) => {
        if (selectedValue === value) return; // No change, do nothing
        
        const selected = clientOptions.find(option => option.value === value);
        if (selected) {
            // Set in local state
            setSelectedValue(value);
            
            // Save to localStorage
            localStorage.setItem('selectedClient', JSON.stringify(selected));
            
            // Set the cookie via server action
            try {
                await setSelectedClientCookie(selected);
            } catch (err) {
                console.error('Failed to set selected client cookie:', err);
            }
            
            // Redirect to databases page on client change, but not on initial load
            if (!isInitialLoad && pathname !== '/databases') {
                router.push('/databases');
            }
            
            // Refresh the current page to apply the new client context
            router.refresh();
        }
    };

    return (
        <header className="bg-base-100 border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <SelectList
                            options={clientOptions}
                            selectedValue={selectedValue}
                            name="client"
                            label="Client Application"
                            onChange={handleClientChange}
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button className="btn btn-ghost btn-circle">
                            <i className="fa-solid fa-desktop w-5 h-5" />
                        </button>
                        <button className="btn btn-ghost btn-circle">
                            <div className="indicator">
                                <i className="fa-solid fa-bell w-5 h-5" />
                                <span className="indicator-item badge badge-xs badge-primary"></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
};

export default Header;
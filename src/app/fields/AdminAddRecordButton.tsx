"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSelectedClientFromCookies } from "@/context/clientActions";

export default function AdminAddRecordButton({ databaseName, tableName, makeIdLinkable }: { databaseName: string; tableName: string; makeIdLinkable: boolean }) {
    const [error, setError] = useState<string | null>(null); // State to store error messages
    const [loading, setLoading] = useState<boolean>(false); // State to indicate loading
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Get selected client ID from cookies
        const fetchClientId = async () => {
            try {
                const selectedClient = await getSelectedClientFromCookies();
                setSelectedClientId(selectedClient?.value || null);
            } catch (error) {
                console.error("Error fetching client from cookies:", error);
            }
        };

        fetchClientId();
    }, []);

    const handleNavigate = () => {
        if (!selectedClientId) {
            setError("No client selected");
            return;
        }
        
        setLoading(true);
        // Navigate to the admin create page with the database and table parameters
        router.push(`/fields/adminCreate?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}`);
    };
    
    return (
        <div>
            <button
                onClick={handleNavigate}
                className="px-4 py-2 btn btn-error"
                disabled={loading || !selectedClientId}
            >
                {loading ? "Loading..." : "ADMIN: Add Record"}
            </button>

            {error && <p className="mt-4 text-red-500">Error: {error}</p>}
        </div>
    );
}
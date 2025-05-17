"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSelectedClientFromCookies } from "@/context/clientActions";

export default function AddRecordButton({ databaseName, tableName, makeIdLinkable }: { databaseName: string; tableName: string; makeIdLinkable: boolean }) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
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
        router.push(`/fields/create?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}`);
    };
    
    return (
        <div>
            <button
                onClick={handleNavigate}
                className="px-4 py-2 btn btn-primary"
                disabled={loading || !selectedClientId}
            >
                {loading ? "Loading..." : "Add Record"}
            </button>

            {error && <p className="mt-4 text-red-500">Error: {error}</p>}
        </div>
    );
}
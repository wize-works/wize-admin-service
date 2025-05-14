"use client";

import { useState, useEffect } from "react";
import { getSelectedClientFromCookies } from "@/context/clientActions";

export default function FetchRecordsButton({ databaseName, tableName, makeIdLinkable }: { databaseName: string; tableName: string; makeIdLinkable: boolean }) {
  const [tableData, setTableData] = useState<any[]>([]); // State to store fetched table data
  const [error, setError] = useState<string | null>(null); // State to store error messages
  const [loading, setLoading] = useState<boolean>(false); // State to indicate loading
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
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

  async function handleFetchTableData() {
    if (!selectedClientId) {
      setError("No client selected");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Update the API call to include the clientId from cookies
      const response = await fetch(
        `/api/fetchTableData?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}&identityId=${encodeURIComponent(selectedClientId)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setTableData(data); // Update state with fetched data
    } catch (error: any) {
      setError(error.message); // Update state with error message
    } finally {
      setLoading(false);
    }
  }

  // Get all unique fields from the data
  const allFields = Array.from(new Set(tableData.flatMap((row) => Object.keys(row))));

  return (
    <div>
      <button
        onClick={handleFetchTableData}
        className="px-4 py-2 btn btn-primary"
        disabled={loading || !selectedClientId}
      >
        {loading ? "Fetching..." : "Fetch Records"}
      </button>

      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {tableData.length > 0 && (
        <div className="mt-4 w-full">
          <h3 className="text-xl font-bold mb-2">Table Data:</h3>
          <table className="table-auto border-collapse w-full">
            <thead className="bg-base-300">
              <tr>
                {allFields.map((field) => (
                  <th key={field} className="px-4 py-2 text-left border border-base-300">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {allFields.map((field, fieldIndex) => (
                    <td key={field} className="px-4 py-2 border border-base-200">
                      {fieldIndex === 0 ? (
                        <a 
                          href={`/fields/details?db=${databaseName}&table=${tableName}&recordId=${row[field]}`}
                          className={`btn btn-sm btn-outline ${index % 2 === 0 ? 'border-primary text-primary hover:bg-primary' : 'border-secondary text-secondary hover:bg-secondary'} w-full`}
                        >
                          {row[field]}
                        </a>
                      ) : (
                        row[field] !== undefined ? (
                          typeof row[field] === "object" ? JSON.stringify(row[field]) : row[field]
                        ) : (
                          "-"
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
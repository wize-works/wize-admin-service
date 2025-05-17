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

  async function handleFetchRecords() {
    if (!selectedClientId) {
      setError("No client selected");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {

      const apiKeyResponse = await fetch(`/api/fetchApiKey?clientId=${encodeURIComponent(selectedClientId)}`);
      if (!apiKeyResponse.ok) {
        throw new Error(`Failed to get API key: ${apiKeyResponse.status}`);
      }
      const apiKeyData = await apiKeyResponse.json();
      if (!apiKeyData) {  
        throw new Error("API key not found");
      }
      
      // Extract the actual API key value from the response
      const apiKey = apiKeyData.apiKey || apiKeyData;
      
      const response = await fetch(`/api/fetchRecords?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}&apiKey=${encodeURIComponent(apiKey)}&identityKey=${encodeURIComponent(selectedClientId)}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Handle the nested data structure if present
      let extractedData = responseData;
      
      // Check if response has the nested structure
      if (responseData.data) {
        const tableCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
        const findMethodName = `find${tableCapitalized}`;
        
        if (responseData.data[findMethodName] && responseData.data[findMethodName].data) {
          extractedData = responseData.data[findMethodName].data;
        } else {
          extractedData = responseData.data;
        }
      }
      
      setTableData(Array.isArray(extractedData) ? extractedData : []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Get all unique fields from the data
  const allFields = Array.isArray(tableData) 
    ? Array.from(new Set(tableData.flatMap((row) => Object.keys(row || {}))))
    : [];

  return (
    <div>
      <button
        onClick={handleFetchRecords}
        className="px-4 py-2 btn btn-primary"
        disabled={loading || !selectedClientId}
      >
        {loading ? "Fetching..." : "Fetch Records"}
      </button>

      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {!loading && tableData.length === 0 && !error && (
        <div className="mt-4 p-6 text-center border rounded-md">
          <p>No Records Found</p>
        </div>
      )}

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
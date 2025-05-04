"use client";

import { useState } from "react";
import FetchDatabaseTablesButton from "./FetchDatabaseTablesButton"; // Import the button

export default function FetchTableDataButton({ databaseName, tableName }: { databaseName: string; tableName: string }) {
  const [tableData, setTableData] = useState<any[]>([]); // State to store fetched table data
  const [error, setError] = useState<string | null>(null); // State to store error messages
  const [loading, setLoading] = useState<boolean>(false); // State to indicate loading

  async function handleFetchTableData() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/fetchTableData?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}`);
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
    <div className="mt-4">
      {/* Buttons side by side */}
      <div className="flex space-x-4">
        <FetchDatabaseTablesButton databaseName={databaseName} /> {/* Left button */}
        <button
          onClick={handleFetchTableData}
          className="button"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Table Data"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {tableData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Table Data:</h3>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr>
                {allFields.map((field) => (
                  <th key={field} className="border border-gray-300 px-4 py-2 text-left">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {allFields.map((field) => (
                    <td key={field} className="border border-gray-300 px-4 py-2">
                      {row[field] !== undefined ? (
                        typeof row[field] === "object" ? JSON.stringify(row[field]) : row[field]
                      ) : (
                        "-"
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
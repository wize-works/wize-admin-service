import { FetchTableNames, FetchClientKeys } from "../service-clients/wize-database-service-client";
import FetchDatabasesButton from "./FetchDatabasesButton";
import SelectList from "../../components/selectList";
import Link from "next/link";

// Add export configuration to indicate dynamic behavior
export const dynamic = 'force-dynamic';

// Use server-side props with searchParams
export default async function QueryTables({ searchParams }: { searchParams: { db?: string, option?: string, identityId?: string } }) {
  // Ensure we properly await any async operations
  const databaseName = searchParams?.db;
  const selectedOption = searchParams?.option;
  const identityId = searchParams?.identityId || selectedOption; // Use identityId if provided, otherwise fall back to option

  // Fetch client keys for the dropdown
  const clientKeys = await FetchClientKeys();
  
  const selectListItems = Object.entries(clientKeys).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  if (!databaseName) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">No database selected</h1>
        <p>Please navigate back and select a database.</p>
      </div>
    );
  }

  // Fetch all table names for the selected database if client app is selected
  const tableNames = identityId ? await FetchTableNames(databaseName) : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Database: {databaseName}</h1>
      
      {/* Display selected client app if available */}
      {selectedOption && clientKeys[selectedOption] && (
        <p className="mb-4 text-gray-600">
          Client Application: {clientKeys[selectedOption]}
        </p>
      )}
      
      {/* Add the SelectList component */}
      <SelectList
        options={selectListItems}
        selectedValue={selectedOption}
        name="identityId"
        label="Client Application:"
      />
      
      {identityId && (
        <>
          <h2 className="text-xl font-bold mb-4 mt-4">Tables:</h2>
          <ul className="space-y-2">
            {tableNames.map((tableName) => (
              <li key={tableName} className="p-2 rounded shadow">
                <Link
                  href={`/fields?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}&identityId=${encodeURIComponent(identityId)}`}
                  className="text-blue-500 hover:underline"
                >
                  {tableName}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <FetchDatabasesButton />
          </div>
        </>
      )}
    </div>
  );
}
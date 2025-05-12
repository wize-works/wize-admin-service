import { FetchTableNames, FetchClientKeys } from "../service-clients/wize-database-service-client";
import FetchDatabasesButton from "./FetchDatabasesButton";
import SelectList from "../../components/selectList";
import Link from "next/link";
import { getSelectedClientFromCookies } from "@/context/clientActions";

// Add export configuration to indicate dynamic behavior
export const dynamic = 'force-dynamic';

// Use server-side props with searchParams
export default async function QueryTables({ searchParams }: { searchParams: { db?: string } }) {
  // Get the selected client from cookies
  const selectedClient = await getSelectedClientFromCookies();
  
  // Ensure we properly await any async operations
  const databaseName = searchParams?.db;

  // Fetch client keys for the dropdown (might not be needed if we're using selectedClient from cookies)
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
  const tableNames = selectedClient ? await FetchTableNames(databaseName, selectedClient.value) : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Database: {databaseName}</h1>
      
      {/* Display selected client app if available */}
      {selectedClient && (
        <p className="mb-4 text-gray-600">
          Client Application: {selectedClient.label}
        </p>
      )}
      
      {!selectedClient && (
        <div className="alert alert-info">
          <p>Please select a client application from the dropdown in the header.</p>
        </div>
      )}
      
      {selectedClient && (
        <>
          <h2 className="text-xl font-bold mb-4 mt-4">Tables:</h2>
          <div className="flex flex-col gap-2">
            {tableNames.map((tableName, index) => (
              <Link
                key={tableName}
                href={`/fields?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}`}
                className={`btn btn-outline ${index % 2 === 0 ? 'border-primary text-primary hover:bg-primary' : 'border-secondary text-secondary hover:bg-secondary'} w-full text-left justify-start`}
              >
                {tableName}
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <FetchDatabasesButton />
          </div>
        </>
      )}
    </div>
  );
}
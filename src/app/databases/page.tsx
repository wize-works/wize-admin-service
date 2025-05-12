import { FetchDatabaseNames } from "../service-clients/wize-database-service-client";
import Link from "next/link";
import { getSelectedClientFromCookies } from "@/context/clientActions";

export default async function DatabasesPage() {
  // Get the selected client from cookies
  const selectedClient = await getSelectedClientFromCookies();

  // Fetch database names only if a client is selected, passing the client ID for filtering
  const databaseNames = selectedClient ? await FetchDatabaseNames(selectedClient.value) : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Databases</h1>

      {/* Instructions for when no client is selected */}
      {!selectedClient && (
        <div className="alert alert-info">
          <p>Please select a client application from the dropdown in the header.</p>
        </div>
      )}

      {/* Render the list only if a client is selected */}
      {selectedClient && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Available Databases for {selectedClient.label}:</h2>
          <div className="flex flex-col gap-2">
            {databaseNames.map((dbName, index) => (
              <Link
                key={dbName}
                href={`/tables?db=${encodeURIComponent(dbName)}`}
                className={`btn btn-outline ${index % 2 === 0 ? 'border-primary text-primary hover:bg-primary' : 'border-secondary text-secondary hover:bg-secondary'} w-full text-left justify-start`}>
                {dbName}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
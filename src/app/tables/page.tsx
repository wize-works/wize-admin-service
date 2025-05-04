import { FetchTableNames } from "../service-clients/wize-database-service-client";
import FetchDatabasesButton from "./FetchDatabasesButton"; // Import the button

export default async function QueryTables({ searchParams }: { searchParams: { db?: string } }) {
  const databaseName = searchParams.db;

  if (!databaseName) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">No database selected</h1>
        <p>Please navigate back and select a database.</p>
      </div>
    );
  }

  // Fetch all table names for the selected database
  const tableNames = await FetchTableNames(databaseName);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Database: {databaseName}</h1>
      <h2 className="text-xl font-bold mb-4">Tables:</h2>
      <ul className="space-y-2">
        {tableNames.map((tableName) => (
          <li key={tableName} className="p-2 rounded shadow">
            <a
              href={`/fields?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}`}
              className="text-blue-500 hover:underline"
            >
              {tableName}
            </a>
          </li>
        ))}
      </ul>

      {/* Add the FetchDatabasesButton below the list */}
      <div className="mt-4">
        <FetchDatabasesButton />
      </div>
    </div>
  );
}
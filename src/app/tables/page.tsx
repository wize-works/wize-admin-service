import { FetchTableNames, FetchClientKeys } from "../service-clients/wize-database-service-client";
import FetchDatabasesButton from "./FetchDatabasesButton"; // Import the button
import SelectList from "../../components/selectList"; // Import the SelectList component
import Link from "next/link";

export default async function QueryTables({ searchParams }: { searchParams: { db?: string, option?: string } }) {
  const databaseName = searchParams.db;
  const selectedOption = searchParams.option;

  // Fetch client keys and transform them into options for the dropdown
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

  // Fetch all table names for the selected database only if client app is selected
  const tableNames = selectedOption ? await FetchTableNames(databaseName) : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Database: {databaseName}</h1>
      
      {/* Add the SelectList component */}
      <SelectList
        options={selectListItems}
        selectedValue={selectedOption}
        name="option"
        label="Client Application:"
      />
      
      {selectedOption && (
        <>
          <h2 className="text-xl font-bold mb-4 mt-4">Tables:</h2>
          <ul className="space-y-2">
            {tableNames.map((tableName) => (
              <li key={tableName} className="p-2 rounded shadow">
                <Link
                  href={`/fields?db=${encodeURIComponent(databaseName)}&table=${encodeURIComponent(tableName)}&option=${encodeURIComponent(selectedOption)}`}
                  className="text-blue-500 hover:underline"
                >
                  {tableName}
                </Link>
              </li>
            ))}
          </ul>

          {/* Add the FetchDatabasesButton below the list */}
          <div className="mt-4">
            <FetchDatabasesButton />
          </div>
        </>
      )}
    </div>
  );
}
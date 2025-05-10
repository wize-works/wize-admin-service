import { FetchDatabaseNames, FetchClientKeys } from "../service-clients/wize-database-service-client";
import Link from "next/link";
import SelectList from "../../components/selectList"; // Adjust the import path as necessary

export default async function DatabasesPage({ searchParams }: { searchParams: { option?: string } }) {
  // Fetch client keys and transform them into options for the dropdown
  const clientKeys = await FetchClientKeys();
  
  const selectListItems = Object.entries(clientKeys).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  // Get the selected option from the query parameters
  const selectedOption = await searchParams.option;

  // Fetch database names only if an option is selected
  const databaseNames = selectedOption ? await FetchDatabaseNames() : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Databases</h1>

      {/* Add the SelectList component above the <ul> */}
      <SelectList
        options={selectListItems}
        selectedValue={selectedOption}
        name="option"
        label="Client Application:"
      />

      {/* Render the list only if an option is selected */}
      {selectedOption && (
        <ul className="space-y-2 mt-4">
          {databaseNames.map((dbName) => (
            <li key={dbName} className="p-2 rounded shadow">
              <Link
                href={`/tables?db=${encodeURIComponent(dbName)}&option=${encodeURIComponent(selectedOption)}`}
                className="text-blue-500 hover:underline"
              >
                {dbName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
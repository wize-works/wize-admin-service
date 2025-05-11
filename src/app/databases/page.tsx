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
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Available Databases:</h2>
          <div className="flex flex-col gap-2">
            {databaseNames.map((dbName, index) => (
              <Link
                key={dbName}
                href={`/tables?db=${encodeURIComponent(dbName)}&option=${encodeURIComponent(selectedOption)}`}
                className={`btn ${index % 2 === 0 ? 'btn-primary' : 'btn-secondary'} w-full text-left justify-start`}>
                {dbName}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
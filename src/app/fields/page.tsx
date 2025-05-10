import { FetchFieldNames, FetchClientKeys } from "../service-clients/wize-database-service-client";
import FetchTableDataButton from "./FetchTableDataButton"; // Import the Client Component
import SelectList from "../../components/selectList"; // Import the SelectList component

export default async function FieldsPage({ searchParams }: { searchParams: { db?: string; table?: string; identityId?: string } }) {
  const databaseName = searchParams.db;
  const tableName = searchParams.table;
  const selectedOption = searchParams.identityId;

  // Fetch client keys and transform them into options for the dropdown
  const clientKeys = await FetchClientKeys();
  
  const selectListItems = Object.entries(clientKeys).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  if (!databaseName || !tableName) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">No database or table selected</h1>
        <p>Please navigate back and select a database and table.</p>
      </div>
    );
  }

  // Fetch all field names and types for the selected table only if client app is selected
  const fieldInfo = selectedOption ? await FetchFieldNames(databaseName, tableName) : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Database: {databaseName}</h1>
      <h2 className="text-xl font-bold mb-4">Table: {tableName}</h2>
      
      {/* Add the SelectList component */}
      <SelectList
        options={selectListItems}
        selectedValue={selectedOption}
        name="identityId"
        label="Client Application:"
      />
      
      {selectedOption && (
        <>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-2 font-bold">
              <div>Field Name</div>
              <div>Field Type</div>
            </div>
            <ul className="space-y-2">
              {fieldInfo.map(({ name, type }) => (
                <li key={name} className="grid grid-cols-2 gap-4 p-2 rounded shadow">
                  <div>{name}</div>
                  <div>{type}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              {/* Pass the selectedOption (schemaId) to the FetchTableDataButton */}
              <FetchTableDataButton 
                databaseName={databaseName} 
                tableName={tableName} 
                identityId={selectedOption}
                makeIdLinkable={true} // Add new prop to indicate IDs should be linkable
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
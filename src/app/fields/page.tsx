import { FetchApiKey, FetchFieldNames as FetchFieldNamesFromDb } from "../service-clients/wize-database-service-client";
import { FetchFieldNames as FetchFieldnamesFromApi } from "../service-clients/wize-api-service-client";
import { getSelectedClientFromCookies } from "@/context/clientActions";
import FetchDatabaseTablesButton from "./FetchDatabaseTablesButton";
import FetchRecordsButton from "./FetchRecordsButton";
import AddRecordButton from "./AddRecordButton";

// Add export configuration to indicate dynamic behavior
export const dynamic = 'force-dynamic';

export default async function FieldsPage({ searchParams }: { searchParams: { db?: string; table?: string; } }) {
  // Get the selected client from cookies
  const selectedClient = await getSelectedClientFromCookies();

  const databaseName = searchParams.db;
  const tableName = searchParams.table;

  if (!databaseName || !tableName) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">No database or table selected</h1>
        <p>Please navigate back and select a database and table.</p>
      </div>
    );
  }

  const selectedClientId = selectedClient?.value;
  var fieldInfo: { name: string; type: string }[] = [];
  if (selectedClientId === '0') {
    fieldInfo = await FetchFieldNamesFromDb(databaseName, tableName, selectedClientId);
  }
  else {
    const apikey = await FetchApiKey(selectedClientId ?? '');
    fieldInfo = selectedClient && apikey ? await FetchFieldnamesFromApi(databaseName, tableName, apikey) : [];
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Database: {databaseName}</h1>
      <h2 className="text-xl font-bold mb-4">Table: {tableName}</h2>

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

            {/* Only show the buttons for admin users */}

            <div className="flex gap-4 mt-4">
              <FetchRecordsButton
                databaseName={databaseName}
                tableName={tableName}
                makeIdLinkable={true}
              />
              <FetchDatabaseTablesButton
                databaseName={databaseName}
                tableName={tableName}
                makeIdLinkable={true}
              />
              <AddRecordButton
                databaseName={databaseName}
                tableName={tableName}
                makeIdLinkable={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
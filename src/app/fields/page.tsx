import { FetchFieldNames } from "../service-clients/wize-database-service-client";
import FetchTableDataButton from "./FetchTableDataButton"; // Import the Client Component

export default async function FieldsPage({ searchParams }: { searchParams: { db?: string; table?: string } }) {
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

  // Fetch all field names and types for the selected table
  const fieldInfo = await FetchFieldNames(databaseName, tableName);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Database: {databaseName}</h1>
      <h2 className="text-xl font-bold mb-4">Fields in Table: {tableName}</h2>
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
      <FetchTableDataButton databaseName={databaseName} tableName={tableName} />
    </div>
  );
}
import { FetchDatabaseNames } from "../service-clients/wize-database-service-client";
import Link from "next/link";

export default async function DatabasesPage() {
  const databaseNames = await FetchDatabaseNames();

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Databases</h1>
      <ul className="space-y-2">
        {databaseNames.map((dbName) => (
          <li key={dbName} className="p-2 rounded shadow">
            <Link href={`/tables?db=${encodeURIComponent(dbName)}`} className="text-blue-500 hover:underline">
              {dbName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
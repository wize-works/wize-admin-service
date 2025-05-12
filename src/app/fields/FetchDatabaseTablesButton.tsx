"use client";

import { useRouter } from "next/navigation";

export default function FetchDatabaseTablesButton({ databaseName, tableName, makeIdLinkable }: 
  { databaseName: string; tableName: string; makeIdLinkable: boolean }) {
  
  const router = useRouter();

  function navigateToTables() {
    router.push(`/tables?db=${encodeURIComponent(databaseName)}`);
  }

  return (
    <button
      onClick={navigateToTables}
      className="px-4 py-2 btn btn-primary"
    >
      Back to Tables
    </button>
  );
}
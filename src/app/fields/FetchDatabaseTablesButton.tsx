"use client";

import { useRouter } from "next/navigation";

interface FetchDatabaseTablesButtonProps {
  databaseName: string;
}

export default function FetchDatabaseTablesButton({ databaseName }: FetchDatabaseTablesButtonProps) {
  const router = useRouter();

  function handleNavigate() {
    // Navigate back to the /tables page with the database name as a query parameter
    router.push(`/tables?db=${encodeURIComponent(databaseName)}`);
  }

  return (
    <button
      onClick={handleNavigate}
      className="button"
    >
      Tables View
    </button>
  );
}
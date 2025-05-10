"use client";

import { useRouter } from "next/navigation";

interface FetchTableDataButtonProps {
  databaseName: string;
  selectedOption: string;
  tableName: string;
  makeIdLinkable?: boolean; // Add the optional makeIdLinkable prop
}
export default function FetchDatabaseTablesButton({ databaseName, selectedOption }: FetchTableDataButtonProps) {
  const router = useRouter();

  function handleNavigate() {
    // Navigate back to the /tables page with the database name as a query parameter
    router.push(`/tables?db=${encodeURIComponent(databaseName)}&option=${encodeURIComponent(selectedOption)}`);
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
"use client";

import { useRouter } from "next/navigation";

export default function FetchDatabasesButton() {
  const router = useRouter();

  function handleNavigate() {
    // Navigate back to the /databases page
    router.push("/databases");
  }

  return (
    <button
      onClick={handleNavigate}
      className="button px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
    >
      Databases View
    </button>
  );
}
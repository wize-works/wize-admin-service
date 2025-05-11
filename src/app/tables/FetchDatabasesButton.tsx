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
      className="px-4 py-2 btn btn-primary"
    >
      Databases View
    </button>
  );
}
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
      className="button px-4 btn bg-base-100 hover:bg-base-300 py-2 rounded "
    >
      Databases View
    </button>
  );
}
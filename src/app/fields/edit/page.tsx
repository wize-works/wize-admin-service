import { GetIdentityKey } from "../../service-clients/wize-database-service-client";
import { GetRecordById, UpdateRecord } from "../../service-clients/wize-api-service-client";

type SearchParams = {
  db: string;
  table: string;
  identityId: string;
  recordId: string;
};

export default async function EditRecordPage({ searchParams }: { searchParams: SearchParams }) {
  const { db, table, identityId, recordId } = searchParams;
  
  // Fetch apiKey for header
  const apiKey = await GetIdentityKey(identityId);

  if (!apiKey) {
    throw new Error("API key is null. Unable to fetch the record.");
  }
  
  // Fetch record data - wrap in try/catch to handle 404 errors gracefully
  let record;
  try {
    const apiKey = 'wize_sk_dev_manualtestkey1234567890';
    record = await GetRecordById(db, table, identityId, recordId, apiKey);
  } catch (error) {
    console.error("Error fetching record:", error);
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to fetch record. The record may not exist or there might be a permission issue.</p>
      </div>
    );
  }
  
  if (!record) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Record Not Found</h1>
        <p>The requested record could not be found.</p>
      </div>
    );
  }
  
  // Display the record data for editing
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Edit Record</h1>
      <div className="">
        <pre>{JSON.stringify(record, null, 2)}</pre>
        {/* Form will be added here later */}
      </div>
    </div>
  );
}

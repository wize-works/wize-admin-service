import { ObjectId } from "mongodb";
import { fetchRecordById, getTenantIdFromConfigurationId } from "../../service-clients/wize-database-service-client";
import Link from "next/link";
import FetchFieldsDataButton from "./FetchFieldsDataButton";

type SearchParams = {
  db: string;
  table: string;
  identityId: string;
  recordId: string;
};

export default async function RecordDetailsPage({ searchParams }: { searchParams: SearchParams }) {
  const { db, table, identityId, recordId } = searchParams;
  
  // Fetch record data
  // First get the tenant ID from the identity ID
  const tenantId = await getTenantIdFromConfigurationId(identityId);
  if (!tenantId) {
    throw new Error("Tenant ID is null. Unable to fetch the record.");
  }
  const record = await fetchRecordById(db, table, recordId, tenantId);
  
  if (!record) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Record Not Found</h1>
        <p>The requested record could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Record Details</h1>
        
      </div>
      
      <div className="mb-4">
        <p><strong>Database:</strong> {db}</p>
        <p><strong>Table:</strong> {table}</p>
        <p><strong>Record ID:</strong> {JSON.stringify(recordId)}</p>
      </div>

      <FetchFieldsDataButton
        db={db}
        table={table}
        identityId={identityId}
        className="button btn bg-base-100 hover:bg-base-300 mb-4"
        buttonText="Back to Fields"
      />
      
      <div className="bg-base-100 shadow-md rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Field Values</h2>
          <dl className="divide-y ">
            {Object.entries(record).map(([field, value]) => (
              <div key={field} className="py-4 flex justify-between">
                <dt className="font-medium w-1/3">{field}</dt>
                <dd className="w-2/3">
                  {typeof value === 'object' 
                    ? <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                    : String(value)
                  }
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
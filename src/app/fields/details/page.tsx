import { fetchRecordById, getTenantIdFromConfigurationId } from "../../service-clients/wize-database-service-client";
import FetchFieldsDataButton from "./FetchFieldsDataButton";
import AdminEditRecordButton from "./AdminEditRecordButton";
import { getSelectedClientFromCookies } from "@/context/clientActions";
import EditRecordButton from "../edit/EditRecordButton";

type SearchParams = {
  db: string;
  table: string;
  recordId: string;
};

export default async function RecordDetailsPage({ searchParams }: { searchParams: SearchParams }) {
  const { db, table, recordId } = searchParams;

  const selectedClient = await getSelectedClientFromCookies();

  if (!selectedClient?.value) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Client Not Selected</h1>
        <p>Please select a client application from the header dropdown.</p>
      </div>
    );
  }

  let record;
  const isAdmin = selectedClient.value === '0';

  if (isAdmin) {
    // For admin, use the isAdmin flag to bypass tenant filtering
    record = await fetchRecordById(db, table, recordId, '', true);
  } else {
    // For non-admin users, get the tenant ID and filter by it
    const tenantId = await getTenantIdFromConfigurationId(selectedClient.value);
    if (!tenantId) {
      throw new Error("Tenant ID is null. Unable to fetch the record.");
    }
    record = await fetchRecordById(db, table, recordId, tenantId, false);
  }

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
        <div className="flex space-x-3">

        </div>
      </div>

      <div className="mb-4">
        <p><strong>Database:</strong> {db}</p>
        <p><strong>Table:</strong> {table}</p>
        <p><strong>Record ID:</strong> {JSON.stringify(recordId)}</p>
        <p><strong>Client:</strong> {selectedClient.label} {selectedClient.value === '0' ? '(Admin)' : ''}</p>
      </div>
      <div className="mt-4 flex space-x-4">
        <FetchFieldsDataButton
          db={db}
          table={table}
        />
        {isAdmin && (
          <AdminEditRecordButton
            db={db}
            table={table}
            recordId={recordId}
          />
        )}
        { !isAdmin && (
          <EditRecordButton
            db={db}
            table={table}
            recordId={recordId}
          />
        )}
      </div>
      <div className="bg-base-100 shadow-md rounded-lg overflow-hidden mt-4">
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
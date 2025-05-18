import { FetchRecordById, FetchFieldNames } from '../../service-clients/wize-api-service-client';
import { FetchApiKey, fetchRecordById } from '../../service-clients/wize-database-service-client';
import { getSelectedClientFromCookies } from "@/context/clientActions";
import { redirect } from "next/navigation";
import NavigateBackButton from '@/app/components/NavigateBackButton';

type SearchParams = {
  db: string;
  table: string;
  recordId: string;
};

export default async function EditPage({ searchParams }: { searchParams: SearchParams }) {
  const { db, table, recordId } = searchParams;

  // Get the selected client from cookies
  const selectedClient = await getSelectedClientFromCookies();

  // Check if user is logged in
  if (!selectedClient) {
    redirect('/databases');
  }

  // Variable to store record data
  let record;
  
  try {
    if (selectedClient.value === '0') {
      // For admin, use direct database access
      record = await fetchRecordById(db, table, recordId, '', true);
    }
    else {
      // For regular users, use API
      const apiKey = await FetchApiKey(selectedClient.value);
      if (!apiKey) {
        throw new Error("API key not found");
      }

      const fieldNames = await FetchFieldNames(db, table, apiKey);
      record = await FetchRecordById(db, table, recordId, fieldNames.map(field => field.name), apiKey);
    }

    if (!record) {
      throw new Error("Record not found");
    }
  } catch (error) {
    console.error("Error fetching record:", error);
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to fetch record. The record may not exist or there might be a permission issue.</p>
        <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  // Create an array of fields for the form, excluding _id
  const editableFields = Object.entries(record).filter(([key]) => key !== '_id');
  
  // Display the record data for editing
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Edit Record</h1>
      <div className="mb-4">
        <p><strong>Database:</strong> {db}</p>
        <p><strong>Table:</strong> {table}</p>
        <p><strong>Record ID:</strong> {recordId}</p>
        <p><strong>Client:</strong> {selectedClient.label} {selectedClient.value === '0' ? '(Admin)' : ''}</p>
      </div>

      <form
        action={`/api/updateRecord?redirect=/fields/details?db=${encodeURIComponent(db)}&table=${encodeURIComponent(table)}&recordId=${encodeURIComponent(recordId)}`}
        method="POST"
        className="space-y-6"
      >
        <input type="hidden" name="db" value={db} />
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="recordId" value={recordId} />

        <div className="bg-base-100 shadow rounded-lg p-6">
          <div className="space-y-4">
            {editableFields.map(([fieldName, fieldValue]) => (
              <div key={fieldName} className="grid grid-cols-3 gap-4 items-center">
                <label htmlFor={fieldName} className="font-medium col-span-1">{fieldName}:</label>

                {/* Render different inputs based on field type */}
                {typeof fieldValue === 'boolean' ? (
                  <select
                    id={fieldName}
                    name={fieldName}
                    className="select select-bordered w-full col-span-2"
                    defaultValue={String(fieldValue)}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : typeof fieldValue === 'number' ? (
                  <input
                    type="number"
                    id={fieldName}
                    name={fieldName}
                    defaultValue={fieldValue}
                    className="input input-bordered w-full col-span-2"
                  />
                ) : typeof fieldValue === 'object' ? (
                  <textarea
                    id={fieldName}
                    name={fieldName}
                    defaultValue={JSON.stringify(fieldValue, null, 2)}
                    rows={4}
                    className="textarea textarea-bordered w-full col-span-2 font-mono"
                  />
                ) : (
                  <input
                    type="text"
                    id={fieldName}
                    name={fieldName}
                    defaultValue={String(fieldValue)}
                    className="input input-bordered w-full col-span-2"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            {selectedClient.value === '0' && (
              <h2 className="text-error font-bold text-lg mb-4">WARNING! This is a direct database edit.</h2>
            )}
            <button type="submit" className={`btn ${selectedClient.value === '0' ? 'btn-error' : 'btn-primary'}`}>
              Save Changes
            </button>
            <NavigateBackButton />
          </div>
        </div>
      </form>
    </div>
  );
}

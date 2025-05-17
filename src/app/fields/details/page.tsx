import { FetchApiKey, fetchRecordById, getTenantIdFromConfigurationId } from "../../service-clients/wize-database-service-client";
import { FetchFieldNames, FetchRecordById } from "../../service-clients/wize-api-service-client";
import FetchFieldsDataButton from "./FetchFieldsDataButton";
import AdminEditRecordButton from "./AdminEditRecordButton";
import EditRecordButton from "./EditRecordButton";
import { getSelectedClientFromCookies } from "@/context/clientActions";
import RecordTable from "@/app/components/RecordTable";

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

  try {
    if (isAdmin) {
      // For admin, use the isAdmin flag to bypass tenant filtering
      record = await fetchRecordById(db, table, recordId, '', true);
    } else {
      // For non-admin users, get the tenant ID and filter by it
      const tenantId = await getTenantIdFromConfigurationId(selectedClient.value);
      if (!tenantId) {
        throw new Error("Tenant ID is null. Unable to fetch the record.");
      }
      
      try {
        // Get API key - handle errors gracefully
        const apiKey = await FetchApiKey(selectedClient.value);
        if (!apiKey) {
          throw new Error("API key not found");
        }
        
        // Get field names with better error handling
        let fieldNames;
        try {
          fieldNames = await FetchFieldNames(db, table, apiKey);
          console.log("Field names retrieved:", fieldNames);
        } catch (fieldError) {
          console.error("Error fetching field names:", fieldError);
          // Use default field names
          fieldNames = [{ name: '_id', type: 'String' }];
        }
        
        // Get record data
        const fieldNameStrings = fieldNames.map(field => field.name);
        record = await FetchRecordById(db, table, recordId, fieldNameStrings, apiKey);
        
        // Extract the record from the response if needed
        const tableCapitalized = table.charAt(0).toUpperCase() + table.slice(1);
        const findMethodName = `find${tableCapitalized}ById`;
        
        if (record && record[findMethodName]) {
          record = record[findMethodName];
        }
      } catch (apiError) {
        console.error("API service error:", apiError);
        // Fall back to standard database service
        record = await fetchRecordById(db, table, recordId, tenantId);
      }
    }
  } catch (error) {
    console.error("Error fetching record:", error);
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Error Fetching Record</h1>
        <p>There was an error retrieving the record: {error instanceof Error ? error.message : String(error)}</p>
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
        {!isAdmin && (
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
          <RecordTable record={record} />
        </div>
      </div>
    </div>
  );
}
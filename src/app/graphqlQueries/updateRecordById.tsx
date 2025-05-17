export const updateRecordById = (table: string, recordId: string, data: any) => {
  const updateMutation = `
      mutation UpdateRecord(${table}, ${recordId}, ${data}) {
        updateRecord(${table}, ${recordId}, ${data}) {
          id
          success
          message
          record
        }
      }
    `;
    
  return updateMutation;
};
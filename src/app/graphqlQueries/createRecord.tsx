export const createRecord = (table: string, data: any) => {
  const createMutation = `
      mutation CreateRecord(${table}, ${data}) {
        createRecord(${table}, ${data}) {
          id
          success
          message
          record
        }
      }
    `;
    
  return createMutation;
};
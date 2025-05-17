export const fetchRecordById = (table: string, recordId: string, fieldNames?: string[]) => {
    const tableCapitalized = table.charAt(0).toUpperCase() + table.slice(1);
    const tableCapitalizedAndSingularized = table.charAt(0).toUpperCase() + table.slice(1, -1);

    let query = `
      query Find${tableCapitalizedAndSingularized}ById {
      find${tableCapitalizedAndSingularized}ById(id: "${recordId}") {`

    if (Array.isArray(fieldNames) && fieldNames.length > 0) {
        // Add proper indentation and spacing for better readability
        fieldNames.forEach(field => {
            query += `
            ${field}`;
        });
    } else {
        // Default fields with proper indentation
        query += `
            _id
            `;
    }

    query += `
          }
        }`;

    return query;
};

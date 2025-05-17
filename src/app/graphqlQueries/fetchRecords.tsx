export const fetchRecords = (table: string, fieldNames?: string[]) => {
  const tableCapitalized = table.charAt(0).toUpperCase() + table.slice(1);
  
  let query = `
      query Find${tableCapitalized} {
        find${tableCapitalized} {
          data {`;

  if (Array.isArray(fieldNames) && fieldNames.length > 0) {
    fieldNames.forEach(field => {
      query += `
            ${field}`;
    });
  } else {
    query += `
            _id
            `;
  }
  query += `
          }
        }
      }`;

  return query;
};
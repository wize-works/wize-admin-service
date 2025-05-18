import { FieldInfo } from "../models/FieldInfo"

export const fetchRecords = (table: string, fieldInfo?: FieldInfo[]) => {
  const tableCapitalized = table.charAt(0).toUpperCase() + table.slice(1);
  
  let query = `
      query Find${tableCapitalized} {
        find${tableCapitalized} {
          data {`;

  if (Array.isArray(fieldInfo) && fieldInfo.length > 0) {
    fieldInfo.forEach(fieldInfo => {
      query += `
            ${fieldInfo.name}`;
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
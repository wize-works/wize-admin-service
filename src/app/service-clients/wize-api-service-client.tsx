const url = "https://api.wize.works/wize-comment/graphql";
const fetchWithAuth = async (url: string, graphqlQuery: string, variables: any = {}, options: RequestInit = {}, apiKey?: string) => {
  const headers = {
    ...options.headers,
    'wize-api-key': apiKey || "",
    'Content-Type': 'application/json',
  };

  console.log(`Making API request to ${url} with headers: ${headers}, GraphQl Query: ${graphqlQuery}, Variables: ${JSON.stringify(variables)}`);

  // Prepare GraphQL request body
  const graphqlBody = {
    query: graphqlQuery,
    variables: variables
  };

  const response = await fetch(url, {
    ...options,
    method: 'POST', // GraphQL typically uses POST
    headers,
    body: JSON.stringify(graphqlBody)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Update a record in the database
export const UpdateRecord = async (
  db: string,
  table: string,
  recordId: string,
  data: any,
  apiKey?: string
): Promise<any> => {
  // GraphQL mutation for updating a record
  const updateMutation = `
      mutation UpdateRecord($table: String!, $recordId: ID!, $data: JSON!) {
        updateRecord(table: $table, recordId: $recordId, data: $data) {
          id
          success
          message
          record
        }
      }
    `;

  return fetchWithAuth(
    url,
    updateMutation,
    { table, recordId, data },
    {},
    apiKey
  );
};

// Get a record by ID
export const FetchRecordById = async (
  db: string,
  table: string,
  recordId: string,
  fieldNames?: string[],
  apiKey?: string
): Promise<any> => {

  console.log(`API URL: ${url}`);

  const tableCapitalizedAndSingularized = table.charAt(0).toUpperCase() + table.slice(1, -1);
  
  var query = `
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

  console.log('GraphQL Query:', query);
  console.log('Variables:', { recordId, apiKey });

  try {
    console.log('Making API request...');
    const response = await fetchWithAuth(
      url,
      query,
      { recordId },
      {},
      apiKey
    );
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('GetRecordById Error:', error);
    console.error('Error Details:', {
      recordId,
      graphqlQuery: query
    });
    throw error;
  }
};

// Get all records from a table
export const FetchRecords = async (
  db: string,
  table: string,
  fieldNames?: string[],
  apiKey?: string
): Promise<any[]> => {
  const tableCapitalized = table.charAt(0).toUpperCase() + table.slice(1);
  let query = `
      query Find${tableCapitalized} {
        find${tableCapitalized} {
          data {`;

  // If fieldNames are provided, include them in the query
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

  // Close the query structure
  query += `
          }
        }
      }`;

  console.log("Generated GraphQL query:", query);

  return fetchWithAuth(
    url,
    query,
    {},
    {},
    apiKey
  );
};

export interface FieldInfo {
  name: string;
  type: string;
}

export const FetchFieldNamesFromApi = async (
  db: string,
  table: string,
  apiKey: string
): Promise<FieldInfo[]> => {
  try {
    const projectName = db.split("-")[1];
    console.log(`Fetching field names for project: ${projectName}`);
    
    // If projectName is undefined or empty, use a fallback
    if (!projectName) {
      console.warn(`Invalid database name format: ${db}. Using '${table}' as type name.`);
      const query = `
        query {
          __type(name: "${table}") {
            name
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      `;
      
      const response = await fetchWithAuth(
        url,
        query,
        {},
        {},
        apiKey
      );
      
      if (response?.data?.__type?.fields) {
        return response.data.__type.fields.map((field: any) => ({
          name: field.name,
          type: field.type.name || (field.type.ofType ? field.type.ofType.name : 'Unknown')
        }));
      }
    } else {
      // Original query with projectName
      const query = `
        query {
          __type(name: "${projectName}") {
            name
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      `;
      
      const response = await fetchWithAuth(
        url,
        query,
        {},
        {},
        apiKey
      );
      
      if (response?.data?.__type?.fields) {
        return response.data.__type.fields.map((field: any) => ({
          name: field.name,
          type: field.type.name || (field.type.ofType ? field.type.ofType.name : 'Unknown')
        }));
      }
    }
    
    // If we get here, return default fields
    console.warn("Could not fetch field names, returning default fields");
    return [
      { name: '_id', type: 'String' },
      { name: 'name', type: 'String' },
      { name: 'comment', type: 'String' },
      { name: 'userId', type: 'String' },
      { name: 'createdAt', type: 'DateTime' },
      { name: 'createdBy', type: 'String' }
    ];
  } catch (error) {
    console.error('Error in FetchFieldNamesFromApi:', error);
    // Return basic default fields on error
    return [
      { name: '_id', type: 'String' },
      { name: 'name', type: 'String' },
      { name: 'comment', type: 'String' }
    ];
  }
}

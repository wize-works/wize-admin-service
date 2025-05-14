//use fetch to get data from the API and return it as a promise

// Base fetch function with authorization headers and GraphQL support
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
    `https://api.wize.works/wize-${db}/graphql`, 
    updateMutation,
    { table, recordId, data },
    {},
    apiKey
  );
};

// Get a record by ID
export const GetRecordById = async (
  db: string,
  table: string,
  identityId: string,
  recordId: string,
  apiKey?: string
): Promise<any> => {
  console.log(`GetRecordById called with params: db=${db}, table=${table}, identityId=${identityId}, recordId=${recordId}, apiKey=${apiKey}`);
  
  const url = `https://api.wize.works/${db}/graphql`;
  console.log(`API URL: ${url}`);
  
  // GraphQL query to fetch a record by ID
  const query = `
    query FindCommentById {
    findCommentById(id: "680aa8c956dfb81718931ad7") {
        _id
        name
      }
    }`;
  
  console.log('GraphQL Query:', query);
  console.log('Variables:', { db, table, recordId, apiKey });

  try {
    console.log('Making API request...');
    const response = await fetchWithAuth(
      url,
      query,
      { table, recordId },
      {},
      apiKey
    );
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('GetRecordById Error:', error);
    console.error('Error Details:', {
      db,
      table,
      identityId,
      recordId,
      graphqlQuery: query
    });
    throw error;
  }
};

// Get all records from a table
export const GetRecords = async (
  db: string,
  table: string,
  filters?: any,
  apiKey?: string
): Promise<any[]> => {
  // GraphQL query to fetch all records from a table with optional filters
  const getRecordsQuery = `
    query FindComments {
    findComments {
        data {
            _id
            userId
            postId
            name
            createdAt
            createdBy
            comment
        }
    }
}
  `;
  
  return fetchWithAuth(
    `https://api.wize.works/${db}/graphql`, 
    getRecordsQuery,
    { table, filters },
    {},
    apiKey
  );
};
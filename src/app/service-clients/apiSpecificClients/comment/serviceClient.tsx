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
export const FetchCommentsById = async (
  recordId: string,
  apiKey?: string
): Promise<any> => {

  console.log(`API URL: ${url}`);

  // GraphQL query to fetch a record by ID
  //TODO: Figure out how to customize these fields based on tenantID or some such.
  const query = `
      query FindCommentById($recordId: ID!) {
      findCommentById(id: $recordId) {
          _id
          userId
          postId
          name
          createdAt
          createdBy
          comment
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
export const FetchComments = async (
  apiKey?: string
): Promise<any[]> => {
  // GraphQL query to fetch all records from a table with optional filters
  const query = `
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
    url,
    query,
    {},
    {},
    apiKey
  );
};
import { FieldInfo } from "../models/FieldInfo";
import { fetchFieldproperties } from "../graphqlQueries/fetchFeildproperties"
import { fetchRecords } from "../graphqlQueries/fetchRecords";
import { fetchRecordById } from "../graphqlQueries/fetchRecordById";
import { updateRecordById } from "../graphqlQueries/updateRecordById";

const fetchWithAuth = async (url: string, graphqlQuery: string, variables: any = {}, options: RequestInit = {}, apiKey?: string) => {
  const headers = {
    ...options.headers,
    'wize-api-key': apiKey || "",
    'Content-Type': 'application/json',
  };

  const graphqlBody = {
    query: graphqlQuery,
    variables: variables
  };

  const response = await fetch(url, {
    ...options,
    method: 'POST',
    headers,
    body: JSON.stringify(graphqlBody)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const UpdateRecord = async (db: string, table: string, recordId: string, data: any, apiKey?: string): Promise<any> => {
  const url = `https://api.wize.works/${db}/graphql`;
  var updateMutation = "";
  try {
    updateMutation = updateRecordById(table, recordId, data);
    return fetchWithAuth(url, updateMutation,{ table, recordId, data }, {}, apiKey);
  } catch (error) {
    console.error('UpdateRecord Error:', error);
    console.error('Error Details:', { recordId, graphqlQuery: updateMutation });
    throw error;
  }
};

export const FetchRecordById = async (db: string, table: string, recordId: string, fieldNames?: string[], apiKey?: string): Promise<any> => {
  const url = `https://api.wize.works/${db}/graphql`;
  var query = "";
  try {
    query = fetchRecordById(table, recordId, fieldNames);
    const response = await fetchWithAuth(url, query, { recordId }, {}, apiKey);
    
    if (response.data) {
      const tableCapitalized = table.charAt(0).toUpperCase() + table.slice(1, -1); // Capitalize table name and remove trailing 's'
      const findMethodName = `find${tableCapitalized}ById`;
      
      if (response.data[findMethodName]) {
        return response.data[findMethodName];
      }
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('GetRecordById Error:', error);
    console.error('Error Details:', { recordId, graphqlQuery: query });
    throw error;
  }
};

export const FetchRecords = async (db: string, table: string, fieldNames?: string[], apiKey?: string): Promise<any[]> => {
  const url = `https://api.wize.works/${db}/graphql`;
  var query = "";
  try {
    query = fetchRecords(table, fieldNames);
    return fetchWithAuth(url, query, {}, {}, apiKey);
  }
  catch (error) {
    console.error('FetchRecords Error:', error);
    console.error('Error Details:', { graphqlQuery: query });
    throw error;
  }
};

export const FetchFieldNames = async (db: string, table: string, apiKey: string): Promise<FieldInfo[]> => {
  const url = `https://api.wize.works/${db}/graphql`;
  var query = "";
  try {
    query = fetchFieldproperties(table.slice(0, -1));
    console.log("GraphQL Query for field names:", query);
    const response = await fetchWithAuth(url, query, {}, {}, apiKey);

    if (response?.data?.__type?.fields) {
      return response.data.__type.fields.map((field: any) => ({
        name: field.name,
        type: field.type.name || (field.type.ofType ? field.type.ofType.name : 'Unknown')
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching field names:", error);
    console.error('Error Details:', { graphqlQuery: query });
    throw error;
  }
}

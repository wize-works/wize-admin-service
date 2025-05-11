import { MongoClient, ObjectId } from "mongodb";
// Add source-map-support for better debugging
import 'source-map-support/register';
import { MongoDBConnectionProvider } from "./mongodb-connection-provider";

// Debug mode
const isDebug = process.env.NODE_ENV === 'development';

// Use the provider to get MongoDB client instances
const mongoProvider = MongoDBConnectionProvider.getInstance();

// This function is retained for backward compatibility
export async function getMongoClient(): Promise<MongoClient> {
  return mongoProvider.getConnection();
}

export async function FetchClientKeys(): Promise<{ [key: string]: string }> {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log("FetchClientKeys: Connected to MongoDB");
      
      const database = mongoClient.db("wize-identity");
      const collection = database.collection("tenants");

      const clientKeys = await collection
        .find({ clientApp: { $exists: true } }, { projection: { clientApp: 1, _id: 1 } }).toArray();

      // Transform the results into a dictionary using _id as key and clientApp as value
      const result: { [key: string]: string } = {};

      console.log("FetchClientKeys: Found client keys:", clientKeys);
      
      clientKeys.forEach((clientKey, index) => {
        // Using _id as the dictionary key and clientApp as the value
        if (clientKey._id && clientKey.clientApp) {
          // Convert ObjectId to string for the key
          const idKey = clientKey._id.toString();
          result[idKey] = clientKey.clientApp;
        } else {
          // Log if clientApp is missing
          console.warn(`Skipping record at index ${index} - missing clientApp field:`, clientKey);
        }
      });

      if (isDebug) console.log("Final result:", result);
      
      return result;
    } catch (error) {
      console.error("Error fetching client keys:", error);
      throw error;
    }
  });
}

// Function to fetch all database names
export async function FetchDatabaseNames() {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log("FetchDatabaseNames: Connected to MongoDB");

      // Use the admin database to list all databases
      const adminDb = mongoClient.db().admin();
      const { databases } = await adminDb.listDatabases();

      if (isDebug) console.log(`FetchDatabaseNames: Found ${databases.length} databases`);

      // Extract and return the names of the databases
      return databases.map((db) => db.name);
    } catch (error) {
      console.error("Error fetching database names:", error);
      throw error;
    }
  });
}

// Function to fetch all table (collection) names in a given database
export async function FetchTableNames(databaseName: string) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`FetchTableNames: Connected to MongoDB, accessing database ${databaseName}`);

      // Access the specified database
      const database = mongoClient.db(databaseName);

      // List all collections (tables) in the database
      const collections = await database.listCollections().toArray();
      
      if (isDebug) console.log(`FetchTableNames: Found ${collections.length} collections in ${databaseName}`);

      // Extract and return the names of the collections
      return collections.map((collection) => collection.name);
    } catch (error) {
      console.error(`Error fetching table names for database "${databaseName}":`, error);
      throw error;
    }
  });
}

// Function to fetch all field names in a given table (collection)
export async function FetchFieldNames(databaseName: string, tableName: string) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`FetchFieldNames: Connected to MongoDB, accessing ${databaseName}.${tableName}`);
      
      const database = mongoClient.db(databaseName);
      const collection = database.collection(tableName);

      // Fetch a sample of documents from the collection
      const sampleDocuments = await collection.find({}).limit(100).toArray();
      
      if (isDebug) console.log(`FetchFieldNames: Retrieved ${sampleDocuments.length} sample documents`);

      // Extract all unique field names and infer their types
      const fieldInfo = new Map<string, string>();
      sampleDocuments.forEach((doc) => {
        Object.entries(doc).forEach(([field, value]) => {
          if (!fieldInfo.has(field)) {
            fieldInfo.set(field, typeof value); // Infer the type using `typeof`
          }
        });
      });

      // Convert the Map to an array of objects with name and type
      return Array.from(fieldInfo.entries()).map(([name, type]) => ({ name, type }));
    } catch (error) {
      console.error(`Error fetching field names for table "${tableName}" in database "${databaseName}":`, error);
      throw error;
    }
  });
}

// Function to fetch all data from a given table (collection) with optional schema-based filtering
export async function QueryTable(databaseName: string, tableName: string, identityId?: string) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`QueryTable: Connected to MongoDB, querying ${databaseName}.${tableName}${identityId ? ` with schemaId: ${identityId}` : ''}`);
      
      const database = mongoClient.db(databaseName);
      const collection = database.collection(tableName);
      
      // Build query object based on tenantId from schemaId
      let query = {};
      
      if (identityId) {
        if (isDebug) console.log(`QueryTable: Looking up tenantId for schemaId: ${identityId}`);
        
        // Get tenantId from configuration schema
        const tenantId = await getTenantIdFromConfigurationId(identityId);
        
        if (tenantId) {
          if (isDebug) console.log(`QueryTable: Found tenantId: ${tenantId}, will filter by this value`);
          query = { tenantId: tenantId };
        } else {
          if (isDebug) console.log(`QueryTable: No tenantId found for schemaId: ${identityId}, returning all records`);
        }
      }
      
      // Fetch documents from the collection with optional filter
      const data = await collection.find(query).toArray();
      
      if (isDebug) {
        const filterInfo = Object.keys(query).length > 0 ? ` with filter: ${JSON.stringify(query)}` : ' (no filters)';
        console.log(`QueryTable: Retrieved ${data.length} documents from ${databaseName}.${tableName}${filterInfo}`);
      }

      return data;
    } catch (error) {
      console.error(`Error querying table "${tableName}" in database "${databaseName}"${identityId ? ` with schemaId: ${identityId}` : ''}:`, error);
      throw error;
    }
  });
}

export async function fetchRecordById(db: string, table: string, recordId: string, tenantId: string) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try{
      if (isDebug) console.log(`fetchRecordById: Connected to MongoDB, querying ${db}.${table} for recordId: ${recordId}`);
      
      const database = mongoClient.db(db);
      const collection = database.collection(table);

      const recordIdString = typeof recordId === 'string' ? recordId : (recordId as ObjectId).toString();
      
      const query = { _id: new ObjectId(recordIdString), tenantId: tenantId };
      
      const record = await collection.findOne(query);
      
      if (isDebug) console.log(`fetchRecordById: Retrieved record with ID ${recordId}`);

      return record;
    } catch (error) {
      console.error(`Error fetching data for record: Database: "${db}", Table: "${table}", _id: "${recordId}": `, error);
      throw error;
    }
  });
}

/**
 * Retrieves the tenantId associated with a given object ID from the schemas configuration
 * @param identityId - The object ID to look up
 * @returns The associated tenantId as a string or null if not found
 */
export async function getTenantIdFromConfigurationId(identityId: string): Promise<string | null> {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`getTenantIdFromConfigurationId: Looking up configurationSchemaId for object ID: ${identityId}`);
      
      // Assuming the configuration is stored in a "wize-config" database with a "schemas" collection
      const database = mongoClient.db("wize-identity");
      const collection = database.collection("tenants");

      const result = await collection.findOne({ "_id": new ObjectId(identityId) }, { projection: { tenantId: 1 } });

      if (!result) {
        if (isDebug) console.log(`getTenantIdFromConfigurationId: No tenantId found for object ID: ${identityId}`);
        return null;
      }

      if (isDebug) console.log(`getTenantIdFromConfigurationId: Found tenantId: ${result.tenantId} for object ID: ${identityId}`);
      return result.tenantId;
    } catch (error) {
      console.error(`Error getting tenantId for object ID "${identityId}":`, error);
      throw error;
    }
  });
}

export async function GetIdentityKey(_id: string): Promise<string | null> {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`GetIdentityKey: Looking up identity key for object ID: ${_id}`);
      
      const database = mongoClient.db("wize-identity");
      const collection = database.collection("tenants");

      const result = await collection.findOne({ "_id": new ObjectId(_id) }, { projection: { key: 1 } });

      if (!result) {
        if (isDebug) console.log(`GetIdentityKey: No identity key found for object ID: ${_id}`);
        return null;
      }

      if (isDebug) console.log(`GetIdentityKey: Found identity key: ${result.key} for object ID: ${_id}`);
      return result.key;
    } catch (error) {
      console.error(`Error getting identity key for object ID "${_id}":`, error);
      throw error;
    }
  });
}
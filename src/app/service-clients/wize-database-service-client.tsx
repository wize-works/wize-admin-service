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

// Function to fetch all database names with optional filtering based on client app
export async function FetchDatabaseNames(clientId?: string) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`FetchDatabaseNames: Connected to MongoDB, clientId: ${clientId || 'none'}`);

      // Use the admin database to list all databases
      const adminDb = mongoClient.db().admin();
      const { databases } = await adminDb.listDatabases();

      if (isDebug) console.log(`FetchDatabaseNames: Found ${databases.length} databases before filtering`);

      // Define system databases to filter out when clientId is not '0'
      const systemDatabases = ['wize-configuration', 'wize-identity', 'wize-log', 'local', 'admin'];

      // Filter databases based on clientId
      const filteredDatabases = databases.filter((db) => {
        // If clientId is '0' or not provided, include all databases
        if (!clientId || clientId === '0') {
          return true;
        }
        // Otherwise, exclude system databases
        return !systemDatabases.includes(db.name);
      });

      if (isDebug) console.log(`FetchDatabaseNames: Returning ${filteredDatabases.length} databases after filtering`);

      // Extract and return the names of the filtered databases
      return filteredDatabases.map((db) => db.name);
    } catch (error) {
      console.error("Error fetching database names:", error);
      throw error;
    }
  });
}

// Function to fetch all table (collection) names in a given database with optional client filtering
export async function FetchTableNames(databaseName: string, clientId?: string) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`FetchTableNames: Connected to MongoDB, accessing database ${databaseName}, clientId: ${clientId || 'none'}`);

      // If clientId is '0' (admin) or not provided, return all tables without filtering
      if (!clientId || clientId === '0') {
        // Access the specified database
        const database = mongoClient.db(databaseName);

        // List all collections (tables) in the database
        const collections = await database.listCollections().toArray();
        
        if (isDebug) console.log(`FetchTableNames: Found ${collections.length} collections in ${databaseName} (no filtering)`);

        // Extract and return the names of the collections
        return collections.map((collection) => collection.name);
      } 
      // Otherwise, filter tables based on tenant ID
      else {
        // First, get the tenantId from the clientId (which is the identity/schema ID)
        const tenantId = await getTenantIdFromConfigurationId(clientId);
        
        if (!tenantId) {
          if (isDebug) console.log(`FetchTableNames: No tenantId found for clientId ${clientId}, returning empty list`);
          return [];
        }
        
        if (isDebug) console.log(`FetchTableNames: Found tenantId ${tenantId} for clientId ${clientId}`);
        
        // Query the wize-configuration database for schemas matching the database name and tenant ID
        const configDb = mongoClient.db("wize-configuration");
        const schemasCollection = configDb.collection("schemas");
        
        // Find schema documents for this tenant that match the specified database name
        const schemaDocuments = await schemasCollection.find({
          tenantId: tenantId,
          database: databaseName,
          table: { $exists: true }
        }).toArray();
        
        if (isDebug) console.log(`FetchTableNames: Found ${schemaDocuments.length} schema documents for tenantId ${tenantId} and database ${databaseName}`);
        
        // Extract table names from the schema documents
        const allowedTables = new Set<string>();
        
        schemaDocuments.forEach(doc => {
          // Add the table from each schema document
          if (doc.table && typeof doc.table === 'string') {
            allowedTables.add(doc.table);
          }
        });
        
        if (isDebug) console.log(`FetchTableNames: Extracted ${allowedTables.size} allowed tables for tenantId ${tenantId} in database ${databaseName}`);
        
        // Return only the tables found in the configuration
        return Array.from(allowedTables);
      }
    } catch (error) {
      console.error(`Error fetching table names for database "${databaseName}" with clientId "${clientId}":`, error);
      throw error;
    }
  });
}

// Function to fetch all field names in a given table (collection)
export async function FetchFieldNames(databaseName: string, tableName: string, clientId?: string) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      if (isDebug) console.log(`FetchFieldNames: Connected to MongoDB, accessing ${databaseName}.${tableName}, clientId: ${clientId || 'none'}`);
      
      // Access the specified database and collection
      const database = mongoClient.db(databaseName);
      const collection = database.collection(tableName);

      // If clientId is '0' (admin) or not provided, return all fields without filtering
      if (!clientId || clientId === '0') {
        // Fetch a sample of documents to infer fields and types
        const sampleDocuments = await collection.find({}).limit(100).toArray();
        
        if (isDebug) console.log(`FetchFieldNames (admin): Retrieved ${sampleDocuments.length} sample documents`);

        // Extract all unique field names and infer their types
        const fieldInfo = new Map<string, string>();
        
        if (sampleDocuments.length > 0) {
          sampleDocuments.forEach((doc) => {
            Object.entries(doc).forEach(([field, value]) => {
              if (!fieldInfo.has(field)) {
                fieldInfo.set(field, typeof value);
              }
            });
          });
        } else {
          // Add _id field as a fallback if no documents found
          fieldInfo.set('_id', 'string');
        }

        return Array.from(fieldInfo.entries()).map(([name, type]) => ({ name, type }));
      } 
      // For non-admin clients, filter fields based on tenantId
      else {
        const tenantId = await getTenantIdFromConfigurationId(clientId);
        
        if (!tenantId) {
          if (isDebug) console.log(`FetchFieldNames: No tenantId found for clientId ${clientId}, returning minimal fields`);
          return [{ name: '_id', type: 'string' }];
        }
        
        if (isDebug) console.log(`FetchFieldNames: Found tenantId ${tenantId} for clientId ${clientId}`);
        
        // Query only documents that belong to this tenant to extract fields
        const tenantDocuments = await collection.find({ tenantId: tenantId }).limit(100).toArray();
        
        if (isDebug) console.log(`FetchFieldNames: Retrieved ${tenantDocuments.length} documents for tenantId ${tenantId}`);

        const fieldInfo = new Map<string, string>();
        
        // If we found documents for this tenant, extract fields
        if (tenantDocuments.length > 0) {
          tenantDocuments.forEach((doc) => {
            Object.entries(doc).forEach(([field, value]) => {
              if (!fieldInfo.has(field)) {
                fieldInfo.set(field, typeof value);
              }
            });
          });
        }
        // If no documents found, try to get field info from schema
        else {
          if (isDebug) console.log(`FetchFieldNames: No documents found, looking for schema definition for table ${tableName}`);
          
          // Query wize-configuration.schemas for field definitions
          const configDb = mongoClient.db("wize-configuration");
          const schemasCollection = configDb.collection("schemas");
          
          const schemaDoc = await schemasCollection.findOne({
            tenantId: tenantId,
            database: databaseName,
            table: tableName
          });
          
          if (schemaDoc && schemaDoc.fields) {
            if (isDebug) console.log(`FetchFieldNames: Found schema definition with ${Object.keys(schemaDoc.fields).length} fields`);
            
            // Process fields from schema
            Object.entries(schemaDoc.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
              // Map schema types to JavaScript types
              let jsType = 'unknown';
              if (fieldConfig.type) {
                const schemaType = fieldConfig.type.toLowerCase();
                if (['string', 'text', 'varchar', 'char'].includes(schemaType)) {
                  jsType = 'string';
                } else if (['number', 'int', 'integer', 'float', 'decimal', 'double'].includes(schemaType)) {
                  jsType = 'number';
                } else if (['boolean', 'bool'].includes(schemaType)) {
                  jsType = 'boolean';
                } else if (['date', 'datetime', 'timestamp'].includes(schemaType)) {
                  jsType = 'date';
                } else if (['object', 'json'].includes(schemaType)) {
                  jsType = 'object';
                } else if (['array'].includes(schemaType)) {
                  jsType = 'array';
                }
              }
              
              fieldInfo.set(fieldName, jsType);
            });
          }
        }

        // Ensure we at least have _id field
        if (fieldInfo.size === 0) {
          if (isDebug) console.log(`FetchFieldNames: No fields found for tenant ${tenantId}, using fallback`);
          fieldInfo.set('_id', 'string');
        }

        return Array.from(fieldInfo.entries()).map(([name, type]) => ({ name, type }));
      }
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

export async function fetchRecordById(db: string, table: string, recordId: string, tenantId: string, isAdmin: boolean = false) {
  return mongoProvider.withConnection(async (mongoClient) => {
    try{
      if (isDebug) {
        const adminText = isAdmin ? " as admin" : "";
        console.log(`fetchRecordById: Connected to MongoDB, querying ${db}.${table} for recordId: ${recordId}${adminText}`);
      }
      
      const database = mongoClient.db(db);
      const collection = database.collection(table);

      const recordIdString = typeof recordId === 'string' ? recordId : (recordId as ObjectId).toString();
      
      // Build query - if admin, only filter by ID; otherwise include tenantId
      const query = isAdmin 
        ? { _id: new ObjectId(recordIdString) }
        : { _id: new ObjectId(recordIdString), tenantId: tenantId };
      
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
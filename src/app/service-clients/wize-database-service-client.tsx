import { MongoClient, ObjectId } from "mongodb";
import 'source-map-support/register';
import { MongoDBConnectionProvider } from "./mongodb-connection-provider";

const mongoProvider = MongoDBConnectionProvider.getInstance();

// This function is retained for backward compatibility
export async function getMongoClient(): Promise<MongoClient> {
  return mongoProvider.getConnection();
}

export async function FetchClientKeys(): Promise<{ [key: string]: string }> {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      const database = mongoClient.db("wize-identity");
      const collection = database.collection("tenants");

      const clientKeys = await collection
        .find({ clientApp: { $exists: true } }, { projection: { clientApp: 1, _id: 1 } }).toArray();

      // Transform the results into a dictionary using _id as key and clientApp as value
      const result: { [key: string]: string } = {};

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
      // Use the admin database to list all databases
      const adminDb = mongoClient.db().admin();
      const { databases } = await adminDb.listDatabases();

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
      // If clientId is '0' (admin) or not provided, return all tables without filtering
      if (!clientId || clientId === '0') {
        // Access the specified database
        const database = mongoClient.db(databaseName);

        // List all collections (tables) in the database
        const collections = await database.listCollections().toArray();
        
        // Extract and return the names of the collections
        return collections.map((collection) => collection.name);
      } 
      // Otherwise, filter tables based on tenant ID
      else {
        // First, get the tenantId from the clientId (which is the identity/schema ID)
        const tenantId = await getTenantIdFromConfigurationId(clientId);
        
        if (!tenantId) {
          return [];
        }
        
        // Query the wize-configuration database for schemas matching the database name and tenant ID
        const configDb = mongoClient.db("wize-configuration");
        const schemasCollection = configDb.collection("schemas");
        
        // Find schema documents for this tenant that match the specified database name
        const schemaDocuments = await schemasCollection.find({
          tenantId: tenantId,
          database: databaseName,
          table: { $exists: true }
        }).toArray();
        
        // Extract table names from the schema documents
        const allowedTables = new Set<string>();
        
        schemaDocuments.forEach(doc => {
          // Add the table from each schema document
          if (doc.table && typeof doc.table === 'string') {
            allowedTables.add(doc.table + 's'); // Add 's' to the table name
          }
        });
        
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
      // Access the specified database and collection
      const database = mongoClient.db(databaseName);
      const collection = database.collection(tableName);

      // If clientId is '0' (admin) or not provided, return all fields without filtering
      if (!clientId || clientId === '0') {
        // Fetch a sample of documents to infer fields and types
        const sampleDocuments = await collection.find({}).limit(100).toArray();

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

        // Convert Map to array and sort alphabetically, ensuring _id comes first
        return Array.from(fieldInfo.entries())
          .sort((a, b) => {
            // Always put _id first
            if (a[0] === '_id') return -1;
            if (b[0] === '_id') return 1;
            // Sort other fields alphabetically
            return a[0].localeCompare(b[0]);
          })
          .map(([name, type]) => ({ name, type }));
      } 
      // For non-admin clients, filter fields based on tenantId
      else {
        const tenantId = await getTenantIdFromConfigurationId(clientId);
        
        if (!tenantId) {
          return [{ name: '_id', type: 'string' }];
        }
        
        // Query only documents that belong to this tenant to extract fields
        const tenantDocuments = await collection.find({ tenantId: tenantId }).limit(100).toArray();

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
          // Query wize-configuration.schemas for field definitions
          const configDb = mongoClient.db("wize-configuration");
          const schemasCollection = configDb.collection("schemas");
          
          const schemaDoc = await schemasCollection.findOne({
            tenantId: tenantId,
            database: databaseName,
            table: tableName
          });
          
          if (schemaDoc && schemaDoc.fields) {
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
          fieldInfo.set('_id', 'string');
        }

        // Convert to array and sort alphabetically, ensuring _id comes first
        return Array.from(fieldInfo.entries())
          .sort((a, b) => {
            // Always put _id first
            if (a[0] === '_id') return -1;
            if (b[0] === '_id') return 1;
            // Sort other fields alphabetically
            return a[0].localeCompare(b[0]);
          })
          .map(([name, type]) => ({ name, type }));
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
      const database = mongoClient.db(databaseName);
      const collection = database.collection(tableName);
      
      // Build query object based on tenantId from schemaId
      let query = {};
      
      if (identityId) {
        // Get tenantId from configuration schema
        const tenantId = await getTenantIdFromConfigurationId(identityId);
        
        if (tenantId) {
          query = { tenantId: tenantId };
        }
      }
      
      // Fetch documents from the collection with optional filter
      const data = await collection.find(query).toArray();

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
      const database = mongoClient.db(db);
      const collection = database.collection(table);

      const recordIdString = typeof recordId === 'string' ? recordId : (recordId as ObjectId).toString();
      
      // Build query - if admin, only filter by ID; otherwise include tenantId
      const query = isAdmin 
        ? { _id: new ObjectId(recordIdString) }
        : { _id: new ObjectId(recordIdString), tenantId: tenantId };
      
      const record = await collection.findOne(query);

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
      // Assuming the configuration is stored in a "wize-config" database with a "schemas" collection
      const database = mongoClient.db("wize-identity");
      const collection = database.collection("tenants");

      const result = await collection.findOne({ "_id": new ObjectId(identityId) }, { projection: { tenantId: 1 } });

      if (!result) {
        return null;
      }

      return result.tenantId;
    } catch (error) {
      console.error(`Error getting tenantId for object ID "${identityId}":`, error);
      throw error;
    }
  });
}

export async function FetchApiKey(_id: string): Promise<string | null> {
  // If admin mode (ID is '0'), return null immediately
  if (_id === '0') {
    return null;
  }
  
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      const database = mongoClient.db("wize-identity");
      const collection = database.collection("tenants");

      const result = await collection.findOne({ "_id": new ObjectId(_id) }, { projection: { key: 1 } });

      if (!result) {
        return null;
      }

      return result.key;
    } catch (error) {
      console.error(`Error getting api key for object ID "${_id}":`, error);
      throw error;
    }
  });
}

/**
 * Creates a new record in the specified database and collection
 * @param db Database name
 * @param table Collection name
 * @param data Record data to insert
 * @returns The inserted document including the generated _id
 */
export async function createRecord(db: string, table: string, data: Record<string, any>): Promise<any> {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      const database = mongoClient.db(db);
      const collection = database.collection(table);
      
      // Prepare the document for insertion
      const document = {
        ...data,
        createdAt: new Date() // Add creation timestamp
      };
      
      // Insert the document
      const result = await collection.insertOne(document);
      
      if (!result.acknowledged) {
        throw new Error("Failed to insert document");
      }
      
      // Return the inserted document with its _id
      return { 
        _id: result.insertedId,
        ...document 
      };
    } catch (error) {
      throw error;
    }
  });
}

/**
 * Updates an existing record in the specified database and collection
 * @param db Database name
 * @param table Collection name
 * @param recordId ID of the record to update
 * @param data Fields to update in the record
 * @returns The updated document
 */
export async function updateRecord(db: string, table: string, recordId: string, data: Record<string, any>): Promise<any> {
  return mongoProvider.withConnection(async (mongoClient) => {
    try {
      const database = mongoClient.db(db);
      const collection = database.collection(table);
      
      // Prepare the document for update
      const updateData = {
        ...data,
        updatedAt: new Date() // Add update timestamp
      };
      
      // Convert string ID to ObjectId
      const objectId = new ObjectId(recordId);
      
      // Execute the update operation
      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' } // Return the document after update
      );
      
      if (!result) {
        throw new Error("Record not found or update failed");
      }
      
      // Return the updated document
      return result;
    } catch (error) {
      console.error(`Error updating record: Database: "${db}", Table: "${table}", _id: "${recordId}": `, error);
      throw error;
    }
  });
}
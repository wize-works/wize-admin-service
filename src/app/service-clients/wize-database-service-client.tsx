import { MongoClient } from "mongodb";

// Load the MongoDB connection string from the environment variables
const uri = process.env.MONGO_URI || ""; // Ensure this is defined in your .env file
if (!uri) {
  throw new Error("Please define the MONGO_URI environment variable in your .env file.");
}

// Global MongoDB client singleton
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Debug mode
const isDebug = process.env.NODE_ENV === 'development';

// Function to get a database client instance
export async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;

  if (!clientPromise) {
    // Configure MongoDB client with debugging options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    client = new MongoClient(uri, options);
    console.log("Creating new MongoDB client instance");
    
    // Create and store promise to prevent multiple client instances from being created
    clientPromise = client.connect()
      .then(() => {
        console.log("MongoDB connected successfully");
        return client as MongoClient;
      })
      .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
        // Reset client so we can retry
        client = null;
        clientPromise = null;
        throw err;
      });
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.error("Error getting MongoDB client:", error);
    throw error;
  }
}

export async function FetchClientKeys(): Promise<{ [key: string]: string }> {
  try {
    // Get MongoDB client
    const mongoClient = await getMongoClient();
    
    if (isDebug) console.log("FetchClientKeys: Connected to MongoDB");
    
    const database = mongoClient.db("wize-identity");
    const collection = database.collection("tenants");

    if (isDebug) console.log("FetchClientKeys: Querying tenants collection");

    // Query the collection and project the needed fields
    // Note: No need to explicitly include _id as MongoDB includes it by default
    const clientKeys = await collection
      .find({}, { projection: { clientApp: 1, tenantId: 1 } }).toArray();

    if (isDebug) {
      console.log(`FetchClientKeys: Found ${clientKeys.length} tenant records`);
      console.log("Raw tenant records:", JSON.stringify(clientKeys, null, 2));
    }

    // Transform the results into a dictionary using _id as key and clientApp as value
    const result: { [key: string]: string } = {};
    
    clientKeys.forEach((clientKey, index) => {
      // Debug each record
      if (isDebug) console.log(`Record ${index}:`, clientKey);
      
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
}

// Function to fetch all database names
export async function FetchDatabaseNames() {
  try {
    const mongoClient = await getMongoClient();
    
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
}

// Function to fetch all table (collection) names in a given database
export async function FetchTableNames(databaseName: string) {
  try {
    const mongoClient = await getMongoClient();
    
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
}

// Function to fetch all field names in a given table (collection)
export async function FetchFieldNames(databaseName: string, tableName: string) {
  try {
    const mongoClient = await getMongoClient();
    
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
}

// Function to fetch all data from a given table (collection)
export async function QueryTable(databaseName: string, tableName: string, tenantId?: string) {
  try {
    const mongoClient = await getMongoClient();
    
    if (isDebug) console.log(`QueryTable: Connected to MongoDB, querying ${databaseName}.${tableName}${tenantId ? ` with tenantId: ${tenantId}` : ''}`);
    
    const database = mongoClient.db(databaseName);
    const collection = database.collection(tableName);

    // Build query object - filter by tenantId if provided
    const query = tenantId ? { tenantId: tenantId } : {};
    
    // Fetch documents from the collection with optional filter
    const data = await collection.find(query).toArray();
    
    if (isDebug) console.log(`QueryTable: Retrieved ${data.length} documents${tenantId ? ` with tenantId: ${tenantId}` : ''}`);

    return data; // Return the list of documents
  } catch (error) {
    console.error(`Error fetching data for table "${tableName}" in database "${databaseName}"${tenantId ? ` with tenantId: ${tenantId}` : ''}:`, error);
    throw error;
  }
}

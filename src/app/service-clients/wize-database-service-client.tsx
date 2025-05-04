import { MongoClient } from "mongodb";

// Load the MongoDB connection string from the environment variables
const uri = process.env.MONGO_URI || ""; // Ensure this is defined in your .env file
if (!uri) {
  throw new Error("Please define the MONGO_URI environment variable in your .env file.");
}

// MongoDB client
const client = new MongoClient(uri);

// Function to fetch all database names
export async function FetchDatabaseNames() {
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Use the admin database to list all databases
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    // Extract and return the names of the databases
    return databases.map((db) => db.name);
  } catch (error) {
    console.error("Error fetching database names:", error);
    throw error;
  } finally {
    // Ensure the client is closed after the query
    await client.close();
  }
}

// Function to fetch all table (collection) names in a given database
export async function FetchTableNames(databaseName: string) {
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the specified database
    const database = client.db(databaseName);

    // List all collections (tables) in the database
    const collections = await database.listCollections().toArray();

    // Extract and return the names of the collections
    return collections.map((collection) => collection.name);
  } catch (error) {
    console.error(`Error fetching table names for database "${databaseName}":`, error);
    throw error;
  } finally {
    // Ensure the client is closed after the query
    await client.close();
  }
}

// Function to fetch all field names in a given table (collection)
export async function FetchFieldNames(databaseName: string, tableName: string) {
  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(tableName);

    // Fetch a sample of documents from the collection
    const sampleDocuments = await collection.find({}).limit(100).toArray();

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
  } finally {
    await client.close();
  }
}

// Function to fetch all data from a given table (collection)
export async function QueryTable(databaseName: string, tableName: string) {
  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(tableName);

    // Fetch all documents from the collection
    const data = await collection.find({}).toArray();

    return data; // Return the list of documents
  } catch (error) {
    console.error(`Error fetching data for table "${tableName}" in database "${databaseName}":`, error);
    throw error;
  } finally {
    await client.close();
  }
}

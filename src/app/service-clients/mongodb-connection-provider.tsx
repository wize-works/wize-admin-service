import { MongoClient, MongoClientOptions } from "mongodb";
import 'source-map-support/register';

// Debug mode
const isDebug = process.env.NODE_ENV === 'development';

export class MongoDBConnectionProvider {
  private static instance: MongoDBConnectionProvider;
  private client: MongoClient | null = null;
  private clientPromise: Promise<MongoClient> | null = null;
  private connectionCounter = 0;
  private uri: string;
  
  private constructor() {
    this.uri = process.env.MONGO_URI || "";
    if (!this.uri) {
      throw new Error("Please define the MONGO_URI environment variable in your .env file.");
    }
  }
  
  public static getInstance(): MongoDBConnectionProvider {
    if (!MongoDBConnectionProvider.instance) {
      MongoDBConnectionProvider.instance = new MongoDBConnectionProvider();
    }
    return MongoDBConnectionProvider.instance;
  }
  
  public async getConnection(): Promise<MongoClient> {
    if (!this.clientPromise) {
      // Configure MongoDB client with options
      const options: MongoClientOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };
      
      this.client = new MongoClient(this.uri, options);
      
      if (isDebug) console.log("Creating new MongoDB client instance");
      
      this.clientPromise = this.client.connect()
        .then((client) => {
          if (isDebug) console.log("MongoDB connected successfully");
          return client;
        })
        .catch((err) => {
          console.error("Failed to connect to MongoDB:", err);
          // Reset client so we can retry
          this.client = null;
          this.clientPromise = null;
          throw err;
        });
    }
    
    this.connectionCounter++;
    if (isDebug) console.log(`Getting MongoDB connection (active: ${this.connectionCounter})`);
    return this.clientPromise as Promise<MongoClient>;
  }
  
  public async releaseConnection(): Promise<void> {
    this.connectionCounter--;
    if (isDebug) console.log(`Releasing MongoDB connection (remaining: ${this.connectionCounter})`);
    
    if (this.connectionCounter <= 0 && this.client) {
      this.connectionCounter = 0;
      
      if (isDebug) console.log("No active connections, closing MongoDB client");
      
      try {
        await this.client.close(true);
        if (isDebug) console.log("MongoDB client closed successfully");
      } catch (error) {
        console.error("Error closing MongoDB client:", error);
      } finally {
        this.client = null;
        this.clientPromise = null;
      }
    }
  }
  
  // Helper method to use a connection with proper release handling
  public async withConnection<T>(operation: (client: MongoClient) => Promise<T>): Promise<T> {
    const client = await this.getConnection();
    try {
      return await operation(client);
    } finally {
      await this.releaseConnection();
    }
  }
}

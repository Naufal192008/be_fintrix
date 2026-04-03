const { MongoClient, ServerApiVersion } = require('mongodb');

class MongoDBClient {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI;
      
      // Create a MongoClient with the server API options
      this.client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

      // Connect the client
      await this.client.connect();
      
      // Send a ping to confirm connection
      await this.client.db("admin").command({ ping: 1 });
      console.log("✅ MongoDB Driver client connected successfully!");
      
      this.db = this.client.db("fintrix");
      return this.db;
      
    } catch (error) {
      console.error("❌ MongoDB Driver connection error:", error);
      throw error;
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }

  // Example method to test the connection
  async testConnection() {
    try {
      const admin = this.db.admin();
      const serverInfo = await admin.serverInfo();
      console.log('MongoDB server info:', serverInfo.version);
      
      const collections = await this.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
      
      return true;
    } catch (error) {
      console.error('Test connection error:', error);
      return false;
    }
  }
}

// Create a singleton instance
const mongoClient = new MongoDBClient();

module.exports = mongoClient;
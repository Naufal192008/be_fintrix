const { MongoClient, ServerApiVersion } = require('mongodb');

// Your connection string
const uri = "mongodb+srv://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@cluster0.q8ggibl.mongodb.net/fintrix?retryWrites=true&w=majority&appName=Cluster0";

// Create a client with specific SSL options for Windows
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsInsecure: true,  // This is key for Windows
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  // Force IPv4
  family: 4,
  // Increase timeouts
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  // Disable TLS 1.3 (sometimes causes issues)
  tlsDisableCertificateRevocationCheck: true,
  minPoolSize: 0,
  maxPoolSize: 10
});

async function run() {
  console.log('Attempting to connect with aggressive Windows settings...');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    // Send a ping
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful!');
    
    // Try to create a test collection
    const db = client.db("fintrix");
    await db.createCollection("test_connection");
    console.log('✅ Created test collection');
    
    // Insert a test document
    const result = await db.collection("test_connection").insertOne({
      timestamp: new Date(),
      message: "Connection successful!"
    });
    console.log('✅ Insert successful:', result.insertedId);
    
    console.log('\n🎉 SUCCESS! Connection working!');
    console.log('\n📝 Update your .env file with:');
    console.log(`MONGODB_URI=${uri}`);
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\nTrying alternative connection method...');
    
    // Try without SRV
    await alternativeConnection();
  } finally {
    await client.close();
  }
}

async function alternativeConnection() {
  // Try direct connection without SRV
  const altUri = "mongodb://cluster0-shard-00-00.q8ggibl.mongodb.net:27017,cluster0-shard-00-01.q8ggibl.mongodb.net:27017,cluster0-shard-00-02.q8ggibl.mongodb.net:27017/fintrix?ssl=true&authSource=admin&replicaSet=atlas-9nuz1d-shard-0&retryWrites=true&w=majority";
  
  const altClient = new MongoClient(altUri, {
    auth: {
      username: "nmurtadho1905_db_user",
      password: "7p3Z3gFq89coM5fY"
    },
    tls: true,
    tlsInsecure: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    family: 4
  });
  
  try {
    console.log('📡 Trying alternative connection...');
    await altClient.connect();
    console.log('✅ Alternative connection successful!');
  } catch (err) {
    console.error('❌ Alternative connection failed:', err.message);
    console.log('\n🔧 Final Windows-specific troubleshooting:');
    console.log('1. Run PowerShell as Administrator and execute:');
    console.log('   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12');
    console.log('2. Add this to your Windows hosts file (C:\\Windows\\System32\\drivers\\etc\\hosts):');
    console.log('   65.62.241.108 cluster0-shard-00-00.q8ggibl.mongodb.net');
    console.log('   65.62.241.118 cluster0-shard-00-01.q8ggibl.mongodb.net');
    console.log('   65.62.241.131 cluster0-shard-00-02.q8ggibl.mongodb.net');
    console.log('3. Temporarily disable Windows Defender Firewall');
    console.log('4. Try using a VPN or mobile hotspot');
  } finally {
    await altClient.close();
  }
}

run().catch(console.error);
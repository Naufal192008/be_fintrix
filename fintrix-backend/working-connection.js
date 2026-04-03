const { MongoClient, ServerApiVersion } = require('mongodb');

// We have the actual IPs now!
const SHARD_IPS = {
  shard00: '65.62.241.108',
  shard01: '65.62.241.118',
  shard02: '65.62.241.131'
};

const username = 'nmurtadho1905_db_user';
const password = '7p3Z3gFq89coM5fY';

async function connectWithIP() {
  console.log('=' .repeat(60));
  console.log('MongoDB Direct IP Connection Test');
  console.log('=' .repeat(60));
  
  // Try each IP directly
  for (const [shardName, ip] of Object.entries(SHARD_IPS)) {
    console.log(`\n🔍 Testing ${shardName} (${ip})...`);
    
    // Direct connection string with IP
    const uri = `mongodb://${username}:${password}@${ip}:27017/fintrix?authSource=admin&ssl=true&replicaSet=atlas-9nuz1d-shard-0&readPreference=primary&retryWrites=true&w=majority&directConnection=true`;
    
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000
    });
    
    try {
      console.log('📡 Connecting...');
      await client.connect();
      console.log('✅ Connected to IP!');
      
      // Send a ping
      await client.db("admin").command({ ping: 1 });
      console.log('✅ Ping successful!');
      
      // Test write
      const db = client.db("fintrix");
      const result = await db.collection("connection_test").insertOne({
        timestamp: new Date(),
        ip: ip,
        shard: shardName,
        message: "Direct IP connection successful!"
      });
      console.log('✅ Write test successful! ID:', result.insertedId);
      
      // Read back
      const doc = await db.collection("connection_test").findOne({ _id: result.insertedId });
      console.log('✅ Read test successful:', doc.message);
      
      console.log(`\n🎉 SUCCESS! Working IP: ${ip}`);
      console.log('\n📝 Use this connection string in your .env:');
      console.log(`MONGODB_URI=mongodb://${username}:${password}@${ip}:27017/fintrix?authSource=admin&ssl=true&replicaSet=atlas-9nuz1d-shard-0&readPreference=primary&retryWrites=true&w=majority&directConnection=true`);
      
      await client.close();
      return true;
      
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    } finally {
      await client.close();
    }
  }
  
  // Try connecting to all shards as a replica set
  console.log('\n🔍 Testing replica set connection...');
  
  const replicaUri = `mongodb://${username}:${password}@${SHARD_IPS.shard00}:27017,${SHARD_IPS.shard01}:27017,${SHARD_IPS.shard02}:27017/fintrix?authSource=admin&ssl=true&replicaSet=atlas-9nuz1d-shard-0&readPreference=primary&retryWrites=true&w=majority`;
  
  const replicaClient = new MongoClient(replicaUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000
  });
  
  try {
    console.log('📡 Connecting to replica set...');
    await replicaClient.connect();
    console.log('✅ Connected to replica set!');
    
    await replicaClient.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful!');
    
    console.log('\n🎉 SUCCESS! Replica set connection working!');
    console.log('\n📝 Use this connection string in your .env:');
    console.log(`MONGODB_URI=${replicaUri}`);
    
    await replicaClient.close();
    return true;
  } catch (err) {
    console.log(`❌ Replica set failed: ${err.message}`);
    return false;
  }
}

connectWithIP().catch(console.error);
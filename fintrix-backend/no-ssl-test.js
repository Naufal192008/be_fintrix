const { MongoClient } = require('mongodb');

// Try WITHOUT SSL (temporary for testing)
const username = 'nmurtadho1905_db_user';
const password = '7p3Z3gFq89coM5fY';
const ip = '65.62.241.108';

// Connection without SSL
const uri = `mongodb://${username}:${password}@${ip}:27017/fintrix?authSource=admin&directConnection=true`;

console.log('=' .repeat(60));
console.log('No-SSL Connection Test');
console.log('=' .repeat(60));
console.log('Attempting connection WITHOUT SSL...\n');

const client = new MongoClient(uri, {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  // No SSL options at all
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected without SSL!');
    
    const db = client.db("fintrix");
    await db.command({ ping: 1 });
    console.log('✅ Ping successful!');
    
    // Try to insert
    const result = await db.collection("test").insertOne({
      timestamp: new Date(),
      message: "No SSL connection test"
    });
    console.log('✅ Insert successful! ID:', result.insertedId);
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    
    if (err.message.includes('SSL')) {
      console.log('\n🔧 SSL is required. Trying with minimal SSL...');
      await tryMinimalSSL();
    }
  } finally {
    await client.close();
  }
}

async function tryMinimalSSL() {
  const sslUri = `mongodb://${username}:${password}@${ip}:27017/fintrix?authSource=admin&directConnection=true&ssl=true`;
  
  const sslClient = new MongoClient(sslUri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    connectTimeoutMS: 10000
  });
  
  try {
    await sslClient.connect();
    console.log('✅ Connected with minimal SSL!');
    await sslClient.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful!');
  } catch (err) {
    console.error('❌ Minimal SSL also failed:', err.message);
    console.log('\n🔧 Windows Fix Attempt:');
    console.log('1. Run PowerShell as Administrator and run:');
    console.log('   netsh advfirewall set allprofiles state off');
    console.log('2. Add to hosts file (C:\\Windows\\System32\\drivers\\etc\\hosts):');
    console.log('   65.62.241.108 cluster0-shard-00-00.q8ggibl.mongodb.net');
    console.log('   65.62.241.118 cluster0-shard-00-01.q8ggibl.mongodb.net');
    console.log('   65.62.241.131 cluster0-shard-00-02.q8ggibl.mongodb.net');
  } finally {
    await sslClient.close();
  }
}

run().catch(console.error);
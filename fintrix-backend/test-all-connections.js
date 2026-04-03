const { MongoClient } = require('mongodb');

const connections = [
  {
    name: 'SRV Connection (ATLAS)',
    uri: 'mongodb+srv://fintrix:fintrix12345@cluster0.tiehhgw.mongodb.net/fintrix?retryWrites=true&w=majority&appName=Cluster0'
  },
  {
    name: 'Direct IP - Single Shard',
    uri: 'mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017/fintrix?authSource=admin&ssl=true'
  },
  {
    name: 'Direct IP - All Shards',
    uri: 'mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017,65.62.241.118:27017,65.62.241.131:27017/fintrix?authSource=admin&replicaSet=atlas-9nuz1d-shard-0&ssl=true'
  },
  {
    name: 'With TLS 1.2 forced',
    uri: 'mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017/fintrix?authSource=admin&ssl=true&tls=true&tlsInsecure=true'
  }
];

async function testConnection(conn) {
  console.log(`\n🔍 Testing: ${conn.name}`);
  console.log(`URI: ${conn.uri.replace(/:[^:@]*@/, ':****@')}`);
  
  const client = new MongoClient(conn.uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  });

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log('✅ SUCCESS! Connected successfully');
    return true;
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
    return false;
  } finally {
    await client.close();
  }
}

async function run() {
  console.log('='.repeat(60));
  console.log('TEST ALL CONNECTION METHODS');
  console.log('='.repeat(60));
  
  for (const conn of connections) {
    await testConnection(conn);
  }
}

run().catch(console.error);

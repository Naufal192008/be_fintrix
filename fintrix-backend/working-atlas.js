const { MongoClient, ServerApiVersion } = require('mongodb');
const https = require('https');
const tls = require('tls');

// Force TLS 1.2 (instead of letting it negotiate)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Your credentials
const username = 'nmurtadho1905_db_user';
const password = '7p3Z3gFq89coM5fY';

// Use the hostnames (they work better with SSL)
const hosts = [
  'ac-nkc0wyt-shard-00-00.q8ggibl.mongodb.net',
  'ac-nkc0wyt-shard-00-01.q8ggibl.mongodb.net',
  'ac-nkc0wyt-shard-00-02.q8ggibl.mongodb.net'
];

// Create connection string with explicit SSL parameters
const uri = `mongodb://${username}:${password}@${hosts[0]}:27017,${hosts[1]}:27017,${hosts[2]}:27017/fintrix?authSource=admin&replicaSet=atlas-9nuz1d-shard-0&ssl=true&retryWrites=true&w=majority`;

console.log('=' .repeat(60));
console.log('MongoDB Atlas Windows Fix');
console.log('=' .repeat(60));
console.log('Attempting connection with forced TLS 1.2...\n');

// Create a custom TLS socket that forces TLS 1.2
const customTLS = (host, port, options, callback) => {
  options.secureProtocol = 'TLSv1_2_method';
  options.rejectUnauthorized = false;
  options.requestCert = true;
  
  const socket = tls.connect(port, host, options, () => {
    console.log(`✅ TLS socket connected to ${host}`);
    callback(null, socket);
  });
  
  socket.on('error', (err) => {
    console.error(`❌ TLS socket error for ${host}:`, err.message);
    callback(err);
  });
  
  return socket;
};

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Force IPv4
  family: 4,
  // SSL/TLS settings
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  tlsInsecure: true,
  // Use TLS 1.2 explicitly
  secureProtocol: 'TLSv1_2_method',
  // Custom socket
  socketOptions: {
    secureProtocol: 'TLSv1_2_method'
  },
  // Timeouts
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  // Disable TLS 1.3
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.2',
});

async function run() {
  try {
    console.log('📡 Connecting with TLS 1.2...');
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    // Send a ping
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful!');
    
    // Test write
    const db = client.db("fintrix");
    const result = await db.collection("connection_test").insertOne({
      timestamp: new Date(),
      message: "Windows TLS fix working!",
      host: hosts[0]
    });
    console.log('✅ Write test successful! ID:', result.insertedId);
    
    console.log('\n🎉 SUCCESS! Connection is working!');
    console.log('\n📝 Add this to your .env file:');
    console.log(uri);
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\n🔧 Trying alternative approach...');
    await alternativeApproach();
  } finally {
    await client.close();
  }
}

async function alternativeApproach() {
  // Try with SRV record but custom TLS
  const srvUri = `mongodb+srv://${username}:${password}@cluster0.q8ggibl.mongodb.net/fintrix?retryWrites=true&w=majority&appName=Cluster0`;
  
  const srvClient = new MongoClient(srvUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    secureProtocol: 'TLSv1_2_method',
    family: 4
  });
  
  try {
    console.log('\n📡 Trying SRV connection with TLS 1.2...');
    await srvClient.connect();
    await srvClient.db("admin").command({ ping: 1 });
    console.log('✅ SRV connection successful!');
  } catch (err) {
    console.error('❌ SRV connection failed:', err.message);
    console.log('\n🔧 Windows Registry Fix (run regedit as Administrator):');
    console.log('1. Navigate to: HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Protocols');
    console.log('2. Create new key: "TLS 1.2" under Protocols');
    console.log('3. Under "TLS 1.2", create two keys: "Client" and "Server"');
    console.log('4. In each key, create DWORD (32-bit) values:');
    console.log('   - "DisabledByDefault" = 0');
    console.log('   - "Enabled" = 1');
    console.log('5. Reboot your computer');
  } finally {
    await srvClient.close();
  }
}

run().catch(console.error);
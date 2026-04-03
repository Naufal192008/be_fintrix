
const { MongoClient } = require('mongodb');
const dns = require('dns');
const net = require('net');

console.log('=' .repeat(60));
console.log('MongoDB Connection Diagnostic Tool');
console.log('=' .repeat(60));

const username = 'nmurtadho1905_db_user';
const password = '7p3Z3gFq89coM5fY';
const hosts = [
  { name: 'shard00', host: 'ac-nkc0wyt-shard-00-00.q8ggibl.mongodb.net', ip: '65.62.241.108' },
  { name: 'shard01', host: 'ac-nkc0wyt-shard-00-01.q8ggibl.mongodb.net', ip: '65.62.241.118' },
  { name: 'shard02', host: 'ac-nkc0wyt-shard-00-02.q8ggibl.mongodb.net', ip: '65.62.241.131' }
];

async function testTCPConnection(ip, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 5000;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`  ✅ TCP connection to ${ip}:${port} successful`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`  ❌ TCP connection to ${ip}:${port} timed out`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`  ❌ TCP connection to ${ip}:${port} failed: ${err.message}`);
      resolve(false);
    });
    
    socket.connect(port, ip);
  });
}

async function testDNSResolution(hostname) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing DNS for ${hostname}...`);
    
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) {
        console.log(`  ❌ DNS lookup failed: ${err.message}`);
        resolve(null);
      } else {
        console.log(`  ✅ DNS resolved to: ${address}`);
        resolve(address);
      }
    });
  });
}

async function testMongoDBConnection(uri, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${name}...`);
    
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    
    const timeout = setTimeout(() => {
      console.log(`  ❌ ${name} timed out after 5 seconds`);
      client.close();
      resolve(false);
    }, 5000);
    
    client.connect()
      .then(() => {
        clearTimeout(timeout);
        console.log(`  ✅ ${name} connected successfully!`);
        return client.db("admin").command({ ping: 1 });
      })
      .then(() => {
        console.log(`  ✅ ${name} ping successful!`);
        client.close();
        resolve(true);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.log(`  ❌ ${name} failed: ${err.message}`);
        client.close();
        resolve(false);
      });
  });
}

async function run() {
  console.log('\n1. Testing TCP connectivity to shards...\n');
  
  for (const host of hosts) {
    console.log(`📡 Testing ${host.name} (${host.ip})...`);
    await testTCPConnection(host.ip, 27017);
  }
  
  console.log('\n2. Testing DNS resolution...\n');
  
  for (const host of hosts) {
    await testDNSResolution(host.host);
  }
  
  console.log('\n3. Testing MongoDB connections with different methods...\n');
  
  // Test single server connections
  for (const host of hosts) {
    const uri = `mongodb://${username}:${password}@${host.ip}:27017/fintrix?authSource=admin&directConnection=true&ssl=true`;
    await testMongoDBConnection(uri, `Direct connection to ${host.name}`);
  }
  
  // Test replica set connection
  const replicaUri = `mongodb://${username}:${password}@${hosts[0].ip}:27017,${hosts[1].ip}:27017,${hosts[2].ip}:27017/fintrix?authSource=admin&replicaSet=atlas-9nuz1d-shard-0&ssl=true&retryWrites=true&w=majority`;
  await testMongoDBConnection(replicaUri, 'Replica set connection');
  
  // Test with hostnames
  const hostnameUri = `mongodb://${username}:${password}@${hosts[0].host}:27017,${hosts[1].host}:27017,${hosts[2].host}:27017/fintrix?authSource=admin&replicaSet=atlas-9nuz1d-shard-0&ssl=true&retryWrites=true&w=majority`;
  await testMongoDBConnection(hostnameUri, 'Hostname connection');
  
  console.log('\n' + '=' .repeat(60));
  console.log('Diagnostic Complete');
  console.log('=' .repeat(60));
}

run().catch(console.error);
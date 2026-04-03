const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://fintrix:fintrix12345@cluster0.tiehhgw.mongodb.net/fintrix?retryWrites=true&w=majority&appName=Cluster0";

console.log('=' .repeat(60));
console.log('TEST KONEKSI FINAL');
console.log('=' .repeat(60));

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: true
});

async function run() {
  try {
    console.log('📡 Menghubungkan...');
    await client.connect();
    
    console.log('📡 Ping database...');
    await client.db("admin").command({ ping: 1 });
    console.log('✅ PING SUKSES! Terkoneksi ke MongoDB!');
    
    // Test bikin database
    const db = client.db("fintrix");
    await db.createCollection("users");
    console.log('✅ Collection "users" berhasil dibuat');
    
    console.log('\n🎉 SEMUA BERHASIL! MongoDB siap digunakan!');
    
  } catch (err) {
    console.error('❌ GAGAL:', err.message);
  } finally {
    await client.close();
  }
}

run();
const { MongoClient } = require('mongodb');

// Coba koneksi tanpa SSL
const uri = "mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017/fintrix?authSource=admin&directConnection=true";

console.log('='.repeat(50));
console.log('TEST KONEKSI TANPA SSL');
console.log('='.repeat(50));

const client = new MongoClient(uri, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  // TANPA opsi SSL sama sekali
});

async function run() {
  try {
    console.log('📡 Mencoba koneksi tanpa SSL...');
    await client.connect();
    console.log('✅ BERHASIL! Terkoneksi tanpa SSL');
    
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping berhasil');
    
  } catch (err) {
    console.log('❌ Gagal:', err.message);
    
    if (err.message.includes('SSL')) {
      console.log('\n🔧 SSL diperlukan. Mencoba dengan opsi minimal...');
      await tryMinimalSSL();
    }
  } finally {
    await client.close();
  }
}

async function tryMinimalSSL() {
  const sslUri = "mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017/fintrix?authSource=admin&ssl=true&directConnection=true";
  
  const sslClient = new MongoClient(sslUri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    connectTimeoutMS: 10000
  });
  
  try {
    await sslClient.connect();
    console.log('✅ Berhasil dengan SSL minimal!');
    await sslClient.db("admin").command({ ping: 1 });
    console.log('✅ Ping berhasil');
  } catch (err) {
    console.log('❌ Gagal juga:', err.message);
    console.log('\n🔧 Solusi Windows:');
    console.log('1. Jalankan PowerShell sebagai Administrator');
    console.log('2. Ketik perintah berikut:');
    console.log('   netsh advfirewall set allprofiles state off');
    console.log('3. Coba lagi');
    console.log('\n📝 Atau gunakan MongoDB Compass untuk test:');
    console.log('   Connection string: mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017/fintrix?authSource=admin');
  } finally {
    await sslClient.close();
  }
}

run().catch(console.error);
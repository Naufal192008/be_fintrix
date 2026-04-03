const { MongoClient } = require('mongodb');

const uri = "mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017/fintrix?authSource=admin&directConnection=true";

console.log('='.repeat(60));
console.log('TEST NATIVE MONGODB DRIVER');
console.log('='.repeat(60));
console.log('URI:', uri.replace(/:[^:@]*@/, ':****@'));

const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
  // TANPA opsi SSL sama sekali
});

async function run() {
  try {
    console.log('\n📡 Mencoba koneksi tanpa SSL...');
    await client.connect();
    console.log('✅ BERHASIL!');
    
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping berhasil');
    
  } catch (err) {
    console.log('❌ Gagal:', err.message);
  } finally {
    await client.close();
  }
}

run();
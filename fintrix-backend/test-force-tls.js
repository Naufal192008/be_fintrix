const { MongoClient } = require('mongodb');

// Nonaktifkan validasi sertifikat global (UNTUK TESTING)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Gunakan satu host saja untuk direct connection
const uri = "mongodb://nmurtadho1905_db_user:7p3Z3gFq89coM5fY@65.62.241.108:27017/fintrix?authSource=admin&ssl=true&directConnection=true";

console.log('='.repeat(60));
console.log('TEST DENGAN FORCE TLS 1.2');
console.log('='.repeat(60));

// Hanya gunakan salah satu opsi, tidak keduanya
const client = new MongoClient(uri, {
  // Pilih salah satu: gunakan tlsAllowInvalidCertificates (lebih umum)
  tls: true,
  tlsAllowInvalidCertificates: true,  // Mengabaikan sertifikat invalid
  tlsAllowInvalidHostnames: true,      // Mengabaikan hostname mismatch
  
  // JANGAN gunakan tlsInsecure bersama dengan opsi di atas
  // tlsInsecure: true,  // <-- COMMENT OUT ATAU HAPUS
  
  // Force IPv4
  family: 4,
  
  // Timeouts lebih panjang
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  
  // Force TLS 1.2
  secureProtocol: 'TLSv1_2_method',
  
  // Opsi tambahan
  retryWrites: true,
  w: 'majority'
});

async function run() {
  try {
    console.log('📡 Mencoba koneksi dengan force TLS 1.2...');
    console.log('URI:', uri.replace(/:[^:@]*@/, ':****@')); // Sensor password
    
    await client.connect();
    console.log('✅ BERHASIL TERKONEKSI!');
    
    // Test ping
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping ke database berhasil');
    
    // Test insert sederhana
    const db = client.db("fintrix");
    const result = await db.collection("test").insertOne({
      timestamp: new Date(),
      message: "Test koneksi force TLS"
    });
    console.log('✅ Insert test berhasil, ID:', result.insertedId);
    
  } catch (err) {
    console.log('❌ Gagal:', err.message);
    console.log('\n🔍 Detail error:');
    console.log('Nama error:', err.name);
    console.log('Stack:', err.stack);
    
    console.log('\n🔧 Solusi berikutnya:');
    console.log('1. Jalankan PowerShell sebagai Administrator');
    console.log('2. Nonaktifkan firewall: netsh advfirewall set allprofiles state off');
    console.log('3. Setting registry TLS: lihat instruksi di atas');
    console.log('4. Restart komputer');
  } finally {
    await client.close();
  }
}

run().catch(console.error);
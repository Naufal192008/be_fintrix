const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('='.repeat(60));
console.log('TEST KONEKSI DATABASE ONLY');
console.log('='.repeat(60));
console.log('Mencoba koneksi ke:', uri.replace(/:[^:@]*@/, ':****@'));

async function testConnection() {
  try {
    console.log('\n📡 Mencoba koneksi...');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Koneksi berhasil!');
    
    // Test query sederhana
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('👋 Disconnected');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Detail error:', error);
  }
}

testConnection();
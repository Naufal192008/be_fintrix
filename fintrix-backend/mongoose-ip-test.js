const mongoose = require('mongoose');

// Your credentials
const username = 'nmurtadho1905_db_user';
const password = '7p3Z3gFq89coM5fY';
const ips = ['65.62.241.108', '65.62.241.118', '65.62.241.131'];

// Create connection string with IPs
const uri = `mongodb://${username}:${password}@${ips[0]}:27017,${ips[1]}:27017,${ips[2]}:27017/fintrix?authSource=admin&replicaSet=atlas-9nuz1d-shard-0&ssl=true&retryWrites=true&w=majority`;

console.log('=' .repeat(60));
console.log('Mongoose IP Connection Test');
console.log('=' .repeat(60));
console.log('Connection string:', uri.replace(/:[^:@]+@/, ':<password>@'));
console.log('\nAttempting to connect with IPs...\n');

// Try with different SSL options
const options = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  family: 4,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  autoIndex: true,
  maxPoolSize: 10,
  minPoolSize: 0,
};

console.log('Connecting...');

mongoose.connect(uri, options);

mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected successfully!');
  
  // Create a test schema and model
  const testSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    ip: String
  });
  
  const Test = mongoose.model('ConnectionTest', testSchema);
  
  // Try to create a document
  Test.create({
    message: 'Connection successful',
    timestamp: new Date(),
    ip: ips[0]
  })
  .then(doc => {
    console.log('✅ Test document created with ID:', doc._id);
    console.log('\n🎉 SUCCESS! Connection is working!');
    console.log('\n📝 Add this to your .env file:');
    console.log(`MONGODB_URI=${uri}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to create document:', err.message);
    process.exit(1);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Disconnected from MongoDB');
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 30 seconds');
  console.log('\n🔧 Checking connection state...');
  console.log('Connection readyState:', mongoose.connection.readyState);
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  process.exit(1);
}, 30000);
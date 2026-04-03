const mongoose = require('mongoose');

// Use IPs directly
const username = 'nmurtadho1905_db_user';
const password = '7p3Z3gFq89coM5fY';
const ips = ['65.62.241.108', '65.62.241.118', '65.62.241.131'];

// Create connection string with IPs
const uri = `mongodb://${username}:${password}@${ips[0]}:27017,${ips[1]}:27017,${ips[2]}:27017/fintrix?authSource=admin&replicaSet=atlas-9nuz1d-shard-0&ssl=true&retryWrites=true&w=majority`;

console.log('Attempting mongoose connection with IPs...');

mongoose.connect(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  family: 4,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000
});

mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected!');
  
  // Test the connection
  const Test = mongoose.model('Test', new mongoose.Schema({
    message: String,
    timestamp: Date
  }));
  
  Test.create({ message: 'Connection test', timestamp: new Date() })
    .then(doc => {
      console.log('✅ Test document created:', doc._id);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Test failed:', err.message);
      process.exit(1);
    });
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose error:', err.message);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 30000);
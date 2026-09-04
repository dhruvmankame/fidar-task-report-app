const mongoose = require('mongoose');

// Connect to MongoDB. Throws if it cannot connect, so the caller can exit.
async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}

module.exports = connectDB;

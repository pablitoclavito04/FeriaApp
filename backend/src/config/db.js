const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // In test mode REQUIRE a dedicated test URI. Never fall back to the real
    // database — the suite runs deleteMany() and would wipe production data.
    if (process.env.NODE_ENV === 'test' && !process.env.MONGODB_TEST_URI) {
      throw new Error('MONGODB_TEST_URI must be set when NODE_ENV=test');
    }
    const uri = process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_TEST_URI
      : process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
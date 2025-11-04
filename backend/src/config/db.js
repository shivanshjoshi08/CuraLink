const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Mongoose will automatically read the connection string from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Successfully connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to the database: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
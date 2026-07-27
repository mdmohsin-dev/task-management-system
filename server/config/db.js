import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB using the URI provided in environment
 * variables. Exits the process on failure since the API cannot function
 * without a database connection.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

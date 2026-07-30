import mongoose from 'mongoose';

let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isActuallyConnected = mongoose.connection.readyState === 1;

  if (cached.conn && isActuallyConnected) {
    return cached.conn;
  }


  if (cached.conn && !isActuallyConnected) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // fail fast instead of hanging silently
      })
      .then((mongooseInstance) => {
        console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // allow the next request to retry instead of staying broken
    throw error;
  }

  return cached.conn;
};

export default connectDB;
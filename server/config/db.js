import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;
    
    if (!connUri && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI environment variable is required in production mode!');
    }
    
    const finalUri = connUri || 'mongodb://127.0.0.1:27017/spendly';

    // If already connected, reuse the active connection
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    if (!cachedConnection) {
      cachedConnection = mongoose.connect(finalUri, {
        bufferCommands: false,
      });
    }
    
    const conn = await cachedConnection;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;

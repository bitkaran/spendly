import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;
    
    if (!connUri && process.env.NODE_ENV === 'production') {
      console.error('FATAL ERROR: MONGODB_URI environment variable is required in production mode!');
      process.exit(1);
    }
    
    const finalUri = connUri || 'mongodb://127.0.0.1:27017/spendly';
    const conn = await mongoose.connect(finalUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

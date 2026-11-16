import mongoose from 'mongoose';
import env from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      autoIndex: true,
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Disconnected]');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Error]:', err);
});

export default connectDB;


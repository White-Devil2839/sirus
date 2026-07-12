import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[db] connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    console.error('[db] Set MONGODB_URI in server/.env (local Mongo or an Atlas string).');
    throw err;
  }
}

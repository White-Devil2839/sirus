import { beforeAll, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Force offline mode BEFORE the app config loads: dotenv never overrides
// pre-set env vars, so tests run the demo generation path with no API keys.
process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = '';
process.env.DEEPGRAM_API_KEY = '';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});

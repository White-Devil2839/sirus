import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    hookTimeout: 60_000,
    testTimeout: 30_000,
    fileParallelism: false, // one in-memory Mongo, sequential suites
  },
});

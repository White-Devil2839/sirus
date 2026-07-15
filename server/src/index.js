import { createApp } from './app.js';
import { config, hasLlm, hasDeepgram } from './config/env.js';
import { connectDb } from './config/db.js';

// HTTP entrypoint — createApp() stays port-less so tests can drive it directly.
connectDb()
  .then(() => {
    const app = createApp();
    app.listen(config.port, () => {
      console.log(`[server] SIRUS API on http://localhost:${config.port}`);
      console.log(`[server] LLM: ${hasLlm ? `groq (${config.llm.groqModel})` : 'not configured — seed data still works'}`);
      console.log(`[server] Audio: ${hasDeepgram ? 'deepgram (nova-2, diarized)' : 'not configured — transcript uploads only'}`);
    });
  })
  .catch(() => {
    console.error('[server] could not start without a database connection.');
    process.exit(1);
  });

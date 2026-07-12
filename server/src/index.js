import express from 'express';
import cors from 'cors';
import { config, hasLlm, hasDeepgram } from './config/env.js';
import { connectDb } from './config/db.js';
import { notFound, errorHandler } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import sampleRoutes from './routes/samples.js';
import requestRoutes from './routes/requests.js';
import reportRoutes from './routes/reports.js';

const app = express();

app.use(cors({ origin: config.clientOrigin === '*' ? true : config.clientOrigin.split(',') }));
app.use(express.json({ limit: '4mb' }));

// Health + capability probe (client shows a banner when no LLM key is set).
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/meta', (req, res) =>
  res.json({
    llm: { enabled: hasLlm, provider: config.llm.provider, model: config.llm.groqModel },
    audio: { enabled: hasDeepgram, provider: 'deepgram' },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);

// Stub modules described in the proposal but out of scope for this build.
const stub = (name) => (req, res) => res.json({ stub: true, module: name, message: `${name} is a planned module (see README).` });
app.post('/api/voice/ask', requireAuth, stub('Voice/Text Assistant'));
app.get('/api/crm/profiles', requireAuth, stub('Customer Management (CRM)'));
app.post('/api/broadcast', requireAuth, stub('Broadcast Workspace'));

app.use(notFound);
app.use(errorHandler);

connectDb()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`[server] SIRUS API on http://localhost:${config.port}`);
      console.log(`[server] LLM: ${hasLlm ? config.llm.provider + ' (' + config.llm.groqModel + ')' : 'not configured — seed data still works'}`);
    });
  })
  .catch(() => {
    console.error('[server] could not start without a database connection.');
    process.exit(1);
  });

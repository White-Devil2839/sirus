import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config, hasLlm, hasDeepgram } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import sampleRoutes from './routes/samples.js';
import requestRoutes from './routes/requests.js';
import reportRoutes from './routes/reports.js';

// Builds the configured Express app without binding a port, so the full API
// can be exercised in-process by supertest.
export function createApp() {
  const app = express();

  // Behind Render/Vercel proxies — needed for correct client IPs (rate limits).
  app.set('trust proxy', 1);

  // ── Security ──────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
      },
    })
  );
  app.use(cors({ origin: config.clientOrigin === '*' ? true : config.clientOrigin.split(',') }));
  app.use(express.json({ limit: '4mb' }));
  app.use(mongoSanitize());

  if (!config.isTest) app.use(morgan(config.isProd ? 'combined' : 'dev'));

  // Tiered rate limits: generous globally, tight on auth, tighter on AI calls.
  const limiter = (max, windowMs = 60_000) =>
    rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });
  app.use('/api', limiter(300));
  app.use('/api/auth', limiter(30));
  app.use(['/api/requests/:id/generate', '/api/requests/:id/preview', '/api/requests/:id/ask'], limiter(20));

  // ── Health + capability probe ─────────────────────────────
  app.get('/api/health', (req, res) => res.json({ ok: true, service: 'sirus-api', ts: Date.now() }));
  app.get('/api/meta', (req, res) =>
    res.json({
      llm: { enabled: hasLlm, provider: config.llm.provider, model: config.llm.groqModel },
      audio: { enabled: hasDeepgram, provider: 'deepgram' },
    })
  );

  // ── Feature routes ─────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/samples', sampleRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/reports', reportRoutes);

  // Stub modules described in the proposal but out of scope for this build.
  const stub = (name) => (req, res) => res.json({ stub: true, module: name, message: `${name} is a planned module (see README).` });
  app.post('/api/voice/ask', requireAuth, stub('Voice Agent (Deepgram Voice API)'));
  app.get('/api/crm/profiles', requireAuth, stub('Customer Management (CRM)'));
  app.post('/api/broadcast', requireAuth, stub('Broadcast Workspace'));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Boot-time env validation — fail loud, fail early. Production refuses to
// start with a weak or default JWT secret.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5050),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/sirus'),
  JWT_SECRET: z.string().default('dev-secret-change-me'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  LLM_MAX_TRANSCRIPT_CHARS: z.coerce.number().default(6000),
  DEEPGRAM_API_KEY: z.string().optional().default(''),
}).refine(
  (env) => env.NODE_ENV !== 'production' || (env.JWT_SECRET.length >= 32 && !env.JWT_SECRET.startsWith('dev-secret')),
  { message: 'JWT_SECRET must be a strong value (≥32 chars, not the dev default) in production.' }
);

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[env] invalid configuration:');
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join('.') || issue.code}: ${issue.message}`);
  process.exit(1);
}
const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: '7d',
  clientOrigin: env.CLIENT_ORIGIN,

  llm: {
    provider: env.GROQ_API_KEY ? 'groq' : 'none',
    groqKey: env.GROQ_API_KEY,
    // Groq (OpenAI-compatible, free tier). Large-context Llama by default.
    groqModel: env.GROQ_MODEL,
    // Groq's free tier caps tokens-per-minute (12k for llama-3.3-70b). French
    // tokenizes densely (~2.4 chars/token), so we cap the transcript characters
    // sent per request. Raise only if your Groq tier allows bigger requests.
    maxTranscriptChars: env.LLM_MAX_TRANSCRIPT_CHARS,
  },

  // Deepgram — audio/video → diarized transcript (proposal Section 14).
  deepgram: { key: env.DEEPGRAM_API_KEY },
};

export const hasLlm = config.llm.provider !== 'none';
export const hasDeepgram = !!config.deepgram.key;

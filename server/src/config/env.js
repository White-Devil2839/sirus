import dotenv from 'dotenv';

dotenv.config();

const groqKey = process.env.GROQ_API_KEY || '';
const deepgramKey = process.env.DEEPGRAM_API_KEY || '';

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sirus',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  llm: {
    provider: groqKey ? 'groq' : 'none',
    groqKey,
    // Groq (OpenAI-compatible, free tier). Large-context Llama by default.
    groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    // Groq's free tier caps tokens-per-minute (12k for llama-3.3-70b). French
    // tokenizes densely (~2.4 chars/token), so we send at most this many
    // transcript characters to stay under the per-request budget. Raise it only
    // if your Groq tier allows a bigger request.
    maxTranscriptChars: Number(process.env.LLM_MAX_TRANSCRIPT_CHARS) || 6000,
  },

  // Deepgram — audio/video → diarized transcript (proposal Section 14).
  deepgram: { key: deepgramKey },
};

export const hasDeepgram = !!deepgramKey;

export const hasLlm = config.llm.provider !== 'none';

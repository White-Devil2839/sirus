import { config, hasLlm } from '../../config/env.js';

function llmError(message) {
  const err = new Error(message);
  err.status = 503;
  return err;
}

// Free-tier Groq caps tokens-per-minute; keep the transcript within budget.
function capTranscript(text) {
  const limit = config.llm.maxTranscriptChars;
  if (!text || text.length <= limit) return text;
  return text.slice(0, limit) + '\n\n[transcript truncated to fit the free-tier token budget]';
}

// Run the model on a transcript + instruction and return the raw text response.
// Groq exposes an OpenAI-compatible endpoint, so a single fetch does it.
export async function runModel({ system, transcript, instruction, maxTokens = 8000 }) {
  if (!hasLlm) {
    throw llmError('No GROQ_API_KEY configured. Add it to server/.env to enable live generation.');
  }
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.llm.groqKey}` },
    body: JSON.stringify({
      model: config.llm.groqModel,
      max_tokens: Math.min(maxTokens, 8000),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `${capTranscript(transcript)}\n\n${instruction}` },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const hint =
      res.status === 429 || res.status === 413
        ? ' — Groq free-tier limit hit (12k tokens/min). Wait ~60s and retry, or lower LLM_MAX_TRANSCRIPT_CHARS in server/.env.'
        : '';
    throw llmError(`Groq request failed (${res.status})${hint}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Conversational completion (no JSON mode) — powers the "Ask SIRUS" assistant.
export async function runChat({ system, messages = [], maxTokens = 400 }) {
  if (!hasLlm) {
    throw llmError('The assistant needs GROQ_API_KEY in server/.env to answer questions.');
  }
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.llm.groqKey}` },
    body: JSON.stringify({
      model: config.llm.groqModel,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const hint = res.status === 429 || res.status === 413 ? ' — free-tier limit hit, retry in ~60s.' : '';
    throw llmError(`Groq request failed (${res.status})${hint}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

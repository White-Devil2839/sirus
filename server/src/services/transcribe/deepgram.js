import { config } from '../../config/env.js';

// Report language → Deepgram language code.
const LANG = { French: 'fr', English: 'en', German: 'de', Spanish: 'es', Italian: 'it' };

function err(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

async function callDeepgram(file, query) {
  const res = await fetch(`https://api.deepgram.com/v1/listen?${new URLSearchParams(query)}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${config.deepgram.key}`,
      'Content-Type': file.mimetype || 'audio/mpeg',
    },
    body: file.buffer,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const hint =
      res.status === 401 ? ' — invalid DEEPGRAM_API_KEY.' :
      res.status === 402 ? ' — Deepgram credits exhausted.' : '';
    throw err(502, `Deepgram transcription failed (${res.status})${hint} ${body.slice(0, 200)}`);
  }
  return res.json();
}

// Format a Deepgram response as "[Intervenant N]" turns (or plain text).
function formatTranscript(data) {
  const utterances = data.results?.utterances;
  if (Array.isArray(utterances) && utterances.length) {
    const turns = [];
    for (const u of utterances) {
      const text = (u.transcript || '').trim();
      if (!text) continue;
      const last = turns[turns.length - 1];
      if (last && last.speaker === u.speaker) last.text += ' ' + text;
      else turns.push({ speaker: u.speaker, text });
    }
    if (turns.length) return turns.map((t) => `[Intervenant ${t.speaker + 1}]\n${t.text}`).join('\n\n');
  }
  return data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
}

// Send an uploaded audio/video buffer to Deepgram (pre-recorded API) and return
// a "[Intervenant N]" formatted transcript, matching the format the LLM
// pipeline and admin editor already expect from .docx transcripts.
export async function transcribeAudio(file, { language = 'French' } = {}) {
  if (!config.deepgram.key) {
    throw err(503, 'Audio transcription requires DEEPGRAM_API_KEY in server/.env (free credits at console.deepgram.com). Upload a .docx/.pdf/.txt transcript instead.');
  }

  const base = { model: 'nova-2', diarize: 'true', utterances: 'true', smart_format: 'true', punctuate: 'true' };

  // First pass pinned to the report language.
  let text = formatTranscript(await callDeepgram(file, { ...base, language: LANG[language] || 'fr' }));

  // If nothing was recognized, the speech may be in a different language than
  // the report — retry once with automatic language detection.
  if (!text) {
    text = formatTranscript(await callDeepgram(file, { ...base, detect_language: 'true' }));
  }

  if (!text) throw err(422, 'Deepgram could not recognize any speech in this file — is it silent or corrupted?');
  return text;
}

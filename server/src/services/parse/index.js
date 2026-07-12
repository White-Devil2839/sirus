import mammoth from 'mammoth';
import { normalizeTranscript } from './normalize.js';
import { transcribeAudio } from '../transcribe/deepgram.js';

// pdf-parse ships a debug block on its main entry; import the lib directly to avoid it.
let pdfParse;
async function getPdfParse() {
  if (!pdfParse) {
    const mod = await import('pdf-parse/lib/pdf-parse.js');
    pdfParse = mod.default || mod;
  }
  return pdfParse;
}

// Parse an uploaded file buffer into clean transcript text.
// Returns { text, source }.
export async function parseUpload(file, { language } = {}) {
  const name = (file.originalname || '').toLowerCase();
  const mime = file.mimetype || '';

  if (name.endsWith('.docx') || mime.includes('wordprocessingml')) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return { text: normalizeTranscript(value), source: 'docx' };
  }

  if (name.endsWith('.pdf') || mime === 'application/pdf') {
    const parse = await getPdfParse();
    const data = await parse(file.buffer);
    return { text: normalizeTranscript(data.text), source: 'pdf' };
  }

  if (name.endsWith('.txt') || mime === 'text/plain') {
    return { text: normalizeTranscript(file.buffer.toString('utf-8')), source: 'txt' };
  }

  // Audio/video → Deepgram diarized transcription (proposal Section 14).
  if (/\.(mp3|wav|m4a|mp4|webm|ogg)$/i.test(name) || mime.startsWith('audio/') || mime.startsWith('video/')) {
    const text = await transcribeAudio(file, { language });
    return { text: normalizeTranscript(text), source: 'audio' };
  }

  const err = new Error('Unsupported file type. Use audio (.mp3/.wav/.m4a/.mp4) or a .docx, .pdf, .txt transcript.');
  err.status = 422;
  throw err;
}

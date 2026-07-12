// Light normalization of raw transcript text before it reaches the LLM.
// Keeps the "[Intervenant N] …" turn structure and attendance tables intact,
// just trims noise and collapses excessive blank lines.
export function normalizeTranscript(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/ /g, ' ') // non-breaking spaces
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Rough token estimate (~4 chars/token) so we can decide whether chunking is needed.
export function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

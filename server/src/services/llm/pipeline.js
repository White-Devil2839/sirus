import { runModel } from './client.js';
import { reportSchema } from './schema.js';
import { buildSystemPrompt, buildInstruction, buildPreviewInstruction } from './prompts.js';
import { normalizeTranscript } from '../parse/normalize.js';
import { config, hasLlm } from '../../config/env.js';
import { cseRockefellerExtraction } from '../../seed/sampleData.js';

// When no LLM key is configured, return the seeded CSE extraction with the
// request's own metadata patched onto the cover — so the full journey demos
// end-to-end offline. Real generation runs the moment a key is present.
function demoExtraction(meta = {}) {
  const clone = JSON.parse(JSON.stringify(cseRockefellerExtraction));
  clone.cover = { ...clone.cover };
  if (meta.meetingName) clone.cover.title = meta.meetingName;
  if (meta.company) clone.cover.org = meta.company;
  if (meta.compliance) clone.cover.complianceInstance = meta.compliance;
  if (meta.meetingType) clone.cover.subtitle = `${meta.meetingType} session`;
  if (meta.meetingLocation) clone.cover.location = meta.meetingLocation;
  return reportSchema.parse(clone);
}

// Pull the outermost JSON object out of a model response (tolerates prose/fences).
function extractJson(text) {
  if (!text) throw new Error('Empty model response');
  let s = text.trim();
  // strip ```json fences if present
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) throw new Error('No JSON object found in response');
  return s.slice(start, end + 1);
}

function tryParse(text) {
  const raw = extractJson(text);
  const obj = JSON.parse(raw); // may throw
  return reportSchema.parse(obj); // zod fills defaults / coerces
}

// Run the full generation and return a validated report model.
export async function generateReport({ transcript, tier = 'Scope', meta = {}, preview = false }) {
  if (!hasLlm) return { extraction: demoExtraction(meta), model: 'demo-seed', demo: true };
  const clean = normalizeTranscript(transcript);
  const system = buildSystemPrompt(meta.compliance, meta.language, meta.region);
  const instruction = preview
    ? buildPreviewInstruction({ meta })
    : buildInstruction({ tier, meta });
  const model = config.llm.groqModel;
  // Keep prompt + output under Groq's free-tier per-minute budget (~12k for
  // llama-3.3-70b). Preview needs less output than the full report.
  const maxTokens = preview ? 3000 : 4000;

  const first = await runModel({ system, transcript: clean, instruction, maxTokens });
  try {
    return { extraction: tryParse(first), model };
  } catch (err) {
    // One repair pass — hand the model its own broken output and the parse error.
    const repair = await runModel({
      system,
      transcript: clean,
      instruction: `${instruction}

Your previous response could not be parsed as valid JSON (${String(err.message).slice(0, 160)}).
Return ONLY a single corrected JSON object matching the shape. Do not include any text before or after it.
Previous response:
${first.slice(0, 6000)}`,
      maxTokens,
    });
    return { extraction: tryParse(repair), model };
  }
}

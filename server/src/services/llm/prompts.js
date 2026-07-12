import { shapeHint } from './schema.js';

// Tier controls which sections the model populates (and thus what the renderer emits).
const TIER_SECTIONS = {
  Essential:
    'Populate cover, documentDetails, overview, key decisions (agendaItems with alerts of type "decision"), and findings. Leave attendance, votes, numericalData, speakerAnalysis, timeline as empty arrays/objects.',
  Scope:
    'Populate everything EXCEPT numericalData unless the meeting clearly discussed figures. Include full attendance, agendaItems with log + alerts, votes, speakerAnalysis, and findings.',
  Premium:
    'Populate every section fully: attendance, agendaItems (log + alerts + timeline), votes, numericalData (when figures are discussed), speakerAnalysis, and a complete findings dashboard with clause-by-clause references.',
};

// Region → the legal framework the compliance audit is grounded in.
// Config-driven so new regions ship without touching the pipeline (Section 8).
const LEGAL_FRAMEWORKS = {
  FR: 'the French Code du travail — cite articles (e.g. "Code du travail Art. L.2315-34")',
  DE: 'the German Betriebsverfassungsgesetz (BetrVG) — cite sections (e.g. "§87 BetrVG")',
  ES: 'the Spanish Estatuto de los Trabajadores — cite articles (e.g. "Art. 64 ET")',
  IT: 'the Italian Statuto dei Lavoratori (L. 300/1970) and D.Lgs. 81/2008 — cite articles',
  UK: 'the UK ICE Regulations 2004 and the Employment Rights Act 1996 — cite regulations/sections',
  CH: 'the Swiss Participation Act (Loi sur la participation, RS 822.14) and the Code of Obligations — cite articles',
};

export function buildSystemPrompt(compliance = 'CSE', language = 'French', region = 'FR') {
  const framework = LEGAL_FRAMEWORKS[region] || LEGAL_FRAMEWORKS.FR;
  return `You are SIRUS, an expert analyst that turns raw ${compliance} meeting transcripts into compliance-ready, structured official minutes for works-council and governance bodies.

OUTPUT CONTRACT
- Respond with a SINGLE JSON object and nothing else. No markdown, no code fences, no commentary.
- The JSON must match this shape (all keys optional; omit a section by using [] or {}):
${shapeHint}

RULES
- Ground every compliance finding in ${framework}; put the citation in each finding's "related" field.
- Paraphrase discussion in the third person, in the report's output language (${language}). Never quote verbatim at length.
- Speaker role mapping for the discussion log: management/chair → "neutral" or "a"; elected employee representatives → "b"; external guests/experts → "neutral".
- Never invent attendees, votes, dates, or figures that are not supported by the transcript. If something is absent, leave it out.
- "findings.score" is an overall compliance score 0-100. "counts" must match the lengths/severity of the arrays you produce.
- Keep each log "text", "summary", and "description" concise (1-3 sentences).`;
}

export function buildInstruction({ tier = 'Scope', meta = {} }) {
  const sections = TIER_SECTIONS[tier] || TIER_SECTIONS.Scope;
  const metaLine = [
    meta.meetingName && `Meeting: ${meta.meetingName}`,
    meta.meetingType && `Type: ${meta.meetingType}`,
    meta.meetingDate && `Date: ${meta.meetingDate}`,
    meta.meetingLocation && `Location: ${meta.meetingLocation}`,
    meta.compliance && `Compliance: ${meta.compliance}`,
    meta.language && `Output language: ${meta.language}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return `Analyse the meeting transcript above and produce the official minutes JSON.
Service tier: ${tier}. ${sections}
${metaLine ? `Meeting metadata — use these for the cover and documentDetails: ${metaLine}` : ''}
Return only the JSON object.`;
}

// Shorter, cheaper instruction for the client-side instant preview (3 fixed patterns).
export function buildPreviewInstruction({ meta = {} }) {
  return `Analyse the transcript above and return the minutes JSON, focused on the three preview patterns:
1) speakerAnalysis (who spoke, how much, engagement, stance),
2) numericalData (any figures/amounts discussed, as chart series) — [] if none,
3) findings (compliance score, risks, missing documents, references).
Also fill cover, overview, and attendance so the preview cover page renders.
Compliance: ${meta.compliance || 'CSE'} · Output language: ${meta.language || 'French'}.
Return only the JSON object.`;
}

import { z } from 'zod';

// Canonical "report model" the LLM returns. Defaults everywhere so a partial or
// tier-trimmed response still validates. This one object drives the blue report
// HTML, the 3-pattern preview, the speaker analysis, and the Report Analyzer.

const kv = z.object({ label: z.string().default(''), value: z.string().default('') });

const attendee = z.object({
  name: z.string().default(''),
  role: z.string().default(''),
  group: z.string().default(''),
  arrival: z.string().default(''),
  departure: z.string().default(''),
  voteRight: z.boolean().default(false),
});

const logEntry = z.object({
  speaker: z.string().default('Meeting Record'),
  role: z.enum(['a', 'b', 'neutral']).default('neutral'),
  text: z.string().default(''),
});

const alert = z.object({
  type: z.enum(['decision', 'unresolved', 'tension', 'projection']).default('decision'),
  subject: z.string().default(''),
  fact: z.string().default(''),
  extra: z.string().default(''),
});

const agendaItem = z.object({
  title: z.string().default('Agenda Item'),
  summary: z.string().default(''),
  log: z.array(logEntry).default([]),
  alerts: z.array(alert).default([]),
  timeline: z.array(z.object({ date: z.string().default(''), text: z.string().default('') })).default([]),
});

const vote = z.object({
  question: z.string().default(''),
  date: z.string().default(''),
  rows: z.array(z.object({ voter: z.string().default(''), group: z.string().default(''), vote: z.string().default('') })).default([]),
  summary: z.object({
    favorable: z.number().default(0),
    unfavorable: z.number().default(0),
    abstention: z.number().default(0),
  }).default({}),
  result: z.string().default(''),
});

const finding = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  riskLevel: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  impact: z.number().min(1).max(5).default(3),
  confidence: z.number().min(0).max(100).default(80),
  related: z.string().default(''),
});

export const reportSchema = z.object({
  cover: z.object({
    reportType: z.string().default('Official Minutes'),
    org: z.string().default(''),
    location: z.string().default(''),
    title: z.string().default('Meeting Minutes'),
    subtitle: z.string().default(''),
    date: z.string().default(''),
    preparedBy: z.string().default(''),
    complianceInstance: z.string().default('CSE'),
    stats: z.array(kv).default([]),
  }).default({}),

  documentDetails: z.object({
    reportLabel: z.string().default(''),
    title: z.string().default(''),
    date: z.string().default(''),
    type: z.string().default(''),
    location: z.string().default(''),
    preparedBy: z.string().default(''),
    reference: z.string().default(''),
  }).default({}),

  notice: z.string().default(''),

  overview: z.object({
    executiveSummary: z.string().default(''),
    context: z.string().default(''),
    complianceContext: z.string().default(''),
  }).default({}),

  attendance: z.object({
    present: z.array(attendee).default([]),
    absent: z.array(z.object({ name: z.string().default(''), group: z.string().default(''), role: z.string().default(''), reason: z.string().default('') })).default([]),
    invited: z.array(z.object({ name: z.string().default(''), function: z.string().default(''), org: z.string().default(''), status: z.string().default('') })).default([]),
  }).default({}),

  agendaItems: z.array(agendaItem).default([]),
  votes: z.array(vote).default([]),

  numericalData: z.array(z.object({
    label: z.string().default(''),
    chartType: z.enum(['bar', 'donut']).default('bar'),
    series: z.array(z.object({ name: z.string().default(''), value: z.number().default(0) })).default([]),
  })).default([]),

  speakerAnalysis: z.object({
    intro: z.string().default(''),
    speakers: z.array(z.object({
      id: z.string().default(''),
      name: z.string().default(''),
      role: z.string().default(''),
      interventions: z.number().default(0),
      engagement: z.number().min(0).max(5).default(3),
      stance: z.string().default(''),
    })).default([]),
  }).default({}),

  findings: z.object({
    score: z.number().min(0).max(100).default(90),
    summary: z.string().default(''),
    riskExposure: z.string().default('Low to Medium'),
    metrics: z.array(kv.extend({ value: z.union([z.string(), z.number()]).default(0) })).default([]),
    counts: z.object({
      criticalRisks: z.number().default(0),
      recommendations: z.number().default(0),
      compliantAreas: z.number().default(0),
      missingDocuments: z.number().default(0),
    }).default({}),
    risks: z.array(finding).default([]),
    missingDocuments: z.array(z.object({ title: z.string().default(''), description: z.string().default('') })).default([]),
    complianceReferences: z.array(z.object({ code: z.string().default(''), title: z.string().default(''), status: z.string().default('') })).default([]),
    recommendations: z.array(z.object({ title: z.string().default(''), description: z.string().default('') })).default([]),
  }).default({}),
});

// Compact shape shown to the model so it emits the right keys without a full JSON Schema.
export const shapeHint = `{
  "cover": { "reportType", "org", "location", "title", "subtitle", "date", "preparedBy", "complianceInstance", "stats": [{"label","value"}] },
  "documentDetails": { "reportLabel","title","date","type","location","preparedBy","reference" },
  "notice": "one-paragraph scope/legal note",
  "overview": { "executiveSummary", "context", "complianceContext" },
  "attendance": {
    "present": [{"name","role","group","arrival","departure","voteRight": true|false}],
    "absent":  [{"name","group","role","reason"}],
    "invited": [{"name","function","org","status"}]
  },
  "agendaItems": [{
    "title","summary",
    "log":    [{"speaker","role":"a|b|neutral","text": third-person paraphrase}],
    "alerts": [{"type":"decision|unresolved|tension|projection","subject","fact","extra"}],
    "timeline":[{"date","text"}]
  }],
  "votes": [{"question","date","rows":[{"voter","group","vote"}],"summary":{"favorable","unfavorable","abstention"},"result"}],
  "numericalData": [{"label","chartType":"bar|donut","series":[{"name","value": number}]}],
  "speakerAnalysis": { "intro", "speakers":[{"id","name","role","interventions": number,"engagement": 0-5,"stance"}] },
  "findings": {
    "score": 0-100, "summary", "riskExposure": "Low|Low to Medium|Medium|High",
    "metrics": [{"label","value": 0-100}],
    "counts": {"criticalRisks","recommendations","compliantAreas","missingDocuments"},
    "risks": [{"title","description","riskLevel":"High|Medium|Low","impact":1-5,"confidence":0-100,"related":"e.g. Code du travail Art. L.2315-34"}],
    "missingDocuments": [{"title","description"}],
    "complianceReferences": [{"code","title","status":"Compliant|Partial|Missing"}],
    "recommendations": [{"title","description"}]
  }
}`;

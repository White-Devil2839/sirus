import { describe, it, expect } from 'vitest';
import { reportSchema } from '../src/services/llm/schema.js';
import { renderReportHtml } from '../src/services/render/htmlRenderer.js';
import { finalizeReport, trimToTier } from '../src/services/report.js';
import { cseRockefellerExtraction } from '../src/seed/sampleData.js';

describe('report model (zod)', () => {
  it('fills defaults for a minimal extraction', () => {
    const parsed = reportSchema.parse({ cover: { title: 'Minimal' } });
    expect(parsed.cover.title).toBe('Minimal');
    expect(parsed.findings.score).toBeGreaterThan(0);
    expect(parsed.agendaItems).toEqual([]);
  });

  it('accepts the full seeded extraction', () => {
    const parsed = reportSchema.parse(JSON.parse(JSON.stringify(cseRockefellerExtraction)));
    expect(parsed.attendance.present.length).toBeGreaterThan(3);
    expect(parsed.votes[0].summary.unfavorable).toBe(4);
  });
});

describe('deterministic blue-design renderer', () => {
  const parsed = reportSchema.parse(JSON.parse(JSON.stringify(cseRockefellerExtraction)));
  const html = renderReportHtml(parsed);

  it('emits the design-system components', () => {
    for (const cls of ['class="page"', 'h1-cover', 'kv-table', 'data-table', 'speaker role-', 'alert alert-', 'vote-question']) {
      expect(html).toContain(cls);
    }
  });

  it('escapes user content (no raw HTML injection)', () => {
    const evil = reportSchema.parse({ cover: { title: '<script>alert(1)</script>' } });
    const out = renderReportHtml(evil);
    expect(out).not.toContain('<script>alert(1)</script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('renders multiple pages for a full report', () => {
    expect((html.match(/class="page"/g) || []).length).toBeGreaterThanOrEqual(8);
  });
});

describe('finalizeReport', () => {
  it('derives findings counts from the arrays', () => {
    const ext = reportSchema.parse({
      findings: {
        score: 80,
        risks: [{ title: 'A', riskLevel: 'High' }, { title: 'B', riskLevel: 'Medium' }],
        missingDocuments: [{ title: 'Doc' }],
        recommendations: [{ title: 'R1' }, { title: 'R2' }, { title: 'R3' }],
        complianceReferences: [{ code: 'X', status: 'Compliant' }],
      },
    });
    const { findings } = finalizeReport(ext);
    expect(findings.counts.criticalRisks).toBe(1);
    expect(findings.counts.missingDocuments).toBe(1);
    expect(findings.counts.recommendations).toBe(3);
    expect(findings.counts.compliantAreas).toBe(1);
  });

  it('Essential tier strips attendance, votes and speaker analysis', () => {
    const trimmed = trimToTier(JSON.parse(JSON.stringify(cseRockefellerExtraction)), 'Essential');
    expect(trimmed.attendance.present).toEqual([]);
    expect(trimmed.votes).toEqual([]);
    expect(trimmed.speakerAnalysis.speakers).toEqual([]);
  });
});

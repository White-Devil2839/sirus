import { renderReportHtml } from './render/htmlRenderer.js';

// Fill findings.counts from the arrays when the model left them at 0/blank.
export function normalizeCounts(extraction) {
  const f = extraction.findings || (extraction.findings = {});
  const c = f.counts || (f.counts = {});
  const risks = f.risks || [];
  if (!c.criticalRisks) c.criticalRisks = risks.filter((r) => r.riskLevel === 'High').length;
  if (!c.recommendations) c.recommendations = (f.recommendations || []).length;
  if (!c.missingDocuments) c.missingDocuments = (f.missingDocuments || []).length;
  if (!c.compliantAreas)
    c.compliantAreas = (f.complianceReferences || []).filter((r) => r.status === 'Compliant').length;
  return extraction;
}

// Turn a validated extraction into everything the DB / API needs.
export function finalizeReport(extraction) {
  const ext = normalizeCounts(extraction);
  return {
    extraction: ext,
    generatedHtml: renderReportHtml(ext),
    findings: ext.findings,
    speakerAnalysis: ext.speakerAnalysis,
  };
}

// Trim a full extraction down to a tier for the sample library.
export function trimToTier(extraction, tier) {
  const clone = JSON.parse(JSON.stringify(extraction));
  if (tier === 'Essential') {
    clone.attendance = { present: [], absent: [], invited: [] };
    clone.votes = [];
    clone.numericalData = [];
    clone.speakerAnalysis = { intro: '', speakers: [] };
    clone.agendaItems = (clone.agendaItems || []).map((a) => ({ ...a, log: [], timeline: [] }));
  }
  return clone;
}

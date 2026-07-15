import mongoose from 'mongoose';

// Curated homepage samples, openable in the e-book viewer without login (Section 19).
const sampleReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    org: { type: String, default: '' },
    meetingType: { type: String, default: '' },
    tier: { type: String, enum: ['Essential', 'Scope', 'Premium'], default: 'Scope' },
    language: { type: String, default: 'French' },
    generatedHtml: { type: String, default: '' },
    extraction: { type: mongoose.Schema.Types.Mixed },
    findings: { type: mongoose.Schema.Types.Mixed },
    speakerAnalysis: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const SampleReport = mongoose.model('SampleReport', sampleReportSchema);

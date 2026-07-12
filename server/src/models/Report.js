import mongoose from 'mongoose';

// The generated deliverable. `extraction` is the canonical JSON the LLM returns
// (the single source of truth); `generatedHtml` is the blue-design HTML rendered
// deterministically from it; `findings` powers the Report Analyzer dashboard.
const reportSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingRequest', required: true, index: true },
    tier: { type: String, default: 'Scope' },
    model: { type: String, default: '' },

    extraction: { type: mongoose.Schema.Types.Mixed }, // canonical report model
    generatedHtml: { type: String, default: '' }, // admin-editable blue HTML
    findings: { type: mongoose.Schema.Types.Mixed }, // compliance dashboard data
    speakerAnalysis: { type: mongoose.Schema.Types.Mixed },

    locked: { type: Boolean, default: false },
    lockedAt: { type: Date },
    pdfUrl: { type: String, default: '' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);

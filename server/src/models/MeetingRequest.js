import mongoose from 'mongoose';

export const TIERS = ['Essential', 'Scope', 'Premium'];
export const MEETING_TYPES = ['Ordinary', 'Extraordinary', 'Exceptional', 'Other'];
export const STATUSES = ['draft', 'awaiting', 'generating', 'in-editing', 'locked', 'dispatched'];

const meetingRequestSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Metadata (image 1 + image 2). Compliance bodies are region-specific and
    // config-driven (proposal Section 8) — free string, not a hard enum.
    region: { type: String, default: 'FR' },
    compliance: { type: String, default: 'CSE', trim: true, maxlength: 24 },
    language: { type: String, default: 'French' },
    meetingName: { type: String, default: '' },
    meetingLocation: { type: String, default: '' },
    meetingType: { type: String, enum: MEETING_TYPES, default: 'Ordinary' },
    meetingDate: { type: Date },

    // Uploaded source (transcript). Deepgram audio path is stubbed.
    transcript: {
      rawText: { type: String, default: '' },
      editedText: { type: String, default: '' },
      source: { type: String, enum: ['docx', 'pdf', 'txt', 'audio', 'seed'], default: 'txt' },
      fileName: { type: String, default: '' },
    },

    tier: { type: String, enum: TIERS, default: 'Scope' },
    notes: { type: String, default: '' },

    status: { type: String, enum: STATUSES, default: 'draft', index: true },

    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  },
  { timestamps: true }
);

export const MeetingRequest = mongoose.model('MeetingRequest', meetingRequestSchema);

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';
import { MeetingRequest } from '../models/MeetingRequest.js';
import { Report } from '../models/Report.js';
import { SampleReport } from '../models/SampleReport.js';
import { cseRockefellerExtraction } from './sampleData.js';
import { betriebsratExtraction } from './sampleDataDe.js';
import { ukWorksCouncilExtraction } from './sampleDataUk.js';
import { finalizeReport, trimToTier } from '../services/report.js';

const here = dirname(fileURLToPath(import.meta.url));
const transcriptText = readFileSync(join(here, 'transcript.txt'), 'utf-8');

// Short synthetic transcripts so non-French requests have believable source text.
const deTranscript = `[Intervenant 1]
Guten Morgen zusammen, ich eröffne die Sitzung des Betriebsrats und stelle die Beschlussfähigkeit fest.

[Intervenant 2]
Zum Protokoll der letzten Sitzung sind keine Einwände eingegangen.

[Intervenant 3]
Die Geschäftsführung möchte die Zeiterfassungssoftware TimeTrack Pro einführen. Wir bestehen auf einer Betriebsvereinbarung nach Paragraf 87.

[Intervenant 4]
Wie lange werden die Daten gespeichert, und sind individuelle Leistungsauswertungen möglich?`;

const ukTranscript = `[Intervenant 1]
Good morning everyone, I'm opening this quarterly meeting of the employee forum. We have quorum.

[Intervenant 2]
Management would like to present the warehouse automation programme. Forty-six roles are in scope over eighteen months.

[Intervenant 3]
We can't consider this consultation complete without seeing the business case. Are compulsory redundancies ruled out?

[Intervenant 4]
We commit to sharing the business case under confidentiality before the July session.`;

// Only touch data owned by the seed — user-registered accounts survive.
const SEED_USERS = [
  { email: 'admin@sirus.app', name: 'SIRUS Admin', company: '', role: 'admin' },
  { email: 'client@sirus.app', name: 'Camille Durand', company: 'CSE Rockefeller', role: 'client' },
  { email: 'klaus@dmw.de', name: 'Klaus Weber', company: 'Deutsche Maschinenwerke GmbH', role: 'client' },
  { email: 'amelia@albion.co.uk', name: 'Amelia Hart', company: 'Albion Logistics Ltd', role: 'client' },
];

async function seed() {
  await connectDb();

  // ── Surgical cleanup: seed users' data only ─────────────────
  const emails = SEED_USERS.map((u) => u.email);
  const existing = await User.find({ email: { $in: emails } }).select('_id');
  const ownerIds = existing.map((u) => u._id);
  const oldRequests = await MeetingRequest.find({ client: { $in: ownerIds } }).select('_id report');
  await Report.deleteMany({ request: { $in: oldRequests.map((r) => r._id) } });
  await MeetingRequest.deleteMany({ client: { $in: ownerIds } });
  await User.deleteMany({ email: { $in: emails } });
  await SampleReport.deleteMany({});
  console.log(`[seed] cleaned ${oldRequests.length} seed requests (user-registered accounts untouched)`);

  // ── Users ───────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = {};
  for (const u of SEED_USERS) {
    users[u.email] = await User.create({ ...u, passwordHash });
  }
  console.log('[seed] users: admin@sirus.app · client@sirus.app · klaus@dmw.de · amelia@albion.co.uk (password123)');

  // ── Homepage sample library — three distinct meetings ───────
  const samples = [
    { ext: cseRockefellerExtraction, tier: 'Premium', title: 'CSE Rockefeller — Premium sample', org: 'CSE Rockefeller', meetingType: 'Extraordinary', language: 'French' },
    { ext: betriebsratExtraction, tier: 'Scope', title: 'Deutsche Maschinenwerke — Scope sample', org: 'Deutsche Maschinenwerke', meetingType: 'Betriebsrat · Ordinary', language: 'German' },
    { ext: trimToTier(ukWorksCouncilExtraction, 'Essential'), tier: 'Essential', title: 'Albion Logistics — Essential sample', org: 'Albion Logistics', meetingType: 'Works Council · Quarterly', language: 'English' },
  ];
  for (const s of samples) {
    const { generatedHtml, findings, speakerAnalysis } = finalizeReport(JSON.parse(JSON.stringify(s.ext)));
    await SampleReport.create({ title: s.title, org: s.org, meetingType: s.meetingType, tier: s.tier, language: s.language, generatedHtml, findings, speakerAnalysis });
  }
  console.log('[seed] 3 sample reports: 🇫🇷 CSE · 🇩🇪 Betriebsrat · 🇬🇧 Works Council');

  // ── Requests across the whole workflow ──────────────────────
  async function makeRequest(owner, fields, extraction, { locked = false } = {}) {
    const doc = await MeetingRequest.create({ client: owner._id, ...fields });
    if (extraction) {
      const { extraction: ext, generatedHtml, findings, speakerAnalysis } = finalizeReport(JSON.parse(JSON.stringify(extraction)));
      const report = await Report.create({
        request: doc._id, tier: doc.tier, model: 'seed',
        extraction: ext, generatedHtml, findings, speakerAnalysis,
        locked, lockedAt: locked ? new Date() : undefined,
      });
      doc.report = report._id;
      await doc.save();
    }
    return doc;
  }

  const camille = users['client@sirus.app'];
  const klaus = users['klaus@dmw.de'];
  const amelia = users['amelia@albion.co.uk'];

  // Camille (FR) — delivered · locked (ready to dispatch) · awaiting
  await makeRequest(camille, {
    region: 'FR', compliance: 'CSE', language: 'French', tier: 'Premium', status: 'dispatched',
    meetingName: 'CSE Rockefeller — Séance du 12 février', meetingLocation: 'Lyon, France',
    meetingType: 'Ordinary', meetingDate: new Date('2026-02-12T08:30:00Z'),
    transcript: { rawText: transcriptText, source: 'seed', fileName: 'CSE 12-02.docx' },
  }, cseRockefellerExtraction, { locked: true });

  await makeRequest(camille, {
    region: 'FR', compliance: 'CSE', language: 'French', tier: 'Scope', status: 'locked',
    meetingName: 'CSE Rockefeller — Séance ordinaire du 29 janvier', meetingLocation: 'Lyon, France',
    meetingType: 'Ordinary', meetingDate: new Date('2026-01-29T08:30:00Z'),
    transcript: { rawText: transcriptText, source: 'seed', fileName: 'CSE 29-01.docx' },
    notes: 'Merci de vérifier la liste de présence avant envoi.',
  }, trimToTier(cseRockefellerExtraction, 'Essential'), { locked: true });

  await makeRequest(camille, {
    region: 'FR', compliance: 'CSE', language: 'French', tier: 'Scope', status: 'awaiting',
    meetingName: 'CSE Rockefeller — Séance extraordinaire', meetingLocation: 'Lyon, France',
    meetingType: 'Extraordinary', meetingDate: new Date('2026-03-26T08:30:00Z'),
    transcript: { rawText: transcriptText, source: 'seed', fileName: 'CSE Rockefeller 26-03-26.docx' },
    notes: 'Please emphasise the reclassification-search compliance gap.',
  }, null);

  // Klaus (DE) — delivered Betriebsrat report · awaiting follow-up
  await makeRequest(klaus, {
    region: 'DE', compliance: 'BR', language: 'German', tier: 'Scope', status: 'dispatched',
    meetingName: 'Betriebsratssitzung — Juni 2026', meetingLocation: 'Stuttgart, Werk 2',
    meetingType: 'Ordinary', meetingDate: new Date('2026-06-18T07:00:00Z'),
    transcript: { rawText: deTranscript, source: 'seed', fileName: 'BR-Sitzung-Juni.mp3' },
  }, betriebsratExtraction, { locked: true });

  await makeRequest(klaus, {
    region: 'DE', compliance: 'BR', language: 'German', tier: 'Essential', status: 'awaiting',
    meetingName: 'Betriebsratssitzung — Juli (außerordentlich)', meetingLocation: 'Stuttgart, Werk 2',
    meetingType: 'Extraordinary', meetingDate: new Date('2026-07-16T07:00:00Z'),
    transcript: { rawText: deTranscript, source: 'seed', fileName: 'BR-Juli.docx' },
    notes: 'Beschlussfassung zur Betriebsvereinbarung TimeTrack Pro.',
  }, null);

  // Amelia (UK) — in editing (generated, not yet locked)
  await makeRequest(amelia, {
    region: 'UK', compliance: 'WC', language: 'English', tier: 'Premium', status: 'in-editing',
    meetingName: 'Employee Forum — Automation consultation', meetingLocation: 'Manchester DC',
    meetingType: 'Ordinary', meetingDate: new Date('2026-06-02T09:00:00Z'),
    transcript: { rawText: ukTranscript, source: 'seed', fileName: 'employee-forum-june.m4a' },
    notes: 'Board wants the consultation-completeness risk clearly stated.',
  }, ukWorksCouncilExtraction, { locked: false });

  console.log('[seed] 6 requests across 3 clients: dispatched ×2 · locked ×1 · in-editing ×1 · awaiting ×2');

  await mongoose.connection.close();
  console.log('[seed] done ✔');
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});

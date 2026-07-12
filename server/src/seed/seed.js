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
import { finalizeReport, trimToTier } from '../services/report.js';

const here = dirname(fileURLToPath(import.meta.url));
const transcriptText = readFileSync(join(here, 'transcript.txt'), 'utf-8');

async function seed() {
  await connectDb();
  console.log('[seed] clearing collections…');
  await Promise.all([
    User.deleteMany({}),
    MeetingRequest.deleteMany({}),
    Report.deleteMany({}),
    SampleReport.deleteMany({}),
  ]);

  // ── Users ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await User.create({ email: 'admin@sirus.app', passwordHash, name: 'SIRUS Admin', role: 'admin' });
  const client = await User.create({
    email: 'client@sirus.app',
    passwordHash,
    name: 'Camille Durand',
    company: 'CSE Rockefeller',
    role: 'client',
  });
  console.log('[seed] users: admin@sirus.app / client@sirus.app (password: password123)');

  // ── Homepage sample library (one per tier) ─────────────
  for (const tier of ['Essential', 'Scope', 'Premium']) {
    const ext = tier === 'Premium' ? cseRockefellerExtraction : trimToTier(cseRockefellerExtraction, tier);
    const { generatedHtml, findings, speakerAnalysis } = finalizeReport(ext);
    await SampleReport.create({
      title: `CSE Rockefeller — ${tier} sample`,
      org: 'CSE Rockefeller',
      meetingType: 'Extraordinary',
      tier,
      language: 'French',
      generatedHtml,
      findings,
      speakerAnalysis,
    });
  }
  console.log('[seed] 3 sample reports created');

  // ── A demo client request awaiting admin generation ────
  const request = await MeetingRequest.create({
    client: client._id,
    region: 'FR',
    compliance: 'CSE',
    language: 'French',
    meetingName: 'CSE Rockefeller — Séance extraordinaire',
    meetingLocation: 'Lyon, France',
    meetingType: 'Extraordinary',
    meetingDate: new Date('2026-03-26T08:30:00Z'),
    transcript: { rawText: transcriptText, source: 'seed', fileName: 'CSE Rockefeller 26-03-26.docx' },
    tier: 'Scope',
    notes: 'Please emphasise the reclassification-search compliance gap.',
    status: 'awaiting',
  });
  console.log(`[seed] demo request created (${request._id}) — status: awaiting`);

  // ── A second request already generated & dispatched ────
  const { extraction, generatedHtml, findings, speakerAnalysis } = finalizeReport(
    JSON.parse(JSON.stringify(cseRockefellerExtraction))
  );
  const delivered = await MeetingRequest.create({
    client: client._id,
    region: 'FR',
    compliance: 'CSE',
    language: 'French',
    meetingName: 'CSE Rockefeller — Séance du 12 février',
    meetingLocation: 'Lyon, France',
    meetingType: 'Ordinary',
    meetingDate: new Date('2026-02-12T08:30:00Z'),
    transcript: { rawText: transcriptText, source: 'seed', fileName: 'CSE 12-02.docx' },
    tier: 'Premium',
    status: 'dispatched',
  });
  const report = await Report.create({
    request: delivered._id,
    tier: 'Premium',
    model: 'seed',
    extraction,
    generatedHtml,
    findings,
    speakerAnalysis,
    locked: true,
    lockedAt: new Date(),
  });
  delivered.report = report._id;
  await delivered.save();
  console.log(`[seed] delivered report created (${report._id})`);

  await mongoose.connection.close();
  console.log('[seed] done ✔');
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});

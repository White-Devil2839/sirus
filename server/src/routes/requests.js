import { Router } from 'express';
import { MeetingRequest } from '../models/MeetingRequest.js';
import { Report } from '../models/Report.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/error.js';
import { parseUpload } from '../services/parse/index.js';
import { generateReport } from '../services/llm/pipeline.js';
import { runChat } from '../services/llm/client.js';
import { finalizeReport } from '../services/report.js';

const router = Router();
router.use(requireAuth);

const isAdmin = (req) => req.user.role === 'admin';
const owns = (reqDoc, req) => String(reqDoc.client) === String(req.user._id) || isAdmin(req);

async function loadRequest(req, res) {
  const doc = await MeetingRequest.findById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Request not found' });
    return null;
  }
  if (!owns(doc, req)) {
    res.status(403).json({ error: 'Not authorized for this request' });
    return null;
  }
  return doc;
}

// Create a request (client) — metadata step. Status stays "draft" until quotation.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    const doc = await MeetingRequest.create({
      client: req.user._id,
      region: b.region || 'FR',
      compliance: b.compliance || 'CSE',
      language: b.language || 'French',
      meetingName: b.meetingName || '',
      meetingLocation: b.meetingLocation || '',
      meetingType: b.meetingType || 'Ordinary',
      meetingDate: b.meetingDate || undefined,
      tier: b.tier || 'Scope',
      notes: b.notes || '',
      status: 'draft',
    });
    res.status(201).json({ request: doc });
  })
);

// List — client sees own; admin sees all (optionally filtered by ?status=).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = isAdmin(req) ? {} : { client: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const requests = await MeetingRequest.find(filter)
      .select('-transcript.rawText -transcript.editedText')
      .populate('client', 'name email company')
      .sort({ updatedAt: -1 });
    res.json({ requests });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    await doc.populate('client', 'name email company');
    res.json({ request: doc });
  })
);

// Update metadata / tier / notes / status (quotation submit sets status=awaiting).
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    const fields = ['region', 'compliance', 'language', 'meetingName', 'meetingLocation', 'meetingType', 'meetingDate', 'tier', 'notes'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) doc[f] = req.body[f];
    });
    if (req.body.status && (isAdmin(req) || ['draft', 'awaiting'].includes(req.body.status))) {
      doc.status = req.body.status;
    }
    await doc.save();
    res.json({ request: doc });
  })
);

// Delete a request (+ its report). Clients may remove their own requests only
// before fulfillment (draft/awaiting); admin can remove anything (test data).
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (!isAdmin(req) && !['draft', 'awaiting'].includes(doc.status)) {
      return res.status(403).json({ error: 'Delivered or in-production requests can only be removed by the team' });
    }
    if (doc.report) await Report.deleteOne({ _id: doc.report });
    await doc.deleteOne();
    res.json({ ok: true });
  })
);

// Upload a transcript file → parse to text.
router.post(
  '/:id/transcript',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { text, source } = await parseUpload(req.file, { language: doc.language });
    doc.transcript = { rawText: text, source, fileName: req.file.originalname, editedText: '' };
    await doc.save();
    res.json({ request: doc, chars: text.length });
  })
);

// Admin edits transcript text before generation.
router.patch(
  '/:id/transcript',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const doc = await MeetingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Request not found' });
    doc.transcript.editedText = req.body.editedText || '';
    await doc.save();
    res.json({ request: doc });
  })
);

// Client instant preview — fast model, JSON only, NOT stored, NOT downloadable.
router.post(
  '/:id/preview',
  asyncHandler(async (req, res) => {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    const transcript = doc.transcript.editedText || doc.transcript.rawText;
    if (!transcript) return res.status(400).json({ error: 'Upload a transcript first' });
    const { extraction } = await generateReport({
      transcript,
      preview: true,
      meta: { compliance: doc.compliance, language: doc.language, region: doc.region, meetingName: doc.meetingName },
    });
    finalizeReport(extraction); // fills findings.counts
    res.json({ extraction });
  })
);

// Admin full generation → creates/updates the Report, status → in-editing.
router.post(
  '/:id/generate',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const doc = await MeetingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Request not found' });
    const transcript = doc.transcript.editedText || doc.transcript.rawText;
    if (!transcript) return res.status(400).json({ error: 'This request has no transcript' });

    doc.status = 'generating';
    await doc.save();

    const { extraction, model } = await generateReport({
      transcript,
      tier: doc.tier,
      meta: {
        compliance: doc.compliance,
        language: doc.language,
        region: doc.region,
        meetingName: doc.meetingName,
        meetingType: doc.meetingType,
        meetingDate: doc.meetingDate,
        meetingLocation: doc.meetingLocation,
      },
    });
    const { generatedHtml, findings, speakerAnalysis } = finalizeReport(extraction);

    let report = doc.report ? await Report.findById(doc.report) : null;
    if (!report) report = new Report({ request: doc._id });
    Object.assign(report, {
      tier: doc.tier,
      model,
      extraction,
      generatedHtml,
      findings,
      speakerAnalysis,
      locked: false,
      generatedAt: new Date(),
    });
    await report.save();

    doc.report = report._id;
    doc.status = 'in-editing';
    await doc.save();

    res.json({ request: doc, report });
  })
);

// Fetch the report (owner only once dispatched; admin anytime).
router.get(
  '/:id/report',
  asyncHandler(async (req, res) => {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (!doc.report) return res.status(404).json({ error: 'No report generated yet' });
    if (!isAdmin(req) && doc.status !== 'dispatched') {
      return res.status(403).json({ error: 'Report not yet delivered' });
    }
    const report = await Report.findById(doc.report);
    res.json({ report, request: doc });
  })
);

// "Ask SIRUS" — conversational assistant grounded in this request's report
// (proposal Section 17: answers process/status/report questions in the
// client's report language; refers anything else to the consultancy team).
router.post(
  '/:id/ask',
  asyncHandler(async (req, res) => {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    const question = (req.body.question || '').trim();
    if (!question) return res.status(400).json({ error: 'Ask a question first' });
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-6) : [];

    const report = doc.report ? await Report.findById(doc.report) : null;
    const context = {
      meeting: {
        name: doc.meetingName,
        type: doc.meetingType,
        date: doc.meetingDate,
        compliance: doc.compliance,
        tier: doc.tier,
        status: doc.status,
      },
      executiveSummary: report?.extraction?.overview?.executiveSummary || null,
      findings: report?.findings || null,
      speakers: (report?.speakerAnalysis?.speakers || []).map((s) => ({ name: s.name, role: s.role })),
    };

    const system = `You are SIRUS Assist, the built-in support assistant of the SIRUS meeting-minutes platform.
Answer in ${doc.language}. Be warm and concise: 1-3 sentences unless asked for detail.
You may ONLY answer questions about this client's meeting, report, compliance findings, and the SIRUS process
(statuses: draft → awaiting → generating → in-editing → locked → dispatched; tiers: Essential, Scope, Premium).
Ground every answer in this context (JSON): ${JSON.stringify(context).slice(0, 6000)}
If the report is not yet dispatched, explain where it is in the process.
For anything outside this scope (legal advice, other companies, general knowledge), politely say a human consultant will follow up.`;

    const answer = await runChat({
      system,
      messages: [...history.filter((m) => m && m.role && m.content), { role: 'user', content: question }],
    });
    res.json({ answer });
  })
);

// Dispatch locked report to the client.
router.post(
  '/:id/dispatch',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const doc = await MeetingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Request not found' });
    const report = doc.report ? await Report.findById(doc.report) : null;
    if (!report || !report.locked) {
      return res.status(400).json({ error: 'Lock the report before dispatching' });
    }
    doc.status = 'dispatched';
    await doc.save();
    res.json({ request: doc });
  })
);

export default router;

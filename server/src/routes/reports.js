import { Router } from 'express';
import { Report } from '../models/Report.js';
import { MeetingRequest } from '../models/MeetingRequest.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();
router.use(requireAuth);

// Admin saves edited report HTML from the Document Editor.
router.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.locked) return res.status(409).json({ error: 'Report is locked; unlock to edit' });
    if (typeof req.body.generatedHtml === 'string') report.generatedHtml = req.body.generatedHtml;
    if (req.body.findings) report.findings = req.body.findings;
    await report.save();
    res.json({ report });
  })
);

// Lock / unlock. Locking freezes content and (per spec) enables download.
router.post(
  '/:id/lock',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    report.locked = req.body.locked !== false;
    report.lockedAt = report.locked ? new Date() : undefined;
    await report.save();

    const request = await MeetingRequest.findById(report.request);
    if (request && request.status !== 'dispatched') {
      request.status = report.locked ? 'locked' : 'in-editing';
      await request.save();
    }
    res.json({ report });
  })
);

export default router;

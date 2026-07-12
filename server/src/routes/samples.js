import { Router } from 'express';
import { SampleReport } from '../models/SampleReport.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// Public homepage library — list (no HTML payload) then fetch one.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const samples = await SampleReport.find().select('title org meetingType tier language createdAt').sort({ createdAt: 1 });
    res.json({ samples });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sample = await SampleReport.findById(req.params.id);
    if (!sample) return res.status(404).json({ error: 'Sample not found' });
    res.json({ sample });
  })
);

export default router;

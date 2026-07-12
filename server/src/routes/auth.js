import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { email, password, name, company } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, company: company || '' });
    res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: user.toSafeJSON() });
  })
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;

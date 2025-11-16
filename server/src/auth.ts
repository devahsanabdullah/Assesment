import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername, getUserById } from './logic';
import { User } from './types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AuthRequest extends Request {
  user?: User;
}

export function signToken(user: User) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1d' });
}

export async function authMiddleware(req: AuthRequest, res: Response, next: () => void) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await getUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const existing = await findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'username already exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await createUser(username, hash);
  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  const user = username && (await findUserByUsername(username));
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

export default router;
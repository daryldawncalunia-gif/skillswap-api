import { connectToDatabase } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    if (!token) {
      console.log('Auth check: no token');
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log('Auth check: invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = payload.userId;
    if (!userId) {
      console.log('Auth check: token missing userId');
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const db = await connectToDatabase();
    const [rows] = await db.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );

    if (!rows || rows.length === 0) {
      console.log('Auth check: user not found', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Auth check passed for user:', userId);
    res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
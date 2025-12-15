import { connectToDatabase } from '../../../lib/db';
import { getUserIdFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserIdFromReq(req);
    console.log('ratings/add called');
    console.log('cookie headers:', !!req.headers && !!req.headers.cookie);
    console.log('userId from token:', userId);
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { ratedUserId, score, comment, swapId } = req.body || {};
    const numericScore = Number(score);

    console.log('request body:', { ratedUserId, score, comment, swapId });

    if (!numericScore || Number.isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({ error: 'Score must be a number 1-5' });
    }

    const db = await connectToDatabase();

    const [result] = await db.execute(
      'INSERT INTO reviews (user_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [ratedUserId || null, userId, numericScore, comment || null]
    );

    console.log('insert result:', result);

    res.status(201).json({ success: true, message: 'Rating submitted' });
  } catch (err) {
    console.error('Add rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
}

import { connectToDatabase } from '../../../lib/db';
import { getUserIdFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = await connectToDatabase();
    const [skills] = await db.execute(
      'SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({ skills });
  } catch (error) {
    console.error('List skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
}
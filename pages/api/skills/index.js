import { connectToDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const db = await connectToDatabase();
    
    const [skills] = await db.execute(
      'SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({ skills });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
}
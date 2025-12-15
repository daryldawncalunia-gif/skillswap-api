import { connectToDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const db = await connectToDatabase();

    if (userId) {
      
      const [rows] = await db.execute(
        'SELECT r.*, u.name as rater_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.user_id = ? ORDER BY r.created_at DESC',
        [userId]
      );

      const [agg] = await db.execute(
        'SELECT COUNT(*) as count, AVG(rating) as average FROM reviews WHERE user_id = ?',
        [userId]
      );

      return res.status(200).json({ reviews: rows, count: agg[0].count, average: parseFloat(agg[0].average || 0).toFixed(2) });
    }


    const [rows] = await db.execute(
      'SELECT r.*, u.name as rater_name FROM reviews r JOIN users u ON r.reviewer_id = u.id ORDER BY r.created_at DESC LIMIT 20'
    );

    const [agg] = await db.execute(
      'SELECT COUNT(*) as count, AVG(rating) as average FROM reviews'
    );

    return res.status(200).json({ reviews: rows, count: agg[0].count, average: parseFloat(agg[0].average || 0).toFixed(2) });
  } catch (err) {
    console.error('Ratings list error:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
}

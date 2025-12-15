import { connectToDatabase } from '../../../lib/db';
import { getUserIdFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { skillId } = req.body;
    if (!skillId) return res.status(400).json({ error: 'Skill ID required' });

    const db = await connectToDatabase();
    const [result] = await db.execute(
      'DELETE FROM skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill not found or not owned by user' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Remove skill error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
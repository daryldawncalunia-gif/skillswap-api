import { connectToDatabase } from '../../../lib/db';
import { getUserIdFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { skill_name } = req.body;
    if (!skill_name || !skill_name.trim()) {
      return res.status(400).json({ error: 'Skill name required' });
    }

    const db = await connectToDatabase();
    const [result] = await db.execute(
      'INSERT INTO skills (user_id, skill_name, created_at) VALUES (?, ?, NOW())',
      [userId, skill_name]
    );

    return res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Add skill error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
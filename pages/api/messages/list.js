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
    
    const [messages] = await db.execute(
      `SELECT m.*, u1.name as sender_name, u2.name as receiver_name 
       FROM messages m
       JOIN users u1 ON m.sender_id = u1.id
       JOIN users u2 ON m.receiver_id = u2.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC
       LIMIT 10`,
      [userId, userId]
    );

    res.status(200).json({ 
      success: true, 
      messages 
    });
  } catch (error) {
    console.error('List messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}
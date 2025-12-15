import { connectToDatabase } from '../../../lib/db';
import { getUserIdFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { receiver_id, message } = req.body;

    if (!receiver_id || !message || message.trim() === '') {
      return res.status(400).json({ 
        error: 'Receiver ID and message are required' 
      });
    }

    const db = await connectToDatabase();
    
    await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [userId, receiver_id, message.trim()]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}
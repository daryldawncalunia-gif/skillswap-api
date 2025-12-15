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

    
    const db = await connectToDatabase();
    const filename = `profile-${userId}-${Date.now()}.jpg`;
    const filepath = `/uploads/${filename}`;
    
    
    await db.execute(
      'INSERT INTO media_uploads (user_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)',
      [userId, filename, filepath, 'image/jpeg']
    );

  
    await db.execute(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [filepath, userId]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Profile picture uploaded (simulated)',
      filepath 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload' });
  }
}
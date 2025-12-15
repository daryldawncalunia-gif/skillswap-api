import mysql from 'mysql2/promise';

let connection;

export async function connectToDatabase() {
  if (connection) return connection;

  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'skillswap_db'
    });

    console.log('✅ Connected to MySQL database');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}
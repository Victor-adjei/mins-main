const { Pool } = require('pg');
const fs = require('fs');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function fullInspection() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE (column_name LIKE '%account%' OR column_name LIKE '%customer%' OR column_name LIKE '%number%')
      AND table_schema = 'public'
      ORDER BY table_name, column_name;
    `);
    
    fs.writeFileSync('scratch/schema_dump_clean.json', JSON.stringify(res.rows, null, 2));
    console.log('Schema dumped to scratch/schema_dump_clean.json');

  } catch (err) {
    console.error('Inspection Error:', err);
  } finally {
    await pool.end();
  }
}

fullInspection();

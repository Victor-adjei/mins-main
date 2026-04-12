const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function research() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Researching Uniqueness and Indexes ---');
    
    // Check for unique constraints/indexes on account_number and customer_number
    const indexRes = await pool.query(`
      SELECT 
          t.relname as table_name,
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique
      FROM 
          pg_class t,
          pg_class i,
          pg_index ix,
          pg_attribute a
      WHERE 
          t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relname IN ('accounts', 'customers')
      ORDER BY
          t.relname,
          i.relname;
    `);
    
    console.table(indexRes.rows);

  } catch (err) {
    console.error('Research Error:', err);
  } finally {
    await pool.end();
  }
}

research();

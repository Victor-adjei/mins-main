const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    await pool.query("INSERT INTO account_status (account_status_name) VALUES ('Active'), ('Closed'), ('Suspended')");
    console.log('Seeded account_status table');
  } catch(e) {
    console.error('Seed failed:', e.message);
  } finally {
    pool.end();
  }
}
seed();

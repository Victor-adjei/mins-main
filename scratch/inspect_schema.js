const { query } = require('./lib/db');

async function inspectSchema() {
  try {
    const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));

    const columns = await query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'");
    console.log('Column details for accounts and customers:');
    columns.rows
      .filter(r => r.table_name === 'accounts' || r.table_name === 'customers')
      .forEach(r => console.log(`${r.table_name}.${r.column_name}: ${r.data_type}`));
  } catch (err) {
    console.error('Schema Inspect Error:', err);
  }
}

inspectSchema();

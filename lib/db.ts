import { Pool } from 'pg';

// Singleton pattern for database connection pool in Next.js development mode
// This prevents multiple pools from being created during HMR (Hot Module Replacement)
const globalForPool = global as unknown as { pool: Pool };

const pool = globalForPool.pool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true,
});

if (!globalForPool.pool) {
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client', err);
  });
}

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

/**
 * Executes a PostgreSQL query with performance tracking
 */
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    // pool.query is more efficient for single queries as it handles connect/release automatically
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 500ms) to identify bottlenecks
    if (duration > 500) {
      console.warn(`[DB] Slow query (${duration}ms):`, text.split('\n')[0]);
    }
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[DB] Query Error (${duration}ms):`, { text, error });
    throw error;
  }
}

export default pool;

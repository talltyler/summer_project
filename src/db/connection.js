// Database helper functions for Cloudflare D1
export function getDatabase(env) {
  return env.DB;
}

// Helper function to execute queries
export async function query(db, sql, params = []) {
  try {
    const result = await db.prepare(sql).bind(...params).all();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute single queries
export async function queryFirst(db, sql, params = []) {
  try {
    const result = await db.prepare(sql).bind(...params).first();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute insert/update/delete queries
export async function execute(db, sql, params = []) {
  try {
    const result = await db.prepare(sql).bind(...params).run();
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Qwertyuiop%4044481144@db.kspcggklahaqltkamzji.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('[Database Error] Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper to convert SQLite ? to Postgres $1, $2, etc.
function convertQuery(sql) {
  let counter = 1;
  return sql.replace(/\?/g, () => `$${counter++}`);
}

const db = {
  async run(sql, params = []) {
    const pgSql = convertQuery(sql);
    const result = await pool.query(pgSql, params);
    // return changes (rowCount) to mock SQLite
    return { changes: result.rowCount };
  },

  async get(sql, params = []) {
    const pgSql = convertQuery(sql);
    const result = await pool.query(pgSql, params);
    return result.rows[0];
  },

  async all(sql, params = []) {
    const pgSql = convertQuery(sql);
    const result = await pool.query(pgSql, params);
    return result.rows || [];
  },

  async exec(sql) {
    // For exec, which might run multiple statements, pg query does this out of the box mostly
    await pool.query(sql);
  },

  prepare(sql) {
    return {
      run: (...params) => db.run(sql, params.flat()),
      get: (...params) => db.get(sql, params.flat()),
      all: (...params) => db.all(sql, params.flat())
    };
  }
};

// Initialize schema asynchronously
async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    // pg supports multiple statements natively
    await db.exec(schemaSql);
    console.log('[Database] PostgreSQL schema initialized successfully.');
  } catch (error) {
    console.error('[Database Error] Schema initialization failed:', error.message);
  }
}

initDatabase();

module.exports = db;

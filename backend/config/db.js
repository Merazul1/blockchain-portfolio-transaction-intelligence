require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'blockchain_user',
  password: process.env.DB_PASSWORD || 'BlockchainAuth2026!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'BlockchainIntelligenceDB',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  pool: {
    max: 15,
    min: 2,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 15000,
  },
};

let poolPromise = null;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig)
      .then((pool) => {
        console.log(`[SQL Server] Connected to ${dbConfig.database} on ${dbConfig.server}:${dbConfig.port}`);
        return pool;
      })
      .catch((err) => {
        console.error('[SQL Server] Connection error:', err.message);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

/**
 * Execute parameterized query safely
 * @param {string} queryString SQL query string with @param syntax
 * @param {Object} params Key-value pairs of parameters
 */
async function query(queryString, params = {}) {
  try {
    const pool = await getPool();
    const request = pool.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
    const result = await request.query(queryString);
    return result;
  } catch (error) {
    console.error('[SQL Server Query Error]:', error.message, 'Query:', queryString);
    throw error;
  }
}

async function checkHealth() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as isAlive, @@VERSION as version, DB_NAME() as currentDb');
    return {
      status: 'online',
      connected: true,
      database: result.recordset[0].currentDb,
      version: result.recordset[0].version.split('\n')[0],
    };
  } catch (err) {
    return {
      status: 'offline',
      connected: false,
      error: err.message,
    };
  }
}

module.exports = {
  getPool,
  query,
  checkHealth,
  sql,
};

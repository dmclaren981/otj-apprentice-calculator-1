const { Pool } = require('pg');

const pool = new Pool({
  user: 'danielle.mclaren',
  host: 'localhost',
  database: 'users',
  port: 5432,
});

module.exports = pool;

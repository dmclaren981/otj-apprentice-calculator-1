const db = require('../../db');

const tableExists = async (tableName) => {
  const res = await db.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = '${tableName}'
      )
    `);
  return res.rows[0].exists;
};

const createTables = async () => {
  const usersTableExists = await tableExists('users');
  const adminCodesTableExists = await tableExists('admin_codes');
  const otjRecordsTableExists = await tableExists('otj_records');

  if (usersTableExists && adminCodesTableExists && otjRecordsTableExists) {
    console.log('The tables already exist!');
    return;
  }

  const createUsersTable = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL
      );
    `;

  const createAdminCodesTable = `
      CREATE TABLE admin_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        valid BOOLEAN DEFAULT true
      );
    `;

  const createOtjRecordsTable = `
      CREATE TABLE otj_records (
        id SERIAL PRIMARY KEY,
        apprentice_id INTEGER REFERENCES users(id),
        date DATE NOT NULL,
        hours NUMERIC NOT NULL,
        total_hours NUMERIC NOT NULL DEFAULT 0
      );
    `;

  try {
    if (!usersTableExists) {
      await db.query(createUsersTable);
    }

    if (!adminCodesTableExists) {
      await db.query(createAdminCodesTable);
    }

    if (!otjRecordsTableExists) {
      await db.query(createOtjRecordsTable);
    }

    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables: ', err);
  }
};

module.exports = {
  createTables,
};

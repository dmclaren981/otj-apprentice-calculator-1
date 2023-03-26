// apprenticesController.js

const pool = require('../../db');

const getAdminApprenticesPage = (req, res) => {
  const query = `
    SELECT users.username, users.email, users.role, COALESCE(SUM(otj_records.hours), 0) AS total_hours
    FROM users
    LEFT JOIN otj_records ON users.id = otj_records.apprentice_id
    WHERE users.role = 'apprentice'
    GROUP BY users.id
    ORDER BY users.username ASC
  `;

  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      const errorSummary = err.message;
      req.flash('error', errorSummary);
      return res.redirect('/admin/dashboard');
    }
    const apprentices = result.rows;
    return res.render('admin-apprentice-info', { apprentices });
  });
};

const createApprentice = (req, res) => {
  // implement creating a new apprentice record in the database
};

const updateApprentice = (req, res) => {
  // implement updating an existing apprentice record in the database
};

const deleteApprentice = (req, res) => {
  // implement deleting an existing apprentice record from the database
};

module.exports = {
  getAdminApprenticesPage,
  createApprentice,
  updateApprentice,
  deleteApprentice,
};

const pool = require('../../db');

const getAdminDashboard = async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      req.flash('error', 'You must be logged in to access this page');
      return res.redirect('/login');
    }
    if (user.role !== 'admin') {
      req.flash('error', 'You do not have permission to access this page');
      return res.redirect('/dashboard');
    }
    const { rows: users } = await pool.query(`
    SELECT users.id, users.username, users.email, COALESCE(SUM(otj_records.hours), 0) AS total_hours
      FROM users
      LEFT JOIN otj_records ON users.id = otj_records.apprentice_id
      GROUP BY users.id
    `);
    res.render('admin-dashboard', { users });
  } catch (err) {
    console.error('Error executing query', err.stack);
    const errorSummary = err.message;
    req.flash('error', errorSummary);
    return res.redirect('/dashboard');
  }
};

module.exports = {
  getAdminDashboard,
};

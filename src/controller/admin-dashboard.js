const { v4: uuidv4 } = require('uuid');
const pool = require('../../db');

const generateAdminCodes = async (req, res) => {
  try {
    const adminCodes = [];
    for (let i = 0; i < 3; i++) {
      const code = uuidv4();
      const { rows } = await pool.query(`
        INSERT INTO admin_codes (code, description)
        VALUES ($1, $2)
        RETURNING code
      `, [code, 'New admin code']);
      adminCodes.push(rows[0].code);
    }
    console.log(adminCodes);
    req.flash('success', `Generated admin codes: ${adminCodes.join(', ')}`);
    return res.render('admin-dashboard', { success: req.flash('success'), adminCodes });
  } catch (err) {
    console.error('Error executing query', err.stack);
    const errorSummary = err.message;
    req.flash('error', errorSummary);
    return res.redirect('/admin/dashboard');
  }
};

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
    let adminCodes = [];
    if (req.method === 'POST') {
      adminCodes = [];
      for (let i = 0; i < 3; i++) {
        const code = uuidv4();
        await pool.query(`
          INSERT INTO admin_codes (code, description)
          VALUES ($1, $2)
        `, [code, 'New admin code']);
        adminCodes.push(code);
      }
      req.flash('success', `Successfully generated new admin codes: ${adminCodes.join(', ')}`);
      return res.render('admin-dashboard', { success: req.flash('success'), users, adminCodes });
    }
    if (req.originalUrl === '/admin/dashboard') {
      // user is already on admin dashboard, don't redirect again
      return res.render('admin-dashboard', { success: req.flash('success'), users, adminCodes });
    }
    // redirect to admin dashboard
    return res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error executing query', err.stack);
    const errorSummary = err.message;
    req.flash('error', errorSummary);
    return res.redirect('/dashboard');
  }
};

module.exports = {
  generateAdminCodes,
  getAdminDashboard,
};

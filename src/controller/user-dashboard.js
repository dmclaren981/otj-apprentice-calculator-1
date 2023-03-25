/* eslint-disable consistent-return */
const pool = require('../../db');

const getUserDashboard = (req, res) => {
  const { user } = req.session;

  if (!user) {
    req.flash('error', 'You must be logged in to access this page');
    return res.redirect('/dashboard');
  }

  pool.query(
    `
    SELECT users.username, users.email, COALESCE(SUM(otj_records.hours), 0) AS total_hours
    FROM users
    LEFT JOIN otj_records ON users.id = otj_records.apprentice_id
    WHERE users.id = $1
    GROUP BY users.id
    `,
    [user.id],
    (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
        const errorSummary = err.message;
        req.flash('error', errorSummary);
        return res.redirect('/dashboard');
      }

      if (result.rows.length === 0) {
        console.error('No results returned from query');
        req.flash('error', 'User not found or no OTJ records found');
        return res.redirect('/dashboard');
      }

      const userData = result.rows[0];
      const { total_hours: totalHours } = userData;

      res.render(
        'user-dashboard',
        {
          user: userData,
          totalHours,
          error: req.flash('error'),
          success: req.flash('success'),
        },
      );
    },
  );
};

module.exports = {
  getUserDashboard,
};

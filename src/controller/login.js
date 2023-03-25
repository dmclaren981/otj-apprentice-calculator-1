// authController.js
const bcrypt = require('bcrypt');
const pool = require('../../db');

const authLogin = (req, res) => {
  const { username, password } = req.body;
  pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      const errorSummary = err.message;
      req.flash('error', errorSummary);
      return res.redirect('/dashboard');
    }
    if (result.rows.length === 0) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/dashboard');
    }

    const user = result.rows[0];
    bcrypt.compare(password, user.password, (err, isValid) => {
      if (err) {
        console.error('Error comparing passwords', err.stack);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/dashboard');
      }

      if (!isValid) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/dashboard');
      }

      if (user.role === 'admin') {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        };
        req.flash('success', 'Logged in as admin!');
        return res.redirect('/admin/dashboard');
      }
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      req.flash('success', 'Logged in!');
      return res.redirect('/user/dashboard');
    });
  });
};

module.exports = {
  authLogin,
};

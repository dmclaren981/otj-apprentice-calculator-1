const bcrypt = require('bcrypt');
const db = require('../../db');

const getRegister = async (req, res) => {
  try {
    res.render('register', { error: req.flash('error') });
  } catch (err) {
    console.log(err);
    console.log('its broken');
  }
};

const isValidEmail = (email) => {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

const registerUser = async (req, res) => {
  const {
    username, password, name, email, adminCode,
  } = req.body;

  // Validate form data
  if (!username || !password || !name || !email) {
    req.flash('error', 'All fields are required');
    return res.redirect('/register');
  }
  if (password.length < 8) {
    req.flash('error', 'Password must be at least 8 characters long');
    return res.redirect('/register');
  }
  if (!isValidEmail(email)) { // Add validation for email format
    req.flash('error', 'Invalid email address');
    return res.redirect('/register');
  }

  // Set the user role based on whether an admin code was provided
  let role = 'apprentice';
  if (adminCode) {
    // Check if the provided admin code matches the code stored in the database
    const { rows: [admin] } = await db.query('SELECT * FROM admin_codes WHERE code = $1 AND valid = $2', [adminCode, true]);
    if (admin) {
      role = 'admin';
      req.flash('success', 'Admin code accepted');
      return res.redirect('/admin/dashboard');
    }
    req.flash('error', 'Invalid admin code');
    return res.redirect('/register');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user data into database
  try {
    await db.query('BEGIN');
    const result = await db.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, hashedPassword, email, role],
    );
    const userId = result.rows[0].id;
    if (role === 'apprentice') {
      await db.query('INSERT INTO otj_records (apprentice_id, total_hours, date) VALUES ($1, $2, $3)', [userId, 0, new Date()]);
    }
    await db.query('COMMIT');
    req.session.userId = userId; // set session for the user
    req.flash('success', 'Registration successful');
    res.redirect('/user/dashboard');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Error registering user');
  }

  // Add a return statement here to ensure that the function always returns a promise
  return Promise.resolve();
};

module.exports = {
  getRegister,
  registerUser,
};

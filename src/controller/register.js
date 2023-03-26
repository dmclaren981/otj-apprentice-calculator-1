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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateFormData = (req, res) => {
  const {
    username, password, name, email,
  } = req.body;

  if (!username || !password || !name || !email) {
    req.flash('error', 'All fields are required');
    return false;
  }

  if (password.length < 8) {
    req.flash('error', 'Password must be at least 8 characters long');
    return false;
  }

  if (!isValidEmail(email)) {
    req.flash('error', 'Invalid email address');
    return false;
  }

  return true;
};

const setRole = async (req, adminCode) => {
  let role = 'apprentice';

  if (adminCode) {
    const { rows: [admin] } = await db.query('SELECT * FROM admin_codes WHERE code = $1 AND valid = $2', [adminCode, true]);

    if (admin) {
      role = 'admin';
      req.flash('success', 'Admin code accepted');
    } else {
      req.flash('error', 'Invalid admin code');
      return null;
    }
  }

  return role;
};

const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

const insertUserData = async (req, hashedPassword, role) => {
  try {
    await db.query('BEGIN');
    const result = await db.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.body.username, hashedPassword, req.body.email, role],
    );
    const userId = result.rows[0].id;

    if (role === 'apprentice') {
      await db.query('INSERT INTO otj_records (apprentice_id, total_hours, date) VALUES ($1, $2, $3)', [userId, 0, new Date()]);
    }

    await db.query('COMMIT');

    return userId;
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    return null;
  }
};

const checkIfUserExists = async (db, req, res) => {
  const { username, email } = req.body;
  const { rows: [existingUser] } = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
  if (existingUser) {
    req.flash('error', 'Username or email already in use');
    return res.redirect('/register');
  }
};

const registerUser = async (req, res) => {
  if (!validateFormData(req, res)) {
    return res.redirect('/register');
  }

  await checkIfUserExists(db, req, res);

  const { adminCode } = req.body;
  const role = await setRole(req, adminCode);

  if (role === null) {
    return res.redirect('/register');
  }

  const hashedPassword = await hashPassword(req.body.password);
  const userId = await insertUserData(req, hashedPassword, role);

  if (userId === null) {
    return res.status(500).send('Error registering user');
  }

  req.session.user = {
    id: userId,
    username: req.body.username,
    email: req.body.email,
    role,
  };

  req.flash('success', 'Registration successful');

  if (role === 'admin') {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/user/dashboard');
  }
};

module.exports = {
  getRegister,
  registerUser,
};

const pool = require('../../../db');

const addHours = (req, res) => {
  const { user } = req.session;

  if (!user) {
    req.flash('error', 'You must be logged in to add hours');
    return res.redirect('/dashboard');
  }

  const { hours } = req.body;

  if (!hours || hours <= 0) {
    req.flash('error', 'Invalid number of hours');
    return res.redirect('/user/dashboard');
  }

  const query = 'INSERT INTO otj_records (apprentice_id, date, hours, total_hours) VALUES ($1, $2, $3, $4) RETURNING total_hours';
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000; // convert minutes to milliseconds
  const localDate = new Date(now.getTime() - timezoneOffset);
  const values = [user.id, localDate, hours, hours];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      const errorSummary = err.message;
      req.flash('error', errorSummary);
      return res.redirect('/dashboard');
    }

    const totalHours = result.rows[0].total_hours;
    req.flash('success', `${hours} hours were successfully added`);
    res.redirect('/user/dashboard');
  });
};

module.exports = {
  addHours,
};

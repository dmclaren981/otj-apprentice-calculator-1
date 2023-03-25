const pool = require('../../../db');

const deleteHours = (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  if (!user) {
    req.flash('error', 'You must be logged in to delete hours');
    return res.redirect('/login');
  }

  const query = 'DELETE FROM otj_records WHERE id = $1 AND apprentice_id = $2 RETURNING hours';
  const values = [id, user.id];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      const errorSummary = err.message;
      req.flash('error', errorSummary);
      return res.redirect('/hours-history');
    }

    if (result.rowCount === 0) {
      req.flash('error', 'Record not found');
      return res.redirect('/hours-history');
    }

    const deletedHours = result.rows[0].hours;

    const updateQuery = 'UPDATE otj_records SET total_hours = total_hours - $1 WHERE apprentice_id = $2';
    const updateValues = [deletedHours, user.id];

    pool.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
        const errorSummary = err.message;
        req.flash('error', errorSummary);
        return res.redirect('/hours-history');
      }

      req.flash('success', `Successfully deleted ${deletedHours} hours`);
      res.json({ id, hours: deletedHours });
    });
  });
};

module.exports = {
  deleteHours,
};

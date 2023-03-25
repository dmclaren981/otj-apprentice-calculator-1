const pool = require('../../../db');

const viewEditHoursHistory = (req, res) => {
  const { user } = req.session;

  if (!user) {
    req.flash('error', 'You must be logged in to access this page');
    return res.redirect('/dashboard');
  }

  pool.query(
    `
      SELECT *
      FROM otj_records
      WHERE apprentice_id = $1
      ORDER BY date ASC
      `,
    [user.id],
    (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
        const errorSummary = err.message;
        req.flash('error', errorSummary);
        return res.redirect('/dashboard');
      }

      const records = result.rows.map((record) => {
        const formattedDate = new Date(record.date).toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        return { ...record, formattedDate };
      });

      res.render('hours-history', { records });
    },
  );
};

const getEditHoursForm = (req, res) => {
  const { id } = req.params;

  pool.query(
    `
      SELECT *
      FROM otj_records
      WHERE id = $1
      `,
    [id],
    (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
        const errorSummary = err.message;
        return res.status(500).json({ error: errorSummary });
      }

      const record = result.rows[0];

      const formHTML = `
        <tr id="hours-record-${record.id}" class="govuk-table__row">
          <td class="govuk-table__cell">${record.date.toLocaleDateString()}</td>
          <td class="govuk-table__cell">
            <form method="post" action="/edit-hours/${record.id}">
              <input class="govuk-input" id="hours" name="hours" type="number" value="${record.hours}" required>
              <button class="govuk-button" type="submit">Save</button>
              <button class="govuk-button" type="button" onclick="window.location.href='/hours-history'">Cancel</button>
            </form>
          </td>
          <td class="govuk-table__cell">${record.total_hours}</td>
          <td class="govuk-table__cell">
            <button class="govuk-button" type="button" onclick="window.location.href='/hours-history'">Cancel</button>
          </td>
        </tr>
      `;

      res.send(formHTML);
    },
  );
};

// Function to calculate the total hours for an apprentice
const calculateTotalHours = async (apprenticeId, pool) => {
  try {
    // Get all the hours records for the apprentice
    const result = await pool.query(
      'SELECT hours FROM otj_records WHERE apprentice_id = $1',
      [apprenticeId],
    );
    const hours = result.rows.map((row) => row.hours);

    // Calculate the total hours and return the result
    const totalHours = hours.reduce((total, h) => total + h, 0);
    return totalHours;
  } catch (error) {
    console.error('Error calculating total hours', error);
    return null;
  }
};

// Function to create the HTML for a row in the hours table
const createHoursRowHtml = (record) => {
  const html = `
    <tr class="govuk-table__row" id="hours-record-${record.id}">
      <td class="govuk-table__cell">${record.date.toLocaleDateString()}</td>
      <td class="govuk-table__cell">
        ${record.hours}
        <button class="govuk-button" type="button" onclick="editHours(${record.id})">Edit</button>
      </td>
      <td class="govuk-table__cell">${record.total_hours}</td>
      <td class="govuk-table__cell">
        <button class="govuk-button" type="button" onclick="deleteHours(${record.id})">Delete</button>
      </td>
    </tr>
  `;
  return html;
};

const updateHours = async (req, res) => {
  const { id } = req.params;
  const { hours } = req.body;

  try {
    const result = await pool.query(
      'UPDATE otj_records SET hours = $1 WHERE id = $2 RETURNING *',
      [hours, id],
    );
    const updatedHours = result.rows[0];
    const totalHours = await calculateTotalHours(updatedHours.apprentice_id, pool);
    updatedHours.total_hours = totalHours;
    res.redirect('/hours-history');
  } catch (error) {
    console.error('Error updating hours', error);
    res.json({ success: false, error: 'Error updating hours' });
  }
};

module.exports = {
  viewEditHoursHistory,
  getEditHoursForm,
  updateHours,
};

const getDashboard = async (req, res) => {
  try {
    res.render('dashboard', { error: req.flash('error') });
  } catch (err) {
    console.log(err);
    console.log('its broken');
  }
};

module.exports = {
  getDashboard,
};

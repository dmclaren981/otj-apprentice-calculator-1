// const config = require('../config');
const path = require('path');
// const appConfig = config.returnConfig(process.env);

const getHome = async (req, res) => {
  try {
    res.sendFile( path.resolve('src', 'views', 'dashboard.html') );
  } catch (err) {
    console.log(err);
    console.log('its broken')
  }
};

module.exports = {
  getHome,
};

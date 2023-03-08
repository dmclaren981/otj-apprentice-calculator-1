const path = require('path');
const nunjucks = require('nunjucks');

const nunjucksConfig = (app) => {
  app.set('view engine', 'njk');

  app.set('views', [
    path.join(__dirname, './views/'),
    path.join(__dirname, '../node_modules/govuk-frontend/'),
    path.join(__dirname, '../node_modules/@ministryofjustice/frontend/'),
  ]);

  const njk = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(app.get('views')),
  );
  return njk.express(app);
};

module.exports = {
  nunjucksConfig,
};

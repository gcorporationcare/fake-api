// Final file that will be loaded into swagger
const basicInfo = require('./basicInfo');
const servers = require('./servers');
const components = require('./components');
const models = require('./models');

/**
 * Generate swagger compatible object
 * @param {*} database raw database object
 * @returns a swagger compatible documentation object
 */
exports.generate = (database) => {
  return {
    ...basicInfo,
    ...servers,
    ...components,
    paths: models.providePaths(database),
    tags: models.provideTags(),
    security: [{ bearerAuth: [] }],
  };
};

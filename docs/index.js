// Final file that will be loaded into swagger
const basicInfo = require('./basicInfo');
const servers = require('./servers');
const components = require('./components');
const models = require('./models');

module.exports = {
    ...basicInfo,
    ...servers,
    ...components,
    ...models.PATHS,
    ...models.TAGS,
};

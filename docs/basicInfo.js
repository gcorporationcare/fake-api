const applicationJson = 'application/json';

module.exports = {
  openapi: '3.0.3', // present supported OpenApi version
  info: {
    title: 'Fake Rest API',
    description: 'A simple Rest API implemented with node.js',
    version: '1.0.0',
    contact: {
      name: 'Import in Postman',
      url: 'http://localhost:3000/swagger.json',
    },
    consumes: [applicationJson],
    produces: [applicationJson],
  },
};

// External dependencies
const FileSync = require('lowdb/adapters/FileSync');
const swaggerUI = require('swagger-ui-express');
const express = require('express');
const low = require('lowdb');
const {join} = require('path');
const morgan = require('morgan');
const cors = require('cors');
const docs = require('./docs');

// Local dependencies
const utils = require('./core/utils');
const routes = require('./core/routes');


// 1- Generate database and enable synch with db.json file
const DATABASE = {
    albums: utils.readDataFile('albums'),
    comments: utils.readDataFile('comments'),
    photos: utils.readDataFile('photos'),
    posts: utils.readDataFile('posts'),
    todos: utils.readDataFile('todos'),
    users: utils.readDataFile('users'),
};

const SEQUENCE = {
    albums: utils.nextId(DATABASE.albums),
    comments: utils.nextId(DATABASE.comments),
    photos: utils.nextId(DATABASE.photos),
    posts: utils.nextId(DATABASE.posts),
    todos: utils.nextId(DATABASE.todos),
    users: utils.nextId(DATABASE.users),
};

const adapter = new FileSync(join(__dirname, 'data', 'db.json'));
const db = low(adapter);
// Resetting database
db.assign({
    albums: DATABASE.albums,
    comments: DATABASE.comments,
    photos: DATABASE.photos,
    posts: DATABASE.posts,
    todos: DATABASE.todos,
    users: DATABASE.users,
}).write();

// 2- Prepare express app by adding global values
const app = express();
app.db = db;
app.sequences = SEQUENCE;

//enable CORS for request verbs, and also enabling logger
app.use(morgan('combined'));
app.use(cors());
app.use(express.urlencoded({
    extended: true
}));

// Enabling JSON
app.use(express.json());


// 3- Adding endpoints to application
Object.keys(routes.endpoints).forEach(
    (route) => app.use(`/${route}`, routes.endpoints[route])
);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(docs));
app.use(utils.errorHandler);


//4- Starting the application.
const PORT = process.env.PORT || 3000;
const initialize = async () => {    
    app.listen(PORT);
};

initialize()
    .finally(
        () => console.log(`Server running at http://127.0.0.1:${PORT}/`)
);

const express = require('express');
const utils = require('./utils');

const app = express();
const PORT = 3000;


//------------------------------------------------------------------------------
// Database and sequences
//------------------------------------------------------------------------------
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


//------------------------------------------------------------------------------
// Endpoints
//------------------------------------------------------------------------------
//enable CORS for request verbs
app.use((req, res, next) => {
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

//Handle GET method for listing all records
app.get('/:model', (req, res) => {
    const records = utils.findAll(req, res, DATABASE);
    if (!records) {
        return;
    }
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    const filters = req.query.filters || [];
    const filteredRecords = utils.filteredData(filters, records);
    const result = utils.pagedData(page, size, filteredRecords);
    res.end(JSON.stringify(result));
})

//Handle GET method to get only one record
app.get('/:model/:id', (req, res) => {
    const record = utils.findById(req, res, DATABASE);
    if (!record) {
        return;
    }
    res.end(JSON.stringify(record));
})

//Handle POST method for creating a new record
app.post('/:model', (req, res) => {
    const records = utils.findAll(req, res, DATABASE);
    if (!records) {
        return;
    }
    // Update sequences
    const model = req.params.model;
    const newId = SEQUENCE[model];
    SEQUENCE[model] += 1;

    // Add new record and return it
    const newRecord = { ...req.body, id: newId };
    records.push(newRecord);
    res.end(JSON.stringify(newRecord));
})

//Handle PUT method for modifying a record
app.put('/:model/:id', (req, res) => {
    let record = utils.findById(req, res, DATABASE);
    if (!record) {
        return;
    }
    const newBody = req.body;
    delete newBody.id;
    record = Object.assign(record, newBody);
    res.end(JSON.stringify(record));
});

//Handle DELETE method for deleting a record
app.delete('/:model/:id', (req, res) => {
    const records = utils.findAll(req, res, DATABASE);
    const record = utils.findById(req, res, DATABASE);
    if (!record) {
        return;
    }
    const removeIndex = records.map((item) => item.id).indexOf(record.id);
    ~removeIndex && records.splice(removeIndex, 1);
    res.end(JSON.stringify({removed: true}));
})

app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

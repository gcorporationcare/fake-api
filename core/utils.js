const fs = require('fs');


/**
 * Read data from JSON file
 * @param {string} file 
 * @returns a JSON array
 */
exports.readDataFile = (file) => {
    return JSON.parse(
        fs.readFileSync(`${__dirname}/../data/${file}.json`, 'utf8')
    );
};

/**
 * Get page corresponding to given parameters 
 * @param {number} page the page's number
 * @param {number} size the page's size
 * @param {any[]} data the full data
 * @returns a page response
 */
exports.pagedData = (page, size, array) => {
    // 1- Counting number of items
    let totalElements = array.length;

    // 2- Getting safe size (max to number of items in array)
    let safeSize = size <= 0 ? 10 : +size;
    safeSize = safeSize >= totalElements ? totalElements : safeSize;

    // 3- Computing number of pages
    let totalPages = Math.ceil(totalElements / safeSize);

    // 4- Page can be at min the first index
    // Generally, page are not zero-indexed in URL so we subtract 1
    let safePage = page <= 0 ? 0 : +page - 1;
    safePage = safePage > totalPages ? (totalPages - 1) : safePage;

    // 5- Getting the start and last index for slicing
    let startIndex = safePage * safeSize;
    let endIndex = startIndex + safeSize;
    endIndex = endIndex >= totalElements ? totalElements : endIndex;
    const data = array.slice(startIndex, endIndex);
    // 6- Returning a page object
    return {
        page: safePage + 1,
        size: safeSize,
        count: data.length,
        totalElements,
        totalPages,
        data
    };
};

/**
 * Apply filters on given data
 * @param {*} filters the array of filters to apply
 * @param {*} sortBy the array containing sorting instructions 
 * @param {*} records the records to apply filters on 
 * @returns the filtered records
 */
exports.filteredData = (filters, sortBy, records) => {
    if (this.isNullOrEmpty(records)) {
        // No need to go further
        return records;
    }
    const cleanedFilters = safeFilters(filters);
    const cleanedSortBy = safeSortBy(sortBy);
    let sortedRecords = records;
    // 1- Sorting data
    if (!this.isNullOrEmpty(cleanedSortBy)) {
        sortedRecords = applySortBy(cleanedSortBy, sortedRecords);
    }
    // 2- Filtering data
    if (!this.isNullOrEmpty(cleanedFilters)) {
        // Selected consistent filters and applying to records
        return applyFilters(cleanedFilters, sortedRecords);
    }
    // No filters to apply
    return sortedRecords;
};

/**
 * Send a not found into response
 * @param {*} res the response that will be sent to user
 */
exports.notFound = (res) => {
    res.status(404).send({
        code: 404,
        message: 'Not found'
    });
}

/**
 * Get the next available ID (max Id + 1)
 * @param {*} records the array of records to use for lookup
 * @returns the next ID that can be used
 */
exports.nextId = (records) => {
    if (!records) {
        return 1;
    }
    const ids = records.map((item) => item.id);
    return Math.max(...ids) + 1;
}

/**
 * Check if a given array is null or have no item
 * @param {any[]} array the array to check
 * @returns false if array has at least one item
 */
exports.isNullOrEmpty = (array) => {
    return !array || array.length === 0;
};

/**
 * Find all records related to a table
 * @param {*} model the targeted model
 * @param {*} res the response that will be returned
 * @param {*} database the database object containing loaded records
 * @returns an array of records otherwise null
 */
exports.findAll = (model, res, database) => {
    const records = database.get(model).value();
    if (!records) {
        this.notFound(res);
        return null;
    }
    return records;
}

/**
 * Find record with given ID
 * @param {*} model the targeted model
 * @param {*} id the targeted ID
 * @param {*} res the response that will be returned
 * @param {*} database the database object containing loaded records
 * @returns the record with the ID in req params otherwise null
 */
exports.findById = (model, id, res, database) => {
    const recordId = +id;
    const record = database.get(model).find({ 
        id: recordId
    }).value();
    if (!record) {
        this.notFound(res);
        return null;
    }
    return record;
}


/**
 * Deal with get page request
 * @param {*} model the targeted model
 * @param {*} req the received request
 * @param {*} res the response that will be sent
 */
exports.getPage = (model, req, res) => {
    applyJsonContentType(res);
    const records = this.findAll(model, res, req.app.db);
    if (!records) {
        return;
    }
    const all = req.query.all || false;
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    const filters = req.query.filters || [];
    const sortBy = req.query.sortBy || [];
    const filteredRecords = this.filteredData(filters, sortBy, records);
    const result = all ?
        filteredRecords : this.pagedData(page, size, filteredRecords);
    res.end(JSON.stringify(result));
};

/**
 * Deal with get single record request
 * @param {*} model the targeted model
 * @param {*} req the received request
 * @param {*} res the response that will be sent
 */
exports.get = (model, req, res) => {
    applyJsonContentType(res);
    const record = this.findById(model, req.params.id, res, req.app.db);
    if (!record) {
        return;
    }
    res.end(JSON.stringify(record));
};

/**
 * Deal with create record request
 * @param {*} model the targeted model
 * @param {*} req the received request
 * @param {*} res the response that will be sent
 */
exports.post = (model, req, res) => {
    applyJsonContentType(res);
    // Update sequences
    const newId = req.app.sequences[model];
    req.app.sequences[model] += 1;

    // Add new record and return it
    const newRecord = { ...req.body, id: newId };
    req.app.db.get(model).push(newRecord).write();
    res.end(JSON.stringify(newRecord));
};

/**
 * Deal with edit record request
 * @param {*} model the targeted model
 * @param {*} req the received request
 * @param {*} res the response that will be sent
 */
exports.put = (model, req, res) => {
    applyJsonContentType(res);
    let record = this.findById(model, req.params.id, res, req.app.db);
    if (!record) {
        return;
    }
    const newBody = req.body;
    delete newBody.id;
    record = Object.assign(record, newBody);
    req.app.db.get(model).find({
        id: record.id
    }).assign(record).write();
    res.end(JSON.stringify(record));
};

/**
 * Deal with remove single record request
 * @param {*} model the targeted model
 * @param {*} req the received request
 * @param {*} res the response that will be sent
 */
exports.remove = (model, req, res) => {
    applyJsonContentType(res);
    const record = this.findById(model, req.params.id, res, req.app.db);
    if (!record) {
        return;
    }
    req.app.db.get(model).remove({id: record.id}).write();
    res.end(JSON.stringify({ removed: 1 }));
};

/**
 * Deal with remove all records request
 * @param {*} model the targeted model
 * @param {*} req the received request
 * @param {*} res the response that will be sent
 */
exports.removeAll = (model, req, res) => {
    applyJsonContentType(res);
    const records = this.findAll(model, res, req.app.db);
    if (!records) {
        return;
    }
    const removed = records.length;
    req.app.db.get(model).remove().write();
    res.end(JSON.stringify({ removed }));
};

/**
 * Deal with all unexpected errors on requests
 * @param {*} err the raised error
 * @param {*} req the received request
 * @param {*} res the response that will be sent
 * @param {*} next the next item in HTTP filters
 */
exports.errorHandler = (err, req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send({
        code: 500,
        message: 'Internal server error',
        stack: err.stack
    });
};

/**
 * Useful paths values
 */
exports.PATHS = {
    root: '',
    id: '/:id'
};

// -----------------------------------------------------------------------------
// PRIVATE METHODS
// -----------------------------------------------------------------------------
/**
 * Apply filters operations to given list of records
 * @param {any[]} filters the cleaned filters, list of {field, operator, value, isAndOperation}
 * @param {any[]} records the records to apply filters on
 * @returns the records matching all logical conditions (and/or) in filters
 */
const applyFilters = (filters, records) => {
    if (this.isNullOrEmpty(filters) || this.isNullOrEmpty(records)) {
        // 1- If no record or no filters, no need to go further...
        return records;
    }
    const idField = 'id';
    if (filters.length === 1) {
        // 2- We will loop through the array taking items by pair
        // In case there is a single filtering operations to apply, we add
        // another fake operation that will always resolve to true.
        filters.push({
            field: idField,
            operator: 'greaterThan',
            value: 0,
            isAndOperation: true
        });
    }
    let filteredRecords = records;
    for (let index = 0; index < filters.length - 1; index++) {
        // 3- Since we take two items at once, we won't need to take the last index into account
        const firstFilter = filters[index];
        const secondFilter = filters[index + 1];
        if (secondFilter.isAndOperation) {
            // 4- records must match Condition 1 AND condition 2
            filteredRecords = filteredRecords.filter(
                (record) => (
                    OPERATORS_METHOD[firstFilter.operator](
                        record, firstFilter.field, firstFilter.value
                    ) &&
                    OPERATORS_METHOD[secondFilter.operator](
                        record, secondFilter.field, secondFilter.value
                    )
                )
            );
        } else {
            // 5- records must match Condition 1 OR condition 2
            filteredRecords = filteredRecords.filter(
                (record) => (
                    OPERATORS_METHOD[firstFilter.operator](
                        record, firstFilter.field, firstFilter.value
                    ) ||
                    OPERATORS_METHOD[secondFilter.operator](
                        record, secondFilter.field, secondFilter.value
                    )
                )
            );
        }
        // 6- The next index will contains the result of the current operation
        // See it as a temporary memory for further operations
        filters[index + 1] = {
            field: idField,
            operator: 'in',
            value: filteredRecords.map((record) => record.id).join(ARRAY_VALUE_DELIMITER)
        };
    }
    // 7- Returning the final records
    return filteredRecords;
};

/**
 * Sort the records with given instructions
 * @param {*} sortBy the sorting instructions
 * @param {*} records the records to sort
 */
const applySortBy = (sortBy, records) => {
    if (this.isNullOrEmpty(sortBy) || this.isNullOrEmpty(records)) {
        // 1- If no record or no sortBy, no need to go further...
        return records;
    }
    return records.sort(fieldSorter(sortBy));
};

/**
 * Expression applying multiple sorting on a single record
 * @param {*} sortBy the sorting instructions
 * @returns -1/0/1 depending on record value
 */
const fieldSorter = (sortBy) => (item1, item2) => sortBy.map(sort => {
    const dir = sort.reverse ? -1 : 1;
    const value1 = `${item1[sort.field]}`;
    const value2 = `${item2[sort.field]}`;
    return dir * value1.localeCompare(value2);
}).reduce((p, n) => p ? p : n, 0);

/**
 * Transform string filters into usable object of safe filters
 * @param {string} filters the string received from API
 * @returns a list of valid filtering operations {field, operator, value, isAndOperation}
 */
const safeFilters = (filters) => {
    if (this.isNullOrEmpty(filters)) {
        // 1- No filters to apply
        return [];
    }
    let index = 0;
    let filtersArray = Array.isArray(filters) ? filters : [filters];

    return filtersArray.map((filterElement) => {
        // 2- Reading operands from string filter
        const filter = filterElement.split(OPERATORS_DELIMITER);
        if (filter.length < 2) {
            // Invalid parameters, looking for next one
            return;
        }

        // 3- Establishing which kind of operation must be applied (and/or)
        let isAndOperation = true;
        let field = filter[0];
        if (field.startsWith(OPERATORS_OR)) {
            // On first operations, we do not want to allow OR since it will always resolve to all records
            // Later when applying with previous operation
            isAndOperation = index === 0;
            // Removing extra character
            field = field.substring(OPERATORS_OR.length);
        }

        // 4- Checking operator consistency
        const operator = Object.keys(OPERATORS).filter(
            (key) => OPERATORS[key] === filter[1]
        );
        const value = filter.length > 2 ? filter[2] : null;
        if (this.isNullOrEmpty(operator) || !field) {
            // Invalid operator parameter, next occurrence
            return;
        }
        index++;
        return {
            field,
            operator: operator[0],
            value,
            isAndOperation
        };
    });
};


/**
 * Transform string sortBy into usable object of sorting instructions
 * @param {string} sortBy the string received from API
 * @returns a list of valid sorting operations {field, reverse:true/false}
 */
const safeSortBy = (sortBy) => {
    if (this.isNullOrEmpty(sortBy)) {
        // 1- No filters to apply
        // By default, we will sort by ID
        return [{
            field: 'id',
            reverse: false
        }];
    }
    let sortByArray = Array.isArray(sortBy) ? sortBy : [sortBy];

    return sortByArray.map((sortElement) => {
        // 2- Reading field and direction
        const order = sortElement.split(SORT_DELIMITER);
        const field = order[0];
        const direction = order.length < 2 ? SORT_DIRECTIONS.ascending : order[1];
        const reverse = SORT_DIRECTIONS.descending === direction.toLowerCase();
        return {
            field,
            reverse
        };
    });
};

/**
 * Set the content-type to JSON
 * @param {*} res the response that will be sent
 */
const applyJsonContentType = (res) => {
    res.header('Content-Type', 'application/json');
};

/**
 * List of available operators
 */
const OPERATORS = {
    equal: '==',
    notEqual: '!=',
    greaterThan: '>',
    greaterThanOrEqual: '>=',
    lesserThan: '<',
    lesserThanOrEqual: '<=',
    in: 'in',
    notIn: 'notIn',
    like: 'like',
    notLike: 'notLike',
};

/**
 * Filtering method matching supported operators
 */
const OPERATORS_METHOD = {
    equal: (record, field, value) => `${record[field]}` === `${value}`,
    notEqual: (record, field, value) => `${record[field]}` !== `${value}`,
    greaterThan: (record, field, value) => record && record[field] > value,
    greaterThanOrEqual: (record, field, value) => record && record[field] >= value,
    lesserThan: (record, field, value) => record && record[field] < value,
    lesserThanOrEqual: (record, field, value) => record && record[field] <= value,
    in: (record, field, value) => value.split(ARRAY_VALUE_DELIMITER).includes(`${record[field]}`),
    notIn: (record, field, value) => !value.split(ARRAY_VALUE_DELIMITER).includes(`${record[field]}`),
    like: (record, field, value) => record && `${record[field]}`.includes(`${value}`),
    notLike: (record, field, value) => record && !`${record[field]}`.includes(`${value}`)
}
const OPERATORS_DELIMITER = ',';
const OPERATORS_OR = '|';
// Just for readability
const ARRAY_VALUE_DELIMITER = ';';

const SORT_DIRECTIONS = {
    ascending: 'asc',
    descending: 'desc',
};
const SORT_DELIMITER = ',';

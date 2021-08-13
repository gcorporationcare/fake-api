const fs = require("fs");

/**
 * List of available operators
 */
exports.OPERATORS = {
    equal: '==',
    notEqual: '!=',
    greaterThan: '>',
    greaterThanOrEqual: '>=',
    lesserThan: '<',
    lesserThanOrEqual: '<=',
    in: 'in',
    notIn: 'notIn'
};

/**
 * Read data from JSON file
 * @param {string} file 
 * @returns a JSON array
 */
exports.readDataFile = (file) => {
    return JSON.parse(fs.readFileSync(`${__dirname}/data/${file}.json`, 'utf8'));
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
 * Parse filters and returns safe filters ready for use
 * @param {*} filter the string form of filters to apply
 * @param {any[]} records the records to apply filters on 
 * @returns the filtered records
 */
exports.applyFilter = (field, operator, value, records) => {
    switch (operator) {
        case this.OPERATORS.equal:
        case this.OPERATORS.notEqual:
            return _applyEqualFilter(field, operator, value, records);
        case this.OPERATORS.greaterThan:
        case this.OPERATORS.greaterThanOrEqual:
            return _applyGreaterThanFilter(field, operator, value, records);
        case this.OPERATORS.lesserThan:
        case this.OPERATORS.lesserThanOrEqual:
            return _applyLesserThanFilter(field, operator, value, records);
        case this.OPERATORS.in:
        case this.OPERATORS.notIn:
            return _applyInFilter(field, operator, value, records);
    }
    return records;
};

/**
 * Apply filters on given data
 * @param {*} filters the array of filters to apply
 * @param {*} records the records to apply filters on 
 * @returns 
 */
exports.filteredData = (filters, records) => {
    // 1- Preparing data
    let filteredRecords = records;
    if (this.isNullOrEmpty(filters)) {
        // No filters to apply
        return filteredRecords;
    }
    let filtersArray = Array.isArray(filters) ? filters : [filters];

    // 2- Applying filters on records
    filtersArray.forEach(element => {
        const filter = element.split(';');
        if (this.isNullOrEmpty(filteredRecords) || filter.length < 2) {
            // Invalid parameters, looking for next one
            return;
        }
        const field = filter[0];
        const operator = filter[1];
        const value = filter.length > 2 ? filter[2] : null;
        if (!operator || !field) {
            // Invalid operator parameter, next occurrence
            return;
        }
        filteredRecords = this.applyFilter(field, operator, value, filteredRecords);
    });
    return filteredRecords;
};

/**
 * Send a not found into response
 * @param {*} res the response that will be sent to user
 */
exports.notFound = (res) => {
    res.status(404).send('Not found');
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
 * @param {*} req the original user request
 * @param {*} res the response that will be returned
 * @param {*} database the database object containing loaded records
 * @returns an array of records otherwise null
 */
exports.findAll = (req, res, database) => {
    const records = database[req.params.model];
    if (this.isNullOrEmpty(records)) {
        this.notFound(res);
        return null;
    }
    return records;
}

/**
 * Find record with given ID
 * @param {*} req the original request
 * @param {*} res the response that will be returned
 * @param {*} database the database object containing loaded records
 * @returns the record with the ID in req params otherwise null
 */
exports.findById = (req, res, database) => {
    const records = findAll(req, res, database);
    const id = +req.params.id;
    if (this.isNullOrEmpty(records) || !id) {
        this.notFound(res);
        return null;
    }
    const record = records.filter((item) => item.id === +id);
    if (this.isNullOrEmpty(record)) {
        this.notFound(res);
        return null;
    }
    return record[0];
}

// -----------------------------------------------------------------------------
// PRIVATE METHODS
// -----------------------------------------------------------------------------
const _applyInFilter = (field, operator, value, records) => {
    if (this.OPERATORS.in === operator) {
        return records.filter((record) => JSON.parse(value).includes(record[field]));
    } else if (this.OPERATORS.notIn === operator) {
        return records.filter((record) => !JSON.parse(value).includes(record[field]));
    }
    return records;
};

const _applyLesserThanFilter = (field, operator, value, records) => {
    if (this.OPERATORS.lesserThan === operator) {
        return records.filter((record) => record[field] < value);
    } else if (this.OPERATORS.lesserThanOrEqual === operator) {
        return records.filter((record) => record[field] <= value);
    }
    return records;
};

const _applyEqualFilter = (field, operator, value, records) => {
    if (this.OPERATORS.equal === operator) {
        return records.filter((record) => record[field] === value);
    } else if (this.OPERATORS.notEqual === operator) {
        return records.filter((record) => record[field] !== value);
    }
    return records;
};

const _applyGreaterThanFilter = (field, operator, value, records) => {
    if (this.OPERATORS.greaterThan === operator) {
        return records.filter((record) => record[field] > value);
    } else if (this.OPERATORS.greaterThanOrEqual === operator) {
        return records.filter((record) => record[field] >= value);
    }
    return records;
};
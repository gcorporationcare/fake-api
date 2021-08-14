const fs = require("fs");


/**
 * Read data from JSON file
 * @param {string} file 
 * @returns a JSON array
 */
exports.readDataFile = (file) => {
    return JSON.parse(
        fs.readFileSync(`${__dirname}/data/${file}.json`, 'utf8')
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
 * @param {*} records the records to apply filters on 
 * @returns the filtered records
 */
exports.filteredData = (filters, records) => {
    // 1- Preparing data
    if (this.isNullOrEmpty(records) || this.isNullOrEmpty(filters)) {
        // No filters to apply
        return records;
    } // 2- Selected consistent filters and applying to records
    const cleanedFilters = safeFilters(filters);
    return applyFilters(cleanedFilters, records);
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
    if (!records) {
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
    const records = this.findAll(req, res, database);
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
            value: JSON.stringify(filteredRecords.map((record) => record.id))
        };
    }
    // 7- Returning the final records
    return filteredRecords;
}

/**
 * Transform string filters into usable object of safe filters
 * @param {string} filters the string received from API
 * @returns a list of valid filtering operations {field, operator, value, isAndOperation}
 */
const safeFilters = (filters) => {
    if (this.isNullOrEmpty(filters)) {
        // 1- No filters to apply
        return records;
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
    equal: (record, field, value) => record[field] === value,
    notEqual: (record, field, value) => record[field] !== value,
    greaterThan: (record, field, value) => record && record[field] > value,
    greaterThanOrEqual: (record, field, value) => record && record[field] >= value,
    lesserThan: (record, field, value) => record && record[field] < value,
    lesserThanOrEqual: (record, field, value) => record && record[field] <= value,
    in: (record, field, value) => JSON.parse(value).includes(record[field]),
    notIn: (record, field, value) => !JSON.parse(value).includes(record[field]),
    like: (record, field, value) => record && `${record[field]}`.includes(`${value}`),
    notLike: (record, field, value) => record && !`${record[field]}`.includes(`${value}`)
}
const OPERATORS_DELIMITER = ';';
const OPERATORS_OR = '|';

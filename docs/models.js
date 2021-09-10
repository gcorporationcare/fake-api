/**
 * Change first letter of model to upper case.
 * @param {*} model the targeted model
 * @returns for user will return User
 */
const getCamelModel = (model) => {
    return model[0].toUpperCase() + model.substring(1);
};

/**
 * Generic swagger description for get page endpoint
 * @param {*} model the targeted model
 * @returns a swagger compatible path object
 */
const getPage = (model, camelModel) => {
    return {
        // method of operation
        get: {
            tags: [`${model.toUpperCase()} operations`], // operation's tag.
            description: `Get ${model}s`, // operation's desc.
            operationId: `get${camelModel}s`, // unique operation id.
            parameters: [// expected params.
                {
                    name: 'page', // name of the param
                    in: 'query', // location of the param
                    schema: {
                        type: 'integer', // type of the param
                    },
                    required: false,
                    description: `Page number to browse (starting with 1)`, // param desc.
                    default: 1
                },
                {
                    name: 'size',
                    in: 'query',
                    schema: {
                        type: 'integer',
                    },
                    required: false,
                    description: `Page size to browse (starting with 1)`,
                    default: 10
                },
                {
                    name: 'filters',
                    in: 'query',
                    schema: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: 'id,>,0'
                        }
                    },
                    explode: true,
                    style: 'query',
                    required: false,
                    allowReserved: true,
                    description: `Filters to apply on database record (field,operator,value) with operator: ==, !=, >, >=, <, <=, in, notIn, like, notLike`,
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    schema: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: 'id,desc'
                        }
                    },
                    explode: true,
                    style: 'query',
                    required: false,
                    allowReserved: true,
                    description: `Order to apply on database records (field,direction) with direction: asc (From A to Z) or desc (From Z to A)`,
                },
            ],
            // expected responses
            responses: {
                // response code
                200: {
                    description: `${camelModel}s were obtained`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: `#/components/schemas/Page`, // Record model
                            },
                        },
                    },
                },
            },
        },
    }
};

/**
 * Generic swagger description for get single record endpoint
 * @param {*} model the targeted model
 * @returns a swagger compatible path object
 */
const get = (model, camelModel) => {
    return {
        // method of operation
        get: {
            tags: [`${model.toUpperCase()} operations`], // operation's tag.
            description: `Get ${model}`, // operation's desc.
            operationId: `get${camelModel}`, // unique operation id.
            parameters: [
                // expected params.
                {
                    name: 'id', // name of the param
                    in: 'path', // location of the param
                    schema: {
                    $ref: '#/components/schemas/id', // data model of the param
                    },
                    required: true, // Mandatory param
                    description: `Id of ${model} to retrieve`, // param desc.
                },
            ],
            // expected responses
            responses: {
                // response code
                200: {
                    description: `${camelModel} were obtained`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: `#/components/schemas/${camelModel}`, // Record model
                            },
                        },
                    },
                },
                // response code
                404: {
                    description: `${camelModel} is not found`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/NotFoundError', // error data model
                            },
                        },
                    },
                },
            },
        },
    }
};

/**
 * Generic swagger description for create record endpoint
 * @param {*} model the targeted model
 * @returns a swagger compatible path object
 */
const create = (model, camelModel) => {
    return {
        // method of operation
        post: {
            tags: [`${model.toUpperCase()} operations`], // operation's tag.
            description: `Create ${model}`, // operation's desc.
            operationId: `create${camelModel}`, // unique operation id.
            parameters: [],
            requestBody: {
                // expected request body
                content: {
                    // content-type
                    'application/json': {
                        schema: {
                            $ref: `#/components/schemas/${camelModel}`, // Record model
                        },
                    },
                },
            },
            // expected responses
            responses: {
                // response code
                201: {
                    description: `${camelModel} were created`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: `#/components/schemas/${camelModel}`, // Record model
                            },
                        },
                    },
                },
                // response code
                500: {
                    description: `Server error`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error', // error data model
                            },
                        },
                    },
                },
            },
        },
    }
};

/**
 * Generic swagger description for update record endpoint
 * @param {*} model the targeted model
 * @returns a swagger compatible path object
 */
const update = (model, camelModel) => {
    return {
        // method of operation
        put: {
            tags: [`${model.toUpperCase()} operations`], // operation's tag.
            description: `Update ${model}`, // operation's desc.
            operationId: `update${camelModel}`, // unique operation id.
            parameters: [
                // expected params.
                {
                    name: 'id', // name of the param
                    in: 'path', // location of the param
                    schema: {
                    $ref: '#/components/schemas/id', // data model of the param
                    },
                    required: true, // Mandatory param
                    description: `Id of ${model} to be updated`, // param desc.
                },
            ],
            requestBody: {
                // expected request body
                content: {
                    // content-type
                    'application/json': {
                        schema: {
                            $ref: `#/components/schemas/${camelModel}`, // Record model
                        },
                    },
                },
            },
            // expected responses
            responses: {
                // response code
                200: {
                    description: `${camelModel} were updated`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: `#/components/schemas/${camelModel}`, // Record model
                            },
                        },
                    },
                },
                // response code
                404: {
                    description: `${camelModel} is not found`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/NotFoundError', // error data model
                            },
                        },
                    },
                },
                // response code
                500: {
                    description: `Server error`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error', // error data model
                            },
                        },
                    },
                },
            },
        },
    }
};

/**
 * Generic swagger description for remove record endpoint
 * @param {*} model the targeted model
 * @returns a swagger compatible path object
 */
const remove = (model, camelModel) => {
    return {
        // method of operation
        delete: {
            tags: [`${model.toUpperCase()} operations`], // operation's tag.
            description: `Delete ${model}`, // operation's desc.
            operationId: `delete${camelModel}`, // unique operation id.
            parameters: [
                // expected params.
                {
                    name: 'id', // name of the param
                    in: 'path', // location of the param
                    schema: {
                        $ref: '#/components/schemas/id', // data model of the param
                    },
                    required: true, // Mandatory param
                    description: `Id of ${model} to be removed`, // param desc.
                },
            ],
            // expected responses
            responses: {
                // response code
                200: {
                    description: `${camelModel} were deleted`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: `#/components/schemas/${camelModel}`, // Record model
                            },
                        },
                    },
                },
                // response code
                404: {
                    description: `${camelModel} is not found`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/NotFoundError', // error data model
                            },
                        },
                    },
                },
                // response code
                500: {
                    description: `Server error`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error', // error data model
                            },
                        },
                    },
                },
            },
        },
    }
};

/**
 * Generic swagger description for remove all records endpoint
 * @param {*} model the targeted model
 * @returns a swagger compatible path object
 */
const removeAll = (model, camelModel) => {
    return {
        // method of operation
        delete: {
            tags: [`${model.toUpperCase()} operations`], // operation's tag.
            description: `Delete ${model}s`, // operation's desc.
            operationId: `delete${camelModel}s`, // unique operation id.
            parameters: [],
            // expected responses
            responses: {
                // response code
                200: {
                    description: `${camelModel}s were deleted`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: `#/components/schemas/${camelModel}`, // Record model
                            },
                        },
                    },
                },
                // response code
                500: {
                    description: `Server error`, // response desc.
                    content: {
                        // content-type
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error', // error data model
                            },
                        },
                    },
                },
            },
        },
    }
};

const models = ['album', 'comment', 'photo', 'post', 'todo', 'user'];

/**
 * Generic all existing paths for known models
 * @returns a swagger compatible paths object
 */
const providePaths = () => {
    const paths = {};
    models.forEach((model) => {
        const camelModel = getCamelModel(model);
        paths[`/${model}s`] = {
            ...getPage(model, camelModel),
            ...create(model, camelModel),
            ...removeAll(model, camelModel),
        };
        paths[`/${model}s/{id}`] = {
            ...get(model, camelModel),
            ...update(model, camelModel),
            ...remove(model, camelModel),
        };
    });
    return paths;
};

/**
 * Generate all existing tags based for known models
 * @returns a swagger compatible tags object
 */
const provideTags = () => {
    return models.map((model) => {
        // name of a tag
        return { name: `${model.toUpperCase()} operations` };
    });
};

exports.PATHS = {
    paths: providePaths()
};
exports.TAGS = {
    tags: provideTags()
};

/**
 * A lot of endpoints will have these same statuses as response, so we save them right here
 */
const internalServerResponse = {
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
};
const authErrorResponses = {
  401: {
    description: `No valid authorization header`, // response desc.
    content: {
      // content-type
      'application/json': {
        schema: {
          $ref: `#/components/schemas/AuthenticationError`, // Record model
        },
      },
    },
  },
  403: {
    description: `Valid token but unrecognized`, // response desc.
    content: {
      // content-type
      'application/json': {
        schema: {
          $ref: `#/components/schemas/AuthenticationError`, // Record model
        },
      },
    },
  },
  ...internalServerResponse,
};

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
 * @param {*} camelModel the targeted model starting with uppercase
 * @param {*} data raw data array
 * @returns a swagger compatible path object
 */
const getPage = (model, camelModel, data) => {
  return {
    // method of operation
    get: {
      tags: [`${model.toUpperCase()} operations`], // operation's tag.
      description: `Get ${model}s`, // operation's desc.
      operationId: `get${camelModel}s`, // unique operation id.
      parameters: [
        // expected params.
        {
          name: 'page', // name of the param
          in: 'query', // location of the param
          schema: {
            type: 'integer', // type of the param
          },
          required: false,
          description: `Page number to browse (starting with 1)`, // param desc.
          default: 1,
          minimum: 1,
          example: 4,
          examples: {
            first: {
              value: 0,
              summary:
                'Missing parameter, negative values, 0 and 1 will browse first page',
            },
            last: {
              value: 9789,
              summary: 'Bigger number will always match last page',
            },
          },
        },
        {
          name: 'size',
          in: 'query',
          schema: {
            type: 'integer',
          },
          required: false,
          description: `Page size to browse (starting with 1)`,
          default: 10,
          minimum: 1,
          example: 3,
          examples: {
            small: {
              value: 0,
              summary: 'Will match default size (10 items per page)',
            },
            standard: {
              value: 25,
              summary: '25 items per page',
            },
            large: {
              value: 35901,
              summary: 'Bigger number will probably give a single big page',
            },
          },
        },
        {
          name: 'filters',
          in: 'query',
          schema: {
            type: 'array',
            items: {
              type: 'string',
              example: 'title,like,e',
            },
          },
          explode: true,
          style: 'query',
          required: false,
          allowReserved: true,
          description: `Filters to apply on database record (field,operator,value) with operator: ==, !=, >, >=, <, <=, in, notIn, like, notLike`,
          example: ['id,>,6', 'title,<,b'],
          examples: {
            none: {
              value: [],
              summary: 'No filter applied',
            },
            single: {
              value: ['title,like,e'],
              summary: 'Records having their title containing the character e',
            },
            and: {
              value: ['title,notLike,a', 'id,>,7'],
              summary:
                'Records having their title not containing a and their ID greater than 7',
            },
            or: {
              value: ['title,>,c', '|id,in,1;4;5;19;20'],
              summary:
                'Records having their title after c and their ID in 1,4,5,19,20',
            },
          },
        },
        {
          name: 'sortBy',
          in: 'query',
          schema: {
            type: 'array',
            items: {
              type: 'string',
              example: 'id,desc',
            },
          },
          explode: true,
          style: 'query',
          required: false,
          allowReserved: true,
          description: `Order to apply on database records (field,direction) with direction: asc (From A to Z) or desc (From Z to A)`,
          example: ['title,asc', 'id,desc'],
          examples: {
            single: {
              value: 'title',
              summary: 'Omitting directing wil browse from A to Z',
            },
            multiple: {
              value: ['title,desc', 'id,asc'],
              summary: 'Sort by descending title, then put smallest IDs first',
            },
          },
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
              example: {
                page: 1,
                size: 3,
                count: 3,
                totalElements: data.length,
                totalPages: Math.ceil(data.length / 3),
                data: [data[0], data[1], data[2]],
              },
            },
          },
        },
        ...internalServerResponse,
      },
    },
  };
};

/**
 * Generic swagger description for get single record endpoint
 * @param {*} model the targeted model
 * @param {*} camelModel the targeted model starting with uppercase
 * @param {*} data raw data array
 * @returns a swagger compatible path object
 */
const get = (model, camelModel, data) => {
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
          example: 4,
          examples: {
            unknown: {
              value: -7,
              summary:
                'No record have negative ID, then will have a not found response',
            },
            first: {
              value: 1,
              summary:
                'Unless it has been removed, should match the first record',
            },
            any: {
              value: 8,
              summary: 'All available models have initially at least ten items',
            },
          },
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
              example: data[3],
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
        ...internalServerResponse,
      },
    },
  };
};

/**
 * Generic swagger description for create record endpoint
 * @param {*} model the targeted model
 * @param {*} camelModel the targeted model starting with uppercase
 * @param {*} data raw data array
 * @returns a swagger compatible path object
 */
const create = (model, camelModel, data) => {
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
            examples: {
              real: {
                value: data[0],
                summary: 'Real value from default database',
              },
              fake: {
                value: { id: -16, title: 15904, unknownField: true },
                summary: 'Fake value but no control made in this API',
              },
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
              example: data[0],
            },
          },
        },
        // response code
        ...authErrorResponses,
        ...internalServerResponse,
      },
    },
  };
};

/**
 * Generic swagger description for update record endpoint
 * @param {*} model the targeted model
 * @param {*} camelModel the targeted model starting with uppercase
 * @param {*} data raw data array
 * @returns a swagger compatible path object
 */
const update = (model, camelModel, data) => {
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
          example: 4,
          examples: {
            unknown: {
              value: -8,
              summary:
                'No record have negative ID, then will have a not found response',
            },
            first: {
              value: 1,
              summary:
                'Unless it has been removed, should match the first record',
            },
            any: {
              value: 8,
              summary: 'All available models have initially at least ten items',
            },
          },
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
            examples: {
              real: {
                value: data[0],
                summary: 'Real value from default database',
              },
              fake: {
                value: { id: -1, title: 15674, unknownField: true },
                summary: 'Fake value but no control made in this API',
              },
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
              example: data[0],
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
        ...authErrorResponses,
        ...internalServerResponse,
      },
    },
  };
};

/**
 * Generic swagger description for remove record endpoint
 * @param {*} model the targeted model
 * @param {*} camelModel the targeted model starting with uppercase
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
          example: 4,
          examples: {
            unknown: {
              value: -9,
              summary:
                'No record have negative ID, then will have a not found response',
            },
            first: {
              value: 1,
              summary:
                'Unless it has been removed, should match the first record',
            },
            any: {
              value: 8,
              summary: 'All available models have initially at least ten items',
            },
          },
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
                $ref: `#/components/schemas/Removed`, // Record model
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
        ...authErrorResponses,
        ...internalServerResponse,
      },
    },
  };
};

/**
 * Generic swagger description for remove all records endpoint
 * @param {*} model the targeted model
 * @param {*} camelModel the targeted model starting with uppercase
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
                $ref: `#/components/schemas/Removed`, // Record model
              },
            },
          },
        },
        ...authErrorResponses,
        ...internalServerResponse,
      },
    },
  };
};

const authenticationTag = 'Authentication';

/**
 * Swagger description for login endpoint
 * @returns a swagger compatible path object
 */
const login = () => {
  const credentials = 'My secret Credentials';
  return {
    // method of operation
    post: {
      tags: [authenticationTag], // operation's tag.
      description: `Login`, // operation's desc.
      operationId: `login`, // unique operation id.
      parameters: [],
      requestBody: {
        // expected request body
        content: {
          // content-type
          'application/json': {
            schema: {
              $ref: `#/components/schemas/LoginRequest`, // Record model
            },
            examples: {
              real: {
                value: { username: 'MyUser', password: credentials },
                summary: 'Username and password are case sensitive',
              },
              fake: {
                value: { email: 'any@mail.com', name: 'I am me' },
                summary: 'Username and password are mandatory in body',
              },
            },
          },
        },
      },
      // expected responses
      responses: {
        // response code
        201: {
          description: `User tokens were created`, // response desc.
          content: {
            // content-type
            'application/json': {
              schema: {
                $ref: `#/components/schemas/TokenResponse`, // Record model
              },
              example: {
                accessToken: 'eyJhbGciOiJIiABCiIsInR5cCI6IkpXwCJ9.....',
                refreshToken: 'eyJhbGciOiJIUzDEFIsInR5cCI6IkpXvCJ9.....',
              },
            },
          },
        },
        ...authErrorResponses,
        ...internalServerResponse,
      },
    },
  };
};
/**
 * Swagger description for token endpoint
 * @returns a swagger compatible path object
 */
const token = () => {
  return {
    // method of operation
    post: {
      tags: [authenticationTag], // operation's tag.
      description: `Token`, // operation's desc.
      operationId: `token`, // unique operation id.
      parameters: [],
      requestBody: {
        // expected request body
        content: {
          // content-type
          'application/json': {
            schema: {
              $ref: `#/components/schemas/TokenRequest`, // Record model
            },
            examples: {
              real: {
                value: { token: 'eyJhbGciOiJIiABCiIsInR5cCI6IkpXwCJ9.....' },
                summary: 'Valid refresh token',
              },
              fake: {
                value: { id: 13, username: 'Real Username' },
                summary: 'Token is mandatory in body',
              },
            },
          },
        },
      },
      // expected responses
      responses: {
        // response code
        201: {
          description: `New access token generated`, // response desc.
          content: {
            // content-type
            'application/json': {
              schema: {
                $ref: `#/components/schemas/TokenResponse`, // Record model
              },
              example: {
                accessToken: 'eyJhbGciOiJIiABCiIsInR5cCI6IkpXwCJ9.....',
                refreshToken: null,
              },
            },
          },
        },
        ...authErrorResponses,
        ...internalServerResponse,
      },
    },
  };
};
/**
 * Swagger description for logout endpoint
 * @returns a swagger compatible path object
 */
const logout = () => {
  return {
    // method of operation
    post: {
      tags: [authenticationTag], // operation's tag.
      description: `Logout`, // operation's desc.
      operationId: `logout`, // unique operation id.
      parameters: [],
      requestBody: {
        // expected request body
        content: {
          // content-type
          'application/json': {
            schema: {
              $ref: `#/components/schemas/TokenRequest`, // Record model
            },
            examples: {
              real: {
                value: { token: 'eyJhbGciOiJIiABCiIsInR5cCI6IkpXwCJ9.....' },
                summary: 'Valid refresh token',
              },
              fake: {
                value: { id: 13, username: 'Another Username' },
                summary: 'Token is mandatory in body',
              },
            },
          },
        },
      },
      // expected responses
      responses: {
        // response code
        200: {
          description: `User tokens were created`, // response desc.
          content: {
            // content-type
            'application/json': {
              schema: {
                $ref: `#/components/schemas/LogoutResponse`, // Record model
              },
              example: {
                date: new Date(),
                loggedOut: true,
              },
            },
          },
        },
        ...internalServerResponse,
      },
    },
  };
};
/**
 * Swagger description for whoami endpoint
 * @param {*} data raw data array
 * @returns a swagger compatible path object
 */
const whoami = (data) => {
  return {
    // method of operation
    get: {
      tags: [authenticationTag], // operation's tag.
      description: `Whoami`, // operation's desc.
      operationId: `whoami`, // unique operation id.
      parameters: [],
      // expected responses
      responses: {
        // response code
        200: {
          description: `User token is still valid`, // response desc.
          content: {
            // content-type
            'application/json': {
              schema: {
                $ref: `#/components/schemas/User`, // Record model
              },
              example: data[0],
            },
          },
        },
        ...authErrorResponses,
        ...internalServerResponse,
      },
    },
  };
};

const models = ['album', 'comment', 'photo', 'post', 'todo', 'user'];

/**
 * Generic all existing paths for known models
 * @param {*} database raw database object
 * @returns a swagger compatible paths object
 */
exports.providePaths = (database) => {
  const paths = {
    '/auth/login': login(),
    '/auth/token': token(),
    '/auth/logout': logout(),
    '/auth/whoami': whoami(database['users']),
  };
  models.forEach((model) => {
    const camelModel = getCamelModel(model);
    const data = database[`${model}s`];
    paths[`/${model}s`] = {
      ...getPage(model, camelModel, data),
      ...create(model, camelModel, data),
      ...removeAll(model, camelModel),
    };
    paths[`/${model}s/{id}`] = {
      ...get(model, camelModel, data),
      ...update(model, camelModel, data),
      ...remove(model, camelModel),
    };
  });
  return paths;
};

/**
 * Generate all existing tags based for known models
 * @returns a swagger compatible tags object
 */
exports.provideTags = () => {
  return [authenticationTag].concat(
    models.map((model) => {
      // name of a tag
      return { name: `${model.toUpperCase()} operations` };
    })
  );
};

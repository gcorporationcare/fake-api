/**
 * Description of models and objects
 */
module.exports = {
  components: {
    schemas: {
      id: {
        type: 'integer', 
        description: 'Unique identifier for a given record', 
        example: '1', 
      },
      Album: {
        type: 'object', 
        properties: {
          id: {
            type: 'integer', 
            description: 'Unique identifier for a given record', 
            example: 1, 
          },
          title: {
            type: 'string', 
            description: 'Album\'s title', 
            example: 'Coding in JavaScript', 
          },
          userId: {
            type: 'integer', 
            description: 'The identifier of an existing user', 
            example: 2,
          },
        },
      },
      Comment: {
        type: 'object', 
        properties: {
          id: {
            type: 'integer', 
            description: 'Unique identifier for a given record', 
            example: 1, 
          },
          name: {
            type: 'string', 
            description: 'Comment\'s owner name', 
            example: 'John DOE', 
          },
          body: {
            type: 'string', 
            description: 'Comment\'s body', 
            example: 'This API is great', 
          },
          email: {
            type: 'string', 
            description: 'Comment\'s owner email', 
            example: 'john-doe@mail.com', 
          },
          postId: {
            type: 'integer', 
            description: 'The identifier of an existing post', 
            example: 4,
          },
        },
      },
      Photo: {
        type: 'object', 
        properties: {
          id: {
            type: 'integer', 
            description: 'Unique identifier for a given record', 
            example: 1, 
          },
          title: {
            type: 'string', 
            description: 'Photo\'s name', 
            example: 'Beach.png', 
          },
          url: {
            type: 'string', 
            description: 'Photo\'s url', 
            example: 'http://fake-api/photos/beach.png',
          },
          thumbnailUrl: {
            type: 'string', 
            description: 'Photo\'s thumbnail url', 
            example: 'http://fake-api/thumbnails/beach.png',
          },
          albumId: {
            type: 'integer', 
            description: 'The identifier of an existing album', 
            example: 5,
          },
        },
      },
      Post: {
        type: 'object', 
        properties: {
          id: {
            type: 'integer', 
            description: 'Unique identifier for a given record', 
            example: 1, 
          },
          title: {
            type: 'string', 
            description: 'Post\'s subject', 
            example: 'Learning Postman', 
          },
          body: {
            type: 'string', 
            description: 'Comment\'s body', 
            example: 'A brand new way of learning things', 
          },
          userId: {
            type: 'integer', 
            description: 'The identifier of an existing user', 
            example: 6,
          },
        },
      },
      Todo: {
        type: 'object', 
        properties: {
          id: {
            type: 'integer', 
            description: 'Unique identifier for a given record', 
            example: 1, 
          },
          title: {
            type: 'string', 
            description: 'Task\'s name', 
            example: 'Attends meeting', 
          },
          completed: {
            type: 'boolean', 
            description: 'Marking task as completed', 
            example: true, 
          },
          userId: {
            type: 'integer', 
            description: 'The identifier of an existing user', 
            example: 7,
          },
        },
      },
      Company: {
        type: 'object', 
        properties: {
          name: {
            type: 'string', 
            description: 'Company\'s name', 
            example: 'Bouygues-Construction', 
          },
          catchPhrase: {
            type: 'string', 
            description: 'Company\'s slogan', 
            example: 'Working on Odoo is a real pleasure.',
          },
          bs: {
            type: 'string', 
            description: 'Company\'s bs', 
            example: 'harness the power of ERPs',
          },
        },
      },
      Location: {
        type: 'object', 
        properties: {
          latitude: {
            type: 'number', 
            description: 'A latitude value', 
            example: -43.9509, 
          },
          longitude: {
            type: 'number', 
            description: 'A longitude value', 
            example: 81.1496, 
          },
        },
      },
      Address: {
        type: 'object', 
        properties: {
          street: {
            type: 'string', 
            description: 'The street name/number', 
            example: 'Blvd Al Qods', 
          },
          suite: {
            type: 'string', 
            description: 'A suite/building/villa number', 
            example: 'Apt. 556', 
          },
          city: {
            type: 'string', 
            description: 'A city name', 
            example: 'Gwenborough', 
          },
          zipcode: {
            type: 'string', 
            description: 'A zip code', 
            example: '92998-3874', 
          },
          geo: {
            $ref: '#/components/schemas/Location' 
          },
        },
      },
      User: {
        type: 'object', 
        properties: {
          id: {
            type: 'integer', 
            description: 'Unique identifier for a given record', 
            example: 1, 
          },
          name: {
            type: 'string', 
            description: 'User\'s name', 
            example: 'John DOE', 
          },
          role: {
            type: 'string', 
            description: 'User\'s role', 
            enum: ['Standard', 'Administrator']
          },
          username: {
            type: 'string', 
            description: 'A public name for user', 
            example: 'secret-john',
          },
          email: {
            type: 'string', 
            description: 'A unique email address for user', 
            example: 'user-1@bouygues-construction.com',
          },
          phone: {
            type: 'string', 
            description: 'User\'s phone number', 
            example: '1-770-736-8031 x56442',
          },
          website: {
            type: 'string', 
            description: 'User\'s website', 
            example: 'google.com',
          },
          address: {
            $ref: '#/components/schemas/Address' 
          },
          company: {
            $ref: '#/components/schemas/Company' 
          },
        },
      },
      Page: {
        type: 'object',
        properties: {
          page: {
            type: 'integer', 
            description: 'Page number (starting with 1)', 
            example: 3
          },
          size: {
            type: 'integer', 
            description: 'Page size', 
            example: 10
          },
          count: {
            type: 'integer', 
            description: 'Number of element in received page', 
            example: 7
          },
          totalElements: {
            type: 'integer', 
            description: 'Total number of records in database', 
            example: 27
          },
          totalPages: {
            type: 'integer', 
            description: 'Total number of pages', 
            example: 3
          },
          data: {
            type: 'array', 
            description: 'The page content, of a single type depending on called API', 
            items: {
              anyOf: [
                { $ref: '#/components/schemas/Album' },
                { $ref: '#/components/schemas/Comment' },
                { $ref: '#/components/schemas/Photo' },
                { $ref: '#/components/schemas/Post' },
                { $ref: '#/components/schemas/Todo' },
                { $ref: '#/components/schemas/User' },
              ]
            }
          },
        },
      },
      // Error model
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string', 
            description: 'Error message', 
            example: 'Unauthorized',
          },
          code: {
            type: 'integer', 
            description: 'Error HTTP Status code', 
            example: 500
          },
          stack: {
            type: 'string', 
            description: 'Stack of error if some', 
            example: 'TypeError: Cannot read property \'operator\' of undefined'
          },
        },
      },
      NotFoundError: {
        type: 'object',
        properties: {
          message: {
            type: 'string', 
            description: 'Error message', 
            example: 'Not found',
          },
          code: {
            type: 'integer', 
            description: 'Error HTTP Status code', 
            example: 404
          }
        },
      },
    },
  },
};
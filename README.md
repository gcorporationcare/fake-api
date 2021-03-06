# Fake-api

Fake rest API for helping developers having test APIs when writing frontend applications.
This project was generated with Node JS version 14.17.4.

## Development server

Run `node index.js` for a dev server, the root URL is `http://localhost:3000/`.</br>
You must restart the app every time you change any of the source files, unless you want to enable _live-reload_ feature, in such a case, you should run `npm run dev`.

## API documentation

### Authentication

All **GET** requests are publicly accessible.
However, when creating, updating or removing data, an **JWT Bearer token** will be required.

In order to obtain one, this API also provide endpoints for dealing with authentication:

- **[/auth/login](http://localhost:3000/auth/login)**: Create new tokens for user (access token has a 3 minutes lifespan).

  ```js
  fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'John',
      password: 'MyPassword',
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
    "accessToken": "<accessToken>", // This token expires in 3 minutes"
    "refreshToken": "<refreshToken>" // This token only expires on logout or restart"
  }
  ```

- **[/auth/token](http://localhost:3000/auth/token)**: Generate new access token from refresh token.

  ```js
  fetch('http://localhost:3000/auth/token', {
    method: 'POST',
    body: JSON.stringify({
      token: '<refreshToken>',
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
    "accessToken": "<accessToken>", //A new access token which expires in 3 minutes"
    "refreshToken": null
  }
  ```

- **[/auth/logout](http://localhost:3000/auth/logout)**: Remove refresh token from memory (make it unusable for generating new access tokens).

  ```js
  fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    body: JSON.stringify({
      token: '<refreshToken>',
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
    "date": "2021-01-01T00:00:00.007Z",
    "loggedOut": true // False mean that the refresh token weren't found in memory.
  }
  ```

- **[/auth/whoami](http://localhost:3000/auth/whoami)**: Getting current authenticated user.

  ```js
  fetch('http://localhost:3000/auth/whoami', {
    method: 'GET',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer <accessToken>',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
    "id": 1,
    "name": "Leanne Graham",
    "role": "Standard",
    "title": "Geek",
    "username": "Bret",
    "password": "password123",
    "email": "Sincere@april.biz",
    "address": {...},
    "phone": "1-770-736-8031 x56442",
    "website": "hildegard.org",
    "company": {...}
  }
  ```

### Endpoints

This API provide 6 different resources available at the following URLs:

- **[/albums](http://localhost:3000/albums)**: 100 albums
- **[/comments](http://localhost:3000/comments)**: 500 comments
- **[/photos](http://localhost:3000/photos)**: 5000 photos
- **[/posts](http://localhost:3000/posts)**: 100 posts
- **[/todos](http://localhost:3000/todos)**: 200 todos
- **[/users](http://localhost:3000/users)**: 10 users

**Note**: These data are copied from [JsonPlaceHolder](http://localhost:3000/) and saved in the data folder of this repository.

### Routes

Note that all GET routes are publicly accessible (no authentication required) while POST/PUT/DELETE need an authorization header.

Each previously mentioned resource define the following operations:

- **GET**: For fetching page of data (see pagination section).

  ```js
  fetch('http://localhost:3000/posts')
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
   "page": 1,
   "size": 10,
   "count": 10,
   "totalElements": 100,
   "totalPages": 10,
   "data": [
       {
           "userId": 1,
           "id": 1,
           "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
           "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
       },
       ...
   ]
  }
  ```

- **GET**: For fetching a single record by its ID.

  ```js
  fetch('http://localhost:3000/posts/1')
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
  }
  ```

- **POST**: For creating new data (no data validation but **authentication required**).

  ```js
  fetch('http://localhost:3000/posts', {
    method: 'POST',
    body: JSON.stringify({
      title: 'foo',
      body: 'bar',
      userId: 1,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer <accessToken>',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
    "id": 101,
    "title": "foo",
    "body": "bar",
    "userId": 1
  }
  ```

- **PUT**: For updating the record with provided ID (no data validation but **authentication required**).

  ```js
  fetch('http://localhost:3000/posts/1', {
    method: 'PUT',
    body: JSON.stringify({
      id: 1,
      title: 'foo',
      body: 'bar',
      userId: 1,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer <accessToken>',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
  ```

  Output

  ```json
  {
    "id": 101,
    "title": "foo",
    "body": "bar",
    "userId": 1
  }
  ```

- **DELETE**: For removing the record with provided ID (**authentication required**).

  ```js
  fetch('http://localhost:3000/posts/1', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer <accessToken>',
    },
  });
  ```

  Output

  ```json
  {
    "removed": 1
  }
  ```

- **DELETE**: For removing all records (**authentication required**).

  ```js
  fetch('http://localhost:3000/posts', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer <accessToken>',
    },
  });
  ```

  Output

  ```json
  {
    "removed": 100
  }
  ```

**Note**: These data are copied from [JsonPlaceHolder](https://jsonplaceholder.typicode.com/) and saved in the data folder of this repository.<br/>
Also keep in mind that the data will be restarted to default one every time you restart your Node JS application.

### Pagination

This API provide a pagination feature with the following key words:

- **page**: One-based index of the page to display (if none provided, the default value **1** will be used).

- **size**: Number of records to display on each page (if none provided, the default value **10** will be used).

The following request will browse the third page, each page containing 15 records.

```js
fetch('http://localhost:3000/posts?page=3&size=15')
  .then((response) => response.json())
  .then((json) => console.log(json));
```

### Filtering

This API provide a filtering feature triggered by the keyword **filters** in URL query parameters.<br/>

> Each filtering operation is a new query parameter **filters** added to the URL.<br/>

> Operands in a single operation are delimited by a **colon** ("**,**").

> Final URL will be similar to http://hostname/modelname?filters=**field_1,operator_1,value_1**&filters=**field_2,operator_2,value_2**...

The API currently supports these operators:

- **equal**: ==
- **not equal**: !=
- **greater than**: >
- **greater than or equal**: >=
- **lesser than**: <
- **lesser than or equal**: <=
- **in**: in
- **not in**: notIn
- **like**: like
- **not like**: notLike

Here are some examples (note that the filters param values may need escaping depending on your system):

- http://localhost:3000/posts?page=1&size=5&**filters=title,==,eum et est occaecati**<br/>
  This request will give us a single record since only one record have matching title.

- http://localhost:3000/posts?page=1&size=5&**filters=noId,==,eum et est occaecati**<br/>
  This request will not give any result since the field named **noId** does not exist on model post.

- http://localhost:3000/posts?page=1&size=5&**filters=title,>,a**&**filters=id,>,10**&**filters=id,in,12;13**<br/>
  This request will return exactly 2 records since only 2 posts have a _title_ greater than _a_ **and** an _id_ greater than _10_ **and** an _id_ in the array _[12, 13]_.

Please also note that you can do (basic) logical operations between one filter operations and the previously applied ones.
By default, when multiple filtering operations are applied, the API will do an **and-operation** (condition_N && condition_N+1 &&...).
You can alter this behavior by prefixing the field's name of the next operation with a **pipe (|)**. (condition_N || condition_N+1 || ...).
All operations are applied in FIFO, without any relation of priority between them: `condition_N || condition_N+1 && condition_N+2` will apply the mathematical operation `(condition_N || condition_N+1) && condition_N+2`.

- http://localhost:3000/posts?page=1&size=10&**filters=id,in,2;4;6;8;10;12;14**&**filters=id,in,3;6;9;12**<br/>
  This request return the posts with the IDs **6** & **12** since they are the sole intersections between the set `2;4;6;8;10;12;14` and the set `3;6;9;12`.

- http://localhost:3000/posts?page=1&size=10&**filters=id,in,2;4;6;8;10;12;14**&**filters=|id,in,3;6;9;12**<br/>
  This request return 9 posts which have their IDs in at least one of two sets: the set `2;4;6;8;10;12;14` and the set `3;6;9;12`.
  > Mark the presence of the pipe character **|** at the start of the second filters parameter which act like a **or**.

### Sorting

This API provide a sorting feature triggered by the keyword **sortBy** in URL query parameters.<br/>

> Each sorting operation is a new query parameter **sortBy** added to the URL.<br/>

> For a single sorting operation, we must retrieve the field of the record to base the sorting on, and also the direction of this sorting, separated from field's name by a **colon** ("**,**").

> Final URL will be similar to http://localhost:3000/posts?**sortBy=field_1,direction_1**&**sortBy=field_2,direction_2**...

The API currently supports these two directions:

- **asc**: Sorting in an ascending order based on field's value.
- **desc**: Sorting in a descending order based on field's value.

Please note that if you omit the direction in the sortBy parameter's value, it will be considered as an ascending sorting direction.
Also note that when no sorting instructions is provided in URL, the API will return the results by sorting them on their ID.

Here are some examples:

- http://localhost:3000/posts?page=1&size=5&**sortBy=id,desc**<br/>
  This request will returns the posts sorted by their ID in a descending order.

- http://localhost:3000/posts?page=1&size=5&**sortBy=userId,desc&sortBy=title,desc**<br/>
  This request will returns the posts sorted by their userId in a descending order, then each userId records being sorted by title.

### Swagger

This API also exposes its documentation by using Swagger features. This documentation is available under the endpoint: **http://localhost:3000/api-docs**.

The Swagger definition can also imported in other tools like **Postman**; to do so, just provide Postman with the JSON documentation available at **http://localhost:3000/swagger.json**.

### TODO

These features will eventually be implemented later:

- nested lookup (applying filtering on nested models)
- nested sorting (applying sorting on nested models)

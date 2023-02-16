# Linode JavaScript SDK

JavaScript client for the [Linode APIv4](https://developers.linode.com/api/v4)

## Installation

```
$ npm install @linode/api-v4
```

or with yarn:

```
$ yarn add @linode/api-v4
```

or with a CDN:

```js
<script src="https://unpkg.com/@linode/api-v4/lib/index.global.js"></script>
```

## Usage

Most APIv4 endpoints require authentication, either with an OAuth Token or Personal Access Token (PAT). Please [see the Linode API docs](https://developers.linode.com/api/v4/#access-and-authentication) for instructions on obtaining a token.

Once you have your token, authenticating involves adding an Authorization header to each request. We provide a helper setToken function for this purpose:

```js
import { setToken } from '@linode/api-v4';

setToken('my-access-token');
```

If you would like more fine-grained control, this library is built on top of [the Axios HTTP Client](https://github.com/axios/axios). We expose our base Axios instance, which
you can use to attach interceptors:

```js
import { baseRequest } from '@linode/api-v4/lib/request';

/**
 * intercepts every request with the following config
 * see https://github.com/axios/axios#interceptors for more documentation.
 */
baseRequest.interceptors.request.use((config) => {
  const myToken = '1234';

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${myToken}`,
    },
  };
});
```

```js
/** index.js */

import './request';
import { getAccount } from '@linode/api-v4/lib/account';

getAccount()
  .then((response) => {
    document.getElementById('root').innerHTML = `<div>${response.email}</div>`;
  })
  .catch((e) => {
    console.error(e);
  });
```

Or using Node.js:

```js
const { setToken, getProfile } = require('@linode/api-v4');

setToken('access-token');

getProfile().then((response) => {
  return response.username;
});
```

Other examples:

- [React and TypeScript](./REACT.md)
- Angular (example wanted)
- Vue (example wanted)

### Tree Shaking

All methods are exposed from the SDK root, but we also support tree shaking:

```js
import { getLinodes } from '@linode/api-v4'; // This is fine
import { getLinodes } from '@linode/api-v4/lib/linodes'; // This works too
```

#### Important note about imports

If you are using interceptors on the base request, you should keep your import paths consistent (import either from root or from `/lib`) or else the interceptors will not work.

```js
import { baseRequest } from '@linode/api-v4';
import { getLinodes } from '@linode/api-v4/lib/linodes';

baseRequest.interceptors.use(customInterceptor);
getLinodes(); // customInterceptor not called!

// To fix, change the first import to:
// import { baseRequest } from '@linode/api-v4/lib/request';
//
// (or, import getLinodes from '@linode/api-v4')
```

### Pagination and Filtering

APIv4 supports [pagination](https://developers.linode.com/api/v4/#pagination) and [filtering and sorting](https://developers.linode.com/api/v4/#filtering-and-sorting). Paginated endpoints include the current page, total number
of pages, and total number of results in the response:

```js
import { getLinodes } from '@linode/api-v4/lib/linodes';

getLinodes().then((response) => {
  console.log(response);
});

/*
  {
    page: 1,
    pages: 1,
    results: 9,
    data: [...]
  }
*/
```

Where appropriate, SDK functions allow you to pass
pagination and filter parameters to the API:

```js
// Return page 2 of Linodes, with a page size of 100:
getLinodes({ page: 2, pageSize: 100 });

// Return all public Linode Images:
getImages({}, { is_public: true });
```

The [API docs](https://developers.linode.com/api/v4) provide a list of which response fields are filterable,
as well as examples of more complex filtering and sorting operations.

### Types

This library comes with TypeScript definitions so no need to write your own or find them elsewhere online. Just import the functions as normal and they should play nicely with TypeScript!

Most types can be imported from their corresponding pathname. For instance:

```js
import { Linode } from '@linode/api-v4/lib/linodes';
```

More general types (such as the error shape that comes back from the Linode APIv4) can be found in the `/types` directory:

```js
import { APIError } from '@linode/api-v4/lib/types';
```

You can also import from the root if preferred:

```js
import { APIError, Linode } from '@linode/api-v4';
```

## Contributing

This SDK aims to have a 1-to-1 relationship with the endpoints exposed from the Linode APIv4, but endpoints are being added all the time, so it's entirely possible that the SDK is incomplete. If you see an endpoint in the [API docs](https://developers.linode.com/api/v4) that doesn't exist in this package, don't hesitate to open a PR and add the function and typings that consume the endpoint. If you don't feel comfortable opening a PR, [feel free to open a ticket](https://github.com/linode/manager/issues/new).

We'll do our best to publicize what work needs to be done in the GitHub issues and mark tickets as a _good first issue_. That way, it will be more apparent where the SDK needs work.

When in doubt, look at the code that already exists and mimic that.

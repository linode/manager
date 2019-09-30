# Linode JavaScript SDK

This directory contains all the code for the client-side wrapper around Linode's APIv4, written in JavaScript

## Installation

To install the project to your app, run:

```
$ npm install linode-js-sdk
```

or with yarn:

```
$ yarn add linode-js-sdk
```

or with a CDN:

```js
<script src="https://unpkg.com/linode-js-sdk/index.js"></script>
```

## Using the SDK and Examples

The first step in using the SDK is to authenticate your requests, either with an OAuth Token or Personal Access Token (PAT). Please [see the Linode API docs](https://developers.linode.com/api/v4/#access-and-authentication) in order to either get an OAuth Token or PAT so that you can authenticate your requests.

Once you have your token, authenticating involves adding headers to each request. This library is built on top of [the Axios HTTP Client](https://github.com/axios/axios), so most features that are built into Axios are fair game here. Here's an example of how to authenticate all of your requests:

```js
/** request.js */

import { baseRequest } from 'linode-js-sdk/lib/request'

/** 
 * intercepts every request with the following config
 * see https://github.com/axios/axios#interceptors for more documentation.
 */
baseRequest.interceptors.request.use(config => {
  const myToken = '1234'

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${myToken}`
    }
  };
});
```

```js
/** index.js */

import './request'
import { getAccount } from 'linode-js-sdk/lib/account'

getAccount()
  .then(response => {
    document.getElementById('root').innerHTML = `<div>${response.data.email}</div>`
  })
  .catch(e => {
    console.error(e)
  })
```

Alternatively, check out the following examples using other frameworks:

* [React and TypeScript](./REACT.md)
* Angular (example wanted)
* Vue (example wanted)

## Contributing 

This SDK aims to have a 1-to-1 relationship with the endpoints exposed from the Linode APIv4, but endpoints are being added all the time, so it's entirely possible that the SDK is incomplete. If you see an endpoint in the [API docs](https://developers.linode.com/api/v4) that doesn't exist in this package, don't hesitate to open a PR and add the function and typings that consume the endpoint. If you don't feel comfortable opening a PR, [feel free to open a ticket](https://github.com/linode/manager/issues/new).

We'll do our best to publicize what work needs to be done in the GitHub issues and mark tickets as a _good first issue_. That way, it will be more apparent where the SDK needs work.

When in doubt, look at the code that already exists and mimic that.

## TypeScript

This library comes with TypeScript definitions so no need to write your own or find them elsewhere online. Just import the functions as normal and they should play nicely with TypeScript!

Most types can be imported from their corresponding pathname. For instance:

```js
import { Linode } from 'linode-js-sdk/lib/linodes'
```

More general types (such as the error shape that comes back from the Linode APIv4) can be found in the `/types` directory:

```js
import { APIError } from 'linode-js-sdk/lib/types'
```

You can also import from the root if preferred:

```js
import { APIError, Linode } from 'linode-js-sdk'
```
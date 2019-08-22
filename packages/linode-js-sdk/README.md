# Linode JavaScript SDK

This directory contains all the code for the client-side wrapper around Linode's APIv4, written in JavaScript

## Installation

To install the project to your app, run

```
$ npm install linode-js-sdk
```

or with yarn

```
$ yarn add linode-js-sdk
```

or to use a CDN

```js
<script src="https://unpkg.com/linode-js-sdk/index.js"></script>
```

## Using the SDK

The first step in using the SDK is to authenticate your requests, either with an OAuth Token or Personal Access Token (PAT). Please [see the Linode API docs](https://developers-linode.netlify.com/api/v4/#access-and-authentication) in order to either get an OAuth Token or PAT so that you can authenticate your requests.

Once you have your token, authenticating involves adding headers to each request. This library is build [from the Axios HTTP Client](https://github.com/axios/axios), so most features that are built into Axios are fair game here. Here's an example of how to authenticate all of your requests.

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

import 'request.js'
import { getAccount } from 'linode-js-sdk/lib/account'

getAccount()
  .then(response => {
    document.getElementById('root').innerHTML = `<div>${response.data.email}</div>`
  })
  .catch(e => {
    console.error(e)
  })
```

## Contributing

## TypeScript

This library comes with TypeScript definitions so no need to write your own or find them elsewhere online. Just import the functions as normal and they should play nicely with TypeScript!
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

//////// FOR INTERNAL CONTRIBUTORS. REVISE THIS LATER /////////

Migrating service functions over from Cloud Manager to the JavaScript SDK is relatively straightforward, and involves a few steps.

1. Find a service function you want to move. All of these are located in `/pacakges/manager/src/services`. For example:

```js
/** packages/manager/src/services/account/account.ts */

/**
 * updateAccountInfo
 *
 * Update your contact or billing information.
 *
 */
export const updateAccountInfo = (data: Partial<Linode.Account>) =>
  Request<Linode.Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('PUT'),
    setData(data, updateAccountSchema)
  ).then(response => response.data);
```

2. Since this is an account function, we need to move it to `packages/linode-js-sdk/src/account/account.ts`

3. We also need to make sure that both the Yup Schema and the Type Interfaces are moved over as well.
   * The type definition `Linode.Account` will need to be moved to `packages/linode-js-sdk/src/account/types.ts`
   * The Yup Schema will need to move to `packages/linode-js-sdk/src/account/account.schema.ts`
  
4. The final step is removing all this code from Cloud Manager.
   * Most of the interfaces for the Linode namespace are located in the `types` directory. In this case, `Linode.Account` is located at `packages/manager/src/types/Account.ts`.
   * The schema should be located in the same directory as the service directory for the function you are moving.

After these steps are completed, you'll want to start both the Cloud Manager and Linode JS SDK projects and make sure there are no type errors and that everything is compiling correctly.

## TypeScript

This library comes with TypeScript definitions so no need to write your own or find them elsewhere online. Just import the functions as normal and they should play nicely with TypeScript!

## Licence

Hello world
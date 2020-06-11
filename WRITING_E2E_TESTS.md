# Writing E2E with Cypress

## Intro

Cypress is a framework using multiple tools such as pupeteer, JQuery, SinonJS, Chai etc.
In very short its parts are:
  - a Runner (main process in NodeJs)
  - an Interative dashboard **Only in Debug: `yarn cy:debug`**
  - It launches a browser and runs tests by manipulating the browser through Pupeteer
  - It can run background tasks in NodeJs (the plugins)

**Important point for the developer**
  - the integration tests are running in the browser side (and dependencies: fixtures, Cypress commands)
  - the plugins are executed in NodeJs in independant process
  - **`cy.get` or equivalent function are Async and return Cypress wrapped objects and AWAIT should not be used with it**
  - Do not do `const el = cy.get('#element')` and use it later in the code it will probably not work, see **dettached from DOM**

## Visiting a page
You can only visit under the path of your base RUL `cloud.linode.com` or `localhost:3000`
You can not visit `google.com`.
See more under the section 'API must be behind the same path as the app tested'

Visiting with Login: `cy.visitWithLogin(url)` to automatically reinject the login data in the local storage.

# Getting, using UI element
## waiting for a UI element to be visible

When you get an element you will use `cy.get` or variants:
  - `cy.findByText`
  - `cy.findByLabelText`

This returns a Cypress Wrapped object which works somewhat like a chainable promise and has methods to execute assertions, accessors on the DOM Element.

### DO NOT use promise, await/async (it won t work)

This is an **ASYNC** call, but **it does not return a promise**.
As a consequence you cannot use `await` or other ES6 Promise tools.

### Get can return a Collection
```js
cy.get('[data-qa-blog-post]')
      .should('have.length.gte', 3)
      .each(nativeBlogPostElement => {
          // do something
      });
```

### How to call a function on an object of the DOM
use `invoke` to access an attribute of an element wrapped by Cypress
(here)[https://docs.cypress.io/api/commands/invoke.html#Syntax]

### Access attributes like you would with jQuery
use `its` to access an attribute of an element wrapped by Cypress
(here)[https://docs.cypress.io/api/commands/its.html#Usage]

### You can Wrap a native object into a Cypress object
use `wrap` to wrap an native element into a cypress object
(here)[https://docs.cypress.io/api/commands/wrap.html#Usage]

**Why do this?**
*Here i need to access an attribute of an object, as this will be executed asynchronously in the browser i wrap it first in a Cypress object to then use Invoke and check that attribute*
```js
// using wrapo to have access to invoke on a native element
cy.get('[data-qa-blog-post]')
      .should('have.length.gte', 3)
      .each(nativeBlogPostElement => {
        // calling attr('href') using jquery on the element asynchronously
        cy.wrap($e)
          .invoke('attr', 'href')
          .should('startWith', 'https://www.linode.com');
      });
```

*Another example, I Want to use an alias with `as`
You can see more about aliases but in short, if i create an alias on a variable i can later in any Cypress asynchronous context get it s value through `cy.get('@myAlias')`.*
```js
    // variable i want to use later
    const xhrData = [];
    // creating an alias with `as`
    cy.wrap(xhrData).as('xhrData');
    cy.server({
      // Here we handle all requests passing through Cypress' server
      onRequest: req => {
        xhrData.push(req);
      }
    });
    // a lot of things i do with visiting a page running requests, tests
    cy.get('@xhrData')
      .its('length')
      .should('be.lte', MAX_GET_REQ_TO_API);
```
### Consider checking if the element is visible
This is not necessary, but good practice if an element due to loading is in the DOM but Hidden.
`cy.get('#id').should('be.visible')`

### element dettached from DOM [ERROR]
See more about this error: https://docs.cypress.io/guides/references/error-messages.html#cy-failed-because-the-element-you-are-chaining-off-of-has-become-detached-or-removed-from-the-dom

In short because of how OPA with React work, a component could be unmounted from the dom and recreated.

This means for instance that if you have a few tabs and did
```js
// geting tab 1 & 2 using the title of the tabs
const tab1 = cy.findByText('tab 1');
const tab2 = cy.findByText('tab 2');
// should pass
tab1.should('be.visible');
// should work
tab1.click();
// triggers rerender of tab headers
// WILL FAIL
tab2.should('be.visible');
// should work
cy.findByText('tab 2').should('be.visible')
```

Therefore in tems of style do:
```js
cy.findByText('tab 1').should('be.visible').click();
cy.findByText('tab 2').should('be.visible');
```

If you want to factorize that code, create a function, for instance:
```js
const getTab1 = () => cy.findByText('tab 1').should('be.visible');
// ...
// in the test
getTab1().click();
cy.findByText('tab 2').should('be.visible');
```

## Working with your API requests
### Mocking API responses
**this only works on requests on the same path as your app**

This is quite easy to read, here i mock a path GET method and always return a response specified by response.
```js
cy.server()
cy.route({
    method:'GET', url: '/path/entities',
    response: {
        data:[], number:0
    }
})
```

### waiting for an api request to be done
You may want to do this to wait for data to be available or because you want to check the response status
Example, Checking if the creation of an object is successful:

```js
cy.server();
// create an alias on a request
cy.route({
    method: 'POST',
    url: '/v4/domains/*/record*'
}).as('apiCreateRecord');
// go to the page and trigger a domain record creation
// Using the name `@alias` we wait for the request top complete
cy.wait('@apiCreateRecord')
    .its('status')
    .should('be', 200);
```

### making XHR requests directly
Using `cy.request` is much faster and lightweight than request launched by the browser.

Although, They are not wrapped by the `cy.server` and cannot be mocked.

If you need to make an external call (not behind `cloud.linode.com/api/v4`) then you HAVE TO use    cy.request`

## Tools usable with Cypress
### testing-library
https://testing-library.com/docs/cypress-testing-library/intro

gives us great patterns for testing such as `findByText` or `findByLabelText`.
**Why**
Because we want our test to not rely on non semantic HTML, and be easity readable. (learn more)[https://testing-library.com/docs/intro]

### assertion
*we added `chai-string` to the supported assertions*
There is 2 ways of executing tests, using `except(obj)` or `cypressObj.should(<assertionString>)`
These approach are equivalent, although it is very often natiural to use `should` as `cy.get` calls return a Cypress wrapped object asynchronously.

```js
cy.get('#id').should('be.visible')
// often easier than
cy.get('#id').then(element => expect(element).to.be.visible()
```

*the disavantage of this approch is the risk of mistyping that string, and the repetition of this string*

(learn)[https://docs.cypress.io/guides/references/assertions.html#Chai]

### momentJs
Is built in cypress if you need to parse, format dates

## Configuration and environment
The configuration is set by a few files:
- `cypress.json`
  - specifies the base URL of the app and some general settings
- `.env`
  - MANAGER_OAUTH = personal access token to api in your cloud profile Access token
  - REACT_APP_CLIENT_ID = id of the oauth app for the development server of the app, see (GETTING_STARTED)[GETTING_STARTED.md]
  - REACT_APP_API_ROOT = `http://localhost:3000`
  - REACT_APP_LOGIN_ROOT = `https://login.linode.com`
  - REACT_APP_API_ROOT = `https://api.linode.com/v4`


## Other
### Visual regression tests

When you write a new Visual regression test with cypress and used `checkSnapshot()` you need to record the correct snapshot.

1. run `yarn cy:rec-snap` which launches Cypress with the Dashboard, run the tests for which you need to record snapshots
2. Commit the `screenshots/<your test>/record-*.png`

**WARNING**
Visual regression tests are run on Chrome, and may not work accross browsers,
When writing a visual regression trest make sure that:
  - the section you check is well withing the viewport
  - that it may not be rendered differently in the CI/CD pipeline
  - That you ran the tests on docker `yarn cy:docker` at least once
  - DO NOT commit `diff-*.png` or `actual-*.png` files
  - **If you rename a test, rename the folder/files with the snapshots to match the new test file and test name**


## Important other technical points to know

### Typescript
Cypress since 4.8.0 is compatible with Ts without any webpack set up.

**Why do we use it?**
*the main reason, is that iis easier to add Typecript support now than once the project has a lot of code, while we still authorize pure Js style code and implicit Any for simplicity, this enables us to add typing when our codebase grows*


### API must be behind the same path as the app tested
This is because `cy.route()` works only using the `cy.server()`.
This server wraps all requests of the app to record them and debug them, mock them.

As a consequence any path that is not uder your base url `cloud.linode.com` `localhost:3000` cannot be mocked or visited.

### You can not block calls to specific endpoints
Here i want to talk about the case where you would like to block your app from calling some URL the same way that you would using the dev tools to see what happens if your app is offline or if some specific endpoints are off.

This is related to the server not covering foreign URL, the Cypress team is working on this.
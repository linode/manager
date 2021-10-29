# Testing

## Unit Tests

The unit tests for Cloud Manager are written in Typescript using the [Jest](https://facebook.github.io/jest/) testing framework. Unit tests end with either `.test.tsx` or `.test.ts` file extensions and can be found throughout the codebase.

To run tests, first build the **api-v4** package:

```
yarn install:all && yarn workspace @linode/api-v4 build
```

Then you can start the tests:

```
yarn test
```

Or you can run the tests in watch mode with:

```
yarn test --watch
```

To run a specific file or files in a directory:

```
yarn test myFile.test.tsx
yarn test src/some-folder
```

Jest has built-in pattern matching, so you can also do things like run all tests whose filename contains "Linode" with:

```
yarn test linode
```

To run a test in debug mode, add a `debugger` breakpoint inside one of the test cases, then run:

```
yarn workspace linode-manager run test:debug
```

Test execution will stop at the debugger statement, and you will be able to use Chrome's normal debugger to step through the tests (open `chrome://inspect/#devices` in Chrome).

### React Testing Library

We have some older tests that still use the Enzyme framework, but for new tests we generally use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). This library provides a set of tools to render React components from within the Jest environment. The library's philosophy is that components should be tested as closely as possible to how they are used.

A simple test using this library will look something like this:

```js
import { renderWithTheme } from "src/utilities/testHelpers";
import Component from "./wherever";

describe("My component", () => {
  it("should have some text", () => {
    const { getByText } = renderWithTheme(<Component />);
    getByText("some text");
  });
});
```

Handling events such as clicks is a little more involved:

```js
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "src/utilities/testHelpers";
import Component from "./wherever";

const props = { onClick: jest.fn() };

describe("My component", () => {
  it("should have some text", () => {
    const { getByText } = renderWithTheme(<Component {...props} />);
    const button = getByText("Submit");
    fireEvent.click(button);
    expect(props.onClick).toHaveBeenCalled();
  });
});
```

If, while using the Testing Library, your tests trigger a warning in the console from React ("Warning: An update to Component inside a test was not wrapped in act(...)"), first check out the library author's [blog post](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning) about this. Depending on your situation, you probably will have to `wait` for something in your test:

```js
import { fireEvent, wait } from '@testing-library/react';

...
await wait(() => fireEvent.click(getByText('Delete')));
...
```

### Mocking

Jest has substantial built-in mocking capabilities, and we use many of the available patterns. We generally use them to avoid making network requests in unit tests, but there are some other cases (mentioned below).

In general, components that make network requests should take any request handlers as props. Then testing is as simple as passing `someProp: jest.fn()` and making assertions normally. When that isn't possible, you can do the following:

```js
jest.mock("@linode/api-v4/lib/kubernetes", () => ({
  getKubeConfig: () => jest.fn(),
}));
```

Some components, such as our ActionMenu, don't lend themselves well to unit testing (they often have complex DOM structures from MUI and it's hard to target). We have mocks for most of these components in a `__mocks__` directory adjacent to their respective components. To make use of these, just tell Jest to use the mock:

    jest.mock('src/components/ActionMenu/ActionMenu');

Any `<ActionMenu>`s rendered by the test will be simplified versions that are easier to work with.

#### Mocking Redux state

The `wrapWithTheme` and `renderWithTheme` helper functions take a `customStore` option, used as follows:

```tsx
import { renderWithTheme } from 'src/utilities/testHelpers.ts`;

const { getByTestId } = renderWithTheme(<MyComponent />, {
  customStore: {} // <-- Redux store specified here
});
```

The `customStore` prop is of type `DeepPartial<ApplicationState>`, so only the fields needed to satisfy the conditions of your test are needed.

Several helpers are available in `src/utilities/testHelpersStore.ts` to simulate common scenarios (withManaged, withRestrictedUser, etc).

#### Mocking feature flags

Another option the `wrapWithTheme` and `renderWithTheme` helper functions expose is `flags`, to supply custom feature flags:

```tsx
import { renderWithTheme } from 'src/utilities/testHelpers.ts`;

const { getByTestId } = renderWithTheme(<MyComponent />, {
  flags: { myFeature: true } // <-- Feature Flags specified here
});
```

#### Mocking with Mock Service Worker

We support mocking API requests both in test suites and the browser using the [msw](https://www.npmjs.com/package/msw) library. See [07-mocking-data](07-mocking-data.md) for more details.

These mocks are automatically enabled for tests (using `beforeAll` and `afterAll` in src/setupTests.ts, which is run when setting up
the Jest environment).

## End-to-End tests

We use [Cypress](https://cypress.io) for end-to-end testing. Test files are found in the `packages/manager/cypress` directory.

#### Running the E2E tests

1. Follow the [Getting Started guide](GETTING_STARTED.md) to get Cloud Manager running locally and get your .env setup.
2. Go to [cloud.linode.com/profile/tokens](https://cloud.linode.com/profile/tokens) and click "Add a Personal Access Token" to create a token to use for the `MANAGER_OAUTH` environment variable in `packages/manager/.env`.
3. In one terminal window, run the app with `yarn up`.
4. In another terminal window, run the tests with `yarn cy:e2e` (runs headlessly).
5. Alternatively, use the interactive interface with `yarn cy:debug`.
6. To run the tests against your PR in GitHub, add the `e2e` label
7. Look here for [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
8. [Cypress Plugins](https://docs.cypress.io/plugins/directory)
9. Test Example:
    ```tsx
    /* this test will not pass on cloud manager.
    it is only intended to show correct test structure, syntax,
    and to provide examples of patterns/methods commonly used in the tests */
    
    // start of a test block. Multiple tests can be nested within
    describe('linode landing checks', () => {
      // hook that runs before each test
       beforeEach(() => {
         // uses factory to build data (factories found in packages/manager/src/factories) 
          const mockAccountSettings = accountSettingsFactory.build({
            managed: false,
          });
          // mocks response with cy.intercept
           cy.intercept('GET', '*/account/settings', (req) => {
                req.reply(mockAccountSettings);
                //alias
            }).as('getAccountSettings');
        });
        // start of individual test block
      it('checks the landng page side menu items', () => {
          
          /* intercept only once method for when a call happens multiple times 
          but you only want to stub it once declared in `/cypress/support/ui/common.ts` */
           interceptOnce('GET', '*/profile/preferences*', {
              linodes_view_style: 'list',
              linodes_group_by_tag: false,
              volumes_group_by_tag: false,
              desktop_sidebar_open: false,
              sortKeys: {
                'linodes-landing': { order: 'asc', orderBy: 'label' },
                volume: { order: 'asc', orderBy: 'label' },
              },
            // intercept aliased as `getProfilePreferences`
            }).as('getProfilePreferences');

            /* uses .env variables for login authorization and navigates to /linodes page.
            `visitWithLogin` is found in /cypress/support/login.ts */
            cy.visitWithLogin('/linodes');
            // as page loads, wait by alias to mock state
            cy.wait('@getProfilePreferences');
            cy.wait('@getAccountSettings');

             /* `getVisible` defined in /cypress/support/helpers.ts 
             plus a few other commonly used commands shortened as methods */
             getVisible(`tr[data-qa-linode="${label}"]`).within(() => {
            // use `within` to search inside/use data from/assert on a specific page element
                cy.get(`[data-qa-ip-main]`)
                   // `realHover` and more real event methods from cypress real events plugin
                    .realHover()
                    .then(() => { 
                        getVisible(`[aria-label="Copy ${ip} to clipboard"]`);
                    });
                getVisible(`[aria-label="Action menu for Linode ${label}"]`);
             });
          // `findByText` and others from cypress testing library plugin
            cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.exist');
      });
    });
    ```
  
10. How to use intercepts:
    ```tsx
      // stub response syntax:
      cy.intercept('POST', ‘/path’, {response}) or cy.intercept(‘/path’, (req) => { req.reply({response})}).as('something');
	    // edit and end response syntax: 
      cy.intercept('GET', ‘/path’, (req) => { req.send({edit: something})}).as('something');
	    // edit request syntax:
      cy.intercept('POST', ‘/path’, (req) => { req.body.storyName = 'some name'; req.continue().as('something');
  
      // use alias syntax:
       wait(‘@something’).then({})
      ```



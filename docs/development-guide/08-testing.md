# Testing

## Unit Tests

The unit tests for Cloud Manager are written in Typescript using the [Vitest](https://vitest.dev/) testing framework. Unit tests end with either `.test.tsx` or `.test.ts` file extensions and can be found throughout the codebase.

To run tests, first ensure dependencies are installed and packages are built:

```shell
pnpm bootstrap
```

Then you can start the tests:

```shell
pnpm test
```

Or you can run the tests in watch mode with:

```shell
pnpm test:watch
```

To run a specific file or files in a directory:

```shell
pnpm test myFile.test.tsx
pnpm test src/some-folder
```

Vitest has built-in pattern matching, so you can also do things like run all tests whose filename contains "Linode" with:

```shell
pnpm test linode
```

### React Testing Library

This library provides a set of tools to render React components from within the Vitest environment. The library's philosophy is that components should be tested as closely as possible to how they are used.

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
import { userEvent } from '@testing-library/user-event';
import { renderWithTheme } from "src/utilities/testHelpers";
import Component from "./wherever";

const props = { onClick: vi.fn() };

describe("My component", () => {
  it("should have some text", async () => {
    const { getByText } = renderWithTheme(<Component {...props} />);
    const button = getByText("Submit");
    await userEvent.click(button);
    expect(props.onClick).toHaveBeenCalled();
  });
});
```

We recommend using `userEvent` rather than `fireEvent` where possible. This is a [React Testing Library best practice](https://testing-library.com/docs/user-event/intro#differences-from-fireevent), because `userEvent` more accurately simulates user interactions in a browser and makes the test more reliable in catching unintended event handler behavior.

If, while using the Testing Library, your tests trigger a warning in the console from React ("Warning: An update to Component inside a test was not wrapped in act(...)"), first check out the library author's [blog post](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning) about this. Depending on your situation, you probably will have to use [`findBy`](https://testing-library.com/docs/dom-testing-library/api-async/#findby-queries) or [`waitFor`](https://testing-library.com/docs/dom-testing-library/api-async/) for something in your test to ensure asynchronous side-effects have completed.

### Mocking

Vitest has substantial built-in mocking capabilities, and we use many of the available patterns. We generally use them to avoid making network requests in unit tests, but there are some other cases (mentioned below).

In general, components that make network requests should take any request handlers as props. Then testing is as simple as passing `someProp: vi.fn()` and making assertions normally. When that isn't possible, you can do the following:

```js
vi.mock('@linode/api-v4/lib/kubernetes', async () => {
  const actual = await vi.importActual<any>('@linode/api-v4/lib/kubernetes');
  return {
    ...actual,
    getKubeConfig: () => vi.fn(),
  };
});
```

Some components, such as our ActionMenu, don't lend themselves well to unit testing (they often have complex DOM structures from MUI and it's hard to target). We have mocks for most of these components in a `__mocks__` directory adjacent to their respective components. To make use of these, just tell Vitest to use the mock:

```js
    vi.mock('src/components/ActionMenu/ActionMenu');
```

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

We support mocking API requests both in test suites and the browser using the [msw](https://www.npmjs.com/package/msw) library. See [09-mocking-data](09-mocking-data.md) for more details.

These mocks are automatically enabled for tests (using `beforeAll` and `afterAll` in src/setupTests.ts, which is run when setting up the Vitest environment).

## End-to-End tests

We use [Cypress](https://cypress.io) for end-to-end testing. Test files are found in the `packages/manager/cypress/e2e` directory.

### First Time Setup

1. Follow the [Getting Started guide](../GETTING_STARTED.md) to set up your `packages/manager/.env` file and get Cloud Manager running locally.
2. Go to [cloud.linode.com/profile/tokens](https://cloud.linode.com/profile/tokens), click "Create a Personal Access Token", and create a token to use for your end-to-end tests.
    * Select a reasonable expiry time (avoid "Never") and make sure that every permission is set to "Read/Write".
3. Set the `MANAGER_OAUTH` environment variable in your `.env` file using your new personal access token.
    * Example of `.env` addition:

        ```shell
        # Manager OAuth token for Cypress tests:
        # (The real token will be a 64-digit string of hexadecimals).
        MANAGER_OAUTH='################################################################'
        ```

### Running End-to-End Tests

1. In one terminal window, run the app with `pnpm dev`.
2. In another terminal window, run all of the tests with `pnpm cy:run`.
    * Alternatively, use Cypress's interactive interface with `pnpm cy:debug` if you're focused on a single test suite.

#### Configuring End-to-End Tests

Cloud Manager UI tests can be configured using environment variables, which can be defined in `packages/manager/.env` or specified when running Cypress.

##### Cypress Environment Variables

These environment variables are used by Cypress out-of-the-box to override the default configuration. Cypress exposes many other options that can be configured with environment variables, but the items listed below are particularly relevant for Cloud Manager testing. More information can be found at [docs.cypress.io](https://docs.cypress.io/guides/guides/environment-variables).

| Environment Variable | Description                                | Example                    | Default                 |
|----------------------|--------------------------------------------|----------------------------|-------------------------|
| `CYPRESS_BASE_URL`   | URL to Cloud Manager environment for tests | `https://cloud.linode.com` | `http://localhost:3000` |

##### Cloud Manager-specific Environment Variables

These environment variables are specific to Cloud Manager UI tests. They can be distinguished from out-of-the-box Cypress environment variables by their `CY_TEST_` prefix.

###### General

Environment variables related to the general operation of the Cloud Manager Cypress tests.

| Environment Variable | Description                                                                                           | Example      | Default                         |
|----------------------|-------------------------------------------------------------------------------------------------------|--------------|---------------------------------|
| `CY_TEST_SUITE`      | Name of the Cloud Manager UI test suite to run. Possible values are `core` or `synthetic`.            | `synthetic`  | Unset; defaults to `core` suite |
| `CY_TEST_TAGS`       | Query identifying tests that should run by specifying allowed and disallowed tags.                    | `method:e2e` | Unset; all tests run by default |

###### Overriding Behavior

These environment variables can be used to override some behaviors of Cloud Manager's UI tests. This can be useful when testing Cloud Manager for nonstandard or work-in-progress functionality.

| Environment Variable    | Description                                     | Example   | Default                                    |
|-------------------------|-------------------------------------------------|-----------|--------------------------------------------|
| `CY_TEST_FEATURE_FLAGS` | JSON string containing feature flag data        | `{}`      | Unset; feature flag data is not overridden |

###### Run Splitting

These environment variables facilitate splitting the Cypress run between multiple runners without the use of any third party services. This can be useful for improving Cypress test performance in some circumstances. For additional performance gains, an optional test weights file can be specified using `CY_TEST_SPLIT_RUN_WEIGHTS` (see `CY_TEST_GENWEIGHTS` to generate test weights).

| Environment Variable        | Description                                | Example          | Default                    |
|-----------------------------|--------------------------------------------|------------------|----------------------------|
| `CY_TEST_SPLIT_RUN`         | Enable run splitting                       | `1`              | Unset; disabled by default |
| `CY_TEST_SPLIT_RUN_INDEX`   | Numeric index for each Cypress test runner | `1`, `2`, etc.   | Unset                      |
| `CY_TEST_SPLIT_RUN_TOTAL`   | Total number of runners for the tests      | `2`              | Unset                      |
| `CY_TEST_SPLIT_RUN_WEIGHTS` | Path to test weights file                  | `./weights.json` | Unset; disabled by default |

###### Development, Logging, and Reporting

Environment variables related to Cypress logging and reporting, as well as report generation.

| Environment Variable            | Description                                        | Example          | Default                    |
|---------------------------------|----------------------------------------------------|------------------|----------------------------|
| `CY_TEST_USER_REPORT`           | Log test account information when tests begin      | `1`              | Unset; disabled by default |
| `CY_TEST_JUNIT_REPORT`          | Enable JUnit reporting                             | `1`              | Unset; disabled by default |
| `CY_TEST_DISABLE_FILE_WATCHING` | Disable file watching in Cypress UI                | `1`              | Unset; disabled by default |
| `CY_TEST_DISABLE_RETRIES`       | Disable test retries on failure in CI              | `1`              | Unset; disabled by default |
| `CY_TEST_FAIL_ON_MANAGED`       | Fail affected tests when Managed is enabled        | `1`              | Unset; disabled by default |
| `CY_TEST_GENWEIGHTS`            | Generate and output test weights to the given path | `./weights.json` | Unset; disabled by default |
| `CY_TEST_RESET_PREFERENCES`     | Reset user preferences when test run begins        | `1`              | Unset; disabled by default |

###### Performance

Environment variables that can be used to improve test performance in some scenarios.

| Environment Variable            | Description                                   | Example            | Default                    |
|---------------------------------|-----------------------------------------------|--------------------|----------------------------|
| `CY_TEST_ACCOUNT_CACHE_DIR`     | Directory containing test account cache data  | `./cache/accounts` | Unset; disabled by default |


### Writing End-to-End Tests

1. Look here for [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
2. Test Example:

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

             cy.get(`tr[data-qa-linode="${label}"]`).should('be.visible').within(() => {
            // use `within` to search inside/use data from/assert on a specific page element
                cy.get(`[data-qa-ip-main]`)
                   // `realHover` and more real event methods from cypress real events plugin
                    .realHover()
                    .then(() => {
                        cy.get(`[aria-label="Copy ${ip} to clipboard"]`).should('be.visible');
                    });
                cy.get(`[aria-label="Action menu for Linode ${label}"]`).should('be.visible');
             });
          // `findByText` and others from cypress testing library plugin
            cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.exist');
      });
    });
    ```

3. How to use intercepts:

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

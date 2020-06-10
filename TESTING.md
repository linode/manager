TESTING.md

# Testing Linode Manager

## Unit Tests

The unit tests for Linode Cloud Manager are written in Typescript using the [Jest](https://facebook.github.io/jest/) testing framework. Unit tests end with the `.test.tsx` file extension and can be found throughout the codebase.

To run tests:

**You must have built the JS SDK**

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

To Run a specific file or files in a directory:

```
yarn test myFile.test.tsx
yarn test src/some-folder
```

Jest includes pattern matching out of the box, so you can also do things like run all tests whose filename
contains "Linode" with

```
yarn test linode
```

To run a test in debug mode, add a `debugger` breakpoint inside one of the test cases, then run

```
yarn workspace linode-manager run test:debug
```

Test execution will stop at the debugger statement, and you will be able to use Chrome's normal debugger to step through
the tests (open `chrome://inspect/#devices` in Chrome).

### React Testing Library

We have some older tests that still use the Enzyme framework, but for new tests we generally use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). This library provides a set of tools to render React components from within the Jest environment. The library's philosophy is that components should be tested as closely as possible to how they are used.

A simple test using this library will look something like this:

```js
import { cleanup } from "@testing-library/react";
import { renderWithTheme } from "src/utilities/testHelpers";
import Component from "./wherever";

afterEach(cleanup);

describe("My component", () => {
  it("should have some text", () => {
    const { getByText } = renderWithTheme(<Component />);
    getByText("some text");
  });
});
```

Handling events such as clicks is a little more involved:

```js
import { cleanup, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "src/utilities/testHelpers";
import Component from "./wherever";

afterEach(cleanup);

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
  getKubeConfig: () => jest.fn()
}));
```

Some components, such as our ActionMenu, don't lend themselves well to unit testing (they often have complex DOM structures from MUI and it's hard to target). We have mocks for most of these components in a `__mocks__` directory adjacent to their respective components. To make use of these, just tell Jest to use the mock:

    jest.mock('src/components/ActionMenu/ActionMenu');

Any `<ActionMenu>`s rendered by the test will be simplified versions that are easier to work with.

#### Mocking Redux State

The `wrapWithTheme` and `renderWithTheme` helper functions take a `customStore` option, used as follows:

```tsx
import { renderWithTheme } from 'src/utilities/testHelpers.ts`;

const { getByTestId } = renderWithTheme(<MyComponent />, {
  customStore: {} // <-- Redux store specified here
});
```

The `customStore` prop is of type `DeepPartial<ApplicationState>`, so only the fields needed to satisfy the conditions of your test are needed.

Several helpers are available in `src/utilities/testHelpersStore.ts` to simulate common scenarios (withManaged, withRestrictedUser, etc).

#### Mocking Feature Flags

Another option the `wrapWithTheme` and `renderWithTheme` helper functions expose is `flags`, to supply custom feature flags:

```tsx
import { renderWithTheme } from 'src/utilities/testHelpers.ts`;

const { getByTestId } = renderWithTheme(<MyComponent />, {
  flags: { myFeature: true } // <-- Feature Flags specified here
});
```

## End-to-End Tests

E2E tests use [Cypress](https://cypress.io).

### Run Cypress e2e tests

#### set up your environment

Cypress will read your env variables from `.env` in `/packages/manager`.
It uses `MANAGER_OAUTH`, `REACT_APP_LOGIN_ROOT` and `REACT_APP_API_ROOT`.
See the [_Getting Started_ documentation.](GETTING_STARTED.md) to setup your `.env` file

To get your OAuth token, go to https://cloud.linode.com/profile/tokens and click "Add a Personal Access Token.

#### How to run locally without Docker

Run:

- `yarn up` in one terminal
- In a **new terminal** `yarn run wait-on http://localhost:3000 && yarn cy:e2e`

`yarn run wait-on` will simply wait for the website on port 3000 to be ready.

##### Commands

Run the E2E in headless mode:

```bash
yarn cy:e2e
```

To use the debugging mode and the interactive interface:
```bash
yarn cy:debug
```

#### How to run with Docker

Check that Docker is installed.
Run `yarn docker:cy`

#### How to contribute to E2E tests

Read the [_Writing E2E Tests_ documentation.](WRITING_E2E_TESTS.md)

### Run Storybook UI Components e2e tests

#### dependencies

Run `yarn install:all && yarn selenium:install`.
When running `yarn selenium:install` will check that selenium is installed.
We do not need to take care of Selenium more after this, storybook will take care of launching it.

#### How to run locally without docker

Run:

- `yarn storybook` in one terminal
- In a **new terminal** `yarn run wait-on http://localhost:6006 && yarn storybook:e2e`

`yarn run wait-on` will simply wait for the storybook server on 6006 to be ready.

#### How to run with docker

Check docker is installed.
Run `yarn docker:sb` or `docker build -t cloudsb -f Dockerfile-storybook . && docker run --rm cloudsb`

### Testing React Storybook Components

In addition to the Linode Manager E2E tests, there are also UI tests for the ReactJS components.
The components are tested via [Storybook](https://github.com/storybooks/storybook) and the test specs
live in `src/components/ComponentName/ComponentName.spec.js`. The WDIO config lives in `e2e/config/wdio.storybook.conf.js`

#### Dependencies

```bash
brew cask uninstall java
brew tap caskroom/versions
brew cask install java

brew install node@10
brew cask install google-chrome
brew install yarn
```

#### Run Suite

```bash
# Starts storybook

yarn storybook

# you do not need to start selenium for this, this will be started by wdio automatically

## New shell
## Executes specs matching src/components/**/*.spec.js

yarn storybook:e2e
```

#### Run a Single Test

```bash
# Executes spec matching src/components/StoryName/StoryName.spec.js

yarn storybook:e2e --story StoryName
```

#### Run a Test in Non-Headless Chrome

```bash
yarn selenium

## New Shell
## The --debug flag spawns a visible chrome session

yarn storybook:e2e --debug --story StoryName
```

## Accessibility Testing

**broken, needs chromedriver update**

The axe-core accessibility testing script has been integrated into the webdriverIO-based testing framework to enable automated accessibility testing. At present, the script merely navigates to all routes described in `packages/managere2e/constants.js`, loads the page and runs the accessibility tests.

##### Dependencies

- Same as E2E Manager tests

#### Run Suite

```bash
# Starts the local development environment

yarn install:all && yarn up
yarn workspace linode-manager run axe
```

The test results will be saved as a JSON file with Critical accessibility violations appearing at the top of the list.

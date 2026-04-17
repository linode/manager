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

import {
  MatcherFunction,
  RenderResult,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mediaQuery from 'css-mediaquery';
import { Provider as LDProvider } from 'launchdarkly-react-client-sdk/lib/context';
import { SnackbarProvider } from 'notistack';
import { mergeDeepRight } from 'ramda';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { DeepPartial } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { LinodeThemeWrapper } from 'src/LinodeThemeWrapper';
import { FlagSet } from 'src/featureFlags';
import { queryClientFactory } from 'src/queries/base';
import { setupInterceptors } from 'src/request';
import {
  ApplicationState,
  ApplicationStore,
  defaultState,
  storeFactory,
} from 'src/store';

export const mockMatchMedia = (matches: boolean = true) => {
  window.matchMedia = vi.fn().mockImplementation((query) => {
    return {
      addListener: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeListener: vi.fn(),
    };
  });
};

const createMatchMedia = (width: number) => {
  return (query: string) => {
    return {
      addEventListener: () => vi.fn(),
      addListener: () => vi.fn(),
      dispatchEvent: () => true,
      matches: mediaQuery.match(query, { width }),
      media: '',
      onchange: () => vi.fn(),
      removeEventListener: () => vi.fn(),
      removeListener: () => vi.fn(),
    };
  };
};

export const resizeScreenSize = (width: number) => {
  window.matchMedia = createMatchMedia(width);
};

interface Options {
  MemoryRouter?: MemoryRouterProps;
  customStore?: DeepPartial<ApplicationState>;
  flags?: FlagSet;
  queryClient?: QueryClient;
  theme?: 'dark' | 'light';
}

/**
 * preference state is necessary for all tests using the
 * renderWithTheme() helper function, since the whole app is wrapped with
 * the TogglePreference component
 */
export const baseStore = (customStore: DeepPartial<ApplicationState> = {}) =>
  configureStore<DeepPartial<ApplicationState>>([thunk])(
    mergeDeepRight(defaultState, customStore)
  );

export const wrapWithTheme = (ui: any, options: Options = {}) => {
  const { customStore, queryClient: passedQueryClient } = options;
  const queryClient = passedQueryClient ?? queryClientFactory();
  const storeToPass = customStore
    ? baseStore(customStore)
    : storeFactory(queryClient);

  // we have to call setupInterceptors so that our API error normalization works as expected
  // I'm sorry that it makes us pass it the "ApplicationStore"
  setupInterceptors(
    configureStore<ApplicationState>([thunk])(defaultState)
  );

  return (
    <Provider store={storeToPass}>
      <QueryClientProvider client={passedQueryClient || queryClient}>
        <LinodeThemeWrapper theme={options.theme}>
          <LDProvider
            value={{
              flagKeyMap: {},
              flags: options.flags ?? {},
            }}
          >
            <SnackbarProvider>
              <MemoryRouter {...options.MemoryRouter}>
                {ui.children ?? ui}
              </MemoryRouter>
            </SnackbarProvider>
          </LDProvider>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
};

/**
 * Wraps children with just the Redux Store. This is
 * useful for testing React hooks that need to access
 * the Redux store.
 * @example
 * ```ts
 * const { result } = renderHook(() => useOrder(defaultOrder), {
 *   wrapper: wrapWithStore,
 * });
 * ```
 * @param param {object} contains children to render
 * @returns {JSX.Element} wrapped component with Redux available for use
 */
export const wrapWithStore = (props: {
  children: React.ReactNode;
  queryClient?: QueryClient;
  store?: ApplicationStore;
}) => {
  const queryClient = props.queryClient ?? queryClientFactory();
  const store = props.store ?? storeFactory(queryClient);
  return <Provider store={store}>{props.children}</Provider>;
};

// When wrapping a TableRow component to test, we'll get an invalid DOM nesting
// error complaining that a <tr /> cannot appear as a child of a <div />. This
// is a wrapper around `wrapWithTheme()` that renders the `ui` argument in a
// <table /> and <tbody />.
export const wrapWithTableBody = (ui: any, options: Options = {}) =>
  wrapWithTheme(
    <table>
      <tbody>{ui}</tbody>
    </table>,
    options
  );

export const renderWithTheme = (ui: any, options: Options = {}) => {
  return render(wrapWithTheme(ui, options));
};

declare global {
  // export would be better, but i m aligning with how the namespace is declared by vi-axe
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace vi {
    interface Matchers<R, T> {
      toPassAxeCheck(): R;
    }
  }
}
export const toPassAxeCheck = {
  toPassAxeCheck(received: RenderResult) {
    // if ((typeof rec) !== RenderResult){
    //   return {
    //     pass:false,
    //     message:()=> `Expected type RenderResult (result of function call render...)`
    //   };
    // }
    const anchors = received.container.querySelectorAll('a');
    // Here i want to use forEach but tslint has a bug saying not all my pth return a value,
    // which is intended as i want to return only if there is an error, if not keep traversing
    // Also i could have used For .. Of but this was making tslint think e was a string...
    for (let i = 0; i < anchors.length; i++) {
      const e = anchors[i];
      const hasHref = e.hasAttribute('href');
      if (!hasHref) {
        return {
          message: () => `anchors has no href - specify a value for href
        \nsee: https://a11yproject.com/posts/creating-valid-and-accessible-links/:\n${received.debug(
          e
        )}`,
          pass: false,
        };
      }
      let hrefAtt = e.getAttribute('href');
      if (hrefAtt == null) {
        return {
          message: () => `anchors has bad href - specify a non null value for href
        \nsee: https://a11yproject.com/posts/creating-valid-and-accessible-links/:\n${received.debug(
          e
        )}`,
          pass: false,
        };
      }
      hrefAtt = hrefAtt as string;
      if (['#', ''].includes(hrefAtt) || hrefAtt.includes('javascript')) {
        return {
          message: () => `anchors has invalid href - specify a valid value not #,'' or javascript(void)
        \nsee: https://a11yproject.com/posts/creating-valid-and-accessible-links/:\n${received.debug(
          e
        )}`,
          pass: false,
        };
      }
      // ugly trick to bypass tslint inablility to understand it s normal not to return
      continue;
    }
    return { message: () => '!', pass: true };
  },
};

export const includesActions = (
  actions: string[],
  query: any,
  includes = true
) => {
  const actionMenuButton = screen.queryByLabelText(/^Action menu for/);
  if (actionMenuButton) {
    userEvent.click(actionMenuButton);
  }
  for (const action of actions) {
    includes
      ? expect(query(action)).toBeInTheDocument()
      : expect(query(action)).not.toBeInTheDocument();
  }
};

type Query = (f: MatcherFunction) => HTMLElement;

/** H/T to https://stackoverflow.com/questions/55509875/how-to-query-by-text-string-which-contains-html-tags-using-react-testing-library */
export const withMarkup = (query: Query) => (text: string): HTMLElement =>
  query((content: string, node: HTMLElement) => {
    const hasText = (node: HTMLElement) => node.textContent === text;
    const childrenDontHaveText = Array.from(node.children).every(
      (child) => !hasText(child as HTMLElement)
    );
    return hasText(node) && childrenDontHaveText;
  });

/**
 * Assert that HTML elements appear in a specific order. `selectorAttribute` must select the parent
 * node of each piece of text content you are selecting.
 *
 * Example usage:
 * const { container } = render(<MyComponent />);
 * assertOrder(container, '[data-qa-label]', ['el1', 'el2', 'el3']);
 *
 * Thanks to https://spectrum.chat/testing-library/general/how-to-test-the-order-of-elements~23c8eaee-0fab-4bc6-8ca9-aa00a9582f8c?m=MTU3MjU0NTM0MTgyNw==
 */
export const assertOrder = (
  container: HTMLElement,
  selectorAttribute: string,
  expectedOrder: string[]
) => {
  const elements = container.querySelectorAll(selectorAttribute);
  expect(Array.from(elements).map((el) => el.textContent)).toMatchObject(
    expectedOrder
  );
};

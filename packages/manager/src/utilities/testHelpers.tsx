import { queryClientFactory } from '@linode/queries';
import { CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import mediaQuery from 'css-mediaquery';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { FieldValues, UseFormProps } from 'react-hook-form';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, storeFactory } from 'src/features/Longview/store';
import { LinodeThemeWrapper } from 'src/LinodeThemeWrapper';
import { setupInterceptors } from 'src/request';

import { mergeDeepRight } from './mergeDeepRight';

import type { QueryClient } from '@tanstack/react-query';
import type { AnyRootRoute, AnyRouter } from '@tanstack/react-router';
import type { MatcherFunction } from '@testing-library/react';
import type { DeepPartial } from 'redux';
import type { FlagSet } from 'src/featureFlags';
import type { ApplicationState } from 'src/features/Longview/store';

export const mockMatchMedia = (matches: boolean = true) => {
  window.matchMedia = vi.fn().mockImplementation((query) => {
    return {
      addEventListener: () => vi.fn(),
      addListener: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: () => vi.fn(),
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
  customStore?: DeepPartial<ApplicationState>;
  flags?: FlagSet;
  initialEntries?: string[];
  initialRoute?: string;
  queryClient?: QueryClient;
  router?: AnyRouter;
  routeTree?: AnyRootRoute;
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
  const storeToPass = customStore ? baseStore(customStore) : storeFactory();

  // we have to call setupInterceptors so that our API error normalization works as expected
  // I'm sorry that it makes us pass it the "ApplicationStore"
  setupInterceptors();

  const uiToRender = ui.children ?? ui;

  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    component: () => uiToRender,
    getParentRoute: () => rootRoute,
    path: options.initialRoute ?? '/',
  });

  const router: AnyRouter =
    options.router ??
    createRouter({
      history: createMemoryHistory({
        initialEntries: options.initialEntries ?? [options.initialRoute ?? '/'],
      }),
      routeTree: rootRoute.addChildren([indexRoute]),
    });

  return (
    <Provider store={storeToPass}>
      <QueryClientProvider client={passedQueryClient || queryClient}>
        <LinodeThemeWrapper theme={options.theme}>
          <LDProvider
            clientSideID={''}
            deferInitialization
            flags={options.flags ?? {}}
            options={{ bootstrap: options.flags }}
          >
            <CssBaseline enableColorScheme />
            <SnackbarProvider>
              <RouterProvider router={router} />
            </SnackbarProvider>
          </LDProvider>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
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

export const renderWithTheme = (ui: React.ReactNode, options: Options = {}) => {
  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    component: () => ui,
    getParentRoute: () => rootRoute,
    path: options.initialRoute ?? '/',
  });

  const router: AnyRouter = createRouter({
    history: createMemoryHistory({
      initialEntries: (options.initialEntries as string[]) ?? [
        options.initialRoute ?? '/',
      ],
    }),
    routeTree: rootRoute.addChildren([indexRoute]),
  });

  const utils = render(wrapWithTheme(ui, { ...options, router }));
  return {
    ...utils,
    rerender: (ui: React.ReactNode) =>
      utils.rerender(wrapWithTheme(ui, options)),
    router,
  };
};

interface UseFormPropsWithChildren<T extends FieldValues>
  extends UseFormProps<T> {
  children: React.ReactNode;
}

const FormContextWrapper = <T extends FieldValues>(
  props: UseFormPropsWithChildren<T>
) => {
  const formMethods = useForm<T>(props);

  return <FormProvider {...formMethods}>{props.children}</FormProvider>;
};

interface RenderWithThemeAndHookFormOptions<T extends FieldValues> {
  component: React.ReactElement<any>;
  options?: Options;
  useFormOptions?: UseFormProps<T>;
}

export const wrapWithFormContext = <T extends FieldValues>(
  options: RenderWithThemeAndHookFormOptions<T>
) => {
  return (
    <FormContextWrapper {...options.useFormOptions}>
      {options.component}
    </FormContextWrapper>
  );
};

export const renderWithThemeAndHookFormContext = <T extends FieldValues>(
  options: RenderWithThemeAndHookFormOptions<T>
) => {
  return renderWithTheme(
    <FormContextWrapper {...options.useFormOptions}>
      {options.component}
    </FormContextWrapper>,
    options.options
  );
};

type Query = (f: MatcherFunction) => HTMLElement;

/** H/T to https://stackoverflow.com/questions/55509875/how-to-query-by-text-string-which-contains-html-tags-using-react-testing-library */
export const withMarkup =
  (query: Query) =>
  (text: string): HTMLElement =>
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

/**
 * Utility function to query an element inside the Shadow DOM of a web component.
 * Uses MutationObserver to detect changes in the Shadow DOM and resolve the promise
 * when the desired element is available.
 * @param host - The web component host element.
 * @param selector - The CSS selector for the element to query.
 * @returns A promise that resolves to the queried element inside the Shadow DOM, or null if not found.
 */
export const getShadowRootElement = <T extends Element>(
  host: HTMLElement,
  selector: string
): Promise<null | T> => {
  return new Promise((resolve) => {
    const shadowRoot = host.shadowRoot;

    if (!shadowRoot) {
      resolve(null);
      return;
    }

    // Check if the element already exists
    const element = shadowRoot.querySelector<T>(selector);
    if (element) {
      resolve(element);
      return;
    }

    // Use MutationObserver to detect changes in the Shadow DOM
    const observer = new MutationObserver(() => {
      const element = shadowRoot.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(shadowRoot, { childList: true, subtree: true });
  });
};

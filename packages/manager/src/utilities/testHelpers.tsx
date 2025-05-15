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
import { render, waitFor } from '@testing-library/react';
import mediaQuery from 'css-mediaquery';
import { Formik } from 'formik';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { FieldValues, UseFormProps } from 'react-hook-form';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter, Route } from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { LinodeThemeWrapper } from 'src/LinodeThemeWrapper';
import { setupInterceptors } from 'src/request';
import { migrationRouteTree } from 'src/routes';
import { defaultState, storeFactory } from 'src/store';

import { mergeDeepRight } from './mergeDeepRight';

import type { QueryClient } from '@tanstack/react-query';
// TODO: Tanstack Router - replace AnyRouter once migration is complete.
import type { AnyRootRoute, AnyRouter } from '@tanstack/react-router';
import type { MatcherFunction, RenderResult } from '@testing-library/react';
import type { FormikConfig, FormikValues } from 'formik';
import type { DeepPartial } from 'redux';
import type { FlagSet } from 'src/featureFlags';
import type { ApplicationState, ApplicationStore } from 'src/store';

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
  MemoryRouter?: MemoryRouterProps;
  queryClient?: QueryClient;
  routePath?: string;
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
  const { customStore, queryClient: passedQueryClient, routePath } = options;
  const queryClient = passedQueryClient ?? queryClientFactory();
  const storeToPass = customStore ? baseStore(customStore) : storeFactory();

  // we have to call setupInterceptors so that our API error normalization works as expected
  // I'm sorry that it makes us pass it the "ApplicationStore"
  setupInterceptors(configureStore<ApplicationState>([thunk])(defaultState));

  const uiToRender = ui.children ?? ui;

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
              {/**
               * TODO Tanstack Router - remove amy routing  routing wrapWithTheme
               */}
              <MemoryRouter {...options.MemoryRouter}>
                {routePath ? (
                  <Route path={routePath}>{uiToRender}</Route>
                ) : (
                  uiToRender
                )}
              </MemoryRouter>
            </SnackbarProvider>
          </LDProvider>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
};

interface OptionsWithRouter
  extends Omit<Options, 'MemoryRouter' | 'routePath'> {
  initialRoute?: string;
  router?: AnyRouter;
  routeTree?: AnyRootRoute;
}

/**
 * We don't always need to use the router in our tests. When we do, due to the async nature of TanStack Router, we need to use this helper function.
 * The reason we use this instead of extending renderWithTheme is because of having to make all tests async.
 * It seems unnecessary to refactor all tests to async when we don't need to access the router at all.
 *
 * In order to use this, you must await the result of the function.
 *
 * @example
 * const { getByText, router } = await renderWithThemeAndRouter(
 *   <Component />, {
 *     initialRoute: '/route',
 *   }
 * );
 *
 * // Assert the initial route
 * expect(router.state.location.pathname).toBe('/route');
 *
 * // from here, you can use the router to navigate
 * await waitFor(() =>
 *   router.navigate({
 *    params: { betaId: beta.id },
 *    to: '/path/to/something',
 *  })
 * );
 *
 * // And assert
 * expect(router.state.location.pathname).toBe('/path/to/something');
 *
 * // and test the UI
 * getByText('Some text');
 */
export const wrapWithThemeAndRouter = (
  ui: React.ReactNode,
  options: OptionsWithRouter = {}
) => {
  const {
    customStore,
    initialRoute = '/',
    queryClient: passedQueryClient,
  } = options;
  const queryClient = passedQueryClient ?? queryClientFactory();
  const storeToPass = customStore ? baseStore(customStore) : storeFactory();

  setupInterceptors(configureStore<ApplicationState>([thunk])(defaultState));

  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    component: () => ui,
    getParentRoute: () => rootRoute,
    path: initialRoute,
  });
  const router: AnyRouter = createRouter({
    history: createMemoryHistory({
      initialEntries: [initialRoute],
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
              <BrowserRouter>
                <RouterProvider router={router} />
              </BrowserRouter>
            </SnackbarProvider>
          </LDProvider>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
};

export const renderWithThemeAndRouter = async (
  ui: React.ReactNode,
  options: OptionsWithRouter = {}
): Promise<RenderResult & { router: AnyRouter }> => {
  const router = createRouter({
    history: createMemoryHistory({
      initialEntries: [options.initialRoute || '/'],
    }),
    routeTree: options.routeTree || migrationRouteTree,
  });

  const utils: RenderResult = render(
    wrapWithThemeAndRouter(ui, { ...options, router })
  );

  // Wait for the router to be ready
  await waitFor(() => expect(router.state.status).toBe('idle'));

  return {
    ...utils,
    rerender: (ui) =>
      utils.rerender(wrapWithThemeAndRouter(ui, { ...options, router })),
    router,
  };
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
  const store = props.store ?? storeFactory();
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

export const renderWithTheme = (
  ui: React.ReactNode,
  options: Options = {}
): RenderResult => {
  const utils = render(wrapWithTheme(ui, options));
  return {
    ...utils,
    rerender: (ui) => utils.rerender(wrapWithTheme(ui, options)),
  };
};

/**
 * Renders the given UI component within both the Formik and renderWithTheme.
 *
 * @param {React.ReactElement} ui - The React component that you want to render. This component
 *                                  typically will be a part of or a whole form.
 * @param {FormikConfig<T>} configObj - Formik configuration object which includes all the necessary
 *                                      configurations for the Formik context such as initialValues,
 *                                      validationSchema, and onSubmit.
 */

export const renderWithThemeAndFormik = <T extends FormikValues>(
  ui: React.ReactElement,
  configObj: FormikConfig<T>
) => renderWithTheme(<Formik {...configObj}>{ui}</Formik>);

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
  component: React.ReactElement;
  options?: Options;
  useFormOptions?: UseFormProps<T>;
}

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

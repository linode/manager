import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MatcherFunction, render } from '@testing-library/react';
import mediaQuery from 'css-mediaquery';
import { Formik, FormikConfig, FormikValues } from 'formik';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { SnackbarProvider } from 'notistack';
import { mergeDeepRight } from 'ramda';
import * as React from 'react';
import {
  FieldValues,
  FormProvider,
  UseFormProps,
  useForm,
} from 'react-hook-form';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { DeepPartial } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { FlagSet } from 'src/featureFlags';
import { LinodeThemeWrapper } from 'src/LinodeThemeWrapper';
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
  const storeToPass = customStore ? baseStore(customStore) : storeFactory();

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
            clientSideID={''}
            deferInitialization
            flags={options.flags ?? {}}
            options={{ bootstrap: options.flags }}
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

export const renderWithTheme = (ui: any, options: Options = {}) => {
  return render(wrapWithTheme(ui, options));
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

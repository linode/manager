import { MatcherFunction, render, RenderResult } from '@testing-library/react';
import { Provider as LDProvider } from 'launchdarkly-react-client-sdk/lib/context';
import { mergeDeepRight } from 'ramda';
import { ResourcePage } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import store, { ApplicationState, defaultState } from 'src/store';
import { DeepPartial } from 'redux';
import { FlagSet } from 'src/featureFlags';

export const createPromiseLoaderResponse: <T>(
  r: T
) => PromiseLoaderResponse<T> = response => ({ response });

export const createResourcePage: <T>(data: T[]) => ResourcePage<T> = data => ({
  data,
  page: 0,
  pages: 0,
  number: 1,
  results: 0
});

interface Options {
  MemoryRouter?: MemoryRouterProps;
  customStore?: DeepPartial<ApplicationState>;
  flags?: FlagSet;
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
  const { customStore } = options;
  const storeToPass = customStore ? baseStore(customStore) : store;
  return (
    <Provider store={storeToPass}>
      <LinodeThemeWrapper theme="dark" spacing="normal">
        <LDProvider value={{ flags: options.flags ?? {} }}>
          <MemoryRouter {...options.MemoryRouter}>{ui}</MemoryRouter>
        </LDProvider>
      </LinodeThemeWrapper>
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

export const renderWithTheme = (ui: any, options: Options = {}) => {
  return render(wrapWithTheme(ui, options));
};

declare global {
  // export would be better, but i m aligning with how the namespace is declared by jest-axe
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
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
          pass: false
        };
      }
      let hrefAtt = e.getAttribute('href');
      if (hrefAtt == null) {
        return {
          message: () => `anchors has bad href - specify a non null value for href
        \nsee: https://a11yproject.com/posts/creating-valid-and-accessible-links/:\n${received.debug(
          e
        )}`,
          pass: false
        };
      }
      hrefAtt = hrefAtt as string;
      if (['#', ''].includes(hrefAtt) || hrefAtt.includes('javascript')) {
        return {
          message: () => `anchors has invalid href - specify a valid value not #,'' or javascript(void)
        \nsee: https://a11yproject.com/posts/creating-valid-and-accessible-links/:\n${received.debug(
          e
        )}`,
          pass: false
        };
      }
      // ugly trick to bypass tslint inablility to understand it s normal not to return
      continue;
    }
    return { pass: true, message: () => '!' };
  }
};

export const includesActions = (
  actions: string[],
  query: any,
  includes = true
) => {
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
      child => !hasText(child as HTMLElement)
    );
    return hasText(node) && childrenDontHaveText;
  });

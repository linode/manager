import { render, RenderResult } from '@testing-library/react';
import { ResourcePage } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import store, { ApplicationState } from 'src/store';

export let createPromiseLoaderResponse: <T>(r: T) => PromiseLoaderResponse<T>;
createPromiseLoaderResponse = response => ({ response });

export let createResourcePage: <T>(data: T[]) => ResourcePage<T>;
createResourcePage = data => ({
  data,
  page: 0,
  pages: 0,
  number: 1,
  results: 0
});

interface Options {
  MemoryRouter?: MemoryRouterProps;
  customStore?: Partial<ApplicationState>;
}

/**
 * preference state is necessary for all tests using the
 * renderWithTheme() helper function, since the whole app is wrapped with
 * the TogglePreference component
 */
export const baseStore = (customStore: Partial<ApplicationState> = {}) =>
  configureStore<Partial<ApplicationState>>([thunk])({
    preferences: {
      data: {},
      loading: false,
      lastUpdated: 0
    },
    ...customStore
  });

export const wrapWithTheme = (ui: any, options: Options = {}) => {
  const { customStore } = options;
  const storeToPass = customStore ? baseStore(customStore) : store;
  return (
    <Provider store={storeToPass}>
      <LinodeThemeWrapper theme="dark" spacing="normal">
        <MemoryRouter {...options.MemoryRouter}>{ui}</MemoryRouter>
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
    // tslint:disable-next-line: prefer-for-of
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

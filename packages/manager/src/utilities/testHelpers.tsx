import { render } from '@testing-library/react';
import { ResourcePage } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import store from 'src/store';

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
}

export const wrapWithTheme = (ui: any, options: Options = {}) => {
  return (
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark" spacing="normal">
        <MemoryRouter {...options.MemoryRouter}>{ui}</MemoryRouter>
      </LinodeThemeWrapper>
    </Provider>
  );
};

export const renderWithTheme = (ui: any) => {
  return render(
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark" spacing="normal">
        <MemoryRouter>{ui}</MemoryRouter>
      </LinodeThemeWrapper>
    </Provider>
  );
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

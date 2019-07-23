import * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from 'react-testing-library';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import store from 'src/store';

export let createPromiseLoaderResponse: <T>(r: T) => PromiseLoaderResponse<T>;
createPromiseLoaderResponse = response => ({ response });

export let createResourcePage: <T>(data: T[]) => Linode.ResourcePage<T>;
createResourcePage = data => ({
  data,
  page: 0,
  pages: 0,
  number: 1,
  results: 0
});

export const wrapWithTheme = (ui: any) => {
  return (
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark" spacing="normal">
        <MemoryRouter>{ui}</MemoryRouter>
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

export const includesActions = (actions: string[], query: any) => {
  for (const action of actions) {
    expect(query(action)).toBeInTheDocument();
  }
};

import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

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
    <LinodeThemeWrapper>
      <MemoryRouter>{ui}</MemoryRouter>
    </LinodeThemeWrapper>
  );
};

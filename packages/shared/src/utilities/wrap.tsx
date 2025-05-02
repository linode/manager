import { queryClientFactory, QueryClientProvider } from '@linode/queries';
import { light, ThemeProvider } from '@linode/ui';
import { render } from '@testing-library/react';
import React from 'react';

import type { Theme } from '@linode/ui';
import type { RenderResult } from '@testing-library/react';

type Wrapper = (ui: React.ReactNode) => React.ReactNode;

export const wrap = (
  ui: React.ReactNode,
  wrappers: Wrapper[],
): React.ReactNode => wrappers.reduce((prev, wrapper) => wrapper(prev), ui);

export const renderWithWrappers = (
  ui: React.ReactNode,
  wrappers: Wrapper[],
): RenderResult => {
  const renderResult = render(wrap(ui, wrappers));
  return {
    ...renderResult,
    rerender: (ui) => renderResult.rerender(wrap(ui, wrappers)),
  };
};

export const QueryClientWrapper =
  (queryClient = queryClientFactory()) =>
  (ui: React.ReactNode) => (
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );

export const ThemeWrapper =
  (theme: Theme = light) =>
  (ui: React.ReactNode) => <ThemeProvider theme={theme}>{ui}</ThemeProvider>;

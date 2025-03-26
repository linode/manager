/* eslint-disable react-refresh/only-export-components */
import { queryClientFactory } from '@linode/queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import React from 'react';

import type { RenderResult } from '@testing-library/react';

type Wrapper = (ui: React.ReactNode) => React.ReactNode;

export const wrap = (
  ui: React.ReactNode,
  wrappers: Wrapper[]
): React.ReactNode => wrappers.reduce((prev, wrapper) => wrapper(prev), ui);

export const renderWithWrappers = (
  ui: React.ReactNode,
  wrappers: Wrapper[]
): RenderResult => {
  const renderResult = render(wrap(ui, wrappers));
  return {
    ...renderResult,
    rerender: (ui) => renderResult.rerender(wrap(ui, wrappers)),
  };
};

export const QueryClientWrapper = (queryClient = queryClientFactory()) => (
  ui: React.ReactNode
) => <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>;

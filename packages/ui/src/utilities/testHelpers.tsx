import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import * as themes from '../foundations/themes';

import type { RenderResult } from '@testing-library/react';

interface Options {
  theme?: 'dark' | 'light';
}

export const wrapWithTheme = (ui: any, options: Options = {}) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={themes[options.theme ?? 'light']}>
      {ui.children ?? ui}
    </ThemeProvider>
  </StyledEngineProvider>
);

export const renderWithTheme = (
  ui: React.ReactNode,
  options: Options = {},
): RenderResult => {
  const renderResult = render(wrapWithTheme(ui, options));
  return {
    ...renderResult,
    rerender: (ui) => renderResult.rerender(wrapWithTheme(ui, options)),
  };
};

export function mockMatchMedia(
  matcher: (query: string) => boolean = () => false,
) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matcher(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

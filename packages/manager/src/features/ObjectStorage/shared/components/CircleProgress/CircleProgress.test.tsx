import { screen, waitFor, within } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CircleProgress } from './CircleProgress';

const testId = 'circle-progress';

const getShadow = (host: HTMLElement) =>
  host.shadowRoot as unknown as HTMLElement;

const getRootWrapper = () =>
  screen.getByTestId(testId).parentElement as HTMLElement;

describe('CircleProgress', () => {
  it('renders', () => {
    renderWithTheme(<CircleProgress />);

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders a progressbar in its default loading state', async () => {
    renderWithTheme(<CircleProgress />);

    const host = screen.getByTestId(testId);
    await waitFor(() => within(getShadow(host)).getByRole('progressbar'));
  });

  it('renders an img in success state', async () => {
    renderWithTheme(<CircleProgress state="success" />);

    const host = screen.getByTestId(testId);
    await waitFor(() => within(getShadow(host)).getByRole('img'));
  });

  it('has extra-large size by default', () => {
    renderWithTheme(<CircleProgress />);

    const host = screen.getByTestId(testId) as HTMLElement & { size: string };
    expect(host.size).toBe('extra-large');
  });

  it('accepts a custom size', () => {
    renderWithTheme(<CircleProgress size="small" />);

    const host = screen.getByTestId(testId) as HTMLElement & { size: string };
    expect(host.size).toBe('small');
  });

  it('applies default fixed height on the root wrapper', () => {
    renderWithTheme(<CircleProgress />);

    const root = getRootWrapper();
    expect(root).toHaveStyle({ height: '300px' });
  });
});

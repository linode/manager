import { screen, waitFor, within } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CircleProgress } from './CircleProgress';

const testId = 'circle-progress';

// Helper to get the shadow root of the cds-loading-spinner host element.
const getShadow = (host: HTMLElement) =>
  host.shadowRoot as unknown as HTMLElement;

describe('CircleProgress', () => {
  it('renders', () => {
    renderWithTheme(<CircleProgress />);

    screen.getByTestId(testId);
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
});

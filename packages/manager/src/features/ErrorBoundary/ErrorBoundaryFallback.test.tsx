import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ErrorBoundaryFallback } from './ErrorBoundaryFallback';

describe('ErrorBoundaryFallback', () => {
  it('should render the ErrorComponent when an error is thrown', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { location } = window;
    window.location = { ...location, reload: vi.fn() };

    const ErrorComponent = () => {
      throw new Error('Test error for error boundary');
    };

    renderWithTheme(
      <ErrorBoundaryFallback>
        <ErrorComponent />
      </ErrorBoundaryFallback>
    );

    screen.getByText('Something went wrong');
    screen.getByText(
      'Please try the following steps that may help resolve the issue:'
    );
    screen.getByText('Update your browser version');
    screen.getByText('Clear your cookies');
    screen.getByText('Check your internet connection');
    screen.getByText('Resources:');
    screen.getByText('Clearing cache and cookies in a browser');
    screen.getByText('Akamai Compute Support');

    expect(consoleSpy).toHaveBeenCalledTimes(3);

    const refreshButton = screen.getByText('Refresh application');
    const reloadButton = screen.getByText('Reload page');

    expect(refreshButton).toBeInTheDocument();
    expect(reloadButton).toBeInTheDocument();

    await userEvent.click(reloadButton);
    expect(window.location.reload).toHaveBeenCalled();

    consoleSpy.mockRestore();
    window.location = location;
  });
});

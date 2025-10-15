import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertsEndpointFilter } from './AlertsEndpointFilter';

describe('AlertsEndpointFilter', () => {
  const endpointOptions = ['endpoint-1', 'endpoint-2'];
  it('calls handleFilterChange with correct arguments when an endpoint is selected', async () => {
    const handleFilterChange = vi.fn();

    renderWithTheme(
      <AlertsEndpointFilter
        endpointOptions={endpointOptions}
        handleFilterChange={handleFilterChange}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    // Check first option exists
    expect(
      screen.getByRole('option', { name: endpointOptions[0] })
    ).toBeVisible();

    // Select first option
    await userEvent.click(
      screen.getByRole('option', { name: endpointOptions[0] })
    );
    expect(handleFilterChange).toHaveBeenCalledWith(
      [endpointOptions[0]],
      'endpoint'
    );
  });
  it('renders with empty endpointOptions', async () => {
    const handleFilterChange = vi.fn();

    renderWithTheme(
      <AlertsEndpointFilter
        endpointOptions={[]}
        handleFilterChange={handleFilterChange}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open' })); // indicates there is a drop down
    expect(
      screen.getByText('You have no options to choose from')
    ).toBeVisible();
  });

  it('renders with multiple selection endpoints', async () => {
    const handleFilterChange = vi.fn();

    renderWithTheme(
      <AlertsEndpointFilter
        endpointOptions={endpointOptions}
        handleFilterChange={handleFilterChange}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    // Select first option
    await userEvent.click(
      screen.getByRole('option', { name: endpointOptions[0] })
    );
    // Select second option
    await userEvent.click(
      screen.getByRole('option', { name: endpointOptions[1] })
    );
    expect(handleFilterChange).toHaveBeenCalledWith(
      [...endpointOptions],
      'endpoint'
    );
  });
});

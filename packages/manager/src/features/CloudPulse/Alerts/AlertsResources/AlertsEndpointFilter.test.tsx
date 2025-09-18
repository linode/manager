import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertsEndpointFilter } from './AlertsEndpointFilter';

describe('AlertsEndpointFilter', () => {
  const endpointOptions = ['endpoint-1', 'endpoint-2'];
  it('calls handleFilterChange with correct arguments when an endpoint is selected', async () => {
    const handleFilterChange = vi.fn();

    const { getByRole } = renderWithTheme(
      <AlertsEndpointFilter
        endpointOptions={endpointOptions}
        handleFilterChange={handleFilterChange}
      />
    );

    await userEvent.click(getByRole('button', { name: 'Open' }));

    // Check first option exists
    expect(
      screen.getByRole('option', { name: endpointOptions[0] })
    ).toBeVisible();

    // Select first option
    await userEvent.click(getByRole('option', { name: endpointOptions[0] }));
    expect(handleFilterChange).toHaveBeenCalledWith(
      endpointOptions[0],
      'endpoint'
    );

    await userEvent.click(getByRole('button', { name: 'Open' }));

    // Check second option exists
    expect(
      screen.getByRole('option', { name: endpointOptions[1] })
    ).toBeVisible();

    // Select second option
    await userEvent.click(getByRole('option', { name: endpointOptions[1] }));
    expect(handleFilterChange).toHaveBeenCalledWith(
      endpointOptions[1],
      'endpoint'
    );
  });
});

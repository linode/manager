import { vi } from 'vitest';

import { AlertResourceAdditionalFilters } from './AlertsResourcesAdditionalFilters'; // Adjust the import path as necessary
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

const serviceType = 'dbaas';
// Mock handleFilterChange
const handleFilterChange = vi.fn();

describe('AlertResourceAdditionalFilters', () => {
  it('renders the correct filter components based on serviceType', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <AlertResourceAdditionalFilters
        handleFilterChange={handleFilterChange}
        serviceType={serviceType}
      />
    );

    expect(
      getByPlaceholderText('Select a Database Engine')
    ).toBeInTheDocument();
  });

  it('calls handleFilterChange when a filter selection changes', async () => {
    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <AlertResourceAdditionalFilters
        handleFilterChange={handleFilterChange}
        serviceType={serviceType}
      />
    );

    // Simulate user interaction with a filter component
    expect(
      getByPlaceholderText('Select a Database Engine')
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Open' }));
    expect(getByRole('option', { name: 'MySQL' })).toBeInTheDocument();
    // select an option
    await userEvent.click(getByRole('option', { name: 'MySQL' }));

    // Verify handleFilterChange was called
    expect(handleFilterChange).toHaveBeenCalledTimes(1);
  });
});

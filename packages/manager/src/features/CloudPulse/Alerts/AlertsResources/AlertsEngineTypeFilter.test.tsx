import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertsEngineOptionFilter } from './AlertsEngineTypeFilter';

describe('AlertsEngineOptionFilter', () => {
  it('calls handleSelection with correct arguments when an engine type is selected', async () => {
    // Mock the handleSelection function
    const handleSelection = vi.fn();

    // Render the component
    const { getByRole } = renderWithTheme(
      <AlertsEngineOptionFilter handleSelection={handleSelection} />
    );

    await userEvent.click(getByRole('button', { name: 'Open' }));
    expect(getByRole('option', { name: 'MySQL' })).toBeInTheDocument();
    // select an option
    await userEvent.click(getByRole('option', { name: 'MySQL' }));

    // Assert that the handleSelection function is called with the expected arguments
    expect(handleSelection).toHaveBeenCalledWith('mysql', 'engineType');

    await userEvent.click(getByRole('button', { name: 'Open' }));
    expect(getByRole('option', { name: 'PostgreSQL' })).toBeInTheDocument();
    // select an option
    await userEvent.click(getByRole('option', { name: 'PostgreSQL' }));
    expect(handleSelection).toHaveBeenCalledWith('mysql', 'engineType');
  });
});

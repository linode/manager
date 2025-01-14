import userEvent from '@testing-library/user-event';
import React from 'react';

import { regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertsRegionFilter } from './AlertsRegionFilter';

describe('AlertsRegionFilter component tests', () => {
  const mockRegions = regionFactory.buildList(3);

  it('should render the AlertsRegionFilter with required options', async () => {
    const { getByRole, getByTestId, queryByTestId } = renderWithTheme(
      <AlertsRegionFilter
        handleSelectionChange={vi.fn()}
        regionOptions={mockRegions}
      />
    );
    await userEvent.click(getByRole('button', { name: 'Open' }));
    expect(getByTestId(mockRegions[0].id)).toBeInTheDocument();
    // select an option
    await userEvent.click(getByTestId(mockRegions[0].id));

    await userEvent.click(getByRole('button', { name: 'Close' }));

    // validate the option is selected
    expect(queryByTestId(mockRegions[0].id)).toBeInTheDocument();

    // validate other options are not selected
    expect(queryByTestId(mockRegions[1].id)).not.toBeInTheDocument();

    // select another option
    await userEvent.click(getByRole('button', { name: 'Open' }));
    expect(getByTestId(mockRegions[1].id)).toBeInTheDocument();
    // select an option
    await userEvent.click(getByTestId(mockRegions[1].id));

    await userEvent.click(getByRole('button', { name: 'Close' }));

    // validate both the options are selected
    expect(queryByTestId(mockRegions[0].id)).toBeInTheDocument();
    expect(queryByTestId(mockRegions[1].id)).toBeInTheDocument();
  });

  it('should render the AlertsRegionFilter with empty options', async () => {
    const { getByRole, getByText } = renderWithTheme(
      <AlertsRegionFilter handleSelectionChange={vi.fn()} regionOptions={[]} />
    );
    await userEvent.click(getByRole('button', { name: 'Open' })); // indicates there is a drop down

    expect(getByText('No results')).toBeInTheDocument();
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDimensionFilterDrawer } from './CloudPulseDimensionFilterDrawer';

describe('CloudPulse dimension filter drawer tests', () => {
  it('renders the cloud pulse dimension filter drawer successfully', async () => {
    const handleClose = vi.fn();
    const handleSelectionChange = vi.fn();
    renderWithTheme(
      <CloudPulseDimensionFilterDrawer
        dimensionOptions={[]}
        drawerLabel="Test Metric"
        handleSelectionChange={handleSelectionChange}
        onClose={handleClose}
        open
        serviceType="linode"
      />
    );

    const drawerOpen = screen.getByText('Test Metric');
    expect(drawerOpen).toBeInTheDocument();
    const selectText = screen.getByText('Select up to 5 Dimension Filters');
    expect(selectText).toBeInTheDocument();
    await userEvent.click(screen.getByText('Add Filter'));
    // validate for form fields to be present
    const dataFieldContainer = screen.queryByTestId('dimension-field');
    expect(dataFieldContainer).toBeInTheDocument();
    const operatorContainer = screen.getByTestId('operator');
    expect(operatorContainer).toBeInTheDocument();
    const valueContainer = screen.getByTestId('value');
    expect(valueContainer).toBeInTheDocument();
    const applyButton = screen.getByText('Apply');
    expect(applyButton).toBeInTheDocument();
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
  });

  it('the clear all button in the drawer works correctly', async () => {
    const handleClose = vi.fn();
    const handleSelectionChange = vi.fn();
    const ariaDisabled = 'aria-hidden';
    renderWithTheme(
      <CloudPulseDimensionFilterDrawer
        dimensionOptions={[]}
        drawerLabel="Test Metric"
        handleSelectionChange={handleSelectionChange}
        onClose={handleClose}
        open
        serviceType="linode"
      />
    );

    const drawerOpen = screen.getByText('Test Metric');
    expect(drawerOpen).toBeInTheDocument();
    const selectText = screen.getByText('Select up to 5 Dimension Filters');
    expect(selectText).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toHaveAttribute(ariaDisabled, 'true'); // nothing is done in form
    await userEvent.click(screen.getByText('Add Filter'));
    expect(screen.getByText('Clear All')).toHaveAttribute(
      ariaDisabled,
      'false'
    ); // now we have added one filter field
    // validate for form fields to be present
    await userEvent.click(screen.getByText('Clear All'));
    expect(screen.getByText('Clear All')).toHaveAttribute(ariaDisabled, 'true'); // means the fields are cleared again
  });
});

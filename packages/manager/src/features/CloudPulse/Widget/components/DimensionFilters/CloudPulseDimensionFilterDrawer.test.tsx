import { screen } from '@testing-library/react';
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
    const selectText = screen.getByText('Select upto 5 Dimension Filters');
    expect(selectText).toBeInTheDocument();
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
});

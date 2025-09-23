import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDimensionFilterSelect } from './CloudPulseDimensionFiltersSelect';

import type { Dimension } from '@linode/api-v4';

const dimensionOptions: Dimension[] = [
  {
    dimension_label: 'test',
    values: ['XYZ', 'ZYX', 'YZX'],
    label: 'Test',
  },
  {
    dimension_label: 'sample',
    values: ['VALUE1', 'VALUE2', 'VALUE3'],
    label: 'Sample',
  },
];

describe('Tests for CloudPulse Dimension Filters Select', () => {
  it('renders the CloudPulse Dimension Filters with icon and drawer', async () => {
    const handleSubmit = vi.fn();
    renderWithTheme(
      <CloudPulseDimensionFilterSelect
        dimensionOptions={dimensionOptions}
        drawerLabel="Test Metric"
        handleSelectionChange={handleSubmit}
        selectedDimensions={[
          {
            dimension_label: 'test',
            operator: 'eq',
            value: 'YZX',
          },
        ]}
        serviceType="linode"
      />
    );
    const badge = screen.queryByText('1');
    expect(badge).toBeInTheDocument(); // should be there since we passed a selected filter
    await userEvent.click(screen.getByTestId('dimension-filter')); // click on icon
    // check for drawer fields
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

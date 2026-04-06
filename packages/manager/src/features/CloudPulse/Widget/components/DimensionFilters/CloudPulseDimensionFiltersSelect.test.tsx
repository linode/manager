import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDimensionFiltersSelect } from './CloudPulseDimensionFiltersSelect';

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
      <CloudPulseDimensionFiltersSelect
        dashboardId={1}
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
    const selectText = screen.getByText('Select up to 5 filters.');
    expect(selectText).toBeInTheDocument();
    const applyButton = screen.getByText('Apply');
    expect(applyButton).toBeInTheDocument();
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
  });
  it('renders the CloudPulse Dimension Filter icon with disabled tool tip text when no dimension options are passed', async () => {
    const handleSubmit = vi.fn();
    renderWithTheme(
      <CloudPulseDimensionFiltersSelect
        dashboardId={1}
        dimensionOptions={[]}
        drawerLabel="Test Metric"
        handleSelectionChange={handleSubmit}
        selectedDimensions={[]}
        serviceType="linode"
      />
    );

    // Verify the tooltip text is being rendered and the icon button is disabled
    const tooltipElement = screen.getByTestId(
      'No dimensions available for filtering'
    );
    expect(tooltipElement).toBeVisible();

    const iconButton = screen.getByTestId('dimension-filter');
    expect(iconButton).toBeDisabled();
  });
});

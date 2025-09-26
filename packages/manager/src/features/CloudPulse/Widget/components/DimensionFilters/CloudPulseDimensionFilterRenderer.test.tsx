import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDimensionFilterRenderer } from './CloudPulseDimensionFilterRenderer';

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
const dimensionFilterForZerothIndex = 'dimension_filters.0-id';
const addFilter = 'Add Filter';

describe('CloudPulse dimension filter field tests', () => {
  it('renders the filter fields based on the dimension options', async () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();
    const handleDimensionChange = vi.fn();
    renderWithTheme(
      <CloudPulseDimensionFilterRenderer
        clearAllTrigger={0}
        dataFieldDisabled={false}
        dimensionOptions={dimensionOptions}
        onClose={handleClose}
        onDimensionChange={handleDimensionChange}
        onSubmit={handleSubmit}
        serviceType="linode"
      />
    );
    await userEvent.click(screen.getByTestId(addFilter));
    await selectADimensionAndValue(
      screen.getByTestId(dimensionFilterForZerothIndex),
      0,
      'Equal',
      2
    );
    await userEvent.click(screen.getByTestId(addFilter));
    await selectADimensionAndValue(
      screen.getByTestId('dimension_filters.1-id'),
      1,
      'Not Equal',
      0
    );
    await userEvent.click(screen.getByText('Apply'));
    expect(handleClose).not.toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleDimensionChange).toHaveBeenCalledTimes(3);
    expect(handleSubmit).toHaveBeenLastCalledWith({
      dimension_filters: [
        {
          dimension_label: 'test',
          operator: 'eq',
          value: 'YZX',
        },
        {
          dimension_label: 'sample',
          operator: 'neq',
          value: 'VALUE1',
        },
      ],
    });
  });
  it('handles the cancel button correctly', async () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();
    renderWithTheme(
      <CloudPulseDimensionFilterRenderer
        clearAllTrigger={0}
        dataFieldDisabled={false}
        dimensionOptions={dimensionOptions}
        onClose={handleClose}
        onDimensionChange={vi.fn()}
        onSubmit={handleSubmit}
        selectedDimensions={[]}
        serviceType="linode"
      />
    );
    await userEvent.click(screen.getByTestId(addFilter));
    await selectADimensionAndValue(
      screen.getByTestId(dimensionFilterForZerothIndex),
      0,
      'Equal',
      2
    );
    await userEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleSubmit).not.toHaveBeenCalled();
  });
  it('handles the case when a proper already selected dimension is passed', async () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();
    const handleDimensionChange = vi.fn();
    renderWithTheme(
      <CloudPulseDimensionFilterRenderer
        clearAllTrigger={0}
        dataFieldDisabled={false}
        dimensionOptions={dimensionOptions}
        onClose={handleClose}
        onDimensionChange={handleDimensionChange}
        onSubmit={handleSubmit}
        selectedDimensions={[
          {
            dimension_label: 'test',
            operator: 'startswith',
            value: 'ZYX',
          },
        ]}
        serviceType="linode"
      />
    );
    const dimensionContainer = screen.getByTestId(
      dimensionFilterForZerothIndex
    );
    const dimension =
      within(dimensionContainer).getByPlaceholderText('Select a Dimension');
    expect(dimension).toHaveValue('Test');
    const operator =
      within(dimensionContainer).getByPlaceholderText('Select an Operator');
    expect(operator).toHaveValue('Starts with');
    const value =
      within(dimensionContainer).getByPlaceholderText('Enter a Value');
    expect(value).toHaveValue('ZYX');
    expect(screen.getByText('Apply')).toHaveAttribute('aria-disabled', 'true'); // form is not changed, so the apply button is disabled in this case
  });
});

const selectADimensionAndValue = async (
  dimensionFilterContainer: HTMLElement,
  dimensionOptionIndex: number,
  operator: string,
  valueOptionIndex: number
) => {
  const dataFieldContainer = within(dimensionFilterContainer).getByTestId(
    'dimension-field'
  );
  const dataFieldInput = within(dataFieldContainer).getByRole('button', {
    name: 'Open',
  });
  await userEvent.click(dataFieldInput);
  dimensionOptions.forEach(({ label }) => {
    screen.getByRole('option', {
      name: label,
    }); // implicit assertion
  });
  await userEvent.click(
    screen.getByRole('option', {
      name: dimensionOptions[dimensionOptionIndex].label,
    })
  );
  const operatorContainer = within(dimensionFilterContainer).getByTestId(
    'operator'
  );
  const operatorFieldInput = within(operatorContainer).getByRole('button', {
    name: 'Open',
  });
  await userEvent.click(operatorFieldInput);
  screen.getByRole('option', {
    name: 'In',
  }); // implicit assertion
  screen.getByRole('option', {
    name: 'Equal',
  });
  await userEvent.click(screen.getByRole('option', { name: operator }));
  const valueContainer = within(dimensionFilterContainer).getByTestId('value');
  const valueFieldInput = within(valueContainer).getByRole('button', {
    name: 'Open',
  });
  await userEvent.click(valueFieldInput);
  dimensionOptions[dimensionOptionIndex].values.forEach((value) => {
    screen.getByRole('option', {
      name: value,
    }); // implicit assertion
  });
  await userEvent.click(
    screen.getByRole('option', {
      name: dimensionOptions[dimensionOptionIndex].values[valueOptionIndex],
    })
  );
};

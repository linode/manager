import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseDimensionFilterFields } from './CloudPulseDimensionFilterFields';

import type { MetricsDimensionFilterForm } from './types';
import type { Dimension } from '@linode/api-v4';

const dimensionOptions: Dimension[] = [
  {
    dimension_label: 'test',
    values: ['XYZ', 'ZYX', 'YZX'],
    label: 'Test',
  },
  {
    dimension_label: 'sample',
    values: ['value1', 'value2', 'value3'],
    label: 'Sample',
  },
];

describe('CloudPulse dimension filter field tests', () => {
  it('renders the filter fields based on the dimension options', async () => {
    const handleDelete = vi.fn();
    renderWithThemeAndHookFormContext<MetricsDimensionFilterForm>({
      component: (
        <CloudPulseDimensionFilterFields
          dataFieldDisabled={false}
          dimensionOptions={dimensionOptions}
          name={`dimension_filters.${1}`}
          onFilterDelete={handleDelete}
          serviceType="linode"
        />
      ),
      useFormOptions: {
        defaultValues: {
          dimension_filters: [
            {
              dimension_label: null,
              operator: null,
              value: null,
            },
          ],
        },
      },
    });
    const dataFieldContainer = screen.getByTestId('dimension-field');
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
      screen.getByRole('option', { name: dimensionOptions[0].label })
    );
    const operatorContainer = screen.getByTestId('operator');
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
    await userEvent.click(screen.getByRole('option', { name: 'Equal' }));
    const valueContainer = screen.getByTestId('value');
    const valueFieldInput = within(valueContainer).getByRole('button', {
      name: 'Open',
    });
    await userEvent.click(valueFieldInput);
    dimensionOptions[0].values.forEach((value) => {
      screen.getByRole('option', {
        name: value,
      }); // implicit assertion
    });
    await userEvent.click(
      screen.getByRole('option', { name: dimensionOptions[0].values[2] })
    );

    // click on delete and see if handle delete is called
    await userEvent.click(screen.getByTestId('clear-icon'));
    expect(handleDelete).toBeCalledTimes(1);
  });
});

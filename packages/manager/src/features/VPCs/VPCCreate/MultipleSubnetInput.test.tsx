import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { MultipleSubnetInput } from './MultipleSubnetInput';

const props = {
  disabled: false,
  isDrawer: false,
};

const formOptions = {
  defaultValues: {
    description: '',
    label: '',
    region: '',
    subnets: [
      {
        ipv4: '',
        label: 'subnet 0',
      },
      {
        ipv4: '',
        label: 'subnet 1',
      },
      {
        ipv4: '',
        label: 'subnet 2',
      },
    ],
  },
};

describe('MultipleSubnetInput', () => {
  it('should render a subnet node for each of the given subnets', () => {
    const { getAllByText, getByDisplayValue } =
      renderWithThemeAndHookFormContext({
        component: <MultipleSubnetInput {...props} />,
        useFormOptions: formOptions,
      });

    expect(getAllByText('Subnet Label')).toHaveLength(3);
    expect(getAllByText('Subnet IP Address Range')).toHaveLength(3);
    getByDisplayValue('subnet 0');
    getByDisplayValue('subnet 1');
    getByDisplayValue('subnet 2');
  });

  it('should display "Add a Subnet" if there are no subnets', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <MultipleSubnetInput {...props} />,
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    getByText('Add a Subnet');
  });

  it('should add a subnet to the array when the Add Subnet button is clicked', async () => {
    const { getByDisplayValue, getByText } = renderWithThemeAndHookFormContext({
      component: <MultipleSubnetInput {...props} />,
      useFormOptions: formOptions,
    });
    const addButton = getByText('Add another Subnet');
    await userEvent.click(addButton);

    expect(getByDisplayValue('10.0.1.0/24')).toBeVisible();
  });

  it('all subnets should have a delete button (X) if not in a drawer', () => {
    const { queryAllByTestId } = renderWithThemeAndHookFormContext({
      component: <MultipleSubnetInput {...props} />,
      useFormOptions: formOptions,
    });
    expect(queryAllByTestId(/delete-subnet/)).toHaveLength(
      formOptions.defaultValues.subnets.length
    );
  });

  it('the first does not have a delete button if in a drawer', () => {
    const { queryAllByTestId, queryByTestId } =
      renderWithThemeAndHookFormContext({
        component: <MultipleSubnetInput {...props} isDrawer={true} />,
        useFormOptions: formOptions,
      });
    expect(queryAllByTestId(/delete-subnet/)).toHaveLength(
      formOptions.defaultValues.subnets.length - 1
    );
    expect(queryByTestId('delete-subnet-0')).toBeNull();
  });

  it('should remove an element from the array based on its index when the X is clicked', async () => {
    const { getByTestId, queryByDisplayValue } =
      renderWithThemeAndHookFormContext({
        component: <MultipleSubnetInput {...props} />,
        useFormOptions: formOptions,
      });
    const closeButton = getByTestId('delete-subnet-1');
    await userEvent.click(closeButton);
    expect(queryByDisplayValue('subnet-1')).toBeNull();
  });
});

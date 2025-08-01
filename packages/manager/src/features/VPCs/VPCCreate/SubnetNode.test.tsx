import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { SubnetNode } from './SubnetNode';

const props = {
  idx: 0,
  isCreateVPCDrawer: false,
  remove: vi.fn(),
};

const formOptions = {
  defaultValues: {
    description: '',
    label: '',
    region: '',
    subnets: [
      {
        ipv4: '10.0.0.0',
        label: 'subnet 0',
      },
    ],
  },
};

describe('SubnetNode', () => {
  it('should show the correct subnet mask', async () => {
    const { getByDisplayValue, getByText } = renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    getByDisplayValue('10.0.0.0/24');
    getByText('Number of Available IP Addresses: 252');
  });

  it('should not show a subnet mask for an ip without a mask', async () => {
    const { getByDisplayValue, queryByText } =
      renderWithThemeAndHookFormContext({
        component: <SubnetNode {...props} />,
        useFormOptions: formOptions,
      });

    getByDisplayValue('10.0.0.0');
    expect(queryByText('Number of Available IP Addresses:')).toBeNull();
  });

  it('should show a label and ip textfield inputs at minimum', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    getByText('Subnet Label');
    getByText('Subnet IP Address Range');
  });

  it('should show a removable button if not a drawer', () => {
    const { getByTestId } = renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    expect(getByTestId('delete-subnet-0')).toBeInTheDocument();
  });

  it('should not show a removable button if a drawer for the first subnet', () => {
    const { queryByTestId } = renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} isCreateVPCDrawer={true} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    expect(queryByTestId('delete-subnet-0')).toBeNull();
  });
});

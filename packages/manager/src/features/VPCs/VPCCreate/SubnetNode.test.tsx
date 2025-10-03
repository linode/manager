import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { SubnetNode } from './SubnetNode';

const props = {
  idx: 0,
  isCreateVPCDrawer: false,
  remove: vi.fn(),
  shouldDisplayIPv6: false,
};

const formOptions = {
  defaultValues: {
    description: '',
    label: '',
    ipv6: null,
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
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    screen.getByDisplayValue('10.0.0.0/24');
    screen.getByText('Number of Available IP Addresses: 252');
  });

  it('should not show a subnet mask for an ip without a mask', async () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} />,
      useFormOptions: formOptions,
    });

    screen.getByDisplayValue('10.0.0.0');
    expect(screen.queryByText('Number of Available IP Addresses:')).toBeNull();
  });

  it('should show a label and ip textfield inputs at minimum', () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    screen.getByText('Subnet Label');
    screen.getByText('Subnet IPv4 Range (CIDR)');
  });

  it('should show a removable button if not a drawer', () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    expect(screen.getByTestId('delete-subnet-0')).toBeInTheDocument();
  });

  it('should not show a removable button if a drawer for the first subnet', () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} isCreateVPCDrawer={true} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [{ ipv4: '10.0.0.0/24', label: 'subnet 0' }],
        },
      },
    });

    expect(screen.queryByTestId('delete-subnet-0')).toBeNull();
  });

  it('should not show IPv6 Prefix Length dropdown if shouldDisplayIPv6 is false', () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} shouldDisplayIPv6={false} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          subnets: [
            {
              ipv4: '10.0.0.0/24',
              label: 'subnet 0',
            },
          ],
        },
      },
    });

    expect(screen.queryByText('IPv6 Prefix Length')).not.toBeInTheDocument();
  });

  it('should show IPv6 Prefix Length dropdown with /56 selected by default if shouldDisplayIPv6 is true', () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} shouldDisplayIPv6={true} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          ipv6: [{ range: '/52' }],
          subnets: [
            {
              ipv4: '10.0.0.0/24',
              ipv6: [{ range: '/56' }],
              label: 'subnet 0',
            },
          ],
        },
      },
    });

    expect(screen.getByText('Subnet IPv6 Prefix Length')).toBeVisible();
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('/56');
  });

  it('should display number of linodes helper text instead of number of available IPs if shouldDisplayIPv6 is true', () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} shouldDisplayIPv6={true} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          ipv6: [{ range: '/52' }],
          subnets: [
            {
              ipv4: '10.0.0.0/24',
              ipv6: [{ range: '/56' }],
              label: 'subnet 0',
            },
          ],
        },
      },
    });

    expect(screen.getByText('Number of Linodes: 252')).toBeVisible();
    expect(
      screen.queryByText('Number of Available IP Addresses: 252')
    ).not.toBeInTheDocument();
  });

  it('should display zero instead of negative numbers for linodes helper text', () => {
    renderWithThemeAndHookFormContext({
      component: <SubnetNode {...props} shouldDisplayIPv6={true} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          ipv6: [{ range: '/52' }],
          subnets: [
            {
              ipv4: '10.0.0.0/32',
              ipv6: [{ range: '/56' }],
              label: 'subnet 0',
            },
          ],
        },
      },
    });

    expect(screen.getByText('Number of Linodes: 0')).toBeVisible();
  });
});

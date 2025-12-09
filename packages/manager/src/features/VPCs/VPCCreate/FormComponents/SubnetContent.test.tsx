import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { SubnetContent } from './SubnetContent';

describe('Subnet form content', () => {
  it('renders the subnet content correctly', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <SubnetContent />,
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [{ ipv4: '', label: '' }],
        },
      },
    });

    expect(getByText('Subnets')).toBeVisible();
    expect(getByText('Subnet Label')).toBeVisible();
    expect(getByText('Subnet IPv4 Range (CIDR)')).toBeVisible();
    expect(getByText('Add another Subnet')).toBeVisible();
  });
});

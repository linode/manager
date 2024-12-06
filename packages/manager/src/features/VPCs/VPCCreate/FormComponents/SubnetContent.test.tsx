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

    getByText('Subnets');
    getByText('Subnet Label');
    getByText('Subnet IP Address Range');
    getByText('Add another Subnet');
  });
});

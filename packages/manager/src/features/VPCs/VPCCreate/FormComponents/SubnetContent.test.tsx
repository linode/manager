import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetContent } from './SubnetContent';

const props = {
  disabled: false,
  onChangeField: jest.fn(),
  subnets: [
    {
      ip: { ipv4: '', ipv4Error: '' },
      label: 'subnet 1',
      labelError: '',
    },
  ],
};

describe('Subnet form content', () => {
  it('renders the subnet content correctly', () => {
    const { getByText } = renderWithTheme(<SubnetContent {...props} />);

    getByText('Subnets');
    getByText('Subnet Label');
    getByText('Subnet IP Address Range');
    getByText('Add another Subnet');
  });
});

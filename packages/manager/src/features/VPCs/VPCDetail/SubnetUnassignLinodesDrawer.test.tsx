import { Subnet } from '@linode/api-v4';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetUnassignLinodesDrawer } from './SubnetUnassignLinodesDrawer';

const props = {
  onClose: jest.fn(),
  open: true,
  subnet: {
    id: 1,
    ipv4: '10.0.0.0/24',
    label: 'subnet-1',
  } as Subnet,
  vpcId: 1,
};

describe('Subnet Assign Linodes Drawer', () => {
  it('should render a subnet assign linodes drawer', () => {
    const { getByText } = renderWithTheme(
      <SubnetUnassignLinodesDrawer {...props} />
    );

    const header = getByText(
      'Unassign Linodes from subnet: subnet-1 (10.0.0.0/24)'
    );
    expect(header).toBeVisible();
    const notice = getByText(
      'Unassigning Linodes from a subnet requires you to reboot the Linodes to update its configuration.'
    );
    expect(notice).toBeVisible();

    const linodeSelect = getByText('Linodes');
    expect(linodeSelect).toBeVisible();
  });
});

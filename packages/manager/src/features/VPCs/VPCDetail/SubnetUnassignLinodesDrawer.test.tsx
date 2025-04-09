import * as React from 'react';

import { SUBNET_UNASSIGN_LINODES_WARNING } from 'src/features/VPCs/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetUnassignLinodesDrawer } from './SubnetUnassignLinodesDrawer';

import type { Subnet } from '@linode/api-v4';

const props = {
  isFetching: false,
  onClose: vi.fn(),
  open: true,
  subnet: {
    id: 1,
    ipv4: '10.0.0.0/24',
    label: 'subnet-1',
  } as Subnet,
  vpcId: 1,
};

describe('Subnet Unassign Linodes Drawer', () => {
  it('should render a subnet Unassign linodes drawer', () => {
    const { getByText } = renderWithTheme(
      <SubnetUnassignLinodesDrawer {...props} />
    );

    const header = getByText(
      'Unassign Linodes from subnet: subnet-1 (10.0.0.0/24)'
    );
    expect(header).toBeVisible();
    const notice = getByText(SUBNET_UNASSIGN_LINODES_WARNING);
    expect(notice).toBeVisible();

    const linodeSelect = getByText('Linodes');
    expect(linodeSelect).toBeVisible();
  });
});

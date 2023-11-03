import { Subnet } from '@linode/api-v4';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetAssignLinodesDrawer } from './SubnetAssignLinodesDrawer';

const props = {
  onClose: jest.fn(),
  open: true,
  subnet: {
    id: 1,
    ipv4: '10.0.0.0/24',
    label: 'subnet-1',
  } as Subnet,
  vpcId: 1,
  vpcRegion: '',
};

describe('Subnet Assign Linodes Drawer', () => {
  it('should render a subnet assign linodes drawer', () => {
    const { getByText, queryByText } = renderWithTheme(
      <SubnetAssignLinodesDrawer {...props} />
    );

    const header = getByText(
      'Assign Linodes to subnet: subnet-1 (10.0.0.0/24)'
    );
    expect(header).toBeVisible();
    const notice = getByText(
      'Assigning a Linode to a subnet requires you to reboot the Linode to update its configuration.'
    );
    expect(notice).toBeVisible();
    const helperText = getByText(
      `Select the Linodes you would like to assign to this subnet. Only Linodes in this VPC's region are displayed.`
    );
    expect(helperText).toBeVisible();
    const linodeSelect = getByText('Linodes');
    expect(linodeSelect).toBeVisible();
    const checkbox = getByText(
      'Auto-assign a VPC IPv4 address for this Linode'
    );
    expect(checkbox).toBeVisible();
    const ipv4Textbox = queryByText('VPC IPv4');
    expect(ipv4Textbox).toBeNull();
    const assignButton = getByText('Assign Linode');
    expect(assignButton).toBeVisible();
    const alreadyAssigned = getByText('Linodes Assigned to Subnet (0)');
    expect(alreadyAssigned).toBeVisible();
    const doneButton = getByText('Done');
    expect(doneButton).toBeVisible();
  });

  it('should show the IPv4 textbox when the checkmark is clicked', () => {
    const { getByText } = renderWithTheme(
      <SubnetAssignLinodesDrawer {...props} />
    );

    const checkbox = getByText(
      'Auto-assign a VPC IPv4 address for this Linode'
    );
    expect(checkbox).toBeVisible();
    fireEvent.click(checkbox);

    const ipv4Textbox = getByText('VPC IPv4');
    expect(ipv4Textbox).toBeVisible();
  });

  it('should close the drawer', () => {
    const { getByText } = renderWithTheme(
      <SubnetAssignLinodesDrawer {...props} />
    );

    const doneButton = getByText('Done');
    expect(doneButton).toBeVisible();
    fireEvent.click(doneButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});

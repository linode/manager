import { linodeFactory } from '@linode/utilities';
import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetAssignLinodesDrawer } from './SubnetAssignLinodesDrawer';

import type { Subnet } from '@linode/api-v4';

beforeAll(() => mockMatchMedia());

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
  vpcRegion: 'us-east',
};

describe('Subnet Assign Linodes Drawer', () => {
  const linode = linodeFactory.build({
    label: 'this-linode',
    region: props.vpcRegion,
  });

  server.use(
    http.get('*/linode/instances', () => {
      return HttpResponse.json(makeResourcePage([linode]));
    })
  );

  it('should render a subnet assign linodes drawer', () => {
    const { getByText, queryAllByText } = renderWithTheme(
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
    const linodeSelect = queryAllByText('Linode')[0];
    expect(linodeSelect).toBeVisible();

    const assignButton = getByText('Assign Linode');
    expect(assignButton).toBeVisible();
    const alreadyAssigned = getByText(
      'Linodes recently assigned to Subnet (0)'
    );
    expect(alreadyAssigned).toBeVisible();
    const doneButton = getByText('Done');
    expect(doneButton).toBeVisible();
  });

  it.skip('should show the IPv4 textbox when the checkmark is clicked', async () => {
    const { findByText, getByLabelText } = renderWithTheme(
      <SubnetAssignLinodesDrawer {...props} />
    );

    const selectField = getByLabelText('Linode');
    fireEvent.change(selectField, { target: { value: 'this-linode' } });

    const checkbox = await findByText(
      'Auto-assign a VPC IPv4 address for this Linode'
    );

    await waitFor(() => expect(checkbox).toBeVisible());
    fireEvent.click(checkbox);

    const ipv4Textbox = await findByText('VPC IPv4');
    await waitFor(() => expect(ipv4Textbox).toBeVisible());
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

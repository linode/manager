import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { firewallSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetAssignLinodesDrawer } from './SubnetAssignLinodesDrawer';

import type { Subnet } from '@linode/api-v4';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useFirewallSettingsQuery: vi.fn().mockReturnValue({}),
}));

const iamMocks = vi.hoisted(() => ({
  usePermissions: vi.fn().mockReturnValue({ data: { update_vpc: true } }),
  useGetUserEntitiesByPermission: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useFirewallSettingsQuery: queryMocks.useFirewallSettingsQuery,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: iamMocks.usePermissions,
}));

vi.mock('src/features/IAM/hooks/useGetUserEntitiesByPermission', () => ({
  useGetUserEntitiesByPermission: iamMocks.useGetUserEntitiesByPermission,
}));

const props = {
  isFetching: false,
  onClose: vi.fn(),
  open: true,
  subnet: {
    id: 1,
    ipv4: '10.0.0.0/24',
    label: 'subnet-1',
    linodes: [],
    nodebalancers: [],
    created: '',
    updated: '',
  } as Subnet,
  vpcId: 1,
  vpcRegion: 'us-east',
};

describe('Subnet Assign Linodes Drawer', () => {
  const linode = linodeFactory.build({
    label: 'this-linode',
    region: props.vpcRegion,
  });

  beforeEach(() => {
    // Set up the default mock to return the linode
    iamMocks.useGetUserEntitiesByPermission.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
  });

  server.use(
    http.get('*/linode/instances', () => {
      return HttpResponse.json(makeResourcePage([linode]));
    })
  );

  it('should render a subnet assign linodes drawer', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <SubnetAssignLinodesDrawer {...props} />
    );

    const header = getByText('Assign Linodes to subnet: subnet-1');
    expect(header).toBeVisible();
    const notice = getByTestId('subnet-linode-action-notice');
    expect(notice).toBeVisible();
    const helperText = getByText(
      `Select the Linodes you would like to assign to this subnet. Only Linodes in this VPC's region are displayed.`
    );
    expect(helperText).toBeVisible();
    const linodeSelect = getByTestId('add-linode-autocomplete');
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

  it('should close the drawer', async () => {
    queryMocks.useFirewallSettingsQuery.mockReturnValue({
      data: firewallSettingsFactory.build(),
    });

    const { getByText } = renderWithTheme(
      <SubnetAssignLinodesDrawer {...props} />
    );

    const doneButton = getByText('Done');
    expect(doneButton).toBeVisible();
    await userEvent.click(doneButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});

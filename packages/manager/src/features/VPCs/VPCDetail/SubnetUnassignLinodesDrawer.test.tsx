import { linodeFactory, linodeInterfaceFactoryVPC } from '@linode/utilities';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetUnassignLinodesDrawer } from './SubnetUnassignLinodesDrawer';

import type { Subnet } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useGetAllUserEntitiesByPermission: vi.fn().mockReturnValue({
    data: [],
    error: null,
    isLoading: false,
  }),
}));

vi.mock('src/features/IAM/hooks/useGetAllUserEntitiesByPermission', () => ({
  useGetAllUserEntitiesByPermission:
    queryMocks.useGetAllUserEntitiesByPermission,
}));

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
  const linode = linodeFactory.build({
    label: 'rdma-linode',
    interface_generation: 'linode',
  });

  beforeEach(() => {
    queryMocks.useGetAllUserEntitiesByPermission.mockReturnValue({
      data: [linode],
      error: null,
      isLoading: false,
    });
  });

  it('should render a subnet Unassign linodes drawer', () => {
    const view = renderWithTheme(<SubnetUnassignLinodesDrawer {...props} />);

    const header = view.getByText(
      'Unassign Linodes from subnet: subnet-1 (10.0.0.0/24)'
    );
    expect(header).toBeVisible();
    const notice = view.getByTestId('subnet-linode-action-notice');
    expect(notice).toBeVisible();

    const linodeSelect = view.getByText('Linodes');
    expect(linodeSelect).toBeVisible();
  });

  it('shows an RDMA linode in the selection table', async () => {
    const rdmaInterface = linodeInterfaceFactoryVPC.build({
      vpc: null,
      rdma_vpc: {
        ipv4: {
          addresses: [
            {
              address: '10.0.0.8',
              primary: true,
            },
          ],
          ranges: [],
        },
        subnet_id: props.subnet.id,
        vpc_id: props.vpcId,
      },
    });

    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({ interfaces: [rdmaInterface] });
      })
    );

    const { findByText } = renderWithTheme(
      <SubnetUnassignLinodesDrawer
        {...props}
        singleLinodeToBeUnassigned={linode}
      />
    );

    expect(
      await findByText('Linodes to be Unassigned from Subnet (1)')
    ).toBeVisible();
    expect(await findByText('rdma-linode')).toBeVisible();
    expect(await findByText('10.0.0.8')).toBeVisible();
  });
});

import { linodeFactory, linodeInterfaceFactoryVPC } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';
import { mockMatchMedia } from 'src/utilities/testHelpers';

import { SubnetRDMALinodeRow } from './SubnetRDMALinodeRow';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useLinodeInterfacesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
    useLinodeInterfacesQuery: queryMocks.useLinodeInterfacesQuery,
  };
});

const linode = linodeFactory.build({ id: 1, label: 'linode-1' });

beforeAll(() => mockMatchMedia());

describe('SubnetRDMALinodeRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useLinodeQuery.mockReturnValue({ data: linode });
  });

  it('displays the linode label and the number of RDMA interfaces belonging to this VPC', () => {
    const rdmaInterface = linodeInterfaceFactoryVPC.build({
      id: 987654321,
      mac_address: 'aa:bb:cc:dd:ee:ff',
      vpc: null,
      rdma_vpc: {
        vpc_id: 1,
        subnet_id: 419438,
        ipv4: {
          addresses: [
            {
              address: '10.0.0.2',
              primary: true,
            },
          ],
        },
      },
    });
    const otherVpcInterface = linodeInterfaceFactoryVPC.build({
      id: 6,
      vpc: { ...linodeInterfaceFactoryVPC.build().vpc!, vpc_id: 2 },
    });
    queryMocks.useLinodeInterfacesQuery.mockReturnValue({
      data: { interfaces: [rdmaInterface, otherVpcInterface] },
    });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetRDMALinodeRow
          linodeId={linode.id}
          numberOfInterfaces={8}
          vpcId={1}
        />
      )
    );

    expect(getByText('linode-1')).toBeVisible();
    expect(getByText('8')).toBeVisible();
  });

  it('shows the interface details', async () => {
    const rdmaInterface = linodeInterfaceFactoryVPC.build({
      id: 987654321,
      mac_address: 'aa:bb:cc:dd:ee:ff',
      vpc: null,
      rdma_vpc: {
        vpc_id: 1,
        subnet_id: 419438,
        ipv4: {
          addresses: [
            {
              address: '10.0.0.2',
              primary: true,
            },
          ],
        },
      },
    });
    queryMocks.useLinodeInterfacesQuery.mockReturnValue({
      data: { interfaces: [rdmaInterface] },
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetRDMALinodeRow
          linodeId={linode.id}
          numberOfInterfaces={8}
          vpcId={1}
        />
      )
    );

    await userEvent.click(getByLabelText('expand linode-1 row'));

    expect(getByText(rdmaInterface.id)).toBeVisible();
    expect(getByText(rdmaInterface.mac_address)).toBeVisible();
  });

  it('shows an empty message when there are no RDMA interfaces for this VPC', async () => {
    queryMocks.useLinodeInterfacesQuery.mockReturnValue({
      data: { interfaces: [] },
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetRDMALinodeRow
          linodeId={linode.id}
          numberOfInterfaces={8}
          vpcId={1}
        />
      )
    );

    await userEvent.click(getByLabelText('expand linode-1 row'));

    expect(getByText('No RDMA Interfaces')).toBeVisible();
  });
});

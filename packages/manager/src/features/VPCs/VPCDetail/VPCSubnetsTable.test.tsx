import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { firewallSettingsFactory } from 'src/factories';
import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories/subnets';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import { VPCSubnetsTable } from './VPCSubnetsTable';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
  useSubnetsQuery: vi.fn().mockReturnValue({}),
  useFirewallSettingsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useSubnetsQuery: queryMocks.useSubnetsQuery,
    useFirewallSettingsQuery: queryMocks.useFirewallSettingsQuery,
  };
});

describe('VPC Subnets table', () => {
  beforeEach(() => {
    queryMocks.useFirewallSettingsQuery.mockReturnValue({
      data: firewallSettingsFactory.build(),
    });
  });

  it('should display filter input, subnet label, id, ip range, number of linodes, and action menu', async () => {
    const subnet = subnetFactory.build({
      linodes: [
        subnetAssignedLinodeDataFactory.build({ id: 1 }),
        subnetAssignedLinodeDataFactory.build({ id: 2 }),
        subnetAssignedLinodeDataFactory.build({ id: 3 }),
      ],
    });
    queryMocks.useSubnetsQuery.mockReturnValue({
      data: {
        data: [subnet],
      },
    });

    const { getByLabelText, getAllByText, getByPlaceholderText, getByText } =
      await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={1}
          vpcRegion=""
        />
      );

    getByPlaceholderText('Filter Subnets by label or id');
    getByText('Subnet');
    getByText(subnet.label);
    getByText('Subnet ID');
    getAllByText(subnet.id);

    getByText('Subnet IP Range');
    getByText(subnet.ipv4!);

    getByText('Linodes');
    getByText(subnet.linodes.length);

    const actionMenuButton = getByLabelText(
      `Action menu for Subnet ${subnet.label}`
    );
    await userEvent.click(actionMenuButton);

    getByText('Assign Linodes');
    getByText('Unassign Linodes');
    getByText('Edit');
    getByText('Delete');
  });

  it('should display filter input, subnet label, id, ip range, number of resources, and action menu', async () => {
    const subnet = subnetFactory.build({
      linodes: [
        subnetAssignedLinodeDataFactory.build({ id: 1 }),
        subnetAssignedLinodeDataFactory.build({ id: 2 }),
        subnetAssignedLinodeDataFactory.build({ id: 3 }),
      ],
    });
    queryMocks.useSubnetsQuery.mockReturnValue({
      data: {
        data: [subnet],
      },
    });

    const { getByLabelText, getAllByText, getByPlaceholderText, getByText } =
      await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={1}
          vpcRegion=""
        />,
        {
          flags: { nodebalancerVpc: true },
        }
      );

    getByPlaceholderText('Filter Subnets by label or id');
    getByText('Subnet');
    getByText(subnet.label);
    getByText('Subnet ID');
    getAllByText(subnet.id);

    getByText('Subnet IP Range');
    getByText(subnet.ipv4!);

    getByText('Resources');
    getByText(subnet.linodes.length + subnet.nodebalancers.length);

    const actionMenuButton = getByLabelText(
      `Action menu for Subnet ${subnet.label}`
    );
    await userEvent.click(actionMenuButton);

    getByText('Assign Linodes');
    getByText('Unassign Linodes');
    getByText('Edit');
    getByText('Delete');
  });

  it('should display no linodes text if there are no linodes associated with the subnet', async () => {
    const subnet = subnetFactory.build({ linodes: [] });
    queryMocks.useSubnetsQuery.mockReturnValue({
      data: {
        data: [subnet],
      },
    });

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={2}
        vpcRegion=""
      />
    );

    const expandTableButton = getByLabelText(`expand ${subnet.label} row`);
    await userEvent.click(expandTableButton);
    getByText('No Linodes');
  });

  it('should show linode table head data when table is expanded', async () => {
    const subnet = subnetFactory.build({
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });

    queryMocks.useSubnetsQuery.mockReturnValue({
      data: {
        data: [subnet],
      },
    });

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={3}
        vpcRegion=""
      />
    );

    const expandTableButton = getByLabelText(`expand ${subnet.label} row`);
    await userEvent.click(expandTableButton);

    getByText('Linode');
    getByText('Status');
    getByText('VPC IPv4');
    getByText('Firewalls');
  });

  it(
    'should show Nodebalancer table head data when table is expanded',
    async () => {
      const subnet = subnetFactory.build();

      queryMocks.useSubnetsQuery.mockReturnValue({
        data: {
          data: [subnet],
        },
      });

      const { getByLabelText, findByText } = await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={3}
          vpcRegion=""
        />,
        { flags: { nodebalancerVpc: true } }
      );

      const expandTableButton = getByLabelText(`expand ${subnet.label} row`);
      await userEvent.click(expandTableButton);

      await findByText('NodeBalancer');
      await findByText('Backend Status');
      await findByText('VPC IPv4 Range');
    },
    { timeout: 15_000 }
  );

  it('should disable Create Subnet button if the VPC is associated with a LKE-E cluster', async () => {
    const { getByRole } = await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={true}
        vpcId={3}
        vpcRegion=""
      />
    );

    const createButton = getByRole('button', {
      name: 'Create Subnet',
    });
    expect(createButton).toBeDisabled();
  });
});

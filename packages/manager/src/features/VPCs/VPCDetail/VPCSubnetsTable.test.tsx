import { screen, waitForElementToBeRemoved } from '@testing-library/react';
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
  useFlags: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
  useSubnetsQuery: vi.fn().mockReturnValue({}),
  useFirewallSettingsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});
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

const loadingTestId = 'circle-progress';

describe('VPC Subnets table', () => {
  beforeEach(() => {
    queryMocks.useFirewallSettingsQuery.mockReturnValue({
      data: firewallSettingsFactory.build(),
    });
  });

  it('should display filter input, subnet label, id, ip range, number of linodes, and action menu', async () => {
    const subnet = subnetFactory.build({
      id: 27,
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

    const { getByLabelText, getByPlaceholderText, getByText } =
      await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={1}
          vpcRegion=""
        />
      );

    expect(getByPlaceholderText('Filter Subnets by label or id')).toBeVisible();
    expect(getByText('Subnet')).toBeVisible();
    expect(getByText(subnet.label)).toBeVisible();
    expect(getByText('Subnet ID')).toBeVisible();
    expect(getByText(subnet.id)).toBeVisible();

    expect(getByText('Subnet IP Range')).toBeVisible();
    expect(getByText(subnet.ipv4!)).toBeVisible();

    expect(getByText('Linodes')).toBeVisible();
    expect(getByText(subnet.linodes.length)).toBeVisible();

    const actionMenuButton = getByLabelText(
      `Action menu for Subnet ${subnet.label}`
    );
    await userEvent.click(actionMenuButton);

    expect(getByText('Assign Linodes')).toBeVisible();
    expect(getByText('Unassign Linodes')).toBeVisible();
    expect(getByText('Edit')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('should display filter input, subnet label, id, ip range, number of resources, and action menu', async () => {
    const subnet = subnetFactory.build({
      id: 39,
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

    const { getByLabelText, getByPlaceholderText, getByText } =
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

    expect(getByPlaceholderText('Filter Subnets by label or id')).toBeVisible();
    expect(getByText('Subnet')).toBeVisible();
    expect(getByText(subnet.label)).toBeVisible();
    expect(getByText('Subnet ID')).toBeVisible();
    expect(getByText(subnet.id)).toBeVisible();

    expect(getByText('Subnet IP Range')).toBeVisible();
    expect(getByText(subnet.ipv4!)).toBeVisible();

    expect(getByText('Resources')).toBeVisible();
    expect(
      getByText(subnet.linodes.length + subnet.nodebalancers.length)
    ).toBeVisible();

    const actionMenuButton = getByLabelText(
      `Action menu for Subnet ${subnet.label}`
    );
    await userEvent.click(actionMenuButton);

    expect(getByText('Assign Linodes')).toBeVisible();
    expect(getByText('Unassign Linodes')).toBeVisible();
    expect(getByText('Edit')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
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
    expect(getByText('No Linodes')).toBeVisible();
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

    // @TODO VPC IPv6: Remove this flag mock once VPC IPv6 is fully rolled out, and update
    // the assertion to expect the IPv6 columns are present
    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={3}
        vpcRegion=""
      />,
      { flags: { vpcIpv6: false } }
    );

    const expandTableButton = getByLabelText(`expand ${subnet.label} row`);
    await userEvent.click(expandTableButton);

    getByText('Linode');
    getByText('Status');
    getByText('VPC IPv4');
    getByText('Firewalls');

    expect(screen.queryByText('VPC IPv6')).not.toBeInTheDocument();
    expect(screen.queryByText('VPC IPv6 Ranges')).not.toBeInTheDocument();
  });

  // @TODO VPC IPv6: Remove this assertion once VPC IPv6 is fully rolled out
  it('renders VPC IPv6 and VPC IPv6 Range columns in Linode table when vpcIpv6 feature flag is enabled', async () => {
    const subnet = subnetFactory.build({
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });

    queryMocks.useSubnetsQuery.mockReturnValue({
      data: {
        data: [subnet],
      },
    });

    await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={3}
        vpcRegion=""
      />,
      { flags: { vpcIpv6: true } }
    );

    const loadingState = screen.queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const expandTableButton = screen.getAllByRole('button')[3];
    await userEvent.click(expandTableButton);

    await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={3}
        vpcRegion=""
      />
    );

    expect(screen.getByText('VPC IPv6')).toBeVisible();
    expect(screen.getByText('Linode IPv6 Ranges')).toBeVisible();
    expect(screen.getByText('Linode')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
    expect(screen.getByText('VPC IPv4')).toBeVisible();
    expect(screen.getByText('Firewalls')).toBeVisible();
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

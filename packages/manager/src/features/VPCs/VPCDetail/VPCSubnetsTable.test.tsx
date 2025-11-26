import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountFactory, firewallSettingsFactory } from 'src/factories';
import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories/subnets';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCSubnetsTable } from './VPCSubnetsTable';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
  useSubnetsQuery: vi.fn().mockReturnValue({}),
  useFirewallSettingsQuery: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      create_vpc_subnet: true,
    },
  })),
  useQueryWithPermissions: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
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
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));
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

    const { getByLabelText, getByPlaceholderText, getByText } = renderWithTheme(
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

    const { getByLabelText, getByPlaceholderText, getByText } = renderWithTheme(
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

    const { getByLabelText, getByText } = renderWithTheme(
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
    const { getByLabelText, getByText } = renderWithTheme(
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
  it('renders VPC IPv6 and VPC IPv6 Ranges columns in Linode table when vpcIpv6 feature flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['VPC Dual Stack'],
    });

    const subnet = subnetFactory.build({
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });

    queryMocks.useSubnetsQuery.mockReturnValue({
      data: {
        data: [subnet],
      },
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    renderWithTheme(
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

    renderWithTheme(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={3}
        vpcRegion=""
      />,
      { flags: { vpcIpv6: true } }
    );

    expect(screen.getByText('Linode')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
    expect(screen.getByText('VPC IPv4')).toBeVisible();
    expect(screen.getByText('VPC IPv6')).toBeVisible();
    expect(screen.getByText('VPC IPv6 Ranges')).toBeVisible();
    expect(screen.getByText('Firewalls')).toBeVisible();
  });

  it(
    'should show Nodebalancer table head data when table is expanded',
    { timeout: 15_000 },
    async () => {
      const subnet = subnetFactory.build();

      queryMocks.useSubnetsQuery.mockReturnValue({
        data: {
          data: [subnet],
        },
      });

      const { getByLabelText, findByText } = renderWithTheme(
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
    }
  );

  it('should disable "Create Subnet" button when user does not have create_vpc_subnet permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_vpc_subnet: false,
      },
    });

    const { getByText } = renderWithTheme(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={1}
        vpcRegion=""
      />
    );

    expect(getByText('Create Subnet')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Create Subnet" button when user has create_vpc_subnet permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_vpc_subnet: true,
      },
    });

    const { getByText } = renderWithTheme(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={1}
        vpcRegion=""
      />
    );

    expect(getByText('Create Subnet')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});

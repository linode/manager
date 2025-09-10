import { regionFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { vpcFactory } from 'src/factories/vpcs';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import VPCDetail from './VPCDetail';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useVPCQuery: vi.fn().mockReturnValue({}),
  useFirewallSettingsQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      update_vpc: true,
      delete_vpc: true,
    },
  })),
  useQueryWithPermissions: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useArrayWithPermissions: vi.fn().mockReturnValue([]),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useFirewallSettingsQuery: queryMocks.useFirewallSettingsQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
    useVPCQuery: queryMocks.useVPCQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
  useArrayWithPermissions: queryMocks.useArrayWithPermissions,
}));
beforeAll(() => mockMatchMedia());

describe('VPC Detail Summary section', () => {
  beforeEach(() => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/vpcs/1',
    });
    queryMocks.useParams.mockReturnValue({
      vpcId: 1,
    });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'us-east',
          capabilities: ['VPCs'],
          label: 'US, Newark, NJ',
        }),
      ],
    });
  });

  it('should display number of subnets and linodes, region, id, creation and update dates', async () => {
    const vpcFactory1 = vpcFactory.build({
      id: 23,
      subnets: [subnetFactory.build()],
      created: '2023-07-12T16:08:53',
      updated: '2023-07-12T16:08:54',
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });

    const { getByText } = renderWithTheme(<VPCDetail />);

    // there is 1 subnet with 5 linodes
    expect(getByText('Subnets')).toBeVisible();
    expect(getByText('1')).toBeVisible();
    expect(getByText('Linodes')).toBeVisible();
    expect(getByText('5')).toBeVisible();

    expect(getByText('Region')).toBeVisible();
    expect(getByText('US, Newark, NJ')).toBeVisible();

    expect(getByText('VPC ID')).toBeVisible();
    expect(getByText(vpcFactory1.id)).toBeVisible();

    expect(getByText('Created')).toBeVisible();
    expect(getByText(vpcFactory1.created)).toBeVisible();

    expect(getByText('Updated')).toBeVisible();
    expect(getByText(vpcFactory1.updated)).toBeVisible();
  });

  it('should display number of subnets and resources, region, id, creation and update dates', async () => {
    const vpcFactory1 = vpcFactory.build({
      id: 42,
      subnets: [subnetFactory.build()],
      created: '2023-07-12T16:08:53',
      updated: '2023-07-12T16:08:54',
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });

    const { getByText } = renderWithTheme(<VPCDetail />, {
      flags: { nodebalancerVpc: true },
    });

    // there is 1 subnet with 8 resources (5 Linodes, 3 nbs)
    expect(getByText('Subnets')).toBeVisible();
    expect(getByText('1')).toBeVisible();
    expect(getByText('Resources')).toBeVisible();
    expect(getByText('8')).toBeVisible();

    expect(getByText('Region')).toBeVisible();
    expect(getByText('US, Newark, NJ')).toBeVisible();

    expect(getByText('VPC ID')).toBeVisible();
    expect(getByText(vpcFactory1.id)).toBeVisible();

    expect(getByText('Created')).toBeVisible();
    expect(getByText(vpcFactory1.created)).toBeVisible();

    expect(getByText('Updated')).toBeVisible();
    expect(getByText(vpcFactory1.updated)).toBeVisible();
  });

  it('should display description if one is provided', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database.`,
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });

    const { getByText } = renderWithTheme(<VPCDetail />);

    expect(getByText('Description')).toBeVisible();
    expect(getByText(vpcFactory1.description)).toBeVisible();
  });

  it('should hide description if none is provided', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build(),
    });

    const { queryByText } = renderWithTheme(<VPCDetail />);

    expect(queryByText('Description')).not.toBeInTheDocument();
  });

  it('should display read more/less button in description if there are more than 150 characters', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver. VPC for webserver.`,
    });

    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });
    queryMocks.useFirewallSettingsQuery.mockReturnValue({
      data: {
        default_firewall_ids: {
          vpc_interface: 1,
        },
      },
    });

    const { getByTestId } = renderWithTheme(<VPCDetail />);

    const readMoreButton = getByTestId('show-description-button');
    expect(readMoreButton.innerHTML).toBe('Read More');

    await userEvent.click(readMoreButton);
    expect(readMoreButton.innerHTML).toBe('Read Less');
  });

  it('should display a notice if the VPC was automatically generated for a LKE-E cluster', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `workload VPC for LKE Enterprise Cluster lke1234567.`,
      label: 'lke1234567',
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });

    const { getByText } = renderWithTheme(<VPCDetail />);

    expect(
      getByText(
        'This VPC has been automatically generated for your LKE Enterprise cluster.'
      )
    ).toBeVisible();
  });
  it('should disable actions if user does not have "update_vpc" or "delete_vpc" permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: false,
        delete_vpc: false,
      },
    });

    const { getByText } = renderWithTheme(<VPCDetail />);

    expect(getByText('Edit')).toBeDisabled();
    expect(getByText('Delete')).toBeDisabled();
  });

  it('should enable actions if user has "update_vpc" or "delete_vpc" permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: true,
        delete_vpc: true,
      },
    });

    const { getByText } = renderWithTheme(<VPCDetail />);

    expect(getByText('Edit')).toBeEnabled();
    expect(getByText('Delete')).toBeEnabled();
  });
});

import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { vpcFactory } from 'src/factories/vpcs';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import VPCLanding from './VPCLanding';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useVPCsQuery: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      create_vpc: true,
    },
  })),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useVPCsQuery: queryMocks.useVPCsQuery,
  };
});
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
describe('VPC Landing Table', () => {
  it('should render vpc landing table with items', async () => {
    const vpcsWithSubnet = vpcFactory.buildList(3, {
      subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
    });
    queryMocks.useVPCsQuery.mockReturnValue({
      data: {
        data: vpcsWithSubnet,
        page: 1,
        pages: 1,
        results: 3,
      },
    });

    const { getByText } = renderWithTheme(<VPCLanding />);

    // Static text and table column headers
    expect(getByText('Label')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
    expect(getByText('VPC ID')).toBeVisible();
    expect(getByText('Subnets')).toBeVisible();
    expect(getByText('Linodes')).toBeVisible();
  });

  it('should render vpc landing table with items with nodebalancerVpc flag enabled', async () => {
    queryMocks.useVPCsQuery.mockReturnValue({
      data: {
        data: vpcFactory.buildList(3, {
          subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
        }),
        page: 1,
        pages: 1,
        results: 3,
      },
    });

    const { getByText } = renderWithTheme(<VPCLanding />, {
      flags: { nodebalancerVpc: true },
    });

    // Static text and table column headers
    expect(getByText('Label')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
    expect(getByText('VPC ID')).toBeVisible();
    expect(getByText('Subnets')).toBeVisible();
    expect(getByText('Resources')).toBeVisible();
  });

  it('should render vpc landing with empty state', async () => {
    queryMocks.useVPCsQuery.mockReturnValue({
      data: {
        data: [],
        page: 1,
        pages: 1,
        results: 3,
      },
    });

    const { getByText } = renderWithTheme(<VPCLanding />);

    expect(
      getByText('Create a private and isolated network')
    ).toBeInTheDocument();
  });

  it('should render vpc landing with loading state', async () => {
    queryMocks.useVPCsQuery.mockReturnValue({
      isLoading: true,
    });

    const { findByTestId } = renderWithTheme(<VPCLanding />);

    const loading = await findByTestId('circle-progress');
    expect(loading).toBeInTheDocument();
  });

  it('should disable "Create VPC" button if user does not have create_vpc permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_vpc: false,
      },
    });
    queryMocks.useVPCsQuery.mockReturnValue({
      isLoading: false,
    });

    const { findByText } = renderWithTheme(<VPCLanding />);

    const createButton = await findByText(/Create VPC/);
    expect(createButton).toBeDisabled();
  });

  it('should enable "Create VPC" button if user has create_vpc permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_vpc: true,
      },
    });
    queryMocks.useVPCsQuery.mockReturnValue({
      isLoading: false,
    });

    const { findByText } = renderWithTheme(<VPCLanding />);

    const createButton = await findByText(/Create VPC/);
    expect(createButton).toBeEnabled();
  });
});

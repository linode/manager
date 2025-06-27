import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { vpcFactory } from 'src/factories/vpcs';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import VPCLanding from './VPCLanding';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useVPCsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useVPCsQuery: queryMocks.useVPCsQuery,
  };
});

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

    const { getAllByText } = await renderWithThemeAndRouter(<VPCLanding />);

    // Static text and table column headers
    getAllByText('Label');
    getAllByText('Region');
    getAllByText('VPC ID');
    getAllByText('Subnets');
    getAllByText('Linodes');
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

    const { getAllByText } = await renderWithThemeAndRouter(<VPCLanding />, {
      flags: { nodebalancerVpc: true },
    });

    // Static text and table column headers
    getAllByText('Label');
    getAllByText('Region');
    getAllByText('VPC ID');
    getAllByText('Subnets');
    getAllByText('Resources');
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

    const { getByText } = await renderWithThemeAndRouter(<VPCLanding />);

    expect(
      getByText('Create a private and isolated network')
    ).toBeInTheDocument();
  });

  it('should render vpc landing with loading state', async () => {
    queryMocks.useVPCsQuery.mockReturnValue({
      isLoading: true,
    });

    const { findByTestId } = await renderWithThemeAndRouter(<VPCLanding />);

    const loading = await findByTestId('circle-progress');
    expect(loading).toBeInTheDocument();
  });
});

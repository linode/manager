import React from 'react';

import { subnetFactory, vpcFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BackendConfigurationVPC } from './BackendConfigVPC';

const queryMocks = vi.hoisted(() => ({
  useNodeBalancerVPCConfigsBetaQuery: vi.fn().mockReturnValue({ data: null }),
  useParams: vi.fn().mockReturnValue({ id: 1 }),
  useVPCQuery: vi.fn().mockReturnValue({ data: null }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNodeBalancerVPCConfigsBetaQuery:
      queryMocks.useNodeBalancerVPCConfigsBetaQuery,
    useVPCQuery: queryMocks.useVPCQuery,
  };
});

describe('BackendConfigurationVPC', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({ id: 1 });
    queryMocks.useNodeBalancerVPCConfigsBetaQuery.mockReturnValue({
      data: {
        data: [],
      },
    });
    queryMocks.useVPCQuery.mockReturnValue({ data: null });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the backend VPC link, subnet label, and configured IP ranges', () => {
    const subnet = subnetFactory.build({
      id: 401,
      label: 'private-subnet',
    });

    queryMocks.useNodeBalancerVPCConfigsBetaQuery.mockReturnValue({
      data: {
        data: [
          {
            id: 7,
            ipv4_range: '10.0.0.0/24',
            ipv6_range: '2600:3c11:e41c:1::/56',
            purpose: 'backend',
            subnet_id: subnet.id,
            vpc_id: 301,
          },
        ],
      },
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build({
        id: 301,
        label: 'prod-vpc',
        subnets: [subnet],
      }),
    });

    const { getByRole, getByText, getByTestId } = renderWithTheme(
      <BackendConfigurationVPC />
    );

    expect(getByText('Backend Configuration - VPC')).toBeVisible();
    expect(getByRole('link', { name: 'VPC prod-vpc' })).toHaveAttribute(
      'href',
      '/vpcs/301'
    );
    expect(getByText('private-subnet')).toBeVisible();
    expect(getByTestId('vpc-ipv4-label')).toHaveTextContent('IPv4 Range');
    expect(getByTestId('vpc-ipv6-label')).toHaveTextContent('IPv6 Range');
    expect(getByText('10.0.0.0/24')).toBeVisible();
    expect(getByText('2600:3c11:e41c:1::/56')).toBeVisible();
  });

  it('falls back to the subnet id when the subnet details are unavailable', () => {
    queryMocks.useNodeBalancerVPCConfigsBetaQuery.mockReturnValue({
      data: {
        data: [
          {
            id: 8,
            ipv4_range: '10.1.0.0/24',
            ipv6_range: null,
            purpose: 'backend',
            subnet_id: 999,
            vpc_id: 302,
          },
        ],
      },
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build({
        id: 302,
        label: 'staging-vpc',
        subnets: [],
      }),
    });

    const { getByText } = renderWithTheme(<BackendConfigurationVPC />);

    expect(getByText('Subnet 999')).toBeVisible();
    expect(getByText('10.1.0.0/24')).toBeVisible();
  });
});

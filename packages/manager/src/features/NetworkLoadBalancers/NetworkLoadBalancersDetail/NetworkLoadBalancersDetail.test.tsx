import { regionFactory } from '@linode/utilities';
import * as React from 'react';

import { networkLoadBalancerFactory } from 'src/factories/networkLoadBalancer';
import { formatDate } from 'src/utilities/formatDate';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import NetworkLoadBalancersDetail from './NetworkLoadBalancersDetail';

const queryMocks = vi.hoisted(() => ({
  useNetworkLoadBalancerQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
    useRegionsQuery: queryMocks.useRegionsQuery,
    useNetworkLoadBalancerQuery: queryMocks.useNetworkLoadBalancerQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

beforeAll(() => mockMatchMedia());

describe('NetworkLoadBalancersDetail', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      id: 1,
    });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'us-east',
          capabilities: ['Network LoadBalancer'],
          label: 'US, Newark, NJ',
        }),
      ],
    });
  });

  it('renders a loading state', () => {
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: true,
    });

    const { getByTestId } = renderWithTheme(<NetworkLoadBalancersDetail />);

    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('renders an error state', () => {
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      error: true,
    });

    const { getByText } = renderWithTheme(<NetworkLoadBalancersDetail />);

    expect(
      getByText('There was a problem retrieving your NLB. Please try again.')
    ).toBeInTheDocument();
  });

  it('renders the NLB details', () => {
    const nlbFactory = networkLoadBalancerFactory.build();
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      data: nlbFactory,
    });

    const { getByText } = renderWithTheme(<NetworkLoadBalancersDetail />);

    expect(getByText('ACTIVE')).toBeInTheDocument();

    expect(getByText('Virtual IP (IPv4)')).toBeInTheDocument();
    expect(getByText(nlbFactory.address_v4)).toBeInTheDocument();

    expect(getByText('Virtual IP (IPv6)')).toBeInTheDocument();
    expect(getByText(nlbFactory.address_v6)).toBeInTheDocument();

    expect(getByText('Region')).toBeInTheDocument();
    expect(getByText('US, Newark, NJ')).toBeInTheDocument();

    expect(getByText('LKE-E Cluster')).toBeInTheDocument();
    expect(getByText('N/A')).toBeInTheDocument();

    expect(getByText('Network Load Balancer ID')).toBeInTheDocument();
    expect(getByText(nlbFactory.id)).toBeInTheDocument();

    expect(getByText('Created')).toBeInTheDocument();
    expect(getByText(formatDate(nlbFactory.created))).toBeInTheDocument();

    expect(getByText('Updated')).toBeInTheDocument();
    expect(getByText(formatDate(nlbFactory.updated))).toBeInTheDocument();
  });

  it('renders LKE Details if the NLB is associated with an LKE cluster', () => {
    const nlbFactory = networkLoadBalancerFactory.build({
      lke_cluster: { id: 1, label: 'Test Cluster' },
    });
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      data: nlbFactory,
    });

    const { getByText } = renderWithTheme(<NetworkLoadBalancersDetail />);

    expect(getByText('LKE-E Cluster')).toBeInTheDocument();
    expect(getByText(nlbFactory.lke_cluster!.label)).toBeInTheDocument();
    expect(
      getByText(`(ID: ${nlbFactory.lke_cluster!.id})`, {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});

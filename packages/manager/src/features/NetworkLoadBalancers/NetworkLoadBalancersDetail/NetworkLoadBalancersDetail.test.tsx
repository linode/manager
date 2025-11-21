import { regionFactory } from '@linode/utilities';
import * as React from 'react';

import {
  networkLoadBalancerFactory,
  networkLoadBalancerListenerFactory,
} from 'src/factories/networkLoadBalancer';
import { formatDate } from 'src/utilities/formatDate';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import NetworkLoadBalancersDetail from './NetworkLoadBalancersDetail';

const queryMocks = vi.hoisted(() => ({
  useNetworkLoadBalancerQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
  useRegionQuery: vi.fn().mockReturnValue({}),
  useNetworkLoadBalancerListenersQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
    useRegionQuery: queryMocks.useRegionQuery,
    useNetworkLoadBalancerQuery: queryMocks.useNetworkLoadBalancerQuery,
    useNetworkLoadBalancerListenersQuery:
      queryMocks.useNetworkLoadBalancerListenersQuery,
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

const mockRegion = regionFactory.build({
  id: 'us-east',
  capabilities: ['Network LoadBalancer'],
  label: 'US, Newark, NJ',
});

describe('NetworkLoadBalancersDetail', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      id: 1,
    });
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
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

  it('renders a Listeners table', () => {
    const listenerFactory = networkLoadBalancerListenerFactory.build();
    const nlbFactory = networkLoadBalancerFactory.build({
      listeners: [listenerFactory],
    });
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      data: nlbFactory,
    });

    queryMocks.useNetworkLoadBalancerListenersQuery.mockReturnValue({
      isLoading: false,
      data: { data: [listenerFactory], results: 1, page: 1, page_size: 25 },
    });

    const { getByText, getByTestId, getByRole } = renderWithTheme(
      <NetworkLoadBalancersDetail />
    );

    const link = getByRole('link', { name: `${listenerFactory.label}` });
    expect(link).toHaveAttribute(
      'href',
      `/netloadbalancers/${nlbFactory.id}/listeners/${listenerFactory.id}`
    );
    expect(getByText('Listeners (1)')).toBeInTheDocument();
    expect(getByTestId('nlb-listeners-table')).toBeInTheDocument();
    expect(getByText(listenerFactory.label)).toBeInTheDocument();
    expect(getByText(listenerFactory.port)).toBeInTheDocument();
    expect(getByText(listenerFactory.protocol)).toBeInTheDocument();
    expect(getByText(listenerFactory.id)).toBeInTheDocument();
  });

  it('renders an empty Listeners table if there are no listeners', () => {
    const nlbFactory = networkLoadBalancerFactory.build({
      listeners: [],
    });
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      data: nlbFactory,
    });
    queryMocks.useNetworkLoadBalancerListenersQuery.mockReturnValue({
      isLoading: false,
      data: { data: [], results: 0 },
    });

    const { getByText, getByTestId } = renderWithTheme(
      <NetworkLoadBalancersDetail />
    );

    expect(getByText('Listeners (0)')).toBeInTheDocument();
    expect(getByTestId('nlb-listeners-table')).toBeInTheDocument();
    expect(
      getByText('No Listeners are defined for this Network Load Balancer')
    ).toBeInTheDocument();
  });
});

import * as React from 'react';

import {
  networkLoadBalancerFactory,
  networkLoadBalancerListenerFactory,
} from 'src/factories/networkLoadBalancer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import NetworkLoadBalancersListenerDetail from './NetworkLoadBalancersListenerDetail';

const queryMocks = vi.hoisted(() => ({
  useNetworkLoadBalancerQuery: vi.fn().mockReturnValue({}),
  useNetworkLoadBalancerNodesQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({ id: 1, listenerId: 1 }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNetworkLoadBalancerQuery: queryMocks.useNetworkLoadBalancerQuery,
    useNetworkLoadBalancerNodesQuery:
      queryMocks.useNetworkLoadBalancerNodesQuery,
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

describe('NetworkLoadBalancersListenerDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useParams.mockReturnValue({ id: 1, listenerId: 1 });
  });

  it('renders a loading state', () => {
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: true,
    });

    const { getByTestId } = renderWithTheme(
      <NetworkLoadBalancersListenerDetail />
    );
    expect(getByTestId('circle-progress')).toBeVisible();
  });

  it('renders an error state when NLB is not found', () => {
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      data: null,
    });

    const { getByText } = renderWithTheme(
      <NetworkLoadBalancersListenerDetail />
    );

    expect(
      getByText(
        'There was a problem retrieving your listener. Please try again.'
      )
    ).toBeVisible();
  });

  it('renders an error state when there is an error', () => {
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      error: new Error('Test error'),
    });

    const { getByText } = renderWithTheme(
      <NetworkLoadBalancersListenerDetail />
    );

    expect(
      getByText(
        'There was a problem retrieving your listener. Please try again.'
      )
    ).toBeVisible();
  });

  it('renders an error state when listener is not found', () => {
    const nlbFactory = networkLoadBalancerFactory.build({
      listeners: [],
    });
    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      data: nlbFactory,
    });

    const { getByText } = renderWithTheme(
      <NetworkLoadBalancersListenerDetail />
    );
    expect(
      getByText(
        'There was a problem retrieving your listener. Please try again.'
      )
    ).toBeVisible();
  });

  it('renders the listener details', () => {
    // Build listener with ID '1' as a string to match the route param
    const listener = networkLoadBalancerListenerFactory.build({ id: 1 });
    const nlbFactory = networkLoadBalancerFactory.build({
      listeners: [listener],
    });

    queryMocks.useNetworkLoadBalancerQuery.mockReturnValue({
      isLoading: false,
      data: nlbFactory,
    });
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      data: { results: 5 },
      isLoading: false,
    });

    const { getByText } = renderWithTheme(
      <NetworkLoadBalancersListenerDetail />,
      {
        initialRoute: '/netloadbalancers/$id/listeners/$listenerId',
        initialEntries: ['/netloadbalancers/2/listeners/1'],
      }
    );

    expect(getByText('Port')).toBeVisible();
    expect(getByText(listener.port.toString())).toBeVisible();
    expect(getByText('Protocol')).toBeVisible();
    expect(getByText(new RegExp(listener.protocol, 'i'))).toBeVisible();
    expect(getByText('Nodes')).toBeVisible();
    expect(getByText('5')).toBeVisible();
  });
});

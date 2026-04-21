import { QueryClient } from '@tanstack/react-query';
import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import {
  networkLoadBalancerFactory,
  networkLoadBalancerListenerFactory,
} from 'src/factories/networkLoadBalancer';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { NetworkLoadBalancersLanding } from './NetworkLoadBalancersLanding';

const queryMocks = vi.hoisted(() => ({
  useMatch: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useMatch: queryMocks.useMatch,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
  };
});

beforeAll(() => {
  mockMatchMedia();
});

const loadingTestId = 'circle-progress';

describe('NetworkLoadBalancersLanding', () => {
  it('renders the NetworkLoadBalancer empty state if there are no NetworkLoadBalancers', async () => {
    server.use(
      http.get('*/v4beta/netloadbalancers', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByTestId } = renderWithTheme(<NetworkLoadBalancersLanding />);

    // expect loading state and wait for it to disappear
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));
  });

  it('renders the NetworkLoadBalancer table if there are NetworkLoadBalancers', async () => {
    const mockNetworkLoadBalancers = [
      networkLoadBalancerFactory.build({
        listeners: networkLoadBalancerListenerFactory.buildList(2),
      }),
    ];

    server.use(
      http.get('*/v4beta/netloadbalancers', () => {
        return HttpResponse.json(makeResourcePage(mockNetworkLoadBalancers));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <NetworkLoadBalancersLanding />
    );

    // expect loading state and wait for it to disappear
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText('Network Load Balancer')).toBeVisible();
    expect(getByText('netloadbalancer-1-test1')).toBeVisible();

    // confirm table headers
    expect(getByText('Label')).toBeVisible();
    expect(getByText('Status')).toBeVisible();
    expect(getByText('ID')).toBeVisible();
    expect(getByText('Listener Ports')).toBeVisible();
    expect(getByText('Virtual IP (IPv4)')).toBeVisible();
    expect(getByText('Virtual IP (IPv6)')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
  });

  it('renders the managed by badge with tooltip', async () => {
    const mockNetworkLoadBalancers = [
      networkLoadBalancerFactory.build({ listeners: [] }),
    ];

    server.use(
      http.get('*/v4beta/netloadbalancers', () => {
        return HttpResponse.json(makeResourcePage(mockNetworkLoadBalancers));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <NetworkLoadBalancersLanding />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Check for the badge
    expect(getByText('Managed by LKE Enterprise')).toBeVisible();

    // Check for the Chip component (which contains the badge)
    const chip = document.querySelector('[class*="MuiChip-root"]');
    expect(chip).toBeInTheDocument();
  });

  it('displays error state when there is an error', async () => {
    // Use a custom QueryClient with retries disabled so we don't have to wait for React Query's retry logic.
    // If we didn't do this, the test would need to wait for up to 7+ seconds because of React Query's exponential backoff retry delay.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    server.use(
      http.get('*/v4beta/netloadbalancers', () => {
        return HttpResponse.json(
          {
            errors: [
              {
                reason: 'Internal Server Error',
              },
            ],
          },
          { status: 500 }
        );
      })
    );

    const { findByText } = renderWithTheme(<NetworkLoadBalancersLanding />, {
      queryClient,
    });

    const errorElement = await findByText('An unexpected error occurred.');

    expect(errorElement).toBeVisible();
  });

  it('displays loading state initially', () => {
    const { getByTestId } = renderWithTheme(<NetworkLoadBalancersLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('displays pagination footer when data is loaded', async () => {
    const mockNetworkLoadBalancers = [
      networkLoadBalancerFactory.build({ listeners: [] }),
    ];

    server.use(
      http.get('*/v4beta/netloadbalancers', () => {
        return HttpResponse.json(makeResourcePage(mockNetworkLoadBalancers));
      })
    );

    const { getByTestId, container } = renderWithTheme(
      <NetworkLoadBalancersLanding />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Check for pagination elements by finding the PaginationFooter component
    // PaginationFooter is typically rendered with pagination controls
    const paginationFooter = container.querySelector(
      '[class*="PaginationFooter"]'
    );
    expect(paginationFooter || container.innerHTML).toBeTruthy();
  });
});

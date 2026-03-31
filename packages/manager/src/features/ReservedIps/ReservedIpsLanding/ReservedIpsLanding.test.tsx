import * as React from 'react';

import { routeTree } from 'src/routes';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ReservedIpsLanding } from './ReservedIpsLanding';

const mockQueryReturn = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    data: undefined,
    error: null,
    isLoading: true,
  })
);

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useReservedIPsQuery: mockQueryReturn,
  };
});

describe('ReservedIpsLanding', () => {
  it('renders a loading state while data is fetching', () => {
    const { getByTestId } = renderWithTheme(<ReservedIpsLanding />, {
      initialRoute: '/reserved-ips',
      routeTree,
    });

    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('renders an error state when the query fails', () => {
    mockQueryReturn.mockReturnValue({
      data: undefined,
      error: [{ reason: 'Something went wrong.' }],
      isLoading: false,
    });

    const { getByText } = renderWithTheme(<ReservedIpsLanding />, {
      initialRoute: '/reserved-ips',
      routeTree,
    });

    expect(getByText('Something went wrong.')).toBeVisible();
  });

  it('renders the empty state when there are no reserved IPs', () => {
    mockQueryReturn.mockReturnValue({
      data: { data: [], results: 0 },
      error: null,
      isLoading: false,
    });

    const { getByText } = renderWithTheme(<ReservedIpsLanding />, {
      initialRoute: '/reserved-ips',
      routeTree,
    });

    expect(getByText('Reserve an IP Address')).toBeVisible();
  });

  it('renders the table when reserved IPs are returned', () => {
    mockQueryReturn.mockReturnValue({
      data: {
        data: [
          {
            address: '203.0.113.1',
            assigned_entity: null,
            gateway: '203.0.113.0',
            interface_id: null,
            linode_id: null,
            prefix: 24,
            public: true,
            rdns: null,
            region: 'us-east',
            reserved: true,
            subnet_mask: '255.255.255.0',
            tags: ['web'],
            type: 'ipv4',
          },
        ],
        results: 1,
      },
      error: null,
      isLoading: false,
    });

    const { getByText } = renderWithTheme(<ReservedIpsLanding />, {
      initialRoute: '/reserved-ips',
      routeTree,
    });

    expect(getByText('Reserved IP Addresses')).toBeVisible();
    expect(getByText('203.0.113.1')).toBeVisible();
  });
});

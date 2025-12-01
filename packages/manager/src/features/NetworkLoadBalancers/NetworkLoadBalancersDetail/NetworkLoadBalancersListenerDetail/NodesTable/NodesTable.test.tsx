import * as React from 'react';
import { vi } from 'vitest';

import { networkLoadBalancerNodeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodesTable } from './NodesTable';

const queryMocks = vi.hoisted(() => ({
  useNetworkLoadBalancerNodesQuery: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(),
  useSearch: vi.fn().mockReturnValue({ query: '' }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNetworkLoadBalancerNodesQuery:
      queryMocks.useNetworkLoadBalancerNodesQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('src/hooks/usePaginationV2', () => ({
  usePaginationV2: () => ({
    page: 1,
    pageSize: 25,
    handlePageChange: vi.fn(),
    handlePageSizeChange: vi.fn(),
  }),
}));

vi.mock('src/hooks/useOrderV2', () => ({
  useOrderV2: () => ({
    order: 'asc',
    orderBy: 'id',
    handleOrderChange: vi.fn(),
  }),
}));

vi.mock('@linode/search', () => ({
  getAPIFilterFromQuery: (query: string) => ({
    filter: {},
    error: null,
  }),
}));

describe('NodesTable', () => {
  const mockNodes = networkLoadBalancerNodeFactory.buildList(5);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading state', () => {
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: true,
    });

    const { getByTestId } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    expect(getByTestId('circle-progress')).toBeVisible();
  });

  it('renders nodes table with correct columns', () => {
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: false,
      data: { data: mockNodes, results: 5 },
    });

    const { getByText } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    expect(getByText('Node Label')).toBeVisible();
    expect(getByText('ID')).toBeVisible();
    expect(getByText('Linode ID')).toBeVisible();
    expect(getByText('VPC IPv6')).toBeVisible();
  });

  it('renders nodes count in header', () => {
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: false,
      data: { data: mockNodes, results: 5 },
    });

    const { getByText } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    expect(getByText(/Nodes \(5\)/)).toBeVisible();
  });

  it('renders a Nodes table', () => {
    const nodeFactory = networkLoadBalancerNodeFactory.build({
      id: 123,
      linode_id: 456,
    });
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: false,
      data: { data: [nodeFactory], results: 1, page: 1, page_size: 25 },
    });

    const { getByText, getByTestId, getByRole } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    const link = getByRole('link', { name: `${nodeFactory.linode_id}` });
    expect(link).toHaveAttribute('href', `/linodes/${nodeFactory.linode_id}`);

    expect(getByText('Nodes (1)')).toBeVisible();
    expect(getByTestId(`nlb-node-row-${nodeFactory.id}`)).toBeVisible();
    expect(getByText(nodeFactory.label)).toBeVisible();
    expect(getByText(nodeFactory.id)).toBeVisible();
    expect(getByText(nodeFactory.linode_id)).toBeVisible();
  });

  it('renders table rows for each node', () => {
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: false,
      data: { data: mockNodes, results: 5 },
    });

    const { getByText } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    mockNodes.forEach((node) => {
      expect(getByText(node.label)).toBeVisible();
    });
  });

  it('renders an empty Nodes table if there are no nodes', () => {
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: false,
      data: { data: [], results: 0 },
    });

    const { getByText } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    expect(getByText('Nodes (0)')).toBeVisible();
    expect(getByText('No nodes are assigned to this listener')).toBeVisible();
  });

  it('renders error state when query fails', () => {
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: false,
      error: [{ reason: 'Failed to fetch nodes' }],
    });

    const { getByText } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    expect(getByText('Failed to fetch nodes')).toBeVisible();
  });

  it('renders search field with correct placeholder', () => {
    queryMocks.useNetworkLoadBalancerNodesQuery.mockReturnValue({
      isLoading: false,
      data: { data: mockNodes, results: 5 },
    });

    const { getByPlaceholderText } = renderWithTheme(
      <NodesTable listenerId={2} nlbId={1} />
    );

    const searchField = getByPlaceholderText(
      'Search ID, Linode ID or IP Address'
    );
    expect(searchField).toBeVisible();
  });
});

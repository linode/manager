import { waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  firewallFactory,
  nodeBalancerConfigFactory,
  nodeBalancerFactory,
} from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SummaryPanel } from './SummaryPanel';

// Set up various mocks for tests
const queryMocks = vi.hoisted(() => ({
  useAllNodeBalancerConfigsQuery: vi.fn().mockReturnValue({ data: undefined }),
  useNodeBalancerQuery: vi.fn().mockReturnValue({ data: undefined }),
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllNodeBalancerConfigsQuery: queryMocks.useAllNodeBalancerConfigsQuery,
    useNodeBalancerQuery: queryMocks.useNodeBalancerQuery,
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
  };
});

const nodeBalancerDetails = 'NodeBalancer Details';

describe('SummaryPanel', () => {
  beforeEach(() => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: nodeBalancerConfigFactory.buildList(2),
    });
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build(),
    });
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: { data: [firewallFactory.build({ label: 'mock-firewall-1' })] },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('does not render anything if there is no nodebalancer', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: undefined,
    });
    const { queryByText } = renderWithTheme(<SummaryPanel />);

    expect(queryByText(nodeBalancerDetails)).not.toBeInTheDocument();
  });

  it('does not render anything if there are no configs', () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: undefined,
    });
    const { queryByText } = renderWithTheme(<SummaryPanel />);

    expect(queryByText(nodeBalancerDetails)).not.toBeInTheDocument();
  });

  it('renders the panel if there is data to render', () => {
    const { getByText, queryByText } = renderWithTheme(<SummaryPanel />);

    // Main summary panel
    expect(getByText(nodeBalancerDetails)).toBeVisible();
    expect(getByText('Ports:')).toBeVisible();
    expect(getByText('Backend Status:')).toBeVisible();
    expect(getByText('0 up, 2 down'));
    expect(getByText('Transferred:')).toBeVisible();
    expect(getByText('0 bytes')).toBeVisible();
    expect(getByText('Host Name:')).toBeVisible();
    expect(getByText('example.com')).toBeVisible();
    expect(getByText('Region:')).toBeVisible();
    // Type should not display for non-premium NBs
    expect(queryByText('Type:')).not.toBeInTheDocument();
    // Cluster should not display for if the NB is not associated with LKE or LKE-E
    expect(queryByText('Cluster:')).not.toBeInTheDocument();

    // Firewall panel
    expect(getByText('Firewall')).toBeVisible();
    expect(getByText('mock-firewall-1')).toBeVisible();

    // IP Address panel
    expect(getByText('IP Addresses')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();

    // Tags panel
    expect(getByText('Tags')).toBeVisible();
    expect(getByText('Add a tag')).toBeVisible();
  });

  it('displays type: premium if the nodebalancer is premium', () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build({ type: 'premium' }),
    });

    const { container } = renderWithTheme(<SummaryPanel />);

    expect(container.querySelector('[data-qa-type]')).toHaveTextContent(
      'Type: Premium'
    );
  });

  it('displays link to cluster if it exists', () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build({
        lke_cluster: {
          id: 1,
          label: 'lke-123',
          type: 'lkecluster',
          url: 'v4/lke/clusters/1',
        },
      }),
    });

    const { container, getByText } = renderWithTheme(<SummaryPanel />);

    expect(getByText('Cluster:')).toBeVisible();
    const clusterLink = container.querySelector('[data-qa-cluster] a');
    expect(clusterLink).toHaveTextContent('lke-123');
    expect(clusterLink).toHaveAttribute(
      'href',
      '/kubernetes/clusters/1/summary'
    );
  });

  it('displays cluster name as deleted text if the cluster was deleted', async () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build({
        lke_cluster: {
          id: 1,
          label: 'lke-123',
          type: 'lkecluster',
          url: 'v4/lke/clusters/1',
        },
      }),
    });

    server.use(
      http.get('*/lke/clusters/:clusterId', () => {
        return HttpResponse.json({}, { status: 404 });
      })
    );

    const { container } = renderWithTheme(<SummaryPanel />);

    await waitFor(() => {
      const clusterLink = container.querySelector('[data-qa-cluster]');
      expect(clusterLink).toHaveTextContent('Cluster: lke-123 (deleted)');
      expect(clusterLink).not.toHaveAttribute(
        'href',
        '/kubernetes/clusters/1/summary'
      );
    });
  });
});

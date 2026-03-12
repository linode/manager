import {
  nodeBalancerConfigFactory,
  nodeBalancerFactory,
  nodeBalancerVPCFactory,
} from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { firewallFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SummaryPanel } from './SummaryPanel';

const queryMocks = vi.hoisted(() => ({
  useAllNodeBalancerConfigsQuery: vi.fn().mockReturnValue({ data: null }),
  useNodeBalancerQuery: vi.fn().mockReturnValue({ data: null }),
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({ data: null }),
  useNodeBalancerVPCConfigsBetaQuery: vi.fn().mockReturnValue({ data: null }),
  useParams: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      is_account_admin: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
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
    useAllNodeBalancerConfigsQuery: queryMocks.useAllNodeBalancerConfigsQuery,
    useNodeBalancerQuery: queryMocks.useNodeBalancerQuery,
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
    useNodeBalancerVPCConfigsBetaQuery:
      queryMocks.useNodeBalancerVPCConfigsBetaQuery,
  };
});

const nodeBalancerDetails = 'Details';
const nbVpcConfig = nodeBalancerVPCFactory.build();

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
    queryMocks.useNodeBalancerVPCConfigsBetaQuery.mockReturnValue({
      data: {
        data: [nbVpcConfig],
      },
    });
    queryMocks.useParams.mockReturnValue({ id: 1 });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('does not render anything if there is no nodebalancer', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: null,
    });
    const { queryByText } = renderWithTheme(<SummaryPanel />);

    expect(queryByText(nodeBalancerDetails)).not.toBeInTheDocument();
  });

  it('does not render anything if there are no configs', () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: null,
    });
    const { queryByText } = renderWithTheme(<SummaryPanel />);

    expect(queryByText(nodeBalancerDetails)).not.toBeInTheDocument();
  });

  it('renders the panel if there is data to render', () => {
    const { getByText, queryByText } = renderWithTheme(<SummaryPanel />, {
      flags: { nodebalancerVpc: true },
    });

    // Main summary panel
    expect(getByText(nodeBalancerDetails)).toBeVisible();
    expect(getByText('Ports:')).toBeVisible();
    expect(getByText('Backend Status:')).toBeVisible();
    expect(getByText('0 up, 2 down')).toBeVisible();
    expect(getByText('Transferred:')).toBeVisible();
    expect(getByText('0 bytes')).toBeVisible();
    expect(getByText('Host Name:')).toBeVisible();
    expect(getByText('example.com')).toBeVisible();
    expect(getByText('Region:')).toBeVisible();
    // Type should be visible and default to Basic since the NB is not premium
    expect(getByText('Basic')).toBeVisible();
    // Cluster should not display for if the NB is not associated with LKE or LKE-E
    expect(queryByText('Cluster:')).not.toBeInTheDocument();

    // Firewall panel
    expect(getByText('Firewall')).toBeVisible();
    expect(getByText('mock-firewall-1')).toBeVisible();

    // IP Address panel
    expect(getByText('Frontend Configuration')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();

    // VPC Details Panel
    expect(getByText('Backend Configuration - VPC')).toBeVisible();
    expect(getByText('Subnets:')).toBeVisible();
    expect(getByText(`${nbVpcConfig.ipv4_range}`)).toBeVisible();

    // Tags panel
    expect(getByText('Tags')).toBeVisible();
    expect(getByText('Add a tag')).toBeVisible();
  });

  it('displays type: Basic if the nodebalancer is non premium', () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build({ type: 'common' }),
    });

    const { getByText } = renderWithTheme(<SummaryPanel />);
    const typeElement = getByText((_, element) => {
      return (
        !!element?.hasAttribute('data-qa-type') &&
        element?.textContent === 'Type: Basic'
      );
    });
    expect(typeElement).toBeVisible();
  });

  it('displays type: premium if the nodebalancer is premium', () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build({ type: 'premium' }),
    });

    const { getByText } = renderWithTheme(<SummaryPanel />);

    const typeElement = getByText((_, element) => {
      return (
        !!element?.hasAttribute('data-qa-type') &&
        element?.textContent === 'Type: Premium'
      );
    });
    expect(typeElement).toBeVisible();
  });

  it('displays type: Enterprise if the nodebalancer is premium_40gb', () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build({ type: 'premium_40gb' }),
    });

    const { getByText } = renderWithTheme(<SummaryPanel />);

    const typeElement = getByText((_, element) => {
      return (
        !!element?.hasAttribute('data-qa-type') &&
        element?.textContent === 'Type: Enterprise'
      );
    });
    expect(typeElement).toBeVisible();
  });

  it('displays link to cluster if it exists', async () => {
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
        return HttpResponse.json({ id: 1, label: 'lke-123' });
      })
    );

    const { getByText } = renderWithTheme(<SummaryPanel />);

    expect(getByText('Cluster:')).toBeVisible();
    const clusterLink = await waitFor(() => {
      return getByText('lke-123');
    });
    expect(clusterLink).toBeVisible();
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

    const { getByText } = renderWithTheme(<SummaryPanel />);

    const clusterElement = await waitFor(() => {
      return getByText((_, element) => {
        return (
          !!element?.hasAttribute('data-qa-cluster') &&
          element?.textContent === 'Cluster: lke-123 (deleted)'
        );
      });
    });
    expect(clusterElement).toBeVisible();
    expect(clusterElement).not.toHaveAttribute('href');
  });

  it('should disable "Add a tag" if user does not have permission', () => {
    const { getByText } = renderWithTheme(<SummaryPanel />, {
      flags: { nodebalancerVpc: true },
    });

    // Tags panel
    expect(getByText('Tags')).toBeVisible();
    expect(getByText('Add a tag')).toBeVisible();
    expect(getByText('Add a tag')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Add a tag" if user has permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        is_account_admin: true,
      },
    });
    const { getByText } = renderWithTheme(<SummaryPanel />, {
      flags: { nodebalancerVpc: true },
    });

    // Tags panel
    expect(getByText('Tags')).toBeVisible();
    expect(getByText('Add a tag')).toBeVisible();
    expect(getByText('Add a tag')).not.toHaveAttribute('aria-disabled', 'true');
  });
});

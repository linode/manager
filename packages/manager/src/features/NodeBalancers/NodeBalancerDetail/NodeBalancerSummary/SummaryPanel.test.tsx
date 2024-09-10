import * as React from 'react';

import {
  firewallFactory,
  nodeBalancerConfigFactory,
  nodeBalancerFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SummaryPanel } from './SummaryPanel';

// Set up various mocks for tests
const queryMocks = vi.hoisted(() => ({
  useAllNodeBalancerConfigsQuery: vi.fn().mockReturnValue({ data: undefined }),
  useNodeBalancerQuery: vi.fn().mockReturnValue({ data: undefined }),
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('src/queries/nodebalancers', async () => {
  const actual = await vi.importActual('src/queries/nodebalancers');
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
    const { getByText } = renderWithTheme(<SummaryPanel />);

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

    // Firewall panel
    expect(getByText('Firewall')).toBeVisible();
    expect(getByText('mock-firewall-1')).toBeVisible();

    // IP Address panel
    expect(getByText('IP Addresses')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();

    // Tags panel
    expect(getByText('Tags')).toBeVisible();
    const addATag = getByText('Add a tag');
    expect(addATag).not.toBeDisabled();
  });
});

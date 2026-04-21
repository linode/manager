import {
  convertMegabytesTo,
  nodeBalancerConfigFactory,
  nodeBalancerFactory,
} from '@linode/utilities';
import React from 'react';

import { firewallFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerDetailBody } from './NodeBalancerDetailBody';

const queryMocks = vi.hoisted(() => ({
  useAllNodeBalancerConfigsQuery: vi.fn().mockReturnValue({ data: [] }),
  useNodeBalancersFirewallsQuery: vi
    .fn()
    .mockReturnValue({ data: { data: [] } }),
  useParams: vi.fn().mockReturnValue({ id: 1 }),
  useRegionsQuery: vi.fn().mockReturnValue({ data: [] }),
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
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

describe('NodeBalancerDetailBody', () => {
  const nodebalancer = nodeBalancerFactory.build({
    hostname: 'example.com',
    id: 1,
    region: 'us-east',
    tags: ['tag-1'],
    type: 'common',
  });

  beforeEach(() => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: [
        nodeBalancerConfigFactory.build({ id: 101, port: 80 }),
        nodeBalancerConfigFactory.build({ id: 102, port: 443 }),
      ],
    });
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: {
        data: [firewallFactory.build({ id: 44, label: 'mock-firewall-1' })],
      },
    });
    queryMocks.useParams.mockReturnValue({ id: 1 });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [{ id: 'us-east', label: 'Newark, NJ' }],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the nodebalancer details, config links, and firewall link', () => {
    const { getByRole, getByText } = renderWithTheme(
      <NodeBalancerDetailBody nodebalancer={nodebalancer} />
    );

    expect(getByText('Type')).toBeVisible();
    expect(getByText('Basic')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
    expect(getByText('Newark, NJ')).toBeVisible();
    expect(getByText('NodeBalancer ID')).toBeVisible();
    expect(getByText(String(nodebalancer.id))).toBeVisible();

    expect(getByText('Configuration Ports')).toBeVisible();

    const port80Link = getByRole('link', { name: 'Port 80' });
    expect(port80Link).toHaveAttribute(
      'href',
      `/nodebalancers/${nodebalancer.id}/configurations/101`
    );

    const port443Link = getByRole('link', { name: 'Port 443' });
    expect(port443Link).toHaveAttribute(
      'href',
      `/nodebalancers/${nodebalancer.id}/configurations/102`
    );

    expect(getByText('Hostname')).toBeVisible();
    expect(getByText(nodebalancer.hostname)).toBeVisible();
    expect(getByText('Transferred')).toBeVisible();
    expect(
      getByText(convertMegabytesTo(nodebalancer.transfer.total))
    ).toBeVisible();

    expect(getByText('Firewall')).toBeVisible();
    const firewallLink = getByRole('link', {
      name: 'Firewall mock-firewall-1',
    });
    expect(firewallLink).toHaveAttribute('href', '/firewalls/44');
  });

  it('renders None when there are no configuration ports and hides the firewall section when there is no firewall', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: [],
    });
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: {
        data: [],
      },
    });

    const { getByText, queryByText } = renderWithTheme(
      <NodeBalancerDetailBody nodebalancer={nodebalancer} />
    );

    expect(getByText('Configuration Ports')).toBeVisible();
    expect(getByText('None')).toBeVisible();
    expect(queryByText('Firewall')).not.toBeInTheDocument();
  });

  it('falls back to the raw region id when the region lookup is unavailable', () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [],
    });

    const { getByText } = renderWithTheme(
      <NodeBalancerDetailBody nodebalancer={nodebalancer} />
    );

    expect(getByText(nodebalancer.region)).toBeVisible();
  });
});

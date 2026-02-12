import { nodeBalancerVPCFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeAll, describe, it } from 'vitest';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { SubnetNodeBalancerRow } from './SubnetNodebalancerRow';

const LOADING_TEST_ID = 'circle-progress';

const queryMocks = vi.hoisted(() => ({
  useAllNodeBalancerConfigsQuery: vi.fn().mockReturnValue({}),
  useNodeBalancerQuery: vi.fn().mockReturnValue({}),
  useNodeBalancerVPCConfigsBetaQuery: vi.fn().mockReturnValue({}),
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllNodeBalancerConfigsQuery: queryMocks.useAllNodeBalancerConfigsQuery,
    useNodeBalancerQuery: queryMocks.useNodeBalancerQuery,
    useNodeBalancerVPCConfigsBetaQuery:
      queryMocks.useNodeBalancerVPCConfigsBetaQuery,
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
  };
});

beforeAll(() => mockMatchMedia());

describe('SubnetNodeBalancerRow', () => {
  const nodebalancer = {
    id: 123,
    label: 'test-nodebalancer',
  };

  const subnetId = 456;

  const configs = [
    { nodes_status: { up: 3, down: 1 } },
    { nodes_status: { up: 2, down: 2 } },
  ];

  const firewalls = makeResourcePage(
    firewallFactory.buildList(1, { label: 'mock-firewall' })
  );

  const vpcConfigs = makeResourcePage([
    nodeBalancerVPCFactory.build({
      ipv4_range: '192.168.1.0/30',
      ipv6_range: '2001:db8::1/64',
      nodebalancer_id: nodebalancer.id,
      purpose: 'frontend',
      subnet_id: subnetId,
    }),
    nodeBalancerVPCFactory.build({
      ipv4_range: '192.168.2.0/30',
      ipv6_range: '2001:db8::2/64',
      nodebalancer_id: nodebalancer.id,
      purpose: 'backend',
      subnet_id: subnetId,
    }),
  ]);

  it('renders loading state', async () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      isLoading: true,
    });
    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetNodeBalancerRow
          nodeBalancerId={nodebalancer.id}
          subnetId={subnetId}
        />
      )
    );

    expect(getByTestId(LOADING_TEST_ID)).toBeInTheDocument();
    // now that we're mocking the query to return isLoading, the loading state will not be removed
    // await waitForElementToBeRemoved(() => getByTestId(LOADING_TEST_ID));
  });

  it('renders nodebalancer row with data', async () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodebalancer,
    });
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: configs,
    });
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: firewalls,
    });
    queryMocks.useNodeBalancerVPCConfigsBetaQuery.mockReturnValue({
      data: vpcConfigs,
    });

    const { getByText, getByRole } = renderWithTheme(
      wrapWithTableBody(
        <SubnetNodeBalancerRow
          nodeBalancerId={nodebalancer.id}
          subnetId={subnetId}
        />
      )
    );

    await waitFor(() => {
      getByText(nodebalancer.label);
    });

    // Frontend IPv4 range
    getByText('192.168.1.0/30');
    // Frontend IPv6 range
    getByText('2001:db8::1/64');
    // Backend IPv4 range
    getByText('192.168.2.0/30');
    // Backend IPv6 range
    getByText('2001:db8::2/64');
    // Firewall
    getByText('mock-firewall');

    const nodebalancerLink = getByRole('link', {
      name: nodebalancer.label,
    });

    expect(nodebalancerLink).toHaveAttribute(
      'href',
      `/nodebalancers/${nodebalancer.id}/summary`
    );
  });
});

import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeAll, describe, it } from 'vitest';

import {
  firewallFactory,
  subnetAssignedNodebalancerDataFactory,
} from 'src/factories';
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
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({}),
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

beforeAll(() => mockMatchMedia());

describe('SubnetNodeBalancerRow', () => {
  const nodebalancer = {
    id: 123,
    label: 'test-nodebalancer',
  };

  const configs = [
    { nodes_status: { up: 3, down: 1 } },
    { nodes_status: { up: 2, down: 2 } },
  ];

  const firewalls = makeResourcePage(
    firewallFactory.buildList(1, { label: 'mock-firewall' })
  );

  const subnetNodebalancer = subnetAssignedNodebalancerDataFactory.build({
    id: nodebalancer.id,
    ipv4_range: '192.168.99.0/30',
  });

  it('renders loading state', async () => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      isLoading: true,
    });
    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetNodeBalancerRow
          ipv4={subnetNodebalancer.ipv4_range}
          nodeBalancerId={subnetNodebalancer.id}
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

    const { getByText, getByRole } = renderWithTheme(
      wrapWithTableBody(
        <SubnetNodeBalancerRow
          ipv4={subnetNodebalancer.ipv4_range}
          nodeBalancerId={nodebalancer.id}
        />
      )
    );

    await waitFor(() => {
      expect(getByText(nodebalancer.label)).toBeInTheDocument();
    });

    expect(getByText(subnetNodebalancer.ipv4_range)).toBeInTheDocument();
    expect(getByText('mock-firewall')).toBeInTheDocument();

    const nodebalancerLink = getByRole('link', {
      name: nodebalancer.label,
    });

    expect(nodebalancerLink).toHaveAttribute(
      'href',
      `/nodebalancers/${nodebalancer.id}/summary`
    );
  });
});

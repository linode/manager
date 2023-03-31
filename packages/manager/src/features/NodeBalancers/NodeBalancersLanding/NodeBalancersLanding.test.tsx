import { vi } from 'vitest';
import { renderWithTheme } from 'src/utilities/testHelpers';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import type { NodeBalancerWithConfigs, NodeBalancer } from '@linode/api-v4';
import { NodeBalancersLanding } from './NodeBalancersLanding';
import { waitFor } from '@testing-library/react';
import { nodeBalancerFactory, nodeBalancerConfigFactory } from 'src/factories';

const mockNodeBalancers: NodeBalancerWithConfigs[] = nodeBalancerFactory
  .buildList(2)
  .map(
    (nodeBalancer: NodeBalancer): NodeBalancerWithConfigs => {
      return {
        ...nodeBalancer,
        configs: nodeBalancerConfigFactory.buildList(1),
      };
    }
  );

const nodeBalancerComponent = (
  <NodeBalancersLanding
    {...reactRouterProps}
    nodeBalancersLoading={false}
    nodeBalancersError={undefined}
    nodeBalancersData={mockNodeBalancers}
    nodeBalancersLastUpdated={0}
    nodeBalancersCount={2}
    nodeBalancerActions={{
      updateNodeBalancer: vi.fn(),
      createNodeBalancer: vi.fn(),
      deleteNodeBalancer: vi.fn(),
      getAllNodeBalancers: vi.fn(),
      getAllNodeBalancersWithConfigs: vi.fn(),
      getNodeBalancerPage: vi.fn(),
      getNodeBalancerWithConfigs: vi.fn(),
    }}
  />
);

describe('NodeBalancers', () => {
  it('should render 3 columns', async () => {
    const { container, findByText } = renderWithTheme(nodeBalancerComponent);

    // @TODO Configure or mock DOM window size so that all 7 columns are shown.
    expect(await findByText('Name')).toBeVisible();
    expect(await findByText('IP Address')).toBeVisible();
    await waitFor(() => {
      expect(container.querySelectorAll('th').length).toBe(3);
    });
  });
});

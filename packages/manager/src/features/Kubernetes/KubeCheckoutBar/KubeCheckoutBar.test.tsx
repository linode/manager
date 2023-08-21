import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { LKE_HA_PRICE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import KubeCheckoutBar, { Props } from './KubeCheckoutBar';

const pools = nodePoolFactory.buildList(5, { count: 3, type: 'g6-standard-1' });

const props: Props = {
  createCluster: jest.fn(),
  hasAgreed: false,
  highAvailability: false,
  highAvailabilityPrice: LKE_HA_PRICE,
  pools,
  region: 'us-east',
  removePool: jest.fn(),
  showHighAvailability: true,
  submitting: false,
  toggleHasAgreed: jest.fn(),
  updatePool: jest.fn(),
};

const renderComponent = (_props: Props) =>
  renderWithTheme(<KubeCheckoutBar {..._props} />);

describe('KubeCheckoutBar', () => {
  it('with DC-specific pricing feature flag on, should not render node pools or create button unless a region has been selected', async () => {
    const { getByTestId, queryAllByTestId, queryAllByText } = renderWithTheme(
      <KubeCheckoutBar {...props} region="" />,
      {
        flags: { dcSpecificPricing: true },
      }
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    expect(queryAllByTestId('node-pool-summary')).toHaveLength(0);
    expect(queryAllByText(/Create Cluster/)).toHaveLength(0);
  });

  it('should render a section for each pool', async () => {
    const { getByTestId, queryAllByTestId } = renderComponent(props);

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    expect(queryAllByTestId('node-pool-summary')).toHaveLength(pools.length);
  });

  it('should not show a warning if all pools have 3 nodes or more', () => {
    const { queryAllByText } = renderComponent(props);
    expect(queryAllByText(/minimum of 3 nodes/i)).toHaveLength(0);
  });

  it('should show a warning if any pool has fewer than 3 nodes', async () => {
    const poolsWithSmallNode = [...pools, nodePoolFactory.build({ count: 2 })];
    const { findByText } = renderComponent({
      ...props,
      pools: poolsWithSmallNode,
    });
    await findByText(/minimum of 3 nodes/i);
  });

  it('should display the total price of the cluster without High Availability', async () => {
    const { findByText } = renderWithTheme(<KubeCheckoutBar {...props} />);

    // 5 node pools * 3 linodes per pool * 10 per linode
    await findByText(/\$150\.00/);
  });

  it('should display the total price of the cluster with High Availability', async () => {
    const { findByText } = renderWithTheme(
      <KubeCheckoutBar {...props} highAvailability />
    );

    // 5 node pools * 3 linodes per pool * 10 per linode + 60 per month per cluster for HA
    await findByText(/\$210\.00/);
  });
});

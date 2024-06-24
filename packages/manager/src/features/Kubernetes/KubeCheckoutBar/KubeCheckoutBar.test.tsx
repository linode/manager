import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { regionFactory } from 'src/factories';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import KubeCheckoutBar from './KubeCheckoutBar';

import type { Props } from './KubeCheckoutBar';

const pools = nodePoolFactory.buildList(5, { count: 3, type: 'g6-standard-1' });

const props: Props = {
  createCluster: vi.fn(),
  hasAgreed: false,
  highAvailability: false,
  highAvailabilityPrice: '60',
  pools,
  region: 'us-east',
  regionsData: regionFactory.buildList(1),
  removePool: vi.fn(),
  showHighAvailability: true,
  submitting: false,
  toggleHasAgreed: vi.fn(),
  updatePool: vi.fn(),
};

const renderComponent = (_props: Props) =>
  renderWithTheme(<KubeCheckoutBar {..._props} />);

describe('KubeCheckoutBar', () => {
  it('should render helper text and disable create button until a region has been selected', async () => {
    const { findByText, getByTestId, getByText } = renderWithTheme(
      <KubeCheckoutBar {...props} region={undefined} />
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    await findByText(LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE);
    expect(getByText('Create Cluster').closest('button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
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

  it('should display the DC-Specific total price of the cluster for a region with a price increase without HA selection', async () => {
    const { findByText } = renderWithTheme(
      <KubeCheckoutBar {...props} region="id-cgk" />
    );

    // 5 node pools * 3 linodes per pool * 12 per linode * 20% increase for Jakarta + 72 per month per cluster for HA
    await findByText(/\$180\.00/);
  });

  it('should display the DC-Specific total price of the cluster for a region with a price increase with HA selection', async () => {
    const { findByText } = renderWithTheme(
      <KubeCheckoutBar
        {...props}
        highAvailability
        highAvailabilityPrice="72"
        region="id-cgk"
      />
    );

    // 5 node pools * 3 linodes per pool * 12 per linode * 20% increase for Jakarta + 72 per month per cluster for HA
    await findByText(/\$252\.00/);
  });

  it('should display UNKNOWN_PRICE for HA when not available and show total price of cluster as the sum of the node pools', async () => {
    const { findByText, getByText } = renderWithTheme(
      <KubeCheckoutBar
        {...props}
        highAvailability
        highAvailabilityPrice={UNKNOWN_PRICE}
        region="id-cgk"
      />
    );

    // 5 node pools * 3 linodes per pool * 12 per linode * 20% increase for Jakarta + UNKNOWN_PRICE
    await findByText(/\$180\.00/);
    getByText(/\$--.--\/month/);
  });
});

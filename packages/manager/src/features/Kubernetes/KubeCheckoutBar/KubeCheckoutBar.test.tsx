import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import {
  LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE,
  LKE_HA_PRICE,
} from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import KubeCheckoutBar, { Props } from './KubeCheckoutBar';

const pools = nodePoolFactory.buildList(5, { count: 3, type: 'g6-standard-1' });

const props: Props = {
  createCluster: vi.fn(),
  hasAgreed: false,
  highAvailability: false,
  highAvailabilityPrice: LKE_HA_PRICE,
  pools,
  region: 'us-east',
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
      <KubeCheckoutBar {...props} region="" />
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    await findByText(LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE);
    expect(getByText('Create Cluster').closest('button')).toBeDisabled();
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

  it('should display the DC-Specific total price of the cluster for a region with a price increase if the DC-Specific pricing feature flag is on', async () => {
    const { findByText } = renderWithTheme(
      <KubeCheckoutBar {...props} region="id-cgk" />,
      {
        flags: { dcSpecificPricing: true },
      }
    );

    // 5 node pools * 3 linodes per pool * 10 per linode * 20% increase for Jakarta
    await findByText(/\$180\.00/);
  });

  it('should display the base total price of the cluster for a region with a price increase if the DC-Specific pricing feature flag is off', async () => {
    const { findByText } = renderWithTheme(
      <KubeCheckoutBar {...props} region="id-cgk" />
    );

    // 5 node pools * 3 linodes per pool * 10 per linode * no price increase for Jakarta
    await findByText(/\$150\.00/);
  });
});

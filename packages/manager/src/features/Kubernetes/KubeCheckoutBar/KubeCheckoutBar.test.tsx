import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithTheme } from 'src/utilities/testHelpers';
import KubeCheckoutBar, { Props } from './KubeCheckoutBar';

const pools = nodePoolFactory.buildList(5, { count: 3, type: 'g6-standard-1' });

const props: Props = {
  pools,
  submitting: false,
  highAvailability: false,
  setHighAvailability: jest.fn(),
  updatePool: jest.fn(),
  removePool: jest.fn(),
  createCluster: jest.fn(),
  region: undefined,
  hasAgreed: false,
  toggleHasAgreed: jest.fn(),
};

const renderComponent = (_props: Props) =>
  renderWithTheme(<KubeCheckoutBar {..._props} />);

describe('KubeCheckoutBar', () => {
  it('should render a section for each pool', async () => {
    const { queryAllByTestId, getByTestId } = renderComponent(props);

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

  it('should display the total price of the cluster', async () => {
    const { findByText } = renderWithTheme(<KubeCheckoutBar {...props} />);

    // 5 node pools * 3 linodes per pool * 10 per linode
    await findByText(/\$150\.00/);
  });
});

import * as React from 'react';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { typeFactory } from 'src/factories/types';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import KubeCheckoutBar, { Props } from './KubeCheckoutBar';

const pools = nodePoolFactory.buildList(5, { count: 3 });
const types = typeFactory.buildList(5);

const props: Props = {
  pools,
  submitting: false,
  highAvailability: false,
  setHighAvailability: jest.fn(),
  updatePool: jest.fn(),
  removePool: jest.fn(),
  createCluster: jest.fn(),
  typesData: types as ExtendedType[],
  region: undefined,
  hasAgreed: false,
  toggleHasAgreed: jest.fn(),
};

const renderComponent = (_props: Props) =>
  renderWithTheme(<KubeCheckoutBar {..._props} />);

describe('KubeCheckoutBar', () => {
  it('should render a section for each pool', () => {
    const { queryAllByTestId } = renderComponent(props);
    expect(queryAllByTestId('node-pool-summary')).toHaveLength(pools.length);
  });

  it('should not show a warning if all pools have 3 nodes or more', () => {
    const { queryAllByText } = renderComponent(props);
    expect(queryAllByText(/minimum of 3 nodes/i)).toHaveLength(0);
  });

  it('should show a warning if any pool has fewer than 3 nodes', () => {
    const poolsWithSmallNode = [...pools, nodePoolFactory.build({ count: 2 })];
    const { getByText } = renderComponent({
      ...props,
      pools: poolsWithSmallNode,
    });
    getByText(/minimum of 3 nodes/i);
  });

  it('should display the total price of the cluster', () => {
    const { getByText } = renderComponent(props);
    getByText(/\$5,000\.00/);
  });
});

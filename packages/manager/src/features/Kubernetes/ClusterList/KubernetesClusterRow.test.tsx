import { render } from '@testing-library/react';
import * as React from 'react';
import { kubernetesClusterFactory } from 'src/factories';
import { wrapWithTableBody, wrapWithTheme } from 'src/utilities/testHelpers';
import { KubernetesClusterRow, Props } from './KubernetesClusterRow';

const extendedClusters = kubernetesClusterFactory.buildList(3);

const cluster = {
  ...extendedClusters[0],
  node_pools: extendedClusters[0].node_pools.map((pool) => ({
    ...pool,
    totalMonthlyPrice: 10,
  })),
};

const props: Props = {
  cluster,
  openUpgradeDialog: jest.fn(),
  openDeleteDialog: jest.fn(),
};

describe('ClusterRow component', () => {
  it('should render', () => {
    const { getByTestId } = render(
      wrapWithTheme(wrapWithTableBody(<KubernetesClusterRow {...props} />))
    );

    getByTestId('cluster-row');
  });

  it('renders a TableRow with label, and region', () => {
    const { getByText } = render(
      wrapWithTableBody(<KubernetesClusterRow {...props} />)
    );

    getByText('cluster-0');
    getByText('Dallas, TX');
  });

  it('renders HA chip for highly available clusters and hides chip for non-ha clusters', () => {
    const haProps = { ...props, isClusterHighlyAvailable: true };
    const { getByTestId, queryByTestId, rerender } = render(
      wrapWithTableBody(<KubernetesClusterRow {...haProps} />)
    );

    getByTestId('ha-chip');

    rerender(wrapWithTableBody(<KubernetesClusterRow {...props} />));
    expect(queryByTestId('ha-chip')).toBeNull();
  });
});

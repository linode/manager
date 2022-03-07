import { render } from '@testing-library/react';
import * as React from 'react';
import { kubernetesClusterFactory } from 'src/factories';
import { wrapWithTableBody, wrapWithTheme } from 'src/utilities/testHelpers';
import { ClusterRow, Props } from './ClusterRow';

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
  hasUpgrade: false,
  openUpgradeDialog: jest.fn(),
  openDeleteDialog: jest.fn(),
};

describe('ClusterRow component', () => {
  it('should render', () => {
    const { getByTestId } = render(
      wrapWithTheme(wrapWithTableBody(<ClusterRow {...props} />))
    );

    getByTestId('cluster-row');
  });

  it('renders a TableRow with label, and region', () => {
    const { getByText } = render(wrapWithTableBody(<ClusterRow {...props} />));

    getByText('cluster-0');
    getByText('Dallas, TX');
  });
});

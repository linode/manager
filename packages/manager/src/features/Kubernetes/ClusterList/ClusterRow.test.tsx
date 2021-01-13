import { render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTableBody, wrapWithTheme } from 'src/utilities/testHelpers';
import { extendedClusters } from 'src/__data__/kubernetes';
import { ClusterRow } from './ClusterRow';

const cluster = {
  ...extendedClusters[0],
  node_pools: extendedClusters[0].node_pools.map(pool => ({
    ...pool,
    totalMonthlyPrice: 10
  }))
};

const props = {
  cluster,
  openDeleteDialog: jest.fn()
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

    getByText('cluster-1');
    getByText('us-central');
  });
});

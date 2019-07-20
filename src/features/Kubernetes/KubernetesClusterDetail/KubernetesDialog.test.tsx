import * as React from 'react';
import { cleanup } from 'react-testing-library';

import { node1, node2 } from 'src/__data__/nodePools';
import { renderWithTheme } from 'src/utilities/testHelpers';

import KubernetesDialog from './KubernetesDialog';

const props = {
  open: true,
  loading: false,
  clusterLabel: 'this-cluster',
  clusterPools: [node1],
  onClose: jest.fn(),
  onDelete: jest.fn()
};

afterEach(cleanup);

describe('Kubernetes deletion dialog', () => {
  it('should display a count of node pools in the cluster', () => {
    const { queryByText } = renderWithTheme(<KubernetesDialog {...props} />);
    expect(queryByText('1 node pool')).toBeInTheDocument();
  });

  it('should display a count of the number of Linodes in the cluster', () => {
    const { queryByText } = renderWithTheme(<KubernetesDialog {...props} />);
    expect(queryByText('1 Linode')).toBeInTheDocument();
  });

  it('should handle plural values', () => {
    const { queryByText } = renderWithTheme(
      <KubernetesDialog {...props} clusterPools={[node1, node2]} />
    );
    expect(queryByText(/2 node pools/)).toBeInTheDocument();
    expect(queryByText(/6 Linodes/)).toBeInTheDocument();
  });
});

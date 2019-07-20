import * as React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';

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

  it('should close the drawer on cancel', () => {
    const { getByTestId } = renderWithTheme(<KubernetesDialog {...props} />);
    const button = getByTestId('dialog-cancel');
    fireEvent.click(button);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not submit the form before the user fills out confirmation text', () => {
    const { getByTestId } = renderWithTheme(<KubernetesDialog {...props} />);
    const button = getByTestId('dialog-confirm');
    fireEvent.click(button);
    expect(props.onDelete).not.toHaveBeenCalled();
  });

  it('should submit the form and call the onDelete handler if the user has confirmed the cluster label', () => {
    const { getByTestId } = renderWithTheme(<KubernetesDialog {...props} />);
    // Fill in the "are you sure" text
    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'this-cluster' } });
    const button = getByTestId('dialog-confirm');
    fireEvent.click(button);
    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });
});

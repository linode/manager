import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Props, ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';

const pool = nodePoolFactory.build({
  type: 'g6-standard-1',
});
const smallPool = nodePoolFactory.build({ count: 2 });

const props: Props = {
  kubernetesClusterId: 1,
  kubernetesRegionId: 'us-east',
  nodePool: pool,
  onClose: jest.fn(),
  open: true,
};

describe('ResizeNodePoolDrawer', () => {
  it("should render the pool's type and size", async () => {
    const { findByText } = renderWithTheme(<ResizeNodePoolDrawer {...props} />);

    await findByText(/linode 1 GB/i);
  });

  it('should display a warning if the user tries to resize a node pool to < 3 nodes', () => {
    const { getByText } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} nodePool={smallPool} />
    );
    expect(getByText(/minimum of 3 nodes/i));
  });

  it('should display a warning if the user tries to resize to a smaller node count', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} />
    );
    const decrement = getByTestId('decrement-button');
    fireEvent.click(decrement);
    expect(getByText(/resizing to fewer nodes/i));
  });
});

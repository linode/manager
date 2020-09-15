import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { types as _types } from 'src/__data__/types';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithTheme } from 'src/utilities/testHelpers';

import ResizeNodePoolDrawer, { Props } from './ResizeNodePoolDrawer';

const pool = nodePoolFactory.build({ type: 'g5-standard-1' });
const smallPool = nodePoolFactory.build({ count: 2 });

const props: Props = {
  open: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  nodePool: pool,
  isSubmitting: false
};

const useTypes = jest.fn().mockReturnValue({ types: { entities: _types } });

jest.mock('src/hooks/useTypes', () => ({
  useTypes: () => useTypes()
}));

describe('ResizeNodePoolDrawer', () => {
  it("should render the pool's type and size", () => {
    const { getByText } = renderWithTheme(<ResizeNodePoolDrawer {...props} />);
    getByText(/linode 2GB/i);
  });

  it('should call the submit handler when submit is clicked', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} />
    );
    const increment = getByTestId('increment-button');
    fireEvent.click(increment);
    const button = getByText(/save/i);
    fireEvent.click(button);
    expect(props.onSubmit).toHaveBeenCalledWith(pool.count + 1);
  });

  it('should display a warning if the user tries to resize a node pool to < 3 nodes', () => {
    const { getByText } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} nodePool={smallPool} />
    );
    expect(getByText(/we recommend at least 3 nodes/i));
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

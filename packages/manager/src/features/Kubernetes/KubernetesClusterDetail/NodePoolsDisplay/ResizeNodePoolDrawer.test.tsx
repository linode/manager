import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { nodePoolFactory, typeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';

import type { Props } from './ResizeNodePoolDrawer';

const pool = nodePoolFactory.build({
  type: 'g6-standard-1',
});
const smallPool = nodePoolFactory.build({ count: 2 });

vi.mock('src/queries/types', async () => {
  const actual = await vi.importActual('src/queries/types');
  return {
    ...actual,
    useSpecificTypes: vi
      .fn()
      .mockReturnValue([{ data: typeFactory.build({ label: 'Linode 1 GB' }) }]),
  };
});

const props: Props = {
  kubernetesClusterId: 1,
  kubernetesRegionId: 'us-east',
  nodePool: pool,
  onClose: vi.fn(),
  open: true,
};

describe('ResizeNodePoolDrawer', () => {
  it("should render the pool's type and size", async () => {
    const { findByText } = renderWithTheme(<ResizeNodePoolDrawer {...props} />);

    await findByText(/linode 1 GB/i);
  });

  it('should display a warning if the user tries to resize a node pool to < 3 nodes', async () => {
    const { findByText } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} nodePool={smallPool} />
    );
    expect(await findByText(/minimum of 3 nodes/i));
  });

  it('should display a warning if the user tries to resize to a smaller node count', async () => {
    const { findByTestId, getByText } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} />
    );

    const decrement = await findByTestId('decrement-button');
    fireEvent.click(decrement);
    expect(getByText(/resizing to fewer nodes/i));
  });
});

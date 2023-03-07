import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { ResizeNodePoolDrawer, Props } from './ResizeNodePoolDrawer';
import { rest, server } from 'src/mocks/testServer';
import { linodeTypeFactory } from 'src/factories';

const pool = nodePoolFactory.build({
  type: 'g6-standard-1',
});
const smallPool = nodePoolFactory.build({ count: 2 });

const props: Props = {
  open: true,
  onClose: jest.fn(),
  nodePool: pool,
  kubernetesClusterId: 1,
};

describe('ResizeNodePoolDrawer', () => {
  it("should render the pool's type and size", async () => {
    server.use(
      rest.get('*/linode/types/g6-standard-1', (req, res, ctx) => {
        return res(
          ctx.json(
            linodeTypeFactory.build({
              id: 'g6-standard-1',
              label: 'Linode 2GB',
            })
          )
        );
      })
    );

    const { findByText } = renderWithTheme(<ResizeNodePoolDrawer {...props} />);

    await findByText(/linode 2 GB/i);
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

import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { ResizeNodePoolDrawer, Props } from './ResizeNodePoolDrawer';
import { rest, server } from 'src/mocks/testServer';
import { linodeTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { QueryClient } from 'react-query';

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

const queryClient = new QueryClient();

describe('ResizeNodePoolDrawer', () => {
  it("should render the pool's type and size", async () => {
    server.use(
      rest.get('*/linode/types', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              linodeTypeFactory.buildList(1, {
                label: 'linode 2GB',
                id: 'g6-standard-1',
              })
            )
          )
        );
      })
    );

    const { getByText, getByTestId } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} />,
      { queryClient }
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    getByText(/linode 2GB/i);
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

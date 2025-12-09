import { linodeTypeFactory } from '@linode/utilities';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { nodePoolFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';

import type { Props } from './ResizeNodePoolDrawer';

const type = linodeTypeFactory.build({
  id: 'fake-linode-type-id',
  label: 'Linode 2GB',
});
const pool = nodePoolFactory.build({
  type: type.id,
});
const smallPool = nodePoolFactory.build({ count: 2 });

const props: Props = {
  clusterTier: 'standard',
  kubernetesClusterId: 1,
  kubernetesRegionId: 'us-east',
  nodePool: pool,
  onClose: vi.fn(),
  open: true,
};

describe('ResizeNodePoolDrawer', () => {
  // @TODO enable this test when we begin surfacing Node Pool `label` in the UI (ECE-353)
  it.skip("should render a title containing the Node Pool's label when the node pool has a label", async () => {
    const nodePool = nodePoolFactory.build({ label: 'my-mock-node-pool-1' });

    const { getByText } = renderWithTheme(
      <ResizeNodePoolDrawer {...props} nodePool={nodePool} />
    );

    expect(getByText('Resize Pool: my-mock-node-pool-1')).toBeVisible();
  });

  it("should render a title containing the Node Pool's type initially when the node pool does not have a label", () => {
    const { getByText } = renderWithTheme(<ResizeNodePoolDrawer {...props} />);

    expect(getByText('Resize Pool: fake-linode-type-id Plan')).toBeVisible();
  });

  it("should render a title containing the Node Pool's type's label once the type data has loaded when the node pool does not have a label", async () => {
    server.use(
      http.get('*/v4*/linode/types/:id', () => HttpResponse.json(type))
    );

    const { findByText } = renderWithTheme(<ResizeNodePoolDrawer {...props} />);

    expect(await findByText('Resize Pool: Linode 2 GB Plan')).toBeVisible();
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

  it('should display a maximum of 100 nodes for LKE', async () => {
    const { findByTestId } = renderWithTheme(
      <ResizeNodePoolDrawer
        {...props}
        nodePool={nodePoolFactory.build({ count: 101 })}
      />
    );

    const input = (await findByTestId('textfield-input')) as HTMLInputElement;
    expect(input.value).toBe('100');
    const increment = await findByTestId('increment-button');
    expect(increment).toBeDisabled();
  });

  it('should display a maximum of 500 nodes for LKE-E', async () => {
    const { findByTestId } = renderWithTheme(
      <ResizeNodePoolDrawer
        {...props}
        clusterTier="enterprise"
        nodePool={nodePoolFactory.build({ count: 501 })}
      />
    );

    const input = (await findByTestId('textfield-input')) as HTMLInputElement;
    expect(input.value).toBe('500');
    const increment = await findByTestId('increment-button');
    expect(increment).toBeDisabled();
  });
});

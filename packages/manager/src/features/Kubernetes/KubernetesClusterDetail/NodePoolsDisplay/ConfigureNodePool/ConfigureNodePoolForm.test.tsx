import { linodeTypeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountFactory, nodePoolFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ConfigureNodePoolForm } from './ConfigureNodePoolForm';

const flags = {
  lkeEnterprise: {
    postLa: true,
    enabled: true,
    la: true,
    ga: false,
    phase2Mtc: false,
  },
};

describe('ConfigureNodePoolForm', () => {
  it("renders a label field containing the Node Pool's label", () => {
    const nodePool = nodePoolFactory.build({ label: 'my-node-pool-1' });

    const { getByLabelText } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={0}
        clusterTier="standard"
        clusterVersion={''}
        nodePool={nodePool}
      />
    );

    const labelTextField = getByLabelText('Label');

    expect(labelTextField).toBeEnabled();
    expect(labelTextField).toBeVisible();
    expect(labelTextField).toHaveDisplayValue('my-node-pool-1');
  });

  it('renders an Update Strategy select if the cluster is enterprise, the account has the capability, and the postLa feature flag is enabled', async () => {
    const nodePool = nodePoolFactory.build({
      update_strategy: 'rolling_update',
    });
    const account = accountFactory.build({
      capabilities: ['Kubernetes Enterprise'],
    });

    server.use(http.get('*/v4*/account', () => HttpResponse.json(account)));

    const { findByLabelText } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={0}
        clusterTier="enterprise"
        clusterVersion={''}
        nodePool={nodePool}
      />,
      { flags }
    );

    const updateStrategyField = await findByLabelText('Update Strategy');

    expect(updateStrategyField).toBeEnabled();
    expect(updateStrategyField).toBeVisible();
    expect(updateStrategyField).toHaveDisplayValue('Rolling Updates');
  });

  it('renders an Kubernetes Version select if the cluster is enterprise, the account has the capability, and the postLa feature flag is enabled', async () => {
    const nodePool = nodePoolFactory.build({
      k8s_version: 'v1.31.8+lke5',
    });
    const account = accountFactory.build({
      capabilities: ['Kubernetes Enterprise'],
    });

    server.use(http.get('*/v4*/account', () => HttpResponse.json(account)));

    const { getByRole, findByLabelText } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={0}
        clusterTier="enterprise"
        clusterVersion="v1.31.8+lke6"
        nodePool={nodePool}
      />,
      { flags }
    );

    const kubernetesVersionField = await findByLabelText('Kubernetes Version');

    expect(kubernetesVersionField).toBeEnabled();
    expect(kubernetesVersionField).toBeVisible();
    expect(kubernetesVersionField).toHaveDisplayValue('v1.31.8+lke5');

    // Open the version select
    await userEvent.click(kubernetesVersionField);

    // Verify the Node Pool's version and the cluster's version show as version options
    expect(getByRole('option', { name: 'v1.31.8+lke5' })).toBeVisible();
    expect(getByRole('option', { name: 'v1.31.8+lke6' })).toBeVisible();
  });

  it("uses the Node Pool's type as the label field's placeholder if the node pool does not have an explicit label", async () => {
    const type = linodeTypeFactory.build({ label: 'Fake Linode 2GB' });
    const nodePool = nodePoolFactory.build({ label: '', type: type.id });

    server.use(
      http.get(`*/v4*/linode/types/${type.id}`, () => HttpResponse.json(type))
    );

    const { findByPlaceholderText } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={0}
        clusterTier="standard"
        clusterVersion={''}
        nodePool={nodePool}
      />
    );

    expect(await findByPlaceholderText('Fake Linode 2 GB')).toBeVisible();
  });

  it('makes a PUT request to /v4beta/lke/clusters/:id/pools/:id and calls onDone when the form is saved', async () => {
    const clusterId = 1;
    const nodePool = nodePoolFactory.build();
    const onDone = vi.fn();
    const onUpdateNodePool = vi.fn();

    server.use(
      http.put(
        `*/v4*/lke/clusters/${clusterId}/pools/${nodePool.id}`,
        async ({ request }) => {
          onUpdateNodePool(await request.json());
          return HttpResponse.json(nodePool);
        }
      )
    );

    const { getByRole, getByLabelText } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={clusterId}
        clusterTier="standard"
        clusterVersion={''}
        nodePool={nodePool}
        onDone={onDone}
      />
    );

    const saveButton = getByRole('button', { name: 'Save' });

    // The save button should be disabled until the user makes a change
    expect(saveButton).toBeDisabled();

    await userEvent.type(getByLabelText('Label'), 'my-new-node-pool-label');

    // The save button should be enabled now that the user changed the Node Pool's label
    expect(saveButton).toBeEnabled();

    await userEvent.click(saveButton);

    // Verify the onDone prop was called
    await waitFor(() => {
      expect(onDone).toHaveBeenCalled();
    });

    // Verify the PUT request happend with the expected payload
    expect(onUpdateNodePool).toHaveBeenCalledWith({
      label: 'my-new-node-pool-label',
      tags: [],
    });
  });

  it("calls onDone when 'Cancel' is clicked", async () => {
    const nodePool = nodePoolFactory.build();
    const onDone = vi.fn();

    const { getByRole } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={0}
        clusterTier="standard"
        clusterVersion={''}
        nodePool={nodePool}
        onDone={onDone}
      />
    );

    await userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(onDone).toHaveBeenCalled();
  });
});

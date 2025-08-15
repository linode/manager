import { linodeTypeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  accountFactory,
  kubernetesVersionFactory,
  nodePoolFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
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
    const kubernetesVersion = kubernetesVersionFactory.build();
    const nodePool = nodePoolFactory.build({
      k8s_version: kubernetesVersion.id,
    });
    const account = accountFactory.build({
      capabilities: ['Kubernetes Enterprise'],
    });

    server.use(
      http.get('*/v4*/account', () => HttpResponse.json(account)),
      http.get('*/v4*/lke/tiers/enterprise/versions', () =>
        HttpResponse.json(makeResourcePage([kubernetesVersion]))
      )
    );

    const { findByLabelText } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={0}
        clusterTier="enterprise"
        nodePool={nodePool}
      />,
      { flags }
    );

    const kubernetesVersionField = await findByLabelText('Kubernetes Version');

    expect(kubernetesVersionField).toBeEnabled();
    expect(kubernetesVersionField).toBeVisible();

    await waitFor(() => {
      expect(kubernetesVersionField).toHaveDisplayValue(kubernetesVersion.id);
    });
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
        nodePool={nodePool}
      />
    );

    expect(await findByPlaceholderText('Fake Linode 2 GB')).toBeVisible();
  });

  it("calls onDone when 'Cancel' is clicked", async () => {
    const nodePool = nodePoolFactory.build();
    const onDone = vi.fn();

    const { getByRole } = renderWithTheme(
      <ConfigureNodePoolForm
        clusterId={0}
        clusterTier="standard"
        nodePool={nodePool}
        onDone={onDone}
      />
    );

    await userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(onDone).toHaveBeenCalled();
  });
});

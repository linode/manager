import { linodeFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import React from 'react';

import { accountFactory } from 'src/factories';
import { kubeLinodeFactory } from 'src/factories/kubernetesCluster';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeTable } from './NodeTable';

import type { Props } from './NodeTable';
import type { KubernetesTier } from '@linode/api-v4';

describe('NodeTable', () => {
  const linodes = [
    linodeFactory.build({ label: 'linode-1', ipv4: ['50.116.6.1'] }),
    linodeFactory.build({ label: 'linode-2', ipv4: ['50.116.6.2'] }),
    linodeFactory.build({ label: 'linode-3', ipv4: ['50.116.6.3'] }),
  ];

  const nodes = linodes.map((linode) =>
    kubeLinodeFactory.build({
      instance_id: linode.id,
    })
  );

  const props: Props = {
    clusterCreated: '2025-01-13T02:58:58',
    clusterId: 1,
    clusterTier: 'standard',
    encryptionStatus: 'enabled',
    isLkeClusterRestricted: false,
    nodes,
    openRecycleNodeDialog: vi.fn(),
    poolId: 1,
    poolVersion: undefined,
    regionSupportsDiskEncryption: false,
    statusFilter: 'all',
    tags: [],
    typeLabel: 'g6-standard-1',
  };

  it('includes label, status, and IP columns', async () => {
    server.use(
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage(linodes));
      })
    );

    const { findAllByText, findByText } = renderWithTheme(
      <NodeTable {...props} />
    );

    expect(await findAllByText('Running')).toHaveLength(3);

    await Promise.all(
      linodes.map(async (linode) => {
        await findByText(linode.label);
        await findByText(linode.ipv4[0]);
      })
    );
  });

  it('shows the Pool ID', async () => {
    const { getByText } = renderWithTheme(<NodeTable {...props} />);

    expect(getByText('Pool ID')).toBeVisible();
    expect(getByText(props.poolId)).toBeVisible();
  });

  it("shows the Node Pool's tags", async () => {
    const tags = ['dev', 'staging', 'production'];

    const { getByText } = renderWithTheme(<NodeTable {...props} tags={tags} />);

    for (const tag of tags) {
      expect(getByText(tag)).toBeVisible();
    }
  });

  it("shows the node pool's version for a LKE Enterprise cluster", async () => {
    const { getByText } = renderWithTheme(
      <NodeTable
        {...props}
        clusterTier="enterprise"
        poolVersion="v1.31.8+lke5"
      />
    );

    expect(getByText('Version')).toBeVisible();
    expect(getByText('v1.31.8+lke5')).toBeVisible();
  });

  it("does not show the node pool's version for a standard LKE cluster", async () => {
    const { queryByText } = renderWithTheme(
      <NodeTable {...props} clusterTier="standard" poolVersion="v1.31.8+lke5" />
    );

    expect(queryByText('Version')).toBeNull();
    expect(queryByText('v1.31.8+lke5')).toBeNull();
  });

  it('displays a provisioning message if the cluster was created within the first 20 mins and there are no nodes yet', async () => {
    const clusterProps = {
      ...props,
      clusterCreated: DateTime.local().toISO(),
      clusterTier: 'enterprise' as KubernetesTier,
      nodes: [],
    };

    const { findByText } = renderWithTheme(<NodeTable {...clusterProps} />);

    expect(
      await findByText(
        'Worker nodes will appear once cluster provisioning is complete.'
      )
    ).toBeVisible();

    expect(
      await findByText('Provisioning can take up to ~20 minutes.')
    ).toBeVisible();
  });

  it('does not display the encryption status of the pool if the account lacks the capability or the feature flag is off', async () => {
    const { queryByText } = renderWithTheme(<NodeTable {...props} />, {
      flags: { linodeDiskEncryption: false },
    });

    expect(queryByText('Encrypted')).not.toBeInTheDocument();
    expect(queryByText('Not Encrypted')).not.toBeInTheDocument();
  });

  it('shows "Encrypted" with an icon if the Node Pool is encrypted, the feature flag is on, and the account has the capability', async () => {
    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findAllByText } = renderWithTheme(
      <NodeTable {...props} encryptionStatus="enabled" />,
      {
        flags: { linodeDiskEncryption: true },
      }
    );

    const encryptedContext = await findAllByText('Encrypted');

    // Two elements exist: A lock icon and the actual "Encrypted" text
    expect(encryptedContext).toHaveLength(2);

    // Verify the "Encrypted" text is visible
    expect(encryptedContext[1]).toBeVisible();
  });

  it('shows "Not Encrypted" with an icon if the Node Pool is not encrypted, the feature flag is on, and the account has the capability', async () => {
    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findAllByText } = renderWithTheme(
      <NodeTable {...props} encryptionStatus="disabled" />,
      {
        flags: { linodeDiskEncryption: true },
      }
    );

    const encryptedContext = await findAllByText('Not Encrypted');

    // Two elements exist: A unlock icon and the actual "Not Encrypted" text
    expect(encryptedContext).toHaveLength(2);

    // Verify the "Encrypted" text is visible
    expect(encryptedContext[1]).toBeVisible();
  });
});

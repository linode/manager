import { linodeFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import React from 'react';

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
    clusterTier: 'standard',
    isLkeClusterRestricted: false,
    nodes,
    openRecycleNodeDialog: vi.fn(),
    statusFilter: 'all',
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
});

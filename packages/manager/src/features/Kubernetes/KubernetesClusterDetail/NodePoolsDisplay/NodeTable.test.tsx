import { linodeFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import * as React from 'react';

import { kubeLinodeFactory } from 'src/factories/kubernetesCluster';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { encryptionStatusTestId, NodeTable } from './NodeTable';

import type { Props } from './NodeTable';
import type { KubernetesTier } from '@linode/api-v4';

const mockLinodes = new Array(3)
  .fill(null)
  .map((_element: null, index: number) => {
    return linodeFactory.build({
      ipv4: [`50.116.6.${index}`],
    });
  });

const mockKubeNodes = mockLinodes.map((mockLinode) =>
  kubeLinodeFactory.build({
    instance_id: mockLinode.id,
  })
);

const props: Props = {
  clusterCreated: '2025-01-13T02:58:58',
  clusterId: 1,
  clusterTier: 'standard',
  encryptionStatus: 'enabled',
  nodes: mockKubeNodes,
  openRecycleNodeDialog: vi.fn(),
  poolId: 1,
  regionSupportsDiskEncryption: false,
  statusFilter: 'all',
  tags: [],
  typeLabel: 'Linode 2G',
};

beforeAll(() => linodeFactory.resetSequenceNumber());

describe('NodeTable', () => {
  const mocks = vi.hoisted(() => {
    return {
      useIsDiskEncryptionFeatureEnabled: vi.fn(),
    };
  });

  vi.mock('src/components/Encryption/utils.ts', async () => {
    const actual = await vi.importActual<any>(
      'src/components/Encryption/utils.ts'
    );
    return {
      ...actual,
      __esModule: true,
      useIsDiskEncryptionFeatureEnabled:
        mocks.useIsDiskEncryptionFeatureEnabled.mockImplementation(() => {
          return {
            isDiskEncryptionFeatureEnabled: false, // indicates the feature flag is off or account capability is absent
          };
        }),
    };
  });

  it('includes label, status, and IP columns', async () => {
    server.use(
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage(mockLinodes));
      })
    );

    const { findAllByText, findByText } = await renderWithThemeAndRouter(
      <NodeTable {...props} />
    );

    expect(await findAllByText('Running')).toHaveLength(3);

    await Promise.all(
      mockLinodes.map(async (mockLinode) => {
        await findByText(mockLinode.label);
        await findByText(mockLinode.ipv4[0]);
      })
    );
  });

  it('includes the Pool ID', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <NodeTable {...props} />
    );
    getByText('Pool ID 1');
  });

  it('displays a provisioning message if the cluster was created within the first 20 mins and there are no nodes yet', async () => {
    const clusterProps = {
      ...props,
      clusterCreated: DateTime.local().toISO(),
      clusterTier: 'enterprise' as KubernetesTier,
      nodes: [],
    };

    const { findByText } = await renderWithThemeAndRouter(
      <NodeTable {...clusterProps} />
    );

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
    // situation where isDiskEncryptionFeatureEnabled === false
    const { queryByTestId } = await renderWithThemeAndRouter(
      <NodeTable {...props} />
    );
    const encryptionStatusFragment = queryByTestId(encryptionStatusTestId);

    expect(encryptionStatusFragment).not.toBeInTheDocument();
  });

  it('displays the encryption status of the pool if the feature flag is on and the account has the capability', async () => {
    mocks.useIsDiskEncryptionFeatureEnabled.mockImplementationOnce(() => {
      return {
        isDiskEncryptionFeatureEnabled: true,
      };
    });

    const { queryByTestId } = await renderWithThemeAndRouter(
      <NodeTable {...props} />
    );
    const encryptionStatusFragment = queryByTestId(encryptionStatusTestId);

    expect(encryptionStatusFragment).toBeInTheDocument();

    mocks.useIsDiskEncryptionFeatureEnabled.mockRestore();
  });
});

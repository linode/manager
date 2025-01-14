import { DateTime } from 'luxon';
import * as React from 'react';

import { kubeLinodeFactory } from 'src/factories/kubernetesCluster';
import { linodeFactory } from 'src/factories/linodes';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeTable, encryptionStatusTestId } from './NodeTable';

import type { Props } from './NodeTable';
import type { KubernetesTier } from '@linode/api-v4';

const mockLinodes = linodeFactory.buildList(3);

const mockKubeNodes = kubeLinodeFactory.buildList(3);

const props: Props = {
  clusterCreated: '2025-01-13T02:58:58',
  clusterId: 1,
  clusterTier: 'standard',
  encryptionStatus: 'enabled',
  nodes: mockKubeNodes,
  openRecycleNodeDialog: vi.fn(),
  poolId: 1,
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
      useIsDiskEncryptionFeatureEnabled: mocks.useIsDiskEncryptionFeatureEnabled.mockImplementation(
        () => {
          return {
            isDiskEncryptionFeatureEnabled: false, // indicates the feature flag is off or account capability is absent
          };
        }
      ),
    };
  });

  it('includes label, status, and IP columns', () => {
    const { findByText } = renderWithTheme(<NodeTable {...props} />);
    mockLinodes.forEach(async (thisLinode) => {
      await findByText(thisLinode.label);
      await findByText(thisLinode.ipv4[0]);
      await findByText('Ready');
    });
  });

  it('includes the Pool ID', () => {
    const { getByText } = renderWithTheme(<NodeTable {...props} />);
    getByText('Pool ID 1');
  });

  it('does not display the encryption status of the pool if the account lacks the capability or the feature flag is off', () => {
    // situation where isDiskEncryptionFeatureEnabled === false
    const { queryByTestId } = renderWithTheme(<NodeTable {...props} />);
    const encryptionStatusFragment = queryByTestId(encryptionStatusTestId);

    expect(encryptionStatusFragment).not.toBeInTheDocument();
  });

  it('displays the encryption status of the pool if the feature flag is on and the account has the capability', () => {
    mocks.useIsDiskEncryptionFeatureEnabled.mockImplementationOnce(() => {
      return {
        isDiskEncryptionFeatureEnabled: true,
      };
    });

    const { queryByTestId } = renderWithTheme(<NodeTable {...props} />);
    const encryptionStatusFragment = queryByTestId(encryptionStatusTestId);

    expect(encryptionStatusFragment).toBeInTheDocument();

    mocks.useIsDiskEncryptionFeatureEnabled.mockRestore();
  });

  it('displays a provisioning message if the cluster was created within the first 10 mins and there are no nodes yet', async () => {
    const clusterProps = {
      ...props,
      clusterCreated: DateTime.local().toISO(),
      clusterTier: 'enterprise' as KubernetesTier,
      nodes: [],
    };

    const { findByText } = renderWithTheme(<NodeTable {...clusterProps} />);

    expect(
      await findByText(
        'Nodes will appear once cluster provisioning is complete.'
      )
    ).toBeVisible();

    expect(
      await findByText('Provisioning can take up to 10 minutes.')
    ).toBeVisible();
  });
});

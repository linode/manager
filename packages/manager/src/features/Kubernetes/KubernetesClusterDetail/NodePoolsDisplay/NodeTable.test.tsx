import * as React from 'react';

import { kubeLinodeFactory } from 'src/factories/kubernetesCluster';
import { linodeFactory } from 'src/factories/linodes';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeTable, Props, encryptionStatusTestId } from './NodeTable';

const mockLinodes = linodeFactory.buildList(3);

const mockKubeNodes = kubeLinodeFactory.buildList(3);

const props: Props = {
  encryptionStatus: 'enabled',
  nodes: mockKubeNodes,
  openRecycleNodeDialog: vi.fn(),
  poolId: 1,
  typeLabel: 'Linode 2G',
};

beforeAll(() => linodeFactory.resetSequenceNumber());

describe('NodeTable', () => {
  const mocks = vi.hoisted(() => {
    return {
      useIsDiskEncryptionFeatureEnabled: vi.fn(),
    };
  });

  vi.mock('src/components/DiskEncryption/utils.ts', async () => {
    const actual = await vi.importActual<any>(
      'src/components/DiskEncryption/utils.ts'
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
});

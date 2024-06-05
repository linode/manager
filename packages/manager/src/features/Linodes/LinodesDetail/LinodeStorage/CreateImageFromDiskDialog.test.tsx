import * as React from 'react';

import { DISK_ENCRYPTION_IMAGES_CAVEAT_COPY } from 'src/components/DiskEncryption/constants';
import { linodeDiskFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateImageFromDiskDialog } from './CreateImageFromDiskDialog';

const diskEncryptionEnabledMock = vi.hoisted(() => {
  return {
    useIsDiskEncryptionFeatureEnabled: vi.fn(),
  };
});

describe('CreateImageFromDiskDialog component', () => {
  const mockDisk = linodeDiskFactory.build();

  vi.mock('src/components/DiskEncryption/utils.ts', async () => {
    const actual = await vi.importActual<any>(
      'src/components/DiskEncryption/utils.ts'
    );
    return {
      ...actual,
      __esModule: true,
      useIsDiskEncryptionFeatureEnabled: diskEncryptionEnabledMock.useIsDiskEncryptionFeatureEnabled.mockImplementation(
        () => {
          return {
            isDiskEncryptionFeatureEnabled: false, // indicates the feature flag is off or account capability is absent
          };
        }
      ),
    };
  });

  it('does not display a notice regarding Images not being encrypted if the Disk Encryption feature is disabled', () => {
    const { queryByText } = renderWithTheme(
      <CreateImageFromDiskDialog
        disk={mockDisk}
        linodeId={1}
        onClose={vi.fn()}
        open={true}
      />
    );

    const encryptionImagesCaveatNotice = queryByText(
      DISK_ENCRYPTION_IMAGES_CAVEAT_COPY
    );

    expect(encryptionImagesCaveatNotice).not.toBeInTheDocument();
  });

  it('displays a notice regarding Images not being encrypted if the Disk Encryption feature is enabled', () => {
    diskEncryptionEnabledMock.useIsDiskEncryptionFeatureEnabled.mockImplementationOnce(
      () => {
        return {
          isDiskEncryptionFeatureEnabled: true,
        };
      }
    );

    const { queryByText } = renderWithTheme(
      <CreateImageFromDiskDialog
        disk={mockDisk}
        linodeId={1}
        onClose={vi.fn()}
        open={true}
      />
    );

    const encryptionImagesCaveatNotice = queryByText(
      DISK_ENCRYPTION_IMAGES_CAVEAT_COPY
    );

    expect(encryptionImagesCaveatNotice).toBeInTheDocument();

    diskEncryptionEnabledMock.useIsDiskEncryptionFeatureEnabled.mockRestore();
  });
});

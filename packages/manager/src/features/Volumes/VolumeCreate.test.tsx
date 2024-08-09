import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VolumeCreate } from './VolumeCreate';

const blockStorageEncryptionEnabledMock = vi.hoisted(() => {
  return {
    useIsBlockStorageEncryptionFeatureEnabled: vi.fn(),
  };
});

describe('VolumeCreate', () => {
  // @TODO BSE: Remove feature flagging/conditionality once BSE is fully rolled out
  vi.mock('src/components/Encryption/utils.ts', async () => {
    const actual = await vi.importActual<any>(
      'src/components/Encryption/utils.ts'
    );
    return {
      ...actual,
      __esModule: true,
      useIsBlockStorageEncryptionFeatureEnabled: blockStorageEncryptionEnabledMock.useIsBlockStorageEncryptionFeatureEnabled.mockImplementation(
        () => {
          return {
            isBlockStorageEncryptionFeatureEnabled: false, // indicates the feature flag is off or account capability is absent
          };
        }
      ),
    };
  });

  it('should not have a "Volume Encryption" section visible if the feature flag is off and user does not have capability', () => {
    const { queryByText } = renderWithTheme(<VolumeCreate />);

    expect(queryByText('Encrypt Volume')).not.toBeInTheDocument();
  });

  it('should have a "Volume Encryption" section visible if feature flag is on and user has the capability', () => {
    blockStorageEncryptionEnabledMock.useIsBlockStorageEncryptionFeatureEnabled.mockImplementationOnce(
      () => {
        return {
          isBlockStorageEncryptionFeatureEnabled: true,
        };
      }
    );

    const { queryByText } = renderWithTheme(<VolumeCreate />);

    expect(queryByText('Encrypt Volume')).toBeInTheDocument();
  });
});

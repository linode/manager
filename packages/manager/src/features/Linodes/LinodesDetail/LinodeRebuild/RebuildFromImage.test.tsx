import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { RebuildFromImage } from './RebuildFromImage';

vi.mock('src/utilities/scrollErrorIntoView');
vi.mock('src/components/EnhancedSelect/Select');

const props = {
  disabled: false,
  diskEncryptionEnabled: true,
  handleRebuildError: vi.fn(),
  isLKELinode: false,
  linodeId: 1234,
  linodeIsInDistributedRegion: false,
  onClose: vi.fn(),
  passwordHelperText: '',
  toggleDiskEncryptionEnabled: vi.fn(),
  ...reactRouterProps,
};

const diskEncryptionEnabledMock = vi.hoisted(() => {
  return {
    useIsDiskEncryptionFeatureEnabled: vi.fn(),
  };
});

describe('RebuildFromImage', () => {
  vi.mock('src/components/Encryption/utils.ts', async () => {
    const actual = await vi.importActual<any>(
      'src/components/Encryption/utils.ts'
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

  it('renders a SelectImage panel', () => {
    const { queryByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTheme(<RebuildFromImage {...props} />),
    });
    expect(queryByText('Select Image')).toBeInTheDocument();
  });

  // @TODO LDE: Remove feature flagging/conditionality once LDE is fully rolled out
  it('does not render a "Disk Encryption" section when the Disk Encryption feature is disabled', () => {
    const { queryByText } = renderWithThemeAndHookFormContext({
      component: <RebuildFromImage {...props} />,
    });

    expect(queryByText('Encrypt Disk')).not.toBeInTheDocument();
  });

  it('renders a "Disk Encryption" section when the Disk Encryption feature is enabled', () => {
    diskEncryptionEnabledMock.useIsDiskEncryptionFeatureEnabled.mockImplementationOnce(
      () => {
        return {
          isDiskEncryptionFeatureEnabled: true,
        };
      }
    );

    const { queryByText } = renderWithThemeAndHookFormContext({
      component: <RebuildFromImage {...props} />,
    });

    expect(queryByText('Encrypt Disk')).toBeInTheDocument();
  });
});

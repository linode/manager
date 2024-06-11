import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { RebuildFromStackScript } from './RebuildFromStackScript';

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
  type: 'community' as const,
  ...reactRouterProps,
};

const diskEncryptionEnabledMock = vi.hoisted(() => {
  return {
    useIsDiskEncryptionFeatureEnabled: vi.fn(),
  };
});

describe('RebuildFromStackScript', () => {
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

  it('renders a SelectImage panel', () => {
    const { queryByText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    expect(queryByText('Select Image')).toBeInTheDocument();
  });

  it('renders a SelectStackScript panel', () => {
    const { queryByPlaceholderText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    expect(queryByPlaceholderText('Search by Label, Username, or Description'));
  });

  it.skip('validates the form upon clicking the "Rebuild" button', async () => {
    const { getByTestId, getByText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    fireEvent.click(getByTestId('rebuild-button'));
    await waitFor(
      () => [
        getByText('A StackScript is required.'),
        getByText('An image is required.'),
        getByText('Password is required.'),
      ],
      {}
    );
  });

  // @TODO LDE: Remove feature flagging/conditionality once LDE is fully rolled out
  it('does not render a "Disk Encryption" section when the Disk Encryption feature is disabled', () => {
    const { queryByText } = renderWithTheme(
      <RebuildFromStackScript {...props} />
    );

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

    const { queryByText } = renderWithTheme(
      <RebuildFromStackScript {...props} />
    );

    expect(queryByText('Encrypt Disk')).toBeInTheDocument();
  });
});

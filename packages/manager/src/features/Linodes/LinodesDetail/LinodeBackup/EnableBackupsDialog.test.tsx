import * as React from 'react';

import { DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY } from 'src/components/DiskEncryption/constants';
import { linodeFactory } from 'src/factories';
import { typeFactory } from 'src/factories/types';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EnableBackupsDialog } from './EnableBackupsDialog';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useTypeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
}));

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

vi.mock('src/queries/types', async () => {
  const actual = await vi.importActual('src/queries/types');
  return {
    ...actual,
    useTypeQuery: queryMocks.useTypeQuery,
  };
});

const diskEncryptionEnabledMock = vi.hoisted(() => {
  return {
    useIsDiskEncryptionFeatureEnabled: vi.fn(),
  };
});

describe('EnableBackupsDialog component', () => {
  beforeEach(() => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: typeFactory.build({
        addons: {
          backups: {
            price: {
              hourly: 0.004,
              monthly: 2.5,
            },
            region_prices: [
              {
                hourly: 0,
                id: 'es-mad',
                monthly: 0,
              },
            ],
          },
        },
        id: 'mock-linode-type',
        label: 'Mock Linode Type',
      }),
    });
  });

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

  it('Displays the monthly backup price', async () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 1,
        label: 'Mock Linode',
        region: 'us-east',
        type: 'mock-linode-type',
      }),
    });

    const { findByText } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    // Confirm that the user is warned that they will be billed, and that the correct
    // price is displayed.
    expect(
      await findByText(
        /Are you sure you want to enable backups on this Linode\?.*/
      )
    ).toHaveTextContent(/This will add .* to your monthly bill/);
    expect(await findByText('$2.50')).toBeVisible();
  });

  it('Displays the monthly backup price when the price is $0', async () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 1,
        label: 'Mock Linode',
        region: 'es-mad',
        type: 'mock-linode-type',
      }),
    });

    const { findByText, getByTestId, queryByText } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    // Confirm that the user is warned that they will be billed, and that $0.00
    // is shown.
    expect(
      await findByText(
        /Are you sure you want to enable backups on this Linode\?.*/
      )
    ).toHaveTextContent(/This will add .* to your monthly bill/);
    expect(await findByText('$0.00')).toBeVisible();

    // Confirm that error message is not present.
    expect(queryByText(PRICES_RELOAD_ERROR_NOTICE_TEXT)).toBeNull();

    // Confirm that "Enable Backups" button is enabled.
    expect(getByTestId('confirm-enable-backups')).toBeEnabled();
  });

  it('Displays an error when backup price cannot be determined', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: undefined,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 1,
        label: 'Mock Linode',
        region: 'es-mad',
        type: 'mock-linode-type',
      }),
    });

    const { findByText, getByTestId } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    // Confirm that error message is not present.
    expect(await findByText(PRICES_RELOAD_ERROR_NOTICE_TEXT)).toBeVisible();

    // Confirm that "Enable Backups" button is disabled.
    expect(getByTestId('confirm-enable-backups')).toBeDisabled();
  });

  it('does not display a notice regarding Backups not being encrypted if the Disk Encryption feature is disabled', () => {
    const { queryByText } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    const encryptionBackupsCaveatNotice = queryByText(
      DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY
    );

    expect(encryptionBackupsCaveatNotice).not.toBeInTheDocument();
  });

  it('displays a notice regarding Backups not being encrypted if the Disk Encryption feature is enabled', () => {
    diskEncryptionEnabledMock.useIsDiskEncryptionFeatureEnabled.mockImplementationOnce(
      () => {
        return {
          isDiskEncryptionFeatureEnabled: true,
        };
      }
    );

    const { queryByText } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    const encryptionBackupsCaveatNotice = queryByText(
      DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY
    );

    expect(encryptionBackupsCaveatNotice).toBeInTheDocument();

    diskEncryptionEnabledMock.useIsDiskEncryptionFeatureEnabled.mockRestore();
  });
});

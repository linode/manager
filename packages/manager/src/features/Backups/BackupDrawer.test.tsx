import { linodeFactory } from '@linode/utilities';
import * as React from 'react';

import { accountSettingsFactory, typeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BackupDrawer } from './BackupDrawer';

const queryMocks = vi.hoisted(() => ({
  useAccountSettings: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useAllLinodesQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useAllTypes: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useTypeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
  userPermissions: vi.fn(() => ({
    data: { enable_linode_backups: true },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllTypes: queryMocks.useAllTypes,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
    useTypeQuery: queryMocks.useTypeQuery,
  };
});

vi.mock('src/queries/accountSettings', async () => {
  const actual = await vi.importActual('src/queries/accountSettings');
  return {
    ...actual,
    useAccountSettings: queryMocks.useAccountSettings,
  };
});

describe('BackupDrawer', () => {
  beforeEach(() => {
    const mockType = typeFactory.build({
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
    });
    queryMocks.useAccountSettings.mockReturnValue({
      data: accountSettingsFactory.build({
        backups_enabled: false,
      }),
    });
    queryMocks.useAllTypes.mockReturnValue({
      data: [mockType],
    });
    queryMocks.useTypeQuery.mockReturnValue({
      data: mockType,
    });
  });

  describe('Total price display', () => {
    it('displays total backup price', async () => {
      queryMocks.useAllLinodesQuery.mockReturnValue({
        data: [
          linodeFactory.build({
            backups: { enabled: false },
            region: 'es-mad',
            type: 'mock-linode-type',
          }),
          ...linodeFactory.buildList(5, {
            backups: { enabled: false },
            region: 'us-east',
            type: 'mock-linode-type',
          }),
        ],
      });

      const { findByText } = renderWithTheme(
        <BackupDrawer onClose={vi.fn()} open={true} />
      );
      expect(await findByText('Total for 6 Linodes:')).toBeVisible();
      expect(await findByText('$12.50')).toBeVisible();
    });

    it('displays total backup price when total is $0', async () => {
      queryMocks.useAllLinodesQuery.mockReturnValue({
        data: [
          linodeFactory.build({
            backups: { enabled: false },
            region: 'es-mad',
            type: 'mock-linode-type',
          }),
        ],
      });

      const { findByText } = renderWithTheme(
        <BackupDrawer onClose={vi.fn()} open={true} />
      );
      expect(await findByText('Total for 1 Linode:')).toBeVisible();
      expect(await findByText('$0.00')).toBeVisible();
    });

    it('displays placeholder when total backup price cannot be determined', async () => {
      queryMocks.useAllTypes.mockReturnValue({
        data: undefined,
      });

      queryMocks.useAllLinodesQuery.mockReturnValue({
        data: [linodeFactory.build({ backups: { enabled: false } })],
      });

      const { findByText } = renderWithTheme(
        <BackupDrawer onClose={vi.fn()} open={true} />
      );
      expect(await findByText('Total for 1 Linode:')).toBeVisible();
      expect(await findByText('$--.--')).toBeVisible();
    });
  });

  describe('Linode list', () => {
    it('Only lists Linodes that do not have backups enabled', async () => {
      const mockLinodesWithBackups = linodeFactory.buildList(3, {
        backups: { enabled: true },
      });

      const mockLinodesWithoutBackups = linodeFactory.buildList(3, {
        backups: { enabled: false },
      });

      queryMocks.useAllLinodesQuery.mockReturnValue({
        data: [...mockLinodesWithBackups, ...mockLinodesWithoutBackups],
      });

      const { findByText, queryByText } = renderWithTheme(
        <BackupDrawer onClose={vi.fn()} open={true} />
      );
      // Confirm that Linodes without backups are listed in table.
      for (const mockLinode of mockLinodesWithoutBackups) {
        expect(await findByText(mockLinode.label)).toBeVisible();
      }
      // Confirm that Linodes with backups are not listed in table.
      for (const mockLinode of mockLinodesWithBackups) {
        expect(queryByText(mockLinode.label)).toBeNull();
      }
    });
  });
  it('should disable "Confirm" button and AutoEnroll checkbox if the user does not have "enable_linode_backups" permission', async () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: linodeFactory.buildList(1, { backups: { enabled: false } }),
    });
    queryMocks.userPermissions.mockReturnValue({
      data: { enable_linode_backups: false },
    });
    const { findByText, getByRole } = renderWithTheme(
      <BackupDrawer onClose={vi.fn()} open={true} />
    );
    const confirmButton = (await findByText('Confirm')).closest('button');
    expect(confirmButton).toBeDisabled();

    expect(getByRole('checkbox')).toBeDisabled();
  });

  it('should enable "Confirm" button and AutoEnroll checkbox if the user has "enable_linode_backups" permission', async () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: linodeFactory.buildList(1, { backups: { enabled: false } }),
    });
    queryMocks.userPermissions.mockReturnValue({
      data: { enable_linode_backups: true },
    });
    const { findByText, getByRole } = renderWithTheme(
      <BackupDrawer onClose={vi.fn()} open={true} />
    );
    const confirmButton = (await findByText('Confirm')).closest('button');
    expect(confirmButton).toBeEnabled();

    expect(getByRole('checkbox')).toBeEnabled();
  });
});

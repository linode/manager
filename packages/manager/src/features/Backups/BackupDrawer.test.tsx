import * as React from 'react';
import {
  accountSettingsFactory,
  linodeFactory,
  typeFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BackupDrawer } from './BackupDrawer';

const queryMocks = vi.hoisted(() => ({
  useAllLinodesQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useAllTypes: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useTypeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useAccountSettings: vi.fn().mockReturnValue({
    data: undefined,
  }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
  };
});

vi.mock('src/queries/types', async () => {
  const actual = await vi.importActual('src/queries/types');
  return {
    ...actual,
    useAllTypes: queryMocks.useAllTypes,
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
      id: 'mock-linode-type',
      label: 'Mock Linode Type',
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
            region: 'es-mad',
            type: 'mock-linode-type',
            backups: { enabled: false },
          }),
          ...linodeFactory.buildList(5, {
            region: 'us-east',
            type: 'mock-linode-type',
            backups: { enabled: false },
          }),
        ],
      });

      const { findByText } = renderWithTheme(
        <BackupDrawer open={true} onClose={vi.fn()} />
      );
      expect(await findByText('Total for 6 Linodes:')).toBeVisible();
      expect(await findByText('$12.50')).toBeVisible();
    });

    it('displays total backup price when total is $0', async () => {
      queryMocks.useAllLinodesQuery.mockReturnValue({
        data: [
          linodeFactory.build({
            region: 'es-mad',
            type: 'mock-linode-type',
            backups: { enabled: false },
          }),
        ],
      });

      const { findByText } = renderWithTheme(
        <BackupDrawer open={true} onClose={vi.fn()} />
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
        <BackupDrawer open={true} onClose={vi.fn()} />
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
        <BackupDrawer open={true} onClose={vi.fn()} />
      );
      // Confirm that Linodes without backups are listed in table.
      /* eslint-disable no-await-in-loop */
      for (const mockLinode of mockLinodesWithoutBackups) {
        expect(await findByText(mockLinode.label)).toBeVisible();
      }
      // Confirm that Linodes with backups are not listed in table.
      for (const mockLinode of mockLinodesWithBackups) {
        expect(queryByText(mockLinode.label)).toBeNull();
      }
    });
  });
});

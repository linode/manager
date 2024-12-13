import React from 'react';

import { databaseFactory } from 'src/factories';
import { DatabaseSettingsMaintenance } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsMaintenance';
import { renderWithTheme } from 'src/utilities/testHelpers';

import type { Engine } from '@linode/api-v4';

const UPGRADE_VERSION = 'Upgrade Version';

const queryMocks = vi.hoisted(() => ({
  useDatabaseEnginesQuery: vi.fn().mockReturnValue({
    data: [
      {
        engine: 'mysql' as Engine,
        id: 'mysql/8',
        version: '8',
      },
      {
        engine: 'postgresql' as Engine,
        id: 'postgresql/13',
        version: '13',
      },
      {
        engine: 'postgresql' as Engine,
        id: 'postgresql/14',
        version: '14',
      },
      {
        engine: 'postgresql' as Engine,
        id: 'postgresql/15',
        version: '15',
      },
      {
        engine: 'postgresql' as Engine,
        id: 'postgresql/16',
        version: '16',
      },
    ],
  }),
}));

vi.mock('src/queries/databases/databases', async () => {
  const actual = await vi.importActual('src/queries/databases/databases');
  return {
    ...actual,
    useDatabaseEnginesQuery: queryMocks.useDatabaseEnginesQuery,
  };
});

describe('Database Settings Maintenance', () => {
  it('should disable upgrade version modal button when there are no upgrades available', async () => {
    const database = databaseFactory.build({
      engine: 'mysql',
      version: '8.0.30',
    });

    const onReviewUpdates = vi.fn();
    const onUpgradeVersion = vi.fn();

    const { findByRole } = renderWithTheme(
      <DatabaseSettingsMaintenance
        databaseEngine={database.engine}
        databasePendingUpdates={database.updates.pending}
        databaseVersion={database.version}
        onReviewUpdates={onReviewUpdates}
        onUpgradeVersion={onUpgradeVersion}
      />
    );

    const button = await findByRole('button', { name: UPGRADE_VERSION });

    expect(button).toBeDisabled();
  });

  it('should disable upgrade version modal button when there are upgrades available, but there are still updates available', async () => {
    const database = databaseFactory.build({
      engine: 'postgresql',
      version: '13',
      updates: {
        pending: [
          {
            deadline: null,
            description: 'Log configuration options changes required',
            planned_for: null,
          },
        ],
      },
    });

    const onReviewUpdates = vi.fn();
    const onUpgradeVersion = vi.fn();

    const { findByRole } = renderWithTheme(
      <DatabaseSettingsMaintenance
        databaseEngine={database.engine}
        databasePendingUpdates={database.updates.pending}
        databaseVersion={database.version}
        onReviewUpdates={onReviewUpdates}
        onUpgradeVersion={onUpgradeVersion}
      />
    );

    const button = await findByRole('button', { name: UPGRADE_VERSION });

    expect(button).toBeDisabled();
  });

  it('should enable upgrade version modal button when there are upgrades available, and there are no pending updates', async () => {
    const database = databaseFactory.build({
      engine: 'postgresql',
      version: '13',
      updates: {
        pending: [],
      },
    });

    const onReviewUpdates = vi.fn();
    const onUpgradeVersion = vi.fn();

    const { findByRole } = renderWithTheme(
      <DatabaseSettingsMaintenance
        databaseEngine={database.engine}
        databasePendingUpdates={database.updates.pending}
        databaseVersion={database.version}
        onReviewUpdates={onReviewUpdates}
        onUpgradeVersion={onUpgradeVersion}
      />
    );

    const button = await findByRole('button', { name: UPGRADE_VERSION });

    expect(button).toBeEnabled();
  });

  it('should show review text and modal button when there are updates ', async () => {
    const database = databaseFactory.build({
      updates: {
        pending: [
          {
            deadline: null,
            description: 'Log configuration options changes required',
            planned_for: null,
          },
        ],
      },
    });

    const onReviewUpdates = vi.fn();
    const onUpgradeVersion = vi.fn();

    const { queryByRole } = renderWithTheme(
      <DatabaseSettingsMaintenance
        databaseEngine={database.engine}
        databasePendingUpdates={database.updates.pending}
        databaseVersion={database.version}
        onReviewUpdates={onReviewUpdates}
        onUpgradeVersion={onUpgradeVersion}
      />
    );

    const button = queryByRole('button', { name: 'Click to review' });

    expect(button).toBeInTheDocument();
  });

  it('should not show review text and modal button when there are no updates', async () => {
    const database = databaseFactory.build({
      updates: {
        pending: [],
      },
    });

    const onReviewUpdates = vi.fn();
    const onUpgradeVersion = vi.fn();

    const { queryByRole } = renderWithTheme(
      <DatabaseSettingsMaintenance
        databaseEngine={database.engine}
        databasePendingUpdates={database.updates.pending}
        databaseVersion={database.version}
        onReviewUpdates={onReviewUpdates}
        onUpgradeVersion={onUpgradeVersion}
      />
    );

    const button = queryByRole('button', { name: 'Click to review' });

    expect(button).not.toBeInTheDocument();
  });
});

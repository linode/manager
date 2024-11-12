import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseSettingsUpgradeVersionDialog } from './DatabaseSettingsUpgradeVersionDialog';

import type { Engine } from '@linode/api-v4';

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

describe('Database Settings Upgrade Version Dialog', () => {
  it('should display warning', async () => {
    const database = databaseFactory.build();

    const onClose = vi.fn();

    const { findByText } = renderWithTheme(
      <DatabaseSettingsUpgradeVersionDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        databaseLabel={database.label}
        databaseVersion={database.version}
        onClose={onClose}
        open={true}
      />
    );

    const warning = await findByText(
      'Reverting back to the prior version is not possible once the upgrade has been started'
    );

    expect(warning).toBeInTheDocument();
  });

  it('should disable upgrade button when no selectedVersion', async () => {
    const database = databaseFactory.build();

    const onClose = vi.fn();

    const { findByTestId } = renderWithTheme(
      <DatabaseSettingsUpgradeVersionDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        databaseLabel={database.label}
        databaseVersion={database.version}
        onClose={onClose}
        open={true}
      />
    );

    const upgrade = await findByTestId('upgrade');
    const cancel = await findByTestId('cancel');

    expect(upgrade).toBeDisabled();
    expect(cancel).toBeEnabled();
  });
});

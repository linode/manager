import { waitFor } from '@testing-library/react';
import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseEngineVersion } from './DatabaseEngineVersion';

describe('Database Engine Version', () => {
  it('should render V2 GA view default db without pendingUpdates', async () => {
    const database = databaseFactory.build({
      engine: 'mysql',
      updates: {
        pending: [],
      },
      version: '8.0.30',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('MySQL v8.0.30')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeNull();
    });
  });

  it('should render V2 GA view default db with pendingUpdates', async () => {
    const database = databaseFactory.build({
      engine: 'postgresql',
      version: '14.6',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('PostgreSQL v14.6')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeInTheDocument();
    });
  });
});

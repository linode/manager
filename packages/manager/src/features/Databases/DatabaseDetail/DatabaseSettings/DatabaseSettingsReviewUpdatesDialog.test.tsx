import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { DatabaseSettingsReviewUpdatesDialog } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsReviewUpdatesDialog';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('Database Settings Review Updates Dialog', () => {
  it('should list updates', async () => {
    const database = databaseFactory.build({
      updates: {
        pending: [
          {
            deadline: null,
            description: 'Update a',
            planned_for: '2044-09-15T17:15:12',
          },
          {
            deadline: null,
            description: 'Update b',
            planned_for: '2044-09-15T17:15:12',
          },
        ],
      },
    });

    const onClose = vi.fn();

    const { findByText } = renderWithTheme(
      <DatabaseSettingsReviewUpdatesDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        onClose={onClose}
        open={true}
      />
    );

    const a = await findByText('Update a');
    const b = await findByText('Update b');

    expect(a).toBeDefined();
    expect(b).toBeDefined();
  });

  it('should enable buttons', async () => {
    const database = databaseFactory.build();

    const onClose = vi.fn();

    const { findByTestId } = renderWithTheme(
      <DatabaseSettingsReviewUpdatesDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        onClose={onClose}
        open={true}
      />
    );

    const start = await findByTestId('start');
    const close = await findByTestId('close');

    expect(start).toBeEnabled();
    expect(close).toBeEnabled();
  });
});

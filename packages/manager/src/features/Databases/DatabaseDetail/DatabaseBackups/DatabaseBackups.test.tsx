import * as React from 'react';

import {
  databaseBackupFactory,
  databaseFactory,
  profileFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseBackups from './DatabaseBackups';

describe('Database Backups', () => {
  it('should render a list of backups after loading', async () => {
    const backups = databaseBackupFactory.buildList(7);

    // Mock the Database because the Backups Details page requires it to be loaded
    server.use(
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ timezone: 'utc' })));
      }),
      rest.get('*/databases/:engine/instances/:id', (req, res, ctx) => {
        return res(ctx.json(databaseFactory.build()));
      }),
      rest.get('*/databases/:engine/instances/:id/backups', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(backups)));
      })
    );

    const { findByText } = renderWithTheme(<DatabaseBackups />);

    for (const backup of backups) {
      // Check to see if all 7 backups are rendered
      expect(
        // eslint-disable-next-line no-await-in-loop
        await findByText(formatDate(backup.created, { timezone: 'utc' }))
      ).toBeInTheDocument();
    }
  });

  it('should render an empty state if there are no backups', async () => {
    // Mock the Database because the Backups Details page requires it to be loaded
    server.use(
      rest.get('*/databases/:engine/instances/:id', (req, res, ctx) => {
        return res(ctx.json(databaseFactory.build()));
      })
    );

    // Mock an empty list of backups
    server.use(
      rest.get('*/databases/:engine/instances/:id/backups', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { findByText } = renderWithTheme(<DatabaseBackups />);

    expect(await findByText('No backups to display.')).toBeInTheDocument();
  });
});

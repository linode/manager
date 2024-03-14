import * as React from 'react';

import {
  databaseBackupFactory,
  databaseFactory,
  profileFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseBackups from './DatabaseBackups';

describe('Database Backups', () => {
  it('should render a list of backups after loading', async () => {
    const backups = databaseBackupFactory.buildList(7);

    // Mock the Database because the Backups Details page requires it to be loaded
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      }),
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(databaseFactory.build());
      }),
      http.get('*/databases/:engine/instances/:id/backups', () => {
        return HttpResponse.json(makeResourcePage(backups));
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
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(databaseFactory.build());
      })
    );

    // Mock an empty list of backups
    server.use(
      http.get('*/databases/:engine/instances/:id/backups', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByText } = renderWithTheme(<DatabaseBackups />);

    expect(await findByText('No backups to display.')).toBeInTheDocument();
  });
});

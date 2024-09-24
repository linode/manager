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
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const backups = databaseBackupFactory.buildList(7);

    // Mock the Database because the Backups Details page requires it to be loaded
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      }),
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
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
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    // Mock the Database because the Backups Details page requires it to be loaded
    server.use(
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
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

  it('should disable the restore button if disabled = true', async () => {
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const backups = databaseBackupFactory.buildList(7);

    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      }),
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      }),
      http.get('*/databases/:engine/instances/:id/backups', () => {
        return HttpResponse.json(makeResourcePage(backups));
      })
    );

    const { findAllByText } = renderWithTheme(
      <DatabaseBackups disabled={true} />
    );
    const buttonSpans = await findAllByText('Restore');
    expect(buttonSpans.length).toEqual(7);
    buttonSpans.forEach((span: HTMLSpanElement) => {
      const button = span.closest('button');
      expect(button).toBeDisabled();
    });
  });

  it('should enable the restore button if disabled = false', async () => {
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const backups = databaseBackupFactory.buildList(7);

    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      }),
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      }),
      http.get('*/databases/:engine/instances/:id/backups', () => {
        return HttpResponse.json(makeResourcePage(backups));
      })
    );

    const { findAllByText } = renderWithTheme(
      <DatabaseBackups disabled={false} />
    );
    const buttonSpans = await findAllByText('Restore');
    expect(buttonSpans.length).toEqual(7);
    buttonSpans.forEach((span: HTMLSpanElement) => {
      const button = span.closest('button');
      expect(button).toBeEnabled();
    });
  });

  it('should render a time picker when it is a new database', async () => {
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-default',
    });
    const backups = databaseBackupFactory.buildList(7);

    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      }),
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      }),
      http.get('*/databases/:engine/instances/:id/backups', () => {
        return HttpResponse.json(makeResourcePage(backups));
      })
    );

    const { findByText } = renderWithTheme(
      <DatabaseBackups disabled={false} />
    );
    const timePickerLabel = await findByText('Time (UTC)');
    expect(timePickerLabel).toBeInTheDocument();
  });
});

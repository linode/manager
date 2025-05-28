import { waitFor } from '@testing-library/react';
import React from 'react';

import { databaseBackupFactory, databaseFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  renderWithTheme,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import DatabaseBackups from './DatabaseBackups';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

/**
 * Skipped due to repeated flake issues that we've been unable to fix after a few attempts
 * 1. https://github.com/linode/manager/pull/11130
 * 2. https://github.com/linode/manager/pull/11394
 */
describe.skip('Database Backups (Legacy)', () => {
  it('should render a list of backups after loading', async () => {
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-legacy',
    });

    const backups = databaseBackupFactory.buildList(7);

    server.use(
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      }),
      http.get('*/databases/:engine/instances/:id/backups', () => {
        return HttpResponse.json(makeResourcePage(backups));
      })
    );

    const { getAllByRole } = renderWithTheme(<DatabaseBackups />);

    await waitFor(() => {
      // Verify there is a table row for each backup (and a row for the table header)
      expect(getAllByRole('row')).toHaveLength(backups.length + 1);
    });
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
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      }),
      http.get('*/databases/:engine/instances/:id/backups', () => {
        return HttpResponse.json(makeResourcePage(backups));
      })
    );

    const { findAllByText } = renderWithTheme(<DatabaseBackups disabled />);

    const buttonSpans = await findAllByText('Restore');

    // There should be a button for each backup
    expect(buttonSpans).toHaveLength(7);

    for (const span of buttonSpans) {
      const button = span.closest('button');
      expect(button).toBeDisabled();
    }
  });

  it('should enable the restore button if disabled = false', async () => {
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const backups = databaseBackupFactory.buildList(7);

    server.use(
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

    // There should be a button for each backup
    expect(buttonSpans).toHaveLength(7);

    for (const span of buttonSpans) {
      const button = span.closest('button');
      expect(button).toBeEnabled();
    }
  });
});

describe('Database Backups (v2)', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      engine: 'rdbms-default',
      databaseId: '1234567890',
    });
  });

  it('should disable the restore button if no oldest_restore_time is returned', async () => {
    const mockDatabase = databaseFactory.build({
      oldest_restore_time: undefined,
      platform: 'rdbms-default',
    });

    server.use(
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      })
    );

    const { findByText } = await renderWithThemeAndRouter(<DatabaseBackups />);

    const restoreButton = (await findByText('Restore')).closest('button');

    expect(restoreButton).toBeDisabled();
  });

  it('should render a date picker when it is a default database', async () => {
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-default',
    });

    server.use(
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      })
    );

    const { container } = await renderWithThemeAndRouter(
      <DatabaseBackups disabled={false} />
    );

    await waitFor(() => {
      expect(
        container.getElementsByClassName('MuiDateCalendar-root')
      ).toHaveLength(1);
    });
  });

  it('should render a time picker when it is a default database', async () => {
    const mockDatabase = databaseFactory.build({
      platform: 'rdbms-default',
    });

    server.use(
      http.get('*/databases/:engine/instances/:id', () => {
        return HttpResponse.json(mockDatabase);
      })
    );

    const { findByText } = await renderWithThemeAndRouter(
      <DatabaseBackups disabled={false} />,
      {
        initialRoute: '/databases/$engine/$databaseId/backups',
      }
    );

    const timePickerLabel = await findByText('Time (UTC)');
    expect(timePickerLabel).toBeInTheDocument();
  });
});

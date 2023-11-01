import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

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

const queryClient = new QueryClient();

afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'table-row-loading';

describe('Database Backups', () => {
  it('should render a loading state', async () => {
    const { getByTestId } = renderWithTheme(<DatabaseBackups />, {
      queryClient,
    });

    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render a list of backups after loading', async () => {
    const backups = databaseBackupFactory.buildList(7);

    server.use(
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ timezone: 'utc' })));
      })
    );

    // Mock the Database because the Backups Details page requires it to be loaded
    server.use(
      rest.get('*/databases/:engine/instances/:id', (req, res, ctx) => {
        return res(ctx.json(databaseFactory.build()));
      })
    );

    // Mock a list of 7 backups
    server.use(
      rest.get('*/databases/:engine/instances/:id/backups', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(backups)));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<DatabaseBackups />, {
      queryClient,
    });

    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    // Wait for loading to finish before test continues
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    for (const backup of backups) {
      // Check to see if all 7 backups are rendered
      expect(
        getByText(formatDate(backup.created, { timezone: 'utc' }))
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

    const { getByTestId, getByText } = renderWithTheme(<DatabaseBackups />, {
      queryClient,
    });

    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    // Wait for loading to finish before test continues
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText('No backups to display.')).toBeInTheDocument();
  });
});

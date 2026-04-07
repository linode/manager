import * as React from 'react';

import {
  databaseInstanceFactory,
  subnetAssignedDatabaseDataFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetDatabasesTable } from './SubnetDatabasesTable';

const queryMocks = vi.hoisted(() => ({
  useDatabasesQuery: vi.fn().mockReturnValue({
    data: [],
  }),
}));

const mockDatabasesData = [subnetAssignedDatabaseDataFactory.build({ id: 1 })];

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDatabasesQuery: queryMocks.useDatabasesQuery,
  };
});

describe('SubnetDatabasesTable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render table for SubnetDatabasesTable when there are assigned databases', async () => {
    queryMocks.useDatabasesQuery.mockReturnValue({
      data: makeResourcePage([
        databaseInstanceFactory.build({ id: 1, label: 'test-database-1' }),
      ]),
      isLoading: false,
      error: null,
    });
    const { getByText } = renderWithTheme(
      <SubnetDatabasesTable databasesData={mockDatabasesData} />
    );
    getByText('test-database-1');
    getByText('Database Cluster');
  });

  it('should render loading state for SubnetDatabasesTable', async () => {
    queryMocks.useDatabasesQuery.mockReturnValue({
      data: makeResourcePage([]),
      isLoading: true,
      error: null,
    });

    const { getByTestId } = renderWithTheme(
      <SubnetDatabasesTable databasesData={mockDatabasesData} />
    );
    getByTestId('circle-progress');
  });

  it('should render empty state for SubnetDatabasesTable when no databases are returned', async () => {
    queryMocks.useDatabasesQuery.mockReturnValue({
      data: makeResourcePage([]),
      isLoading: false,
      error: null,
    });

    const { getByTestId } = renderWithTheme(
      <SubnetDatabasesTable databasesData={mockDatabasesData} />
    );
    getByTestId('table-row-empty');
  });

  it('should render error state for SubnetDatabasesTable', async () => {
    const expectedErrorMessage = 'Failed to fetch databases';
    queryMocks.useDatabasesQuery.mockReturnValue({
      data: makeResourcePage([]),
      isLoading: false,
      error: [{ reason: expectedErrorMessage }],
    });

    const { getByText } = renderWithTheme(
      <SubnetDatabasesTable databasesData={mockDatabasesData} />
    );
    getByText(expectedErrorMessage);
  });
});

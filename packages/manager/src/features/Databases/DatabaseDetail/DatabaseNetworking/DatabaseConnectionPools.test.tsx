import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it } from 'vitest';

import {
  databaseConnectionPoolFactory,
  databaseFactory,
} from 'src/factories/databases';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseConnectionPools } from './DatabaseConnectionPools';

const mockDatabase = databaseFactory.build({
  platform: 'rdbms-default',
  private_network: null,
  engine: 'postgresql',
  id: 1,
});

const mockConnectionPool = databaseConnectionPoolFactory.build({
  database: 'defaultdb',
  label: 'pool-1',
  mode: 'transaction',
  size: 10,
  username: null,
});

// Hoist query mocks
const queryMocks = vi.hoisted(() => {
  return {
    useDatabaseConnectionPoolsQuery: vi.fn(),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDatabaseConnectionPoolsQuery: queryMocks.useDatabaseConnectionPoolsQuery,
  };
});

describe('DatabaseManageNetworkingDrawer Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render PgBouncer Connection Pools field', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([mockConnectionPool]),
      isLoading: false,
    });
    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />);

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('Manage PgBouncer Connection Pools');
    const addPoolBtnLabel = screen.getByText('Add Pool');
    expect(addPoolBtnLabel).toBeInTheDocument();
  });

  it('should render loading state', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([mockConnectionPool]),
      isLoading: true,
    });
    const loadingTestId = 'circle-progress';
    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />);

    const loadingCircle = screen.getByTestId(loadingTestId);
    expect(loadingCircle).toBeInTheDocument();
  });

  it('should render table with connection pool data', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([mockConnectionPool]),
      isLoading: false,
    });

    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />);

    const connectionPoolLabel = screen.getByText(mockConnectionPool.label);
    expect(connectionPoolLabel).toBeInTheDocument();
  });

  it('should render table empty state when no data is provided', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([]),
      isLoading: false,
    });

    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />);

    const emptyStateText = screen.getByText(
      "You don't have any connection pools added."
    );
    expect(emptyStateText).toBeInTheDocument();
  });

  it('should render error state state when backend responds with error', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      error: new Error('Failed to fetch VPC'),
    });

    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />);
    const errorStateText = screen.getByText(
      'There was a problem retrieving your connection pools. Refresh the page or try again later.'
    );
    expect(errorStateText).toBeInTheDocument();
  });
});

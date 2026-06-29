import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it } from 'vitest';

import {
  databaseConnectionPoolFactory,
  databaseFactory,
} from 'src/factories/databases';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import {
  getShadowRootElement,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { DatabaseConnectionPools } from './DatabaseConnectionPools';

const mockDatabase = databaseFactory.build({
  platform: 'rdbms-default',
  private_network: null,
  hosts: {
    primary: 'db-primary-0.b.linodeb.net',
    endpoints: [
      {
        role: 'primary',
        address: 'db-primary-0.b.linodeb.net',
        port: 15847,
        public_access: true,
      },
      {
        role: 'primary-connection-pool',
        address: 'public-db-primary-0.b.linodeb.net',
        port: 15848,
        public_access: true,
      },
    ],
  },
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

function mockMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: true,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

describe('DatabaseConnectionPools Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockMatchMedia();
  });

  it('should render PgBouncer Connection Pools field', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([mockConnectionPool]),
      isLoading: false,
    });
    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />);

    const heading = screen.getAllByRole('heading')[0]; // First heading is the section heading. Second heading is the drawer title.
    expect(heading.textContent).toBe('Manage PgBouncer Connection Pools');
    const addPoolBtnLabel = screen.getAllByText('Add Pool')[0]; // The first "Add Pool" button is the one in the main component. The second "Add Pool" button is in the drawer.
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

  it('should render service URI component if there are connection pools and hostnameEndpoints flag is true', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([mockConnectionPool]),
      isLoading: false,
    });

    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />, {
      flags: { hostnameEndpoints: true },
    });
    const serviceURIText = screen.getByText('Service URI');
    expect(serviceURIText).toBeInTheDocument();
  });

  it('should not render service URI component if there are no connection pools', () => {
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([]),
      isLoading: false,
    });

    renderWithTheme(<DatabaseConnectionPools database={mockDatabase} />);
    const serviceURIText = screen.queryByText('Service URI');
    expect(serviceURIText).not.toBeInTheDocument();
  });

  it('should disable the Add Pool button when the database cluster is not active', async () => {
    const provisioningDatabase = databaseFactory.build({
      platform: 'rdbms-default',
      private_network: null,
      engine: 'postgresql',
      id: 1,
      status: 'provisioning',
    });
    queryMocks.useDatabaseConnectionPoolsQuery.mockReturnValue({
      data: makeResourcePage([]),
      isLoading: false,
    });

    renderWithTheme(
      <DatabaseConnectionPools database={provisioningDatabase} />
    );
    // eslint-disable-next-line testing-library/no-node-access -- cds-button Web Component host
    const addPoolHost = screen
      .getAllByText('Add Pool')[0]
      .closest('cds-button');
    expect(addPoolHost).not.toBeNull();
    const addPoolBtn = await getShadowRootElement(
      addPoolHost as HTMLElement,
      'button'
    );
    expect(addPoolBtn).toBeDisabled();
  });
});

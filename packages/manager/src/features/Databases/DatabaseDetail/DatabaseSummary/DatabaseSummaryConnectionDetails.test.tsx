import { waitFor } from '@testing-library/react';
import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseSummaryConnectionDetails from './DatabaseSummaryConnectionDetails';

import type { Database } from '@linode/api-v4/lib/databases';

const AKMADMIN = 'akmadmin';
const POSTGRESQL = 'postgresql';
const DEFAULT_PRIMARY = 'db-default-primary.net';
const DEFAULT_STANDBY = 'db-default-standby.net';

const queryMocks = vi.hoisted(() => ({
  useDatabaseCredentialsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDatabaseCredentialsQuery: queryMocks.useDatabaseCredentialsQuery,
  };
});

describe('DatabaseSummaryConnectionDetails', () => {
  it('should display correctly for default db', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({
      data: {
        password: 'abc123',
        username: AKMADMIN,
      },
    });

    const database = databaseFactory.build({
      engine: POSTGRESQL,
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: DEFAULT_STANDBY,
        endpoints: [
          {
            role: 'primary',
            address: DEFAULT_PRIMARY,
            port: 3306,
            public_access: true,
          },
          {
            role: 'standby',
            address: DEFAULT_STANDBY,
            port: 3306,
            public_access: true,
          },
        ],
      },
      id: 99,
      port: 22496,
      ssl_connection: true,
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryConnectionDetails database={database} />
    );

    expect(queryMocks.useDatabaseCredentialsQuery).toHaveBeenCalledWith(
      POSTGRESQL,
      99
    );

    await waitFor(() => {
      expect(queryAllByText('Connection Details')).toHaveLength(1);

      expect(queryAllByText('Username')).toHaveLength(1);
      expect(queryAllByText(AKMADMIN)).toHaveLength(1);

      expect(queryAllByText('Password')).toHaveLength(1);

      expect(queryAllByText('Host')).toHaveLength(1);
      expect(queryAllByText(DEFAULT_PRIMARY)).toHaveLength(1);
      expect(queryAllByText('Read-only Host')).toHaveLength(1);
      expect(queryAllByText(DEFAULT_STANDBY)).toHaveLength(1);

      expect(queryAllByText('Port')).toHaveLength(1);
      expect(queryAllByText('22496')).toHaveLength(1);

      expect(queryAllByText('SSL')).toHaveLength(1);
      expect(queryAllByText('ENABLED')).toHaveLength(1);
    });
  });

  it('should display N/A for default DB with blank read-only Host field', async () => {
    const database = databaseFactory.build({
      engine: POSTGRESQL,
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: undefined,
      },
      id: 99,
      port: 22496,
      ssl_connection: true,
    });

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryConnectionDetails database={database} />
    );

    expect(queryAllByText('N/A')).toHaveLength(1);
  });

  it('should display Connection Type for default database', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({});

    const database = databaseFactory.build({
      private_network: {
        public_access: true,
        subnet_id: 1,
        vpc_id: 123,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryConnectionDetails database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText('Connection Type')).toHaveLength(1);
      expect(queryAllByText('VPC')).toHaveLength(1);
    });
  });

  it('should display Connection Type as Private for default database with VPC', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({});

    const database = databaseFactory.build({
      private_network: {
        public_access: false,
        subnet_id: 1,
        vpc_id: 123,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryConnectionDetails database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText('Connection Type')).toHaveLength(1);
      expect(queryAllByText('VPC')).toHaveLength(1);
    });
  });

  it('should display Connection Type as Public for default database with no VPC', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({});

    const database = databaseFactory.build({}) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryConnectionDetails database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText('Connection Type')).toHaveLength(1);
      expect(queryAllByText('Public')).toHaveLength(1);
    });
  });

  it('should not display Database Name for Valkey clusters', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({});

    const database = databaseFactory.build({ engine: 'valkey' }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryConnectionDetails database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText('Database name')).toHaveLength(0);
    });
  });
});

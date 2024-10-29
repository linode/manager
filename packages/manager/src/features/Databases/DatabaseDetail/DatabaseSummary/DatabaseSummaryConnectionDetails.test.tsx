import { waitFor } from '@testing-library/react';
import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseSummaryConnectionDetails from './DatabaseSummaryConnectionDetails';

import type { Database } from '@linode/api-v4/lib/databases';

const AKMADMIN = 'akmadmin';
const POSTGRESQL = 'postgresql';
const DEFAULT_PRIMARY = 'db-mysql-default-primary.net';
const DEFAULT_STANDBY = 'db-mysql-default-standby.net';

const MYSQL = 'mysql';
const LINROOT = 'linroot';
const LEGACY_PRIMARY = 'db-mysql-legacy-primary.net';
const LEGACY_SECONDARY = 'db-mysql-legacy-secondary.net';

const queryMocks = vi.hoisted(() => ({
  useDatabaseCredentialsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/databases/databases', () => ({
  useDatabaseCredentialsQuery: queryMocks.useDatabaseCredentialsQuery,
}));

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
      },
      id: 99,
      platform: 'rdbms-default',
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

  it('should display correctly for legacy db', async () => {
    queryMocks.useDatabaseCredentialsQuery.mockReturnValue({
      data: {
        password: 'abc123',
        username: LINROOT,
      },
    });

    const database = databaseFactory.build({
      engine: MYSQL,
      hosts: {
        primary: LEGACY_PRIMARY,
        secondary: LEGACY_SECONDARY,
        standby: undefined,
      },
      id: 22,
      platform: 'rdbms-legacy',
      port: 3306,
      ssl_connection: true,
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryConnectionDetails database={database} />
    );

    expect(queryMocks.useDatabaseCredentialsQuery).toHaveBeenCalledWith(
      MYSQL,
      22
    );

    await waitFor(() => {
      expect(queryAllByText('Username')).toHaveLength(1);
      expect(queryAllByText(LINROOT)).toHaveLength(1);

      expect(queryAllByText('Password')).toHaveLength(1);

      expect(queryAllByText('Host')).toHaveLength(1);
      expect(queryAllByText(LEGACY_PRIMARY)).toHaveLength(1);

      expect(queryAllByText('Private Network Host')).toHaveLength(1);
      expect(queryAllByText(LEGACY_SECONDARY)).toHaveLength(1);

      expect(queryAllByText('Port')).toHaveLength(1);
      expect(queryAllByText('3306')).toHaveLength(1);

      expect(queryAllByText('SSL')).toHaveLength(1);
      expect(queryAllByText('ENABLED')).toHaveLength(1);
    });
  });
});

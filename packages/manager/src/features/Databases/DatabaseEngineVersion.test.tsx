import { waitFor } from '@testing-library/react';
import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseEngineVersion } from './DatabaseEngineVersion';
import * as utils from './utilities';

const v1 = () => {
  return {
    isDatabasesEnabled: true,
    isDatabasesV1Enabled: true,
    isDatabasesV2Beta: false,
    isDatabasesV2Enabled: false,
    isDatabasesV2GA: false,
    isUserExistingBeta: false,
    isUserNewBeta: false,
  };
};

const v2Beta = () => {
  return {
    isDatabasesEnabled: true,
    isDatabasesV1Enabled: true,
    isDatabasesV2Beta: true,
    isDatabasesV2Enabled: true,
    isDatabasesV2GA: false,
    isUserExistingBeta: false,
    isUserNewBeta: true,
  };
};

const v2GA = () => ({
  isDatabasesEnabled: true,
  isDatabasesV1Enabled: true,
  isDatabasesV2Beta: false,
  isDatabasesV2Enabled: true,
  isDatabasesV2GA: true,
  isUserExistingBeta: false,
  isUserNewBeta: false,
});

const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
spy.mockReturnValue(v2GA());

describe('Database Engine Version', () => {
  it('should render V1 view legacy db', async () => {
    spy.mockReturnValue(v1());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-legacy',
      version: '14.6',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePlatform={database.platform}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('PostgreSQL v14.6')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeNull();
    });
  });

  it('should render V2 beta view legacy db', async () => {
    spy.mockReturnValue(v2Beta());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-legacy',
      version: '14.6',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePlatform={database.platform}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('PostgreSQL v14.6')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeNull();
    });
  });

  it('should render V2 beta view default db without pendingUpdates', async () => {
    spy.mockReturnValue(v2Beta());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-default',
      updates: {
        pending: [],
      },
      version: '14.6',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        databasePlatform={database.platform}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('PostgreSQL v14.6')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeNull();
    });
  });

  it('should render V2 beta view default db with pendingUpdates', async () => {
    spy.mockReturnValue(v2Beta());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-default',
      version: '14.6',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        databasePlatform={database.platform}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('PostgreSQL v14.6')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeNull();
    });
  });

  it('should render V2 GA view legacy db', async () => {
    spy.mockReturnValue(v2GA());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-legacy',
      version: '14.6',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePlatform={database.platform}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('PostgreSQL v14.6')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeNull();
    });
  });

  it('should render V2 GA view default db without pendingUpdates', async () => {
    spy.mockReturnValue(v2GA());

    const database = databaseFactory.build({
      engine: 'mysql',
      platform: 'rdbms-default',
      updates: {
        pending: [],
      },
      version: '8.0.30',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        databasePlatform={database.platform}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('MySQL v8.0.30')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeNull();
    });
  });

  it('should render V2 GA view default db with pendingUpdates', async () => {
    spy.mockReturnValue(v2GA());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-default',
      version: '14.6',
    });

    const { queryAllByText, queryByTestId } = renderWithTheme(
      <DatabaseEngineVersion
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        databasePlatform={database.platform}
        databaseVersion={database.version}
      />
    );

    await waitFor(async () => {
      expect(queryAllByText('PostgreSQL v14.6')).toHaveLength(1);
      expect(queryByTestId('maintenance-link')).toBeInTheDocument();
    });
  });
});

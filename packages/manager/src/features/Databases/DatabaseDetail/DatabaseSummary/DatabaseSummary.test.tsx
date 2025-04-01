import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import { databaseFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import * as utils from '../../utilities';
import { DatabaseSummary } from './DatabaseSummary';

import type { Database } from '@linode/api-v4';

const CLUSTER_CONFIGURATION = 'Cluster Configuration';

const TWO_NODE = 'Primary (+1 Node)';
const VERSION = 'Version';

const CONNECTION_DETAILS = 'Connection Details';
const PRIVATE_NETWORK_HOST = 'Private Network Host';
const GA_READONLY_HOST_LABEL = 'Read-only Host';

const ACCESS_CONTROLS = 'Access Controls';

const DEFAULT_PLATFORM = 'rdbms-default';
const DEFAULT_PRIMARY = 'db-mysql-default-primary.net';
const DEFAULT_STANDBY = 'db-mysql-default-standby.net';

const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
spy.mockReturnValue({
  isDatabasesEnabled: true,
  isDatabasesV2Beta: false,
  isDatabasesV2Enabled: true,
  isDatabasesV2GA: true,
  isUserExistingBeta: false,
  isUserNewBeta: false,
});

describe('Database Summary', () => {
  it('should render V2GA view default db', async () => {
    const database = databaseFactory.build({
      cluster_size: 2,
      hosts: {
        primary: DEFAULT_PRIMARY,
        standby: DEFAULT_STANDBY,
      },
      platform: DEFAULT_PLATFORM,
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummary database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText(CLUSTER_CONFIGURATION)).toHaveLength(1);
      expect(queryAllByText(TWO_NODE)).toHaveLength(1);
      expect(queryAllByText(VERSION)).toHaveLength(0);

      expect(queryAllByText(CONNECTION_DETAILS)).toHaveLength(1);
      expect(queryAllByText(PRIVATE_NETWORK_HOST)).toHaveLength(0);
      expect(queryAllByText(GA_READONLY_HOST_LABEL)).toHaveLength(1);
      expect(queryAllByText(DEFAULT_STANDBY)).toHaveLength(1);

      expect(queryAllByText(ACCESS_CONTROLS)).toHaveLength(0);
    });
  });
});

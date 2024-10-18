import { Database } from '@linode/api-v4';
import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { databaseFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { vi } from 'vitest';
import * as utils from '../../utilities';
import { DatabaseSummary } from './DatabaseSummary';

const CLUSTER_CONFIGURATION = 'Cluster Configuration';
const THREE_NODE = 'Primary +2 replicas';
const TWO_NODE = 'Primary +1 replicas';
const VERSION = 'Version';

const CONNECTION_DETAILS = 'Connection Details';
const PRIVATE_NETWORK_HOST = 'Private Network Host';
const PRIVATE_NETWORK_HOST_LABEL = 'private network host';
const READONLY_HOST_LABEL = 'read-only host';
const GA_READONLY_HOST_LABEL = 'Read-only Host';

const ACCESS_CONTROLS = 'Access Controls';

const DEFAULT_PLATFORM = 'rdbms-default';
const DEFAULT_PRIMARY = 'db-mysql-default-primary.net';
const DEFAULT_STANDBY = 'db-mysql-default-standby.net';

const LEGACY_PLATFORM = 'rdbms-legacy';
const LEGACY_PRIMARY = 'db-mysql-legacy-primary.net';
const LEGACY_SECONDARY = 'db-mysql-legacy-secondary.net';

const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
spy.mockReturnValue({
  isDatabasesEnabled: true,
  isDatabasesV1Enabled: true,
  isDatabasesV2Enabled: true,
  isDatabasesV2Beta: false,
  isV2ExistingBetaUser: false,
  isV2NewBetaUser: false,
  isDatabasesGAEnabled: true,
  isV2GAUser: true,
});

describe('Database Summary', () => {
  it('should render V2GA view default db', async () => {
    const database = databaseFactory.build({
      platform: DEFAULT_PLATFORM,
      cluster_size: 2,
      hosts: {
        primary: DEFAULT_PRIMARY,
        standby: DEFAULT_STANDBY,
      },
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

  it('should render V2GA view legacy db', async () => {
    const database = databaseFactory.build({
      platform: LEGACY_PLATFORM,
      cluster_size: 3,
      hosts: {
        primary: LEGACY_PRIMARY,
        secondary: LEGACY_SECONDARY,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummary database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText(CLUSTER_CONFIGURATION)).toHaveLength(1);
      expect(queryAllByText(THREE_NODE)).toHaveLength(1);
      expect(queryAllByText(VERSION)).toHaveLength(0);

      expect(queryAllByText(CONNECTION_DETAILS)).toHaveLength(1);
      expect(queryAllByText(PRIVATE_NETWORK_HOST)).toHaveLength(1);
      expect(queryAllByText(GA_READONLY_HOST_LABEL)).toHaveLength(0);
      expect(queryAllByText(LEGACY_SECONDARY)).toHaveLength(1);

      expect(queryAllByText(ACCESS_CONTROLS)).toHaveLength(0);
    });
  });

  it('should render Beta view default db', async () => {
    spy.mockReturnValue({
      isDatabasesEnabled: true,
      isDatabasesV1Enabled: true,
      isDatabasesV2Enabled: true,
      isDatabasesV2Beta: true,
      isV2ExistingBetaUser: true,
      isV2NewBetaUser: false,
      isDatabasesGAEnabled: false,
      isV2GAUser: false,
    });
    const database = databaseFactory.build({
      platform: DEFAULT_PLATFORM,
      cluster_size: 2,
      hosts: {
        primary: DEFAULT_PRIMARY,
        standby: DEFAULT_STANDBY,
        secondary: undefined,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummary database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText(CLUSTER_CONFIGURATION)).toHaveLength(1);
      expect(queryAllByText(TWO_NODE)).toHaveLength(1);
      expect(queryAllByText(VERSION)).toHaveLength(1);

      expect(queryAllByText(CONNECTION_DETAILS)).toHaveLength(1);
      expect(queryAllByText(PRIVATE_NETWORK_HOST_LABEL)).toHaveLength(0);
      expect(queryAllByText(READONLY_HOST_LABEL)).toHaveLength(1);
      expect(queryAllByText(/db-mysql-default-standby.net/)).toHaveLength(1);

      expect(queryAllByText(ACCESS_CONTROLS)).toHaveLength(1);
    });
  });

  it('should render Beta view legacy db', async () => {
    spy.mockReturnValue({
      isDatabasesEnabled: true,
      isDatabasesV1Enabled: true,
      isDatabasesV2Enabled: true,
      isDatabasesV2Beta: true,
      isV2ExistingBetaUser: true,
      isV2NewBetaUser: false,
      isDatabasesGAEnabled: false,
      isV2GAUser: false,
    });
    const database = databaseFactory.build({
      platform: LEGACY_PLATFORM,
      cluster_size: 3,
      hosts: {
        primary: LEGACY_PRIMARY,
        secondary: LEGACY_SECONDARY,
        standby: undefined,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummary database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText(CLUSTER_CONFIGURATION)).toHaveLength(1);
      expect(queryAllByText(THREE_NODE)).toHaveLength(1);
      expect(queryAllByText(VERSION)).toHaveLength(1);

      expect(queryAllByText(CONNECTION_DETAILS)).toHaveLength(1);
      expect(queryAllByText(PRIVATE_NETWORK_HOST_LABEL)).toHaveLength(1);
      expect(queryAllByText(READONLY_HOST_LABEL)).toHaveLength(0);
      expect(queryAllByText(/db-mysql-legacy-secondary.net/)).toHaveLength(1);

      expect(queryAllByText(ACCESS_CONTROLS)).toHaveLength(1);
    });
  });

  it('should render V1 view legacy db', async () => {
    spy.mockReturnValue({
      isDatabasesEnabled: true,
      isDatabasesV1Enabled: true,
      isDatabasesV2Enabled: false,
      isDatabasesV2Beta: false,
      isV2ExistingBetaUser: false,
      isV2NewBetaUser: false,
      isDatabasesGAEnabled: false,
      isV2GAUser: false,
    });
    const database = databaseFactory.build({
      platform: LEGACY_PLATFORM,
      cluster_size: 3,
      hosts: {
        primary: LEGACY_PRIMARY,
        secondary: LEGACY_SECONDARY,
        standby: undefined,
      },
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummary database={database} />
    );

    await waitFor(() => {
      expect(queryAllByText(CLUSTER_CONFIGURATION)).toHaveLength(1);
      expect(queryAllByText(THREE_NODE)).toHaveLength(1);
      expect(queryAllByText(VERSION)).toHaveLength(1);

      expect(queryAllByText(CONNECTION_DETAILS)).toHaveLength(1);
      expect(queryAllByText(PRIVATE_NETWORK_HOST_LABEL)).toHaveLength(1);
      expect(queryAllByText(READONLY_HOST_LABEL)).toHaveLength(0);
      expect(queryAllByText(/db-mysql-legacy-secondary.net/)).toHaveLength(1);

      expect(queryAllByText(ACCESS_CONTROLS)).toHaveLength(1);
    });
  });
});

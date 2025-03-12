import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { databaseFactory, databaseTypeFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseSummaryClusterConfiguration } from './DatabaseSummaryClusterConfiguration';

import type { Database, DatabaseStatus } from '@linode/api-v4/lib/databases';

const STATUS_VALUE = 'Active';
const PLAN_VALUE = 'New DBaaS - Dedicated 8 GB';
const NODES_VALUE = 'Primary (+1 Node)';
const REGION_ID = 'us-east';
const REGION_LABEL = 'Newark, NJ';

const DEFAULT_PLATFORM = 'rdbms-default';
const TYPE = 'g6-dedicated-4';

const queryMocks = vi.hoisted(() => ({
  useDatabaseTypesQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

vi.mock('src/queries/databases/databases', () => ({
  useDatabaseTypesQuery: queryMocks.useDatabaseTypesQuery,
}));

describe('DatabaseSummaryClusterConfiguration', () => {
  it('should display correctly for default db', async () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: regionFactory.buildList(1, {
        country: 'us',
        id: REGION_ID,
        label: REGION_LABEL,
        status: 'ok',
      }),
    });

    queryMocks.useDatabaseTypesQuery.mockReturnValue({
      data: databaseTypeFactory.buildList(1, {
        class: 'dedicated',
        disk: 163840,
        id: TYPE,
        label: PLAN_VALUE,
        memory: 8192,
        vcpus: 4,
      }),
    });

    const database = databaseFactory.build({
      cluster_size: 2,
      engine: 'postgresql',
      platform: DEFAULT_PLATFORM,
      region: REGION_ID,
      status: STATUS_VALUE.toLowerCase() as DatabaseStatus,
      total_disk_size_gb: 130,
      type: TYPE,
      used_disk_size_gb: 6,
      version: '16.4',
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryClusterConfiguration database={database} />
    );

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenCalledWith({
      platform: DEFAULT_PLATFORM,
    });

    await waitFor(() => {
      expect(queryAllByText('Status')).toHaveLength(1);
      expect(queryAllByText(STATUS_VALUE)).toHaveLength(1);

      expect(queryAllByText('Plan')).toHaveLength(1);
      expect(queryAllByText(PLAN_VALUE)).toHaveLength(1);

      expect(queryAllByText('Nodes')).toHaveLength(1);
      expect(queryAllByText(NODES_VALUE)).toHaveLength(1);

      expect(queryAllByText('CPUs')).toHaveLength(1);
      expect(queryAllByText(4)).toHaveLength(1);

      expect(queryAllByText('Engine')).toHaveLength(1);
      expect(queryAllByText('PostgreSQL v16.4')).toHaveLength(1);

      expect(queryAllByText('Region')).toHaveLength(1);
      expect(queryAllByText(REGION_LABEL)).toHaveLength(1);

      expect(queryAllByText('RAM')).toHaveLength(1);
      expect(queryAllByText('8 GB')).toHaveLength(1);

      expect(queryAllByText('Total Disk Size')).toHaveLength(1);
      expect(queryAllByText('130 GB')).toHaveLength(1);
    });
  });

  it('should display correctly for legacy db', async () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: regionFactory.buildList(1, {
        country: 'us',
        id: 'us-southeast',
        label: 'Atlanta, GA, USA',
        status: 'ok',
      }),
    });

    queryMocks.useDatabaseTypesQuery.mockReturnValue({
      data: databaseTypeFactory.buildList(1, {
        class: 'nanode',
        disk: 25600,
        id: 'g6-nanode-1',
        label: 'DBaaS - Nanode 1GB',
        memory: 1024,
        vcpus: 1,
      }),
    });

    const database = databaseFactory.build({
      cluster_size: 1,
      engine: 'mysql',
      platform: 'rdbms-legacy',
      region: 'us-southeast',
      replication_type: 'none',
      status: 'provisioning',
      total_disk_size_gb: 15,
      type: 'g6-nanode-1',
      used_disk_size_gb: 2,
      version: '8.0.30',
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryClusterConfiguration database={database} />
    );

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenCalledWith({
      platform: 'rdbms-legacy',
    });

    await waitFor(() => {
      expect(queryAllByText('Status')).toHaveLength(1);
      expect(queryAllByText('Provisioning')).toHaveLength(1);

      expect(queryAllByText('Plan')).toHaveLength(1);
      expect(queryAllByText('Nanode 1 GB')).toHaveLength(1);

      expect(queryAllByText('Nodes')).toHaveLength(1);
      expect(queryAllByText('Primary (1 Node)')).toHaveLength(1);

      expect(queryAllByText('CPUs')).toHaveLength(1);
      expect(queryAllByText(1)).toHaveLength(1);

      expect(queryAllByText('Engine')).toHaveLength(1);
      expect(queryAllByText('MySQL v8.0.30')).toHaveLength(1);

      expect(queryAllByText('Region')).toHaveLength(1);
      expect(queryAllByText('Atlanta, GA, USA')).toHaveLength(1);

      expect(queryAllByText('RAM')).toHaveLength(1);
      expect(queryAllByText('1 GB')).toHaveLength(1);

      expect(queryAllByText('Total Disk Size')).toHaveLength(1);
      expect(queryAllByText('15 GB')).toHaveLength(1);
    });
  });

  it('should return null when there is no matching type', async () => {
    queryMocks.useDatabaseTypesQuery.mockReturnValue({
      data: databaseTypeFactory.buildList(1, {
        class: 'standard',
        disk: 81920,
        id: 'g6-standard-2',
        label: 'DBaaS - Standard 4GB',
        memory: 4096,
        vcpus: 2,
      }),
    });

    const database = databaseFactory.build({
      platform: 'rdbms-legacy',
      type: 'g6-nanode-1',
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseSummaryClusterConfiguration database={database} />
    );

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenCalledWith({
      platform: 'rdbms-legacy',
    });

    await waitFor(() => {
      expect(queryAllByText('Cluster Configuration')).toHaveLength(0);
    });
  });
});

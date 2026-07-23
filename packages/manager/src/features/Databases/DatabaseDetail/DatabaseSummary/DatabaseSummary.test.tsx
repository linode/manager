import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import { databaseFactory, databaseTypeFactory } from 'src/factories/databases';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseSummary } from './DatabaseSummary';

import type { Database } from '@linode/api-v4';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useDatabaseTypesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDatabaseTypesQuery: queryMocks.useDatabaseTypesQuery,
  };
});

queryMocks.useDatabaseTypesQuery.mockReturnValue({
  data: databaseTypeFactory.buildList(1, {
    id: 'g6-nanode-1',
    label: 'DBaaS - Nanode 1GB',
    memory: 1024,
    vcpus: 1,
  }),
});

const CLUSTER_CONFIGURATION = 'Cluster Configuration';

const TWO_NODE = 'Primary (+1 Node)';
const VERSION = 'Version';

const ACCESS_CONTROLS = 'Access Controls';

describe('Database Summary', () => {
  it('should render V2GA view default db', async () => {
    const database = databaseFactory.build({
      cluster_size: 2,
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database }}>
        <DatabaseSummary />
      </DatabaseDetailContext.Provider>
    );

    await waitFor(() => {
      expect(queryAllByText(CLUSTER_CONFIGURATION)).toHaveLength(1);
      expect(queryAllByText(TWO_NODE)).toHaveLength(1);
      expect(queryAllByText(VERSION)).toHaveLength(0);
      expect(queryAllByText(ACCESS_CONTROLS)).toHaveLength(0);
    });
  });
});

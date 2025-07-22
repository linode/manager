import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it } from 'vitest';

import { vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseNetworking } from './DatabaseNetworking';

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useAllVPCsQuery: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useNavigate: vi.fn(() => vi.fn()),
  useRegionQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllVPCsQuery: queryMocks.useAllVPCsQuery,
    useRegionQuery: queryMocks.useRegionQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

describe('DatabaseNetworking Component', () => {
  // Mock Database with no VPC configuration for DatbaseNetworking content rendering test
  const mockDatabase = databaseFactory.build({
    platform: 'rdbms-default',
    private_network: null,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [vpcFactory.build({ region: mockDatabase.region })],
      isLoading: false,
    });
  });

  it('Should render both the Manage Access and Manage Networking sections when all VPCs query response is successful', () => {
    renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: mockDatabase, engine: 'mysql', isVPCEnabled: true }}
      >
        <DatabaseNetworking />
      </DatabaseDetailContext.Provider>
    );
    const headings = screen.getAllByRole('heading');
    expect(headings[0].textContent).toBe('Manage Access');
    expect(headings[1].textContent).toBe('Manage Networking');
  });
});

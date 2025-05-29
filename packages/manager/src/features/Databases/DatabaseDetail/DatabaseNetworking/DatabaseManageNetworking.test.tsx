import * as React from 'react';
import { describe, it } from 'vitest';

import { vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseManageNetworking } from './DatabaseManageNetworking';

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useVPCQuery: vi.fn().mockReturnValue({ data: {} }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useVPCQuery: queryMocks.useVPCQuery,
  };
});

const loadingTestId = 'circle-progress';

describe('DatabaseManageNetworking Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build(),
    });
  });

  it('Should render Manage Networking field with Public grid variation when no VPC is configured for the database', () => {
    const mockDatabase = databaseFactory.build({ platform: 'rdbms-default' });
    mockDatabase.private_network = null;
    const { getByRole, queryByText } = renderWithTheme(
      <DatabaseManageNetworking database={mockDatabase} />
    );

    const heading = getByRole('heading');
    expect(heading.textContent).toBe('Manage Networking');
    const connectionTypeLabel = queryByText('Connection Type');
    expect(connectionTypeLabel).toBeInTheDocument();
    const connectionTypeValue = queryByText('Public');
    expect(connectionTypeValue).toBeInTheDocument();
  });

  it('should render a loading state', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      isLoading: true,
      data: null,
    });
    const mockDatabase = databaseFactory.build({ platform: 'rdbms-default' });
    const { getByTestId } = await renderWithTheme(
      <DatabaseManageNetworking database={mockDatabase} />
    );
    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render error state when a VPC is configured, but useVPCQuery responds with an error', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      error: new Error('Failed to fetch VPC'),
    });
    const mockDatabase = databaseFactory.build({ platform: 'rdbms-default' });
    const { getByText } = await renderWithTheme(
      <DatabaseManageNetworking database={mockDatabase} />
    );
    // Should render a loading state
    const expectedErrorText =
      'There was a problem retrieving your VPC. Please try again later.';
    const errorState = getByText(expectedErrorText);
    expect(errorState).toBeInTheDocument();
  });

  it('should render error state when a VPC is configured, but useVPCQuery responds without a VPC', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      data: null,
    });
    const mockDatabase = databaseFactory.build({ platform: 'rdbms-default' });
    const { getByText } = await renderWithTheme(
      <DatabaseManageNetworking database={mockDatabase} />
    );
    // Should render a loading state
    const expectedErrorText =
      'There was a problem retrieving your VPC. Please try again later.';
    const errorState = getByText(expectedErrorText);
    expect(errorState).toBeInTheDocument();
  });

  it('Should render Manage Networking field with VPC grid variation when VPC is configured for the database', () => {
    queryMocks.useVPCQuery.mockReturnValue({
      isLoading: false,
      data: vpcFactory.build(),
      error: null,
    });
    const mockDatabase = databaseFactory.build({ platform: 'rdbms-default' });
    const { getByRole, queryByText, getAllByText } = renderWithTheme(
      <DatabaseManageNetworking database={mockDatabase} />
    );

    const heading = getByRole('heading');
    expect(heading.textContent).toBe('Manage Networking');
    const connectionTypeLabel = queryByText('Connection Type');
    expect(connectionTypeLabel).toBeInTheDocument();
    const connectionTypeValue = getAllByText('VPC');
    expect(connectionTypeValue.length).toBeGreaterThan(0);
  });
});

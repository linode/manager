import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it } from 'vitest';

import { vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseManageNetworking } from './DatabaseManageNetworking';

const defaultPlatform = 'rdbms-default';

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
    const mockDatabase = databaseFactory.build({ platform: defaultPlatform });
    mockDatabase.private_network = null;
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('Manage Networking');
    const connectionTypeLabel = screen.queryByText('Connection Type');
    expect(connectionTypeLabel).toBeInTheDocument();
    const connectionTypeValue = screen.queryByText('Public');
    expect(connectionTypeValue).toBeInTheDocument();
  });

  it('should render a loading state', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      isLoading: true,
      data: null,
    });
    const mockDatabase = databaseFactory.build({ platform: defaultPlatform });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);
    // Should render a loading state
    const loadingSpinner = screen.getByTestId(loadingTestId);
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should render error state when a VPC is configured, but useVPCQuery responds with an error', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      error: new Error('Failed to fetch VPC'),
    });
    const mockDatabase = databaseFactory.build({ platform: defaultPlatform });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);
    // Should render a loading state
    const expectedErrorText =
      'There was a problem retrieving your VPC. Please try again later.';
    const errorState = screen.getByText(expectedErrorText);
    expect(errorState).toBeInTheDocument();
  });

  it('should render error state when a VPC is configured, but useVPCQuery responds without a VPC', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      data: null,
    });
    const mockDatabase = databaseFactory.build({ platform: defaultPlatform });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);
    // Should render a loading state
    const expectedErrorText =
      'There was a problem retrieving your VPC. Please try again later.';
    const errorState = screen.getByText(expectedErrorText);
    expect(errorState).toBeInTheDocument();
  });

  it('Should render Manage Networking field with VPC grid variation when VPC is configured for the database', () => {
    queryMocks.useVPCQuery.mockReturnValue({
      isLoading: false,
      data: vpcFactory.build(),
      error: null,
    });
    const mockDatabase = databaseFactory.build({ platform: defaultPlatform });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('Manage Networking');
    const connectionTypeLabel = screen.queryByText('Connection Type');
    expect(connectionTypeLabel).toBeInTheDocument();
    const connectionTypeValue = screen.getAllByText('VPC');
    expect(connectionTypeValue.length).toBeGreaterThan(0);
  });
});

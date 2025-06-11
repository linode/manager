import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it } from 'vitest';

import { subnetFactory, vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseManageNetworking } from './DatabaseManageNetworking';

const defaultPlatform = 'rdbms-default';
const mockVPC = vpcFactory.build({ id: 12345 });
const mockSubnet = subnetFactory.build({ id: 1 });
const mockPrivateNetwork = {
  vpc_id: mockVPC.id,
  subnet_id: mockSubnet.id,
  public_access: false,
};
const mockDatabase = databaseFactory.build({
  platform: defaultPlatform,
  private_network: mockPrivateNetwork,
});

const errorStateMessage =
  'There was a problem retrieving your VPC assignment settings. Refresh the page or try again later.';

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useAllVPCsQuery: vi.fn().mockReturnValue({ data: [] }),
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

const loadingTestId = 'circle-progress';

describe('DatabaseManageNetworking Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [vpcFactory.build()],
    });
  });

  it('Should render Manage Networking field with Public grid variation when no VPC is configured for the database', () => {
    const publicAccessDatabase = databaseFactory.build({
      platform: defaultPlatform,
      private_network: null,
    });
    renderWithTheme(
      <DatabaseManageNetworking database={publicAccessDatabase} />
    );

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('Manage Networking');
    const connectionTypeLabel = screen.queryByText('Connection Type');
    expect(connectionTypeLabel).toBeInTheDocument();
    const connectionTypeValue = screen.queryByText('Public');
    expect(connectionTypeValue).toBeInTheDocument();
  });

  it('should render a loading state', async () => {
    queryMocks.useAllVPCsQuery.mockReturnValue({
      isLoading: true,
      data: [],
    });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);
    // Should render loading state
    const loadingSpinner = screen.getByTestId(loadingTestId);
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should render error state when a VPC is configured, but useAllVPCsQuery responds with an error', async () => {
    queryMocks.useAllVPCsQuery.mockReturnValue({
      error: new Error('Failed to fetch VPC'),
    });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);
    const expectedErrorText = errorStateMessage;
    const errorState = screen.getByText(expectedErrorText);
    expect(errorState).toBeInTheDocument();
  });

  it('Should render error state when all VPCs query response is successful, but configured VPC is not found', () => {
    const altVPCId = mockVPC.id + 1;
    const altMockVPC = vpcFactory.build({ id: altVPCId });
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [altMockVPC],
      isLoading: false,
    });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);

    const expectedErrorMessage = errorStateMessage;
    const errorMessage = screen.getByText(expectedErrorMessage);
    expect(errorMessage).toBeInTheDocument();
  });

  it('Should render Manage Networking field with VPC grid variation when VPC is configured for the database', () => {
    queryMocks.useAllVPCsQuery.mockReturnValue({
      isLoading: false,
      data: [mockVPC],
    });
    renderWithTheme(<DatabaseManageNetworking database={mockDatabase} />);

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('Manage Networking');
    const connectionTypeLabel = screen.queryByText('Connection Type');
    expect(connectionTypeLabel).toBeInTheDocument();
    const connectionTypeValue = screen.getAllByText('VPC');
    expect(connectionTypeValue.length).toBeGreaterThan(0);
  });
});

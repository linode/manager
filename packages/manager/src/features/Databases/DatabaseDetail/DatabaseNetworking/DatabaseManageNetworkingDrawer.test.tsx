import { regionFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import { subnetFactory, vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseManageNetworkingDrawer from './DatabaseManageNetworkingDrawer';

const defaultPlatform = 'rdbms-default';
const mockSubnets = [
  subnetFactory.build({ id: 1 }),
  subnetFactory.build({ id: 2 }),
];
const mockVPC = vpcFactory.build({ id: 12345 });
const mockPrivateNetwork = {
  vpc_id: mockVPC.id,
  subnet_id: mockSubnets[0].id,
  public_access: false,
};
const mockDatabase = databaseFactory.build({
  platform: defaultPlatform,
  private_network: mockPrivateNetwork,
  engine: 'mysql',
  id: 1,
});

const mockProps = {
  database: mockDatabase,
  onClose: vi.fn(),
  onUnassign: vi.fn(),
  open: true,
  vpc: mockVPC,
};

const mockRegion = regionFactory.build({
  capabilities: ['VPCs'],
  id: 'us-east',
  label: 'Newark, NJ',
});

const saveButtonTestId = 'save-networking-button';

// Hoist query mocks
const queryMocks = vi.hoisted(() => {
  return {
    useRegionQuery: vi.fn().mockReturnValue({}),
    useAllVPCsQuery: vi.fn().mockReturnValue({ data: [] }),
    useDatabaseMutation: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllVPCsQuery: queryMocks.useAllVPCsQuery,
    useDatabaseMutation: queryMocks.useDatabaseMutation,
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

describe('DatabaseManageNetworkingDrawer Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [mockVPC],
    });
    queryMocks.useDatabaseMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isLoading: false,
      reset: vi.fn(),
    });
  });

  it('Should render the VPC Selector', () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });
    renderWithTheme(<DatabaseManageNetworkingDrawer {...mockProps} />);

    const vpcSelectorLabel = screen.getByText('Assign a VPC');
    expect(vpcSelectorLabel).toBeInTheDocument();
  });

  it(`should display Unassign button when database has networking configuration`, async () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });
    renderWithTheme(<DatabaseManageNetworkingDrawer {...mockProps} />);

    const unassignButton = screen.getByText('Unassign VPC');
    expect(unassignButton).toBeInTheDocument();
  });

  it(`should not display the Unassign button when database has no networking configuration`, async () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });
    // Create an alternative props object with DB Cluster with no networking configuration
    const altProps = {
      ...mockProps,
      database: { ...mockDatabase, private_network: null },
    };
    renderWithTheme(<DatabaseManageNetworkingDrawer {...altProps} />);

    expect(screen.queryByText('Unassign VPC')).not.toBeInTheDocument();
  });

  it(`should disable Save when when loaded without any changes to the form`, async () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });
    await renderWithTheme(<DatabaseManageNetworkingDrawer {...mockProps} />);
    const saveButton = screen.getByTestId(saveButtonTestId);
    expect(saveButton).toBeDisabled();
  });

  it(`should enable Save when networking configuration has changed and is valid`, async () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });
    renderWithTheme(<DatabaseManageNetworkingDrawer {...mockProps} />, {
      initialRoute: `/databases/${mockProps.database.engine}/${mockProps.database.id}/networking`,
    });

    const accessCheckbox = screen.getByTestId(
      'database-public-access-checkbox'
    );
    await userEvent.click(accessCheckbox);

    const saveButton = screen.getByTestId(saveButtonTestId);
    expect(saveButton).toBeEnabled();
  });

  it(`should navigate to summary`, async () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });
    const mockNavigate = vi.fn();
    queryMocks.useNavigate.mockReturnValue(mockNavigate);

    renderWithTheme(<DatabaseManageNetworkingDrawer {...mockProps} />, {
      initialRoute: `/databases/${mockProps.database.engine}/${mockProps.database.id}/networking`,
    });

    const accessCheckbox = screen.getByTestId(
      'database-public-access-checkbox'
    );
    await userEvent.click(accessCheckbox);

    const saveButton = screen.getByTestId(saveButtonTestId);
    expect(saveButton).toBeEnabled();
    await userEvent.click(saveButton);
    // Check that navigation occurs after form submission
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        params: {
          engine: mockProps.database.engine,
          databaseId: mockProps.database.id,
        },
        to: '/databases/$engine/$databaseId',
      });
    });
  });
});

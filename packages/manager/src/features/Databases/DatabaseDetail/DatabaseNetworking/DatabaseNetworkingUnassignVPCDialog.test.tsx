import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import { subnetFactory, vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseNetworkingUnassignVPCDialog } from './DatabaseNetworkingUnassignVPCDialog';

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
  databaseEngine: mockDatabase.engine,
  databaseId: mockDatabase.id,
  databaseLabel: mockDatabase.label,
  onClose: vi.fn(),
  open: true,
};

const unassignButtonTestId = 'unassign-button';

// Hoist query mocks
const queryMocks = vi.hoisted(() => {
  return {
    useDatabaseMutation: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDatabaseMutation: queryMocks.useDatabaseMutation,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

describe('DatabaseNetworkingUnassignVPCDialog Component', () => {
  it(`should navigate to summary after unassigning`, async () => {
    const mockNavigate = vi.fn();
    queryMocks.useNavigate.mockReturnValue(mockNavigate);
    queryMocks.useDatabaseMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isLoading: false,
      reset: vi.fn(),
    });
    renderWithTheme(<DatabaseNetworkingUnassignVPCDialog {...mockProps} />, {
      initialRoute: `/databases/${mockProps.databaseEngine}/${mockProps.databaseId}/networking`,
    });

    const unassignButton = screen.getByTestId(unassignButtonTestId);
    await userEvent.click(unassignButton);
    // Check that navigation occurs after unassign button is clicked
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        params: {
          engine: mockProps.databaseEngine,
          databaseId: mockProps.databaseId,
        },
        to: '/databases/$engine/$databaseId',
      });
    });
  });
});

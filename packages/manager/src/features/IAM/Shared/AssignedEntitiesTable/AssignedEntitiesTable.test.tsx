import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createAccountEntity, createUserRoles } from '../../factories';
import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: false }),
  useParams: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({
    data: { is_account_admin: true, list_entities: true },
  }),
  useSearch: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

beforeAll(() => mockMatchMedia());

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useUserRoles: queryMocks.useUserRoles,
  };
});

vi.mock('../../queries/entities/entities', async () => {
  const actual = await vi.importActual('../../queries/entities/entities');
  return {
    ...actual,
    useAllAccountEntities: queryMocks.useAllAccountEntities,
  };
});

vi.mock('../../hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));

vi.mock('../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
    useNavigate: queryMocks.useNavigate,
  };
});

const mockEntities = [
  createAccountEntity({
    id: 1,
    label: 'no_devices',
    type: 'firewall',
  }),
];

describe('AssignedEntitiesTable', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
    queryMocks.useSearch.mockReturnValue({
      query: '',
    });
  });

  it('should display no roles text if there are no roles assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: {},
    });

    renderWithProviders(<AssignedEntitiesTable />);

    expect(screen.getByText('No items to display.')).toBeVisible();
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithProviders(<AssignedEntitiesTable />);

    expect(screen.getByText('no_devices')).toBeVisible();
    expect(screen.getByText('Firewall')).toBeVisible();
    expect(screen.getByText('firewall_admin')).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for entity no_devices'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByTestId('Change Role')).toBeVisible();
    expect(screen.getByTestId('Remove Assignment')).toBeVisible();
  });

  it('should display empty state when no roles match filters', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    queryMocks.useSearch.mockReturnValue({ query: 'NonExistentRole' });

    renderWithProviders(<AssignedEntitiesTable />);

    expect(screen.getByText('No items to display.')).toBeVisible();
  });

  it('should filter roles based on search query', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    const { container } = renderWithProviders(<AssignedEntitiesTable />);

    const searchField = container.querySelector('cds-search-field');
    searchField!.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        detail: { value: 'no_devices' },
      })
    );

    await waitFor(() => {
      expect(screen.queryByText('no_devices')).toBeVisible();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    const { container, rerender } = renderWithProviders(
      <AssignedEntitiesTable />
    );

    const cdsSelect = container.querySelector('cds-select');
    expect(cdsSelect).not.toBeNull();

    cdsSelect!.dispatchEvent(
      new CustomEvent('change', {
        detail: { label: 'Firewalls', value: 'firewall' },
        bubbles: true,
      })
    );

    queryMocks.useSearch.mockReturnValue({
      query: '',
      entityType: 'firewall',
    });

    rerender(<AssignedEntitiesTable />);

    await waitFor(() => {
      expect(screen.getByText('no_devices')).toBeVisible();
    });
  });
});

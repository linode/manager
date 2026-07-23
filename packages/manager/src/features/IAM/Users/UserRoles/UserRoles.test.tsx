import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  createAccountEntity,
  createAccountRoles,
  createUserRoles,
} from '../../factories';
import {
  ERROR_STATE_TEXT,
  ERROR_STATE_TITLE,
  NO_ASSIGNED_ROLES_TEXT,
} from '../../Shared/constants';
import { getCdsButtonHostByText } from '../../utilities/testHelpers';
import { renderWithProviders } from '../../utilities/testHelpers';
import { UserRoles } from './UserRoles';

const mockMatchMedia = () => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: true,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

beforeAll(() => {
  mockMatchMedia();
});

const mockEntities = [
  createAccountEntity({
    id: 1,
    type: 'firewall',
  }),
];

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
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

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

describe('UserRoles', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test-user',
    });
    queryMocks.useSearch.mockReturnValue({
      selectedRole: '',
    });
    queryMocks.usePermissions.mockReturnValue({
      data: {
        view_user: true,
      },
    });
  });

  it('should display no roles text if no roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
        account_access: [],
        entity_access: [],
      }),
    });

    const { container } = renderWithProviders(<UserRoles />);

    expect(screen.getByText('This list is empty')).toBeVisible();
    expect(screen.getByText(NO_ASSIGNED_ROLES_TEXT)).toBeVisible();
    expect(getCdsButtonHostByText(container, 'Assign New Roles')).toBeVisible();
  });

  it('should display table if no entity access roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithProviders(<UserRoles />);

    expect(
      screen.getByText('View and manage roles assigned to the user.')
    ).toBeVisible();

    const table = screen.getByLabelText('collapsible table');
    expect(within(table).getByText('All Entities')).toBeVisible();
    expect(within(table).getByText('account_admin')).toBeVisible();
  });

  it('should display table if no account access roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
        account_access: [],
        entity_access: [
          {
            id: 1,
            roles: ['firewall_admin'],
            type: 'firewall',
          },
        ],
      }),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithProviders(<UserRoles />);

    expect(screen.getByText('firewall_admin')).toBeVisible();
  });

  it('should exclude the role from the table if the assigned entity (firewall with id 2) was removed', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
        account_access: ['account_admin'],
        entity_access: [
          {
            id: 2,
            roles: ['firewall_admin'],
            type: 'firewall',
          },
        ],
      }),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithProviders(<UserRoles />);

    expect(screen.getByText('account_admin')).toBeVisible();
    expect(screen.queryByText('firewall_admin')).not.toBeInTheDocument();
  });
  it('should display roles and menu when data is available', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles(),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithProviders(<UserRoles />);

    expect(screen.getByText('account_linode_admin')).toBeVisible();
    expect(screen.getAllByText('All Linodes')[0]).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for role account_linode_admin'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getAllByTestId('Change Role')[0]).toBeVisible();
    expect(screen.getAllByTestId('Unassign Role')[0]).toBeVisible();
  });

  it('should show error state when api fails', () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithProviders(<UserRoles />);
    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountRolesFactory } from 'src/factories/accountRoles';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignNewRoleDrawer } from './AssignNewRoleDrawer';

import type { ExtendedRoleView } from '../../Shared/types';
import type { EntityAccess, IamUserRoles } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
    useParams: queryMocks.useParams,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

const mockAccountAccessRole: ExtendedRoleView = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all resources in the account',
  entity_ids: null,
  entity_type: 'account',
  id: 'account_admin',
  name: 'account_admin',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
};

const props = {
  onClose: vi.fn(),
  open: true,
  assignedRoles: {
    account_access: [mockAccountAccessRole.id],
    entity_access: [],
  } as IamUserRoles,
  username: 'test_user',
};

const mockUpdateUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  const actual = await vi.importActual('@linode/api-v4');

  return {
    ...actual,
    updateUserRoles: (_: string, data: EntityAccess) => {
      mockUpdateUserRole(data);
      return Promise.resolve(props);
    },
  };
});

describe('AssignNewRoleDrawer', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
    queryMocks.useAccountRoles.mockReturnValue({
      data: accountRolesFactory.build(),
    });
  });

  it('should render', async () => {
    renderWithTheme(<AssignNewRoleDrawer {...props} />);

    expect(
      screen.getByText(
        /Select a role you want to assign to a user. Some roles require selecting entities they should apply to. Configure the first role and continue adding roles or save the assignment./i
      )
    ).toBeVisible();
  });

  it('should render the role select', async () => {
    renderWithTheme(<AssignNewRoleDrawer {...props} />);

    expect(screen.getByPlaceholderText('Select a Role')).toBeVisible();
  });

  it('should allow changing role', async () => {
    renderWithTheme(<AssignNewRoleDrawer {...props} />);

    const autocomplete = screen.getByRole('combobox');
    await userEvent.click(autocomplete);

    await userEvent.type(autocomplete, 'account_billing_admin');

    const newRole = await screen.findByText('account_billing_admin');
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(autocomplete).toHaveValue('account_billing_admin');
    });

    await userEvent.click(screen.getByText('Assign'));

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith({
        account_access: ['account_billing_admin'],
        entity_access: [],
      });
    });
  });

  it('should not list a role the user already has', async () => {
    renderWithTheme(<AssignNewRoleDrawer {...props} />);

    const autocomplete = screen.getByRole('combobox');

    await userEvent.click(autocomplete);

    // expect select not to a any of the roles the user already has
    const options = screen.getAllByRole('option');
    expect(options.map((option) => option.textContent)).not.toContain(
      mockAccountAccessRole.name
    );
  });
});

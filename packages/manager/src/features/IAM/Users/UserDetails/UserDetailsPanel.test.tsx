import { profileFactory } from '@linode/utilities';
import { fireEvent } from '@testing-library/react';
import React from 'react';

import { accountUserFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDetailsPanel } from './UserDetailsPanel';

import type { IamUserRoles } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

const mockPermissions = {
  delete_user: true,
  list_user_permissions: true,
  update_user: true,
  view_user: true,
};

describe('UserDetailsPanel', () => {
  it("renders the user's username and email", async () => {
    const user = accountUserFactory.build();
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByText(/Username/)).toBeVisible();
    expect(getByText(user.username)).toBeVisible();

    expect(getByText(/Email/)).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
  });

  it("renders '0' if the user doesn't have the assigned roles", async () => {
    const user = accountUserFactory.build({ restricted: true });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getAllByText, getByText } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByText(/Assigned roles/i)).toBeVisible();
    expect(getAllByText('0')[0]).toBeVisible();
  });

  it("renders '7' if the user has 7 different roles", async () => {
    const user = accountUserFactory.build({ restricted: false });
    const assignedRoles: IamUserRoles = {
      account_access: [
        'account_linode_admin',
        'account_linode_creator',
        'account_firewall_creator',
      ],
      entity_access: [
        {
          id: 12345678,
          roles: ['linode_contributor', 'linode_viewer'],
          type: 'linode',
        },
        {
          id: 45678901,
          roles: ['firewall_admin', 'firewall_viewer'],
          type: 'firewall',
        },
      ],
    };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByText(/Assigned roles/i)).toBeVisible();
    expect(getByText('7')).toBeVisible();
  });

  it("renders '4' if the user has 4 different roles", async () => {
    const user = accountUserFactory.build({ restricted: false });
    const assignedRoles: IamUserRoles = {
      account_access: ['account_linode_admin', 'account_linode_creator'],
      entity_access: [
        {
          id: 12345678,
          roles: ['linode_contributor', 'linode_viewer'],
          type: 'linode',
        },
      ],
    };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByText(/Assigned roles/i)).toBeVisible();
    expect(getByText('4')).toBeVisible();
  });

  it("renders the user's phone number", async () => {
    const user = accountUserFactory.build({
      verified_phone_number: '+17040000000',
    });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByText(/Verified number/)).toBeVisible();
    expect(getByText(user.verified_phone_number!)).toBeVisible();
  });

  it("renders the user's 2FA status", async () => {
    const user = accountUserFactory.build({ tfa_enabled: true });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByText(/2FA/)).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
  });
});

describe('UserDetailsPanel – Delete User button', () => {
  const assignedRoles = { account_access: [], entity_access: [] };

  it('disables the Delete User button for proxy users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({
      user_type: 'proxy',
      username: 'proxy_user',
    });

    const { getByRole } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByRole('button', { name: /delete user/i })).toBeDisabled();
  });

  it('disables the Delete User button when viewing your own account', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({
      user_type: 'default',
      username: 'current_user',
    });

    const { getByRole } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByRole('button', { name: /delete user/i })).toBeDisabled();
  });

  it('enables the Delete User button for other deletable users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({
      user_type: 'default',
      username: 'other_user',
    });

    const { getByRole } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByRole('button', { name: /delete user/i })).toBeEnabled();
  });

  it('opens the delete confirmation dialog when the Delete User button is clicked', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({
      user_type: 'default',
      username: 'other_user',
    });

    const { getByRole, getByText } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    fireEvent.click(getByRole('button', { name: /delete user/i }));

    expect(getByText(/Deleting this User is permanent/i)).toBeInTheDocument();
  });

  it('disables the Delete User button when delete_user permission is false', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({ username: 'other_user' });

    const { getByRole } = renderWithTheme(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={{ ...mockPermissions, delete_user: false }}
      />
    );

    expect(getByRole('button', { name: /delete user/i })).toBeDisabled();
  });
});

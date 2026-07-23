import { fireEvent, screen, within } from '@testing-library/react';
import React from 'react';

import { createProfile, createUser } from '../../factories';
import { renderWithProviders } from '../../utilities/testHelpers';
import { UserDetailsPanel } from './UserDetailsPanel';

import type { IamUserRoles } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: queryMocks.useSearch,
  };
});

const mockPermissions = {
  delete_user: true,
  list_user_permissions: true,
  update_user: true,
  view_user: true,
};

const getDetailsGrid = (container: HTMLElement) => {
  const grid = container.querySelector('[class*="itemsGrid"]');
  expect(grid).not.toBeNull();

  return within(grid as HTMLElement);
};

describe('UserDetailsPanel', () => {
  it("renders the user's username and email", async () => {
    const user = createUser();
    const assignedRoles = { account_access: [], entity_access: [] };

    const { container } = renderWithProviders(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    const details = getDetailsGrid(container);

    expect(details.getByText(user.username)).toBeVisible();
    expect(details.getByText(user.email)).toBeVisible();
  });

  it("renders '0' if the user doesn't have the assigned roles", async () => {
    const user = createUser({ restricted: true });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getAllByText, getByText } = renderWithProviders(
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
    const user = createUser({ restricted: false });
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

    const { getByText } = renderWithProviders(
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
    const user = createUser({ restricted: false });
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

    const { getByText } = renderWithProviders(
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
    const user = createUser({
      verified_phone_number: '+17040000000',
    });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithProviders(
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
    const user = createUser({ tfa_enabled: true });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithProviders(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getByText(/Two-factor authentication/)).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
  });
});

describe('UserDetailsPanel – Delete User button', () => {
  const assignedRoles = { account_access: [], entity_access: [] };
  const getDeleteUserButton = (container: HTMLElement) => {
    const buttons = container.querySelectorAll('cds-tooltip > cds-button');
    return Array.from(buttons).find((btn) =>
      btn.textContent?.includes('Delete User')
    );
  };

  it('disables the Delete User button for delegate users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ username: 'current_user' }),
    });

    const user = createUser({
      user_type: 'delegate',
      username: 'delegate_user',
    });

    const { container } = renderWithProviders(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(
      getDeleteUserButton(container)?.querySelector('cds-icon')
    ).toBeTruthy();
    expect(getDeleteUserButton(container)).toHaveProperty('disabled', true);
  });

  it('disables the Delete User button when viewing your own account', () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ username: 'current_user' }),
    });

    const user = createUser({
      user_type: 'default',
      username: 'current_user',
    });

    const { container } = renderWithProviders(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(
      getDeleteUserButton(container)?.querySelector('cds-icon')
    ).toBeTruthy();
    expect(getDeleteUserButton(container)).toHaveProperty('disabled', true);
  });

  it('enables the Delete User button for other deletable users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ username: 'current_user' }),
    });

    const user = createUser({
      user_type: 'default',
      username: 'other_user',
    });

    const { container } = renderWithProviders(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    expect(getDeleteUserButton(container)).not.toHaveAttribute('disabled');
    expect(
      getDeleteUserButton(container)?.querySelector('cds-icon')
    ).toBeNull();
  });

  it('opens the delete confirmation dialog when the Delete User button is clicked', () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ username: 'current_user' }),
    });

    const user = createUser({
      user_type: 'default',
      username: 'other_user',
    });

    const { container } = renderWithProviders(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={mockPermissions}
      />
    );

    fireEvent.click(getDeleteUserButton(container)!);

    expect(
      screen.getByText('Delete user?').closest('cds-modal')
    ).toHaveTextContent(
      "Deleting other_user is permanent and can't be undone."
    );
  });

  it('disables the Delete User button when delete_user permission is false', () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ username: 'current_user' }),
    });

    const user = createUser({ username: 'other_user' });

    const { container } = renderWithProviders(
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={{ ...mockPermissions, delete_user: false }}
      />
    );

    expect(getDeleteUserButton(container)).toHaveProperty('disabled', true);
  });
});

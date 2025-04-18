import React from 'react';

import { accountUserFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDetailsPanel } from './UserDetailsPanel';

import type { IamUserPermissions } from '@linode/api-v4';

describe('UserDetailsPanel', () => {
  it("renders the user's username and email", async () => {
    const user = accountUserFactory.build();
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
    );

    expect(getByText('Username')).toBeVisible();
    expect(getByText(user.username)).toBeVisible();

    expect(getByText('Email')).toBeVisible();
    expect(getByText(user.email)).toBeVisible();
  });

  it("renders '0' if the user doesn't have the assigned roles", async () => {
    const user = accountUserFactory.build({ restricted: true });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getAllByText, getByText } = renderWithTheme(
      <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
    );

    expect(getByText('Assigned Roles')).toBeVisible();
    expect(getAllByText('0')[0]).toBeVisible();
  });

  it("renders '5' if the user has 5 different roles", async () => {
    const user = accountUserFactory.build({ restricted: false });
    const assignedRoles: IamUserPermissions = {
      account_access: [
        'account_linode_admin',
        'linode_creator',
        'firewall_creator',
      ],
      entity_access: [
        {
          id: 12345678,
          roles: ['linode_contributor', 'linode_creator'],
          type: 'linode',
        },
        {
          id: 45678901,
          roles: ['firewall_admin', 'firewall_creator'],
          type: 'firewall',
        },
      ],
    };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
    );

    expect(getByText('Assigned Roles')).toBeVisible();
    expect(getByText('5')).toBeVisible();
  });

  it("renders '3' if the user has 3 different roles", async () => {
    const user = accountUserFactory.build({ restricted: false });
    const assignedRoles: IamUserPermissions = {
      account_access: [
        'account_linode_admin',
        'linode_creator',
        'linode_contributor',
      ],
      entity_access: [
        {
          id: 12345678,
          roles: ['linode_contributor', 'linode_creator'],
          type: 'linode',
        },
      ],
    };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
    );

    expect(getByText('Assigned Roles')).toBeVisible();
    expect(getByText('3')).toBeVisible();
  });

  it("renders the user's phone number", async () => {
    const user = accountUserFactory.build({
      verified_phone_number: '+17040000000',
    });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
    );

    expect(getByText('Verified Phone Number')).toBeVisible();
    expect(getByText(user.verified_phone_number!)).toBeVisible();
  });

  it("renders the user's 2FA status", async () => {
    const user = accountUserFactory.build({ tfa_enabled: true });
    const assignedRoles = { account_access: [], entity_access: [] };

    const { getByText } = renderWithTheme(
      <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
    );

    expect(getByText('2FA')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
  });
});

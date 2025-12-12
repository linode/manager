import { useAccountUser, useUserRoles } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  NotFound,
  Notice,
  Stack,
} from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { usePermissions } from '../../hooks/usePermissions';
import { DeleteUserPanel } from './DeleteUserPanel';
import { UserDetailsPanel } from './UserDetailsPanel';
import { UserEmailPanel } from './UserEmailPanel';
import { UsernamePanel } from './UsernamePanel';

export const UserProfile = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_user',
    'delete_user',
    'view_account',
  ]);

  const isAccountAdmin = permissions?.is_account_admin;

  const {
    data: user,
    error,
    isLoading,
  } = useAccountUser(
    username ?? '',
    isAccountAdmin || permissions?.view_account
  );
  const { data: assignedRoles } = useUserRoles(
    username ?? '',
    isAccountAdmin || permissions?.view_account
  );

  // Only admin users get update_user and delete_user permissions, but doing a bit of defensive programming here to be safe.
  const canUpdateUser = isAccountAdmin || permissions?.update_user;
  const canDeleteUser = isAccountAdmin || permissions?.delete_user;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!(isAccountAdmin || permissions?.view_account)) {
    return (
      <Notice variant="error">
        You do not have permission to view this user&apos;s details.
      </Notice>
    );
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  if (!user) {
    return <NotFound />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - Profile`} />
      <Stack
        spacing={2}
        sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}
      >
        <UserDetailsPanel activeUser={user} assignedRoles={assignedRoles} />
        <UsernamePanel activeUser={user} canUpdateUser={canUpdateUser} />
        <UserEmailPanel activeUser={user} canUpdateUser={canUpdateUser} />
        <DeleteUserPanel activeUser={user} canDeleteUser={canDeleteUser} />
      </Stack>
    </>
  );
};

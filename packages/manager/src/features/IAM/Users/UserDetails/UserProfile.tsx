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
  ]);

  const {
    data: user,
    error,
    isLoading,
  } = useAccountUser(username ?? '', permissions?.is_account_admin);
  const { data: assignedRoles } = useUserRoles(
    username ?? '',
    permissions?.is_account_admin
  );

  const canUpdateUser = permissions?.update_user;
  const canDeleteUser = permissions?.delete_user;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.is_account_admin) {
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
        <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
        <UsernamePanel canUpdateUser={canUpdateUser} user={user} />
        <UserEmailPanel canUpdateUser={canUpdateUser} user={user} />
        <DeleteUserPanel canDeleteUser={canDeleteUser} user={user} />
      </Stack>
    </>
  );
};

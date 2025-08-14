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
    'view_user',
    'list_user_grants',
  ]);

  const {
    data: user,
    error,
    isLoading,
  } = useAccountUser(username ?? '', permissions?.view_user);
  const { data: assignedRoles } = useUserRoles(
    username ?? '',
    permissions?.list_user_grants
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.view_user) {
    return (
      <Notice variant="error">
        You do not have permission to view this user details.
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
        <UsernamePanel user={user} />
        <UserEmailPanel user={user} />
        <DeleteUserPanel user={user} />
      </Stack>
    </>
  );
};

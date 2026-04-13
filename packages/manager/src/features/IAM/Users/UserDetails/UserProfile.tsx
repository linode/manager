import { useAccountUser, useUserRoles } from '@linode/queries';
import { ErrorState, NotFound, Notice, Stack } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { usePermissions } from '../../hooks/usePermissions';
import { LoadingSpinner } from '../../Shared/LoadingSpinner/LoadingSpinner';
import { DeleteUserPanel } from './DeleteUserPanel';
import { UserDetailsPanel } from './UserDetailsPanel';
import { UserEmailPanel } from './UserEmailPanel';
import { UsernamePanel } from './UsernamePanel';

export const UserProfile = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions(
    'account',
    ['view_user', 'update_user', 'delete_user', 'list_user_permissions']
  );

  const {
    data: user,
    error,
    isLoading,
  } = useAccountUser(username ?? '', permissions?.view_user);
  const { data: assignedRoles } = useUserRoles(
    username ?? '',
    permissions?.list_user_permissions
  );

  if (isLoading) {
    return <LoadingSpinner size="extra-large" />;
  }

  if (
    (!permissions?.view_user || !permissions?.list_user_permissions) &&
    !isLoadingPermissions
  ) {
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
        <UsernamePanel
          activeUser={user}
          canUpdateUser={permissions?.update_user}
        />
        <UserEmailPanel activeUser={user} />
        <DeleteUserPanel
          activeUser={user}
          canDeleteUser={permissions?.delete_user}
        />
      </Stack>
    </>
  );
};

import { NotificationBanner } from '@akamai/cds-components/react';
import { useAccountUser, useUserRoles } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/features/IAM/Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';
import { NotFound } from 'src/features/IAM/Shared/NotFound/NotFound';

import { usePermissions } from '../../hooks/usePermissions';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { UserDetailsPanel } from './UserDetailsPanel';

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
    return <CircleProgress />;
  }

  if (
    (!permissions?.view_user || !permissions?.list_user_permissions) &&
    !isLoadingPermissions
  ) {
    return (
      <NotificationBanner
        text="You do not have permission to view this user's details."
        type="error"
      />
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
      <UserDetailsPanel
        activeUser={user}
        assignedRoles={assignedRoles}
        permissions={permissions}
      />
    </>
  );
};

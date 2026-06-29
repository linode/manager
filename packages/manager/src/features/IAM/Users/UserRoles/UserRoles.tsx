import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useAccountUser, useUserRoles } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/features/IAM/Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { Paper } from '../../Shared/Paper/Paper';

export const UserRoles = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'view_user',
    'list_user_permissions',
  ]);

  const {
    data: assignedRoles,
    isLoading,
    error: assignedRolesError,
  } = useUserRoles(username ?? '', permissions?.list_user_permissions);

  const { error } = useAccountUser(username ?? '', permissions?.view_user);

  const hasAssignedRoles = assignedRoles
    ? assignedRoles.account_access.length > 0 ||
      assignedRoles.entity_access.length > 0
    : false;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.view_user) {
    return (
      <NotificationBanner
        text="You do not have permission to view this user's roles."
        type="error"
      />
    );
  }

  if (error || assignedRolesError) {
    return <ErrorState />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Roles`} />
      {hasAssignedRoles ? (
        <Paper>
          <h2 style={{ font: Typography.Heading.M }}>Assigned Roles</h2>
          <p
            style={{
              margin: `${Spacing.S12} 0 ${Spacing.S20}`,
            }}
          >
            View and manage roles assigned to the user.
          </p>
          <AssignedRolesTable />
        </Paper>
      ) : (
        <NoAssignedRoles
          hasAssignNewRoleDrawer={true}
          text={NO_ASSIGNED_ROLES_TEXT}
        />
      )}
    </>
  );
};

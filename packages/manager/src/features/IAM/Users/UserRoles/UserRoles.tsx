import { useAccountUser, useUserRoles } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  Notice,
  Paper,
  Typography,
  useTheme,
} from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import {
  ERROR_STATE_TEXT,
  NO_ASSIGNED_ROLES_TEXT,
} from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

export const UserRoles = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const { data: permissions } = usePermissions('account', ['is_account_admin']);
  const theme = useTheme();

  const {
    data: assignedRoles,
    isLoading,
    error: assignedRolesError,
  } = useUserRoles(username ?? '', permissions?.is_account_admin);

  const { error } = useAccountUser(
    username ?? '',
    permissions?.is_account_admin
  );

  const hasAssignedRoles = assignedRoles
    ? assignedRoles.account_access.length > 0 ||
      assignedRoles.entity_access.length > 0
    : false;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.is_account_admin) {
    return (
      <Notice variant="error">
        You do not have permission to view this user&apos;s roles.
      </Notice>
    );
  }

  if (error || assignedRolesError) {
    return <ErrorState errorText={ERROR_STATE_TEXT} />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Roles`} />
      {hasAssignedRoles ? (
        <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
          <Typography variant="h2">Assigned Roles</Typography>
          <Typography
            sx={{
              margin: `${theme.tokens.spacing.S12} 0 ${theme.tokens.spacing.S20}`,
            }}
            variant="body1"
          >
            View and manage roles assigned to the user.
          </Typography>
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

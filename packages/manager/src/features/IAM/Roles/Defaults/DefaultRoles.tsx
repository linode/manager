import { useGetDefaultDelegationAccessQuery } from '@linode/queries';
import { Notice, Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { NO_ASSIGNED_DEFAULT_ROLES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

export const DefaultRoles = () => {
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['view_default_delegate_access']
  );
  const {
    data: defaultRolesData,
    isLoading: defaultRolesLoading,
    error,
  } = useGetDefaultDelegationAccessQuery({
    enabled: permissions?.view_default_delegate_access,
  });

  const hasAssignedRoles = defaultRolesData
    ? defaultRolesData.account_access.length > 0 ||
      defaultRolesData.entity_access.length > 0
    : false;

  if (defaultRolesLoading || isPermissionsLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.view_default_delegate_access) {
    return (
      <Notice variant="error">
        You do not have permission to view default roles for delegate users.
      </Notice>
    );
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <Paper>
      {hasAssignedRoles ? (
        <>
          <Typography variant="h2">Default Roles for Delegate Users</Typography>
          <Typography mt={2}>
            View and manage roles to be assigned to delegate users by default.
            Note that changes implemented here will apply to only new delegate
            users.
          </Typography>
          <Typography mb={2}>
            For existing delegate users, use their Assigned Roles page to update
            the assignment.
          </Typography>
          <AssignedRolesTable />
        </>
      ) : (
        <NoAssignedRoles
          hasAssignNewRoleDrawer={true}
          text={NO_ASSIGNED_DEFAULT_ROLES_TEXT}
        />
      )}
    </Paper>
  );
};

import { useGetDefaultDelegationAccessQuery } from '@linode/queries';
import { CircleProgress, ErrorState, Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import {
  ERROR_STATE_TEXT,
  NO_ASSIGNED_DEFAULT_ROLES_TEXT,
} from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

export const DefaultRoles = () => {
  const {
    data: defaultRolesData,
    isLoading: defaultRolesLoading,
    error,
  } = useGetDefaultDelegationAccessQuery({ enabled: true });
  const hasAssignedRoles = defaultRolesData
    ? defaultRolesData.account_access.length > 0 ||
      defaultRolesData.entity_access.length > 0
    : false;

  if (defaultRolesLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={ERROR_STATE_TEXT} />;
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

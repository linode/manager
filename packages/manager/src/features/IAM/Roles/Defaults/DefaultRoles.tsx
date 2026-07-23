import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useGetDefaultDelegationAccessQuery } from '@linode/queries';
import * as React from 'react';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { NO_ASSIGNED_DEFAULT_ROLES_TEXT } from '../../Shared/constants';
import { ErrorState } from '../../Shared/ErrorState/ErrorState';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { Paper } from '../../Shared/Paper/Paper';

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
      <NotificationBanner
        text="You do not have permission to view default roles for delegate users."
        type="error"
      />
    );
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <Paper>
      {hasAssignedRoles ? (
        <>
          <h2 style={{ font: Typography.Heading.S }}>
            Default Roles for Delegate Users
          </h2>
          <p style={{ marginTop: Spacing.S16 }}>
            View and manage roles to be assigned to delegate users by default.
            Note that changes implemented here will apply to only new delegate
            users.
          </p>
          <p style={{ marginBottom: Spacing.S16 }}>
            For existing delegate users, use their Assigned Roles page to update
            the assignment.
          </p>
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

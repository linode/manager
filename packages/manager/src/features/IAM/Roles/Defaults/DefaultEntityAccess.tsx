import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useGetDefaultDelegationAccessQuery } from '@linode/queries';
import * as React from 'react';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { NO_ASSIGNED_DEFAULT_ENTITIES_TEXT } from '../../Shared/constants';
import { ErrorState } from '../../Shared/ErrorState/ErrorState';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { Paper } from '../../Shared/Paper/Paper';

export const DefaultEntityAccess = () => {
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['view_default_delegate_access']
  );
  const {
    data: defaultAccess,
    isLoading: defaultAccessLoading,
    error,
  } = useGetDefaultDelegationAccessQuery({
    enabled: permissions?.view_default_delegate_access,
  });

  const hasAssignedEntities = defaultAccess
    ? defaultAccess.entity_access.length > 0
    : false;

  if (defaultAccessLoading || isPermissionsLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.view_default_delegate_access) {
    return (
      <NotificationBanner
        text="You do not have permission to view default entity access for delegate users."
        type="error"
      />
    );
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <Paper>
      {hasAssignedEntities ? (
        <>
          <h2 style={{ font: Typography.Heading.S }}>
            Default Entity Access for Delegate Users
          </h2>
          <p style={{ marginTop: Spacing.S16, marginBottom: Spacing.S16 }}>
            View and update entities assigned to delegate users by default. Note
            that changes implemented here will apply only to new delegate users.
            For existing delegate users, use their Assigned Roles page to update
            the assignment.
          </p>
          <AssignedEntitiesTable />
        </>
      ) : (
        <NoAssignedRoles
          hasAssignNewRoleDrawer={false}
          text={NO_ASSIGNED_DEFAULT_ENTITIES_TEXT}
        />
      )}
    </Paper>
  );
};

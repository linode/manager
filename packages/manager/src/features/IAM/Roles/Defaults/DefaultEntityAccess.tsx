import { useGetDefaultDelegationAccessQuery } from '@linode/queries';
import { ErrorState, Notice, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';
import {
  ERROR_STATE_TEXT,
  NO_ASSIGNED_DEFAULT_ENTITIES_TEXT,
} from '../../Shared/constants';
import { LoadingSpinner } from '../../Shared/LoadingSpinner/LoadingSpinner';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

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
    return <LoadingSpinner size="extra-large" />;
  }

  if (!permissions?.view_default_delegate_access) {
    return (
      <Notice variant="error">
        You do not have permission to view default entity access for delegate
        users.
      </Notice>
    );
  }

  if (error) {
    return <ErrorState errorText={ERROR_STATE_TEXT} />;
  }

  return (
    <Paper>
      {hasAssignedEntities ? (
        <>
          <Stack marginBottom={2}>
            <Typography variant="h2">
              Default Entity Access for Delegate Users
            </Typography>
            <Typography marginTop={2}>
              View and update entities assigned to delegate users by default.
              Note that changes implemented here will apply only to new delegate
              users. For existing delegate users, use their Assigned Roles page
              to update the assignment.
            </Typography>
          </Stack>
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

import { useAccountUser, useUserRoles } from '@linode/queries';
import { Notice, Paper, Typography, useTheme } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { NO_ASSIGNED_ENTITIES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

export const UserEntities = () => {
  const theme = useTheme();
  const { username } = useParams({ from: '/iam/users/$username' });
  const { data: permissions } = usePermissions('account', [
    'view_user',
    'list_entities',
    'list_user_permissions',
  ]);
  const {
    data: assignedRoles,
    isLoading,
    error: assignedRolesError,
  } = useUserRoles(username ?? '', permissions?.list_user_permissions);

  const { error } = useAccountUser(username ?? '', permissions?.view_user);

  const hasAssignedRoles = assignedRoles
    ? assignedRoles.entity_access.length > 0
    : false;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.list_entities) {
    return (
      <Notice variant="error">
        You do not have permission to view this user&apos;s entities.
      </Notice>
    );
  }

  if (error || assignedRolesError) {
    return <ErrorState />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Entities`} />

      {hasAssignedRoles ? (
        <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
          <Typography variant="h2">Entity Access</Typography>
          <Typography
            sx={{
              margin: `${theme.tokens.spacing.S12} 0 ${theme.tokens.spacing.S20}`,
            }}
            variant="body1"
          >
            View and manage entities attached to user&apos;s entity access
            roles.
          </Typography>
          <AssignedEntitiesTable username={username} />
        </Paper>
      ) : (
        <NoAssignedRoles
          hasAssignNewRoleDrawer={false}
          text={NO_ASSIGNED_ENTITIES_TEXT}
        />
      )}
    </>
  );
};

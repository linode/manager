import { NotificationBanner } from '@akamai/cds-components/react/NotificationBanner';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useAccountUser, useUserRoles } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { usePermissions } from '../../hooks/usePermissions';
import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { NO_ASSIGNED_ENTITIES_TEXT } from '../../Shared/constants';
import { DocumentTitleSegment } from '../../Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from '../../Shared/ErrorState/ErrorState';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { Paper } from '../../Shared/Paper/Paper';

export const UserEntities = () => {
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
      <NotificationBanner
        text="You do not have permission to view this user's entities."
        type="error"
      />
    );
  }

  if (error || assignedRolesError) {
    return <ErrorState />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Entities`} />

      {hasAssignedRoles ? (
        <Paper>
          <h2 style={{ font: Typography.Heading.S }}>Entity Access</h2>
          <p
            style={{
              margin: `${Spacing.S12} 0 ${Spacing.S20}`,
            }}
          >
            View and manage entities attached to user&apos;s entity access
            roles.
          </p>
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

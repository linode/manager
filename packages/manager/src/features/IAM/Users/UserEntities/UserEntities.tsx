import { useAccountUser } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  Paper,
  Typography,
  useTheme,
} from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import { isEmpty } from 'ramda';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { NO_ASSIGNED_ENTITIES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { AssignedEntitiesTable } from './AssignedEntitiesTable';

export const UserEntities = () => {
  const theme = useTheme();

  const { username } = useParams({ from: '/iam/users/$username' });
  const { data: assignedRoles, isLoading } = useAccountUserPermissions(
    username ?? ''
  );
  const { error } = useAccountUser(username ?? '');

  const hasAssignedRoles = assignedRoles
    ? !isEmpty(assignedRoles.entity_access)
    : false;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Entities`} />
      <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
        <Typography variant="h2">Entity Access</Typography>
        <Typography
          sx={{
            margin: `${theme.tokens.spacing.S12} 0 ${theme.tokens.spacing.S20}`,
          }}
          variant="body1"
        >
          View and manage entities attached to user&apos;s entity access roles.
        </Typography>
        {hasAssignedRoles ? (
          <AssignedEntitiesTable />
        ) : (
          <NoAssignedRoles text={NO_ASSIGNED_ENTITIES_TEXT} />
        )}
      </Paper>
    </>
  );
};

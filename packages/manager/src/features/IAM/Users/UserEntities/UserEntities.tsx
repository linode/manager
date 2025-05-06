import { useAccountUser } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { isEmpty } from 'ramda';
import React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { NO_ASSIGNED_ENTITIES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { AssignedEntitiesTable } from './AssignedEntitiesTable';

export const UserEntities = () => {
  const { username } = useParams<{ username: string }>();
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
        <Stack spacing={3}>
          <Typography variant="h2">Assigned Entities</Typography>
          {hasAssignedRoles ? (
            <AssignedEntitiesTable />
          ) : (
            <NoAssignedRoles text={NO_ASSIGNED_ENTITIES_TEXT} />
          )}
        </Stack>
      </Paper>
    </>
  );
};

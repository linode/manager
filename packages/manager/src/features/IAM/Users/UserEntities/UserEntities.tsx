import { Paper, Stack, Typography } from '@linode/ui';
import { isEmpty } from 'ramda';
import React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';
import { NO_ASSIGNED_ENTITIES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

export const UserEntities = () => {
  const { username } = useParams<{ username: string }>();
  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

  const hasAssignedRoles = assignedRoles ? !isEmpty(assignedRoles) : false;

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Entities`} />
      <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>
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

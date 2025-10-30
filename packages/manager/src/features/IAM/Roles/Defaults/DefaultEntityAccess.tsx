import { CircleProgress, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { useAllAccountEntities } from 'src/queries/entities/entities';

import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';
import { NO_ASSIGNED_ENTITIES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

export const DefaultEntityAccess = () => {
  const { data: entities, isLoading: entitiesLoading } = useAllAccountEntities(
    {}
  );

  const hasAssignedEntities = entities ? entities.length > 0 : false;

  if (entitiesLoading) {
    return <CircleProgress />;
  }

  return (
    <Paper>
      {hasAssignedEntities ? (
        <>
          <Stack marginBottom={2.5}>
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
          text={NO_ASSIGNED_ENTITIES_TEXT}
        />
      )}
    </Paper>
  );
};

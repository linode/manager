import { Button, Paper, Stack, Typography } from '@linode/ui';
import { isEmpty } from 'ramda';
import React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import { AssignNewRoleDrawer } from './AssignNewRoleDrawer';

export const UserRoles = () => {
  const { username } = useParams<{ username: string }>();

  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const hasAssignedRoles = assignedRoles ? !isEmpty(assignedRoles) : false;

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Roles`} />
      <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <Stack spacing={3}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
          >
            <Typography variant="h2">Assigned Roles</Typography>
            <Button buttonType="primary" onClick={() => setIsDrawerOpen(true)}>
              Assign New Role
            </Button>
          </Stack>
          {hasAssignedRoles ? (
            <AssignedRolesTable />
          ) : (
            <NoAssignedRoles text={NO_ASSIGNED_ROLES_TEXT} />
          )}
        </Stack>
      </Paper>
      <AssignNewRoleDrawer
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      />
    </>
  );
};

import { useAccountUser } from '@linode/queries';
import {
  Button,
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

import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { AssignNewRoleDrawer } from './AssignNewRoleDrawer';

export const UserRoles = () => {
  const { username } = useParams<{ username: string }>();

  const { data: assignedRoles, isLoading } = useAccountUserPermissions(
    username ?? ''
  );
  const { error } = useAccountUser(username ?? '');

  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const hasAssignedRoles = assignedRoles
    ? !isEmpty(assignedRoles.account_access) ||
      !isEmpty(assignedRoles.entity_access)
    : false;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Roles`} />
      <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
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

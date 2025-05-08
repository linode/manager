import { useAccountUser } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  Paper,
  Typography,
  useTheme,
} from '@linode/ui';
import { isEmpty } from 'ramda';
import React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';
import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

export const UserRoles = () => {
  const { username } = useParams<{ username: string }>();
  const theme = useTheme();

  const { data: assignedRoles, isLoading } = useAccountUserPermissions(
    username ?? ''
  );
  const { error } = useAccountUser(username ?? '');

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
        <Typography variant="h2">Assigned Roles</Typography>
        <Typography
          sx={{
            margin: `${theme.tokens.spacing.S12} 0 ${theme.tokens.spacing.S20}`,
          }}
          variant="body1"
        >
          View and manage roles assigned to the user.
        </Typography>
        {hasAssignedRoles ? (
          <AssignedRolesTable />
        ) : (
          <NoAssignedRoles text={NO_ASSIGNED_ROLES_TEXT} />
        )}
      </Paper>
    </>
  );
};

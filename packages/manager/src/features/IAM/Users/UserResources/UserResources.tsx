import { Paper, Stack, Typography } from '@linode/ui';
import { isEmpty } from 'ramda';
import React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { NO_ASSIGNED_RESOURCES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';

import type { IamUserPermissions } from '@linode/api-v4';

interface Props {
  assignedRoles?: IamUserPermissions;
}

export const UserResources = ({ assignedRoles }: Props) => {
  const { username } = useParams<{ username: string }>();

  const hasAssignedRoles = assignedRoles ? !isEmpty(assignedRoles) : false;

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Resources`} />
      <Paper>
        <Stack spacing={3}>
          <Typography variant="h2">Assigned Resources</Typography>
          {hasAssignedRoles ? (
            <p>UIE-8139 - RBAC-5: User Roles - Resources Table</p>
          ) : (
            <NoAssignedRoles text={NO_ASSIGNED_RESOURCES_TEXT} />
          )}
        </Stack>
      </Paper>
    </>
  );
};

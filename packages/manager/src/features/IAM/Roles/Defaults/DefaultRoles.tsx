import { useGetDefaultDelegationAccessQuery } from '@linode/queries';
import { Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { AssignedRolesTable } from '../../Shared/AssignedRolesTable/AssignedRolesTable';

export const DefaultRoles = () => {
  const { data: assignedRoles, isLoading: assignedRolesLoading } =
    useGetDefaultDelegationAccessQuery();

  return (
    <Paper>
      <Typography variant="h2">Default Roles for Delegate Users</Typography>
      <Typography mt={2}>
        View and manage roles to be assigned to delegate users by default. Note
        that changes implemented here will apply to only new delegate users.
      </Typography>
      <Typography mb={2}>
        For existing delegate users, use their Assigned Roles page to update the
        assignment.
      </Typography>
      <AssignedRolesTable
        assignedRoles={assignedRoles}
        assignedRolesLoading={assignedRolesLoading}
        isDefaultRolesView={true}
      />
    </Paper>
  );
};

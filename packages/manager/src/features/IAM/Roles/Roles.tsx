import { CircleProgress, Paper, Typography } from '@linode/ui';
import React from 'react';

import { RolesTable } from 'src/features/IAM/Roles/RolesTable/RolesTable';
import { mapAccountPermissionsToRoles } from 'src/features/IAM/Shared/utilities';
import { useAccountPermissions } from 'src/queries/iam/iam';

export const RolesLanding = () => {
  const { data: accountPermissions, isLoading } = useAccountPermissions();

  const { roles } = React.useMemo(() => {
    if (!accountPermissions) {
      return { roles: [] };
    }
    const roles = mapAccountPermissionsToRoles(accountPermissions);
    return { roles };
  }, [accountPermissions]);

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
      <Typography variant="h2">Roles</Typography>
      <RolesTable roles={roles} />
    </Paper>
  );
};

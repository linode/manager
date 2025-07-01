import { useAccountRoles } from '@linode/queries';
import { CircleProgress, Paper, Typography } from '@linode/ui';
import React from 'react';

import { RolesTable } from 'src/features/IAM/Roles/RolesTable/RolesTable';
import { mapAccountPermissionsToRoles } from 'src/features/IAM/Shared/utilities';

export const RolesLanding = () => {
  const { data: accountRoles, isLoading } = useAccountRoles();

  const { roles } = React.useMemo(() => {
    if (!accountRoles) {
      return { roles: [] };
    }
    const roles = mapAccountPermissionsToRoles(accountRoles);
    return { roles };
  }, [accountRoles]);

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

import { useAccountRoles } from '@linode/queries';
import { CircleProgress, Notice, Paper, Typography } from '@linode/ui';
import React from 'react';

import { RolesTable } from 'src/features/IAM/Roles/RolesTable/RolesTable';
import { mapAccountPermissionsToRoles } from 'src/features/IAM/Shared/utilities';

import { usePermissions } from '../hooks/usePermissions';

export const RolesLanding = () => {
  const { data: permissions } = usePermissions('account', ['list_user_grants']);
  const { data: accountRoles, isLoading } = useAccountRoles(
    permissions?.list_user_grants
  );

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

  if (!permissions?.list_user_grants) {
    return (
      <Notice variant="error">You do not have permission to view roles.</Notice>
    );
  }

  return (
    <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
      <Typography variant="h2">Roles</Typography>
      <RolesTable roles={roles} />
    </Paper>
  );
};

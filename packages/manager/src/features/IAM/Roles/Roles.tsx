import React from 'react';
import { CircleProgress, Paper } from '@linode/ui';
import { RolesTable } from 'src/features/IAM/Roles/RolesTable/RolesTable';
import { useAccountPermissions } from 'src/queries/iam/iam';
import { mapAccountPermissionsToRoles } from 'src/features/IAM/Shared/utilities';

export const RolesLanding = () => {

  const {data: accountPermissions, isLoading} = useAccountPermissions();

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
    <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>
      <RolesTable roles={roles}></RolesTable>
    </Paper>
  );
};

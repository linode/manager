import { useAccountRoles } from '@linode/queries';
import { CircleProgress, Notice, Paper, Typography } from '@linode/ui';
import React from 'react';

import { RolesTable } from 'src/features/IAM/Roles/RolesTable/RolesTable';
import { mapAccountPermissionsToRoles } from 'src/features/IAM/Shared/utilities';

import { useDelegationRole } from '../hooks/useDelegationRole';
import { useIsIAMDelegationEnabled } from '../hooks/useIsIAMEnabled';
import { usePermissions } from '../hooks/usePermissions';
import { DefaultRolesPanel } from './Defaults/DefaultRolesPanel';

export const RolesLanding = () => {
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['list_role_permissions']
  );
  const { data: accountRoles, isLoading } = useAccountRoles(
    permissions?.list_role_permissions
  );
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { isChildUserType, isProfileLoading } = useDelegationRole();

  const { roles } = React.useMemo(() => {
    if (!accountRoles) {
      return { roles: [] };
    }
    const roles = mapAccountPermissionsToRoles(accountRoles);
    return { roles };
  }, [accountRoles]);

  if (isLoading || isPermissionsLoading || isProfileLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.list_role_permissions) {
    return (
      <Notice variant="error">You do not have permission to view roles.</Notice>
    );
  }

  return (
    <>
      {isChildUserType && isIAMDelegationEnabled && <DefaultRolesPanel />}
      <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
        <Typography variant="h2">Roles</Typography>
        <RolesTable roles={roles} />
      </Paper>
    </>
  );
};

import { Box, Button, Typography, useTheme } from '@linode/ui';
import React from 'react';

import EmptyState from 'src/assets/icons/empty-state-cloud.svg';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import { AssignNewRoleDrawer } from '../../Users/UserRoles/AssignNewRoleDrawer';

interface Props {
  hasAssignNewRoleDrawer: boolean;
  text: string;
}

export const NoAssignedRoles = (props: Props) => {
  const { text, hasAssignNewRoleDrawer } = props;
  const theme = useTheme();
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const [isAssignNewRoleDrawerOpen, setIsAssignNewRoleDrawerOpen] =
    React.useState<boolean>(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        paddingTop: theme.tokens.spacing.S24,
      }}
    >
      <EmptyState />
      <Typography variant="h2">This list is empty</Typography>
      <Typography
        sx={{
          mt: 1,
          width: '260px',
          textAlign: 'center',
          marginBottom: theme.tokens.spacing.S24,
        }}
      >
        {text}
      </Typography>
      {hasAssignNewRoleDrawer && (
        <Button
          buttonType="primary"
          disabled={!permissionToCheck}
          onClick={() => setIsAssignNewRoleDrawerOpen(true)}
          tooltipText={
            !permissionToCheck
              ? 'You do not have permission to assign roles.'
              : undefined
          }
        >
          {isDefaultDelegationRolesForChildAccount
            ? 'Add New Default Roles'
            : 'Assign New Roles'}
        </Button>
      )}
      <AssignNewRoleDrawer
        onClose={() => setIsAssignNewRoleDrawerOpen(false)}
        open={isAssignNewRoleDrawerOpen}
      />
    </Box>
  );
};

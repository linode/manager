import { Box, Button, Typography, useTheme } from '@linode/ui';
import React from 'react';

import EmptyState from 'src/assets/icons/empty-state-cloud.svg';

import { AssignNewRoleDrawer } from '../../Users/UserRoles/AssignNewRoleDrawer';

interface Props {
  hasAssignNewRoleDrawer: boolean;
  text: string;
}

export const NoAssignedRoles = (props: Props) => {
  const { text, hasAssignNewRoleDrawer } = props;
  const theme = useTheme();

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
          onClick={() => setIsAssignNewRoleDrawerOpen(true)}
        >
          Assign New Roles
        </Button>
      )}
      <AssignNewRoleDrawer
        onClose={() => setIsAssignNewRoleDrawerOpen(false)}
        open={isAssignNewRoleDrawerOpen}
      />
    </Box>
  );
};

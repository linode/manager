import { useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import * as React from 'react';

import { Permissions } from 'src/features/IAM/Shared/Permissions/Permissions';

import type { PermissionType } from '@linode/api-v4';

interface Props {
  permissions: PermissionType[];
}

export const RolesTableExpandedRow = ({ permissions }: Props) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        backgroundColor: 'transparent',
        padding: `${theme.tokens.spacing.S12} ${theme.tokens.spacing.S8}`,
        width: '100%',
      }}
    >
      <Permissions permissions={permissions} />
    </Paper>
  );
};

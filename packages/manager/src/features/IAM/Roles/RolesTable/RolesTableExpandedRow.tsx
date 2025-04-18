import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Permissions } from 'src/features/IAM/Shared/Permissions/Permissions';
import { useTheme } from '@mui/material';
import type { PermissionType } from '@linode/api-v4';

interface Props {
  permissions: PermissionType[];
}

export const RolesTableExpandedRow = ({ permissions }: Props) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        backgroundColor:
          theme.name === 'light'
            ? theme.tokens.color.Neutrals[5]
            : theme.tokens.color.Neutrals[100],
        marginTop: theme.spacing(1.25),
        padding: `${theme.tokens.spacing.S12} ${theme.tokens.spacing.S8}`,
        width: '100%',
      }}
    >
      <Permissions permissions={permissions}></Permissions>
    </Paper>
  );
};

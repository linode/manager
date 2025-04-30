import { Paper, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';

import { Entities } from '../Entities/Entities';
import { Permissions } from '../Permissions/Permissions';
import { type ExtendedRole, getFacadeRoleDescription } from '../utilities';

import type { DrawerModes, EntitiesOption, ExtendedRoleView } from '../types';
import type { SxProps, Theme } from '@mui/material';

interface Props {
  errorText?: string;
  mode?: DrawerModes;
  onChange?: (value: EntitiesOption[]) => void;
  role: ExtendedRole | ExtendedRoleView;
  sx?: SxProps<Theme>;
  value?: EntitiesOption[];
}

export const AssignedPermissionsPanel = ({
  errorText,
  mode,
  onChange,
  role,
  sx,
  value,
}: Props) => {
  const theme = useTheme();

  // TODO: update the link for the description when it's ready - UIE-8534
  return (
    <Paper
      sx={{
        backgroundColor:
          theme.name === 'light'
            ? theme.tokens.color.Neutrals[5]
            : theme.tokens.color.Neutrals[100],
        marginTop: theme.tokens.spacing.S8,
        padding: `${theme.tokens.spacing.S12} ${theme.tokens.spacing.S8}`,
        ...sx,
      }}
    >
      <Typography
        sx={(theme) => ({
          font: theme.tokens.alias.Typography.Label.Bold.S,
        })}
      >
        Description
      </Typography>
      <Typography
        sx={{
          marginBottom: theme.tokens.spacing.S8,
          marginTop: theme.tokens.spacing.S2,
          overflowWrap: 'anywhere',
          wordBreak: 'normal',
        }}
      >
        {role.permissions.length ? (
          role.description
        ) : (
          <>
            {getFacadeRoleDescription(role)} <Link to="#">Learn more.</Link>
          </>
        )}
      </Typography>
      <Permissions permissions={role.permissions} />
      {mode !== 'change-role-for-entity' && (
        <Entities
          access={role.access}
          errorText={errorText}
          mode={mode}
          onChange={(value) => onChange?.(value)}
          type={role.entity_type}
          value={value || []}
        />
      )}
    </Paper>
  );
};

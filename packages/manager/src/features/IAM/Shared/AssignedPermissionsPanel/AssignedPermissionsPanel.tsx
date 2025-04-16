import { Paper, StyledLinkButton, Typography } from '@linode/ui';
import { truncate } from '@linode/utilities';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { Entities } from '../Entities/Entities';
import { Permissions } from '../Permissions/Permissions';

import type {
  DrawerModes,
  EntitiesOption,
  ExtendedRole,
  ExtendedRoleMap,
} from '../utilities';
import type { SxProps, Theme } from '@mui/material';

interface Props {
  errorText?: string;
  mode?: DrawerModes;
  onChange?: (value: EntitiesOption[]) => void;
  role: ExtendedRole | ExtendedRoleMap;
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
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  const theme = useTheme();

  const description =
    role.description.length < 110 || showFullDescription
      ? role.description
      : truncate(role.description, 110);

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
          display: 'flex',
          flexDirection: 'column',
          marginBottom: theme.tokens.spacing.S8,
          overflowWrap: 'anywhere',
          wordBreak: 'normal',
        }}
      >
        {description}{' '}
        {description.length > 110 && (
          <StyledLinkButton
            onClick={() => setShowFullDescription((show) => !show)}
            sx={{
              font: theme.tokens.alias.Typography.Label.Semibold.Xs,
              width: 'max-content',
            }}
            type="button"
          >
            {showFullDescription ? 'Hide' : 'Expand'}
          </StyledLinkButton>
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

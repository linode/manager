import { Paper, StyledLinkButton, Typography } from '@linode/ui';
import { truncate } from '@linode/utilities';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { Entities } from '../Entities/Entities';
import { Permissions } from '../Permissions/Permissions';

import type { DrawerModes, EntitiesOption } from '../utilities';
import type {
  EntityTypePermissions,
  IamAccessType,
  Roles,
} from '@linode/api-v4/lib/iam/types';

interface ExtendedRole extends Roles {
  access: IamAccessType;
  entity_type: EntityTypePermissions;
}

interface Props {
  assignedEntities?: EntitiesOption[];
  mode?: DrawerModes;
  role: ExtendedRole;
}

export const AssignedPermissionsPanel = ({
  assignedEntities,
  mode,
  role,
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
        marginTop: theme.spacing(1.25),
        padding: `${theme.tokens.spacing.S12} ${theme.tokens.spacing.S8}`,
      }}
    >
      <Typography
        sx={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: theme.tokens.spacing.S12,
          overflowWrap: 'anywhere',
          wordBreak: 'normal',
        }}
      >
        {description}{' '}
        {description.length > 110 && (
          <StyledLinkButton
            sx={{
              font: theme.tokens.alias.Typography.Label.Semibold.Xs,
              width: 'max-content',
            }}
            onClick={() => setShowFullDescription((show) => !show)}
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
          assignedEntities={assignedEntities ?? []}
          type={role.entity_type}
        />
      )}
    </Paper>
  );
};

import { Paper, StyledLinkButton, Typography } from '@linode/ui';
import { truncate } from '@linode/utilities';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { Entities } from '../Entities/Entities';
import { Permissions } from '../Permissions/Permissions';

import type { EntitiesOption } from '../utilities';
import type {
  IamAccessType,
  ResourceTypePermissions,
  Roles,
} from '@linode/api-v4/lib/iam/types';

interface ExtendedRole extends Roles {
  access: IamAccessType;
  resource_type: ResourceTypePermissions;
}

interface Props {
  assignedEntities?: EntitiesOption[];
  role: ExtendedRole;
}

export const AssignedPermissionsPanel = ({ assignedEntities, role }: Props) => {
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
              font: theme.tokens.typography.Label.Semibold.Xs,
              width: 'max-content',
            }}
            onClick={() => setShowFullDescription((show) => !show)}
          >
            {showFullDescription ? 'Hide' : 'Expand'}
          </StyledLinkButton>
        )}
      </Typography>
      <Permissions permissions={role.permissions} />
      <Entities
        access={role.access}
        assignedEntities={assignedEntities ?? []}
        type={role.resource_type}
      />
    </Paper>
  );
};

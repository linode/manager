import { Paper, StyledLinkButton, Typography } from '@linode/ui';
import { truncate } from '@linode/utilities';
import * as React from 'react';

import { Entities } from '../Entities/Entities';
import { Permissions } from '../Permissions/Permissions';

import type {
  IamAccessType,
  ResourceTypePermissions,
  Roles,
} from '@linode/api-v4/lib/iam/types';

interface ExtendedRole extends Roles {
  access: IamAccessType;
  resource_type: ResourceTypePermissions;
}

type Props = {
  role: ExtendedRole;
};

export const AssignedPermissionsPanel = ({ role }: Props) => {
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  const description =
    role.description.length < 110 || showFullDescription
      ? role.description
      : truncate(role.description, 110);

  return (
    <Paper
      sx={(theme) => ({
        backgroundColor:
          theme.name === 'light'
            ? theme.tokens.color.Neutrals[5]
            : theme.tokens.color.Neutrals[90],
        marginTop: theme.spacing(1.25),
        padding: `${theme.spacing(1)} ${theme.spacing(1.25)}`,
      })}
    >
      <Typography
        sx={{ marginBottom: 1, overflowWrap: 'anywhere', wordBreak: 'normal' }}
      >
        {description}{' '}
        {description.length > 110 && (
          <StyledLinkButton
            onClick={() => setShowFullDescription((show) => !show)}
            sx={{ fontSize: '0.875rem' }}
          >
            {showFullDescription ? 'Hide' : 'Expand'}
          </StyledLinkButton>
        )}
      </Typography>
      <Permissions permissions={role.permissions} />
      <Entities access={role.access} type={role.resource_type} />
    </Paper>
  );
};

import { Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';

import { TruncatedList } from '../TuncatedList';
import {
  StyledContainer,
  StyledPermissionItem,
  StyledTitle,
} from './Permissions.style';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

type Props = {
  noPermissionsMessage?: string;
  permissions: PermissionType[];
};

export const Permissions = React.memo(({ permissions }: Props) => {
  return (
    <Grid container data-testid="parent" direction="column">
      <StyledTitle>Permissions</StyledTitle>
      {!permissions.length ? (
        <Typography>
          This role doesn’t include permissions. Refer to the role description
          to understand what access is granted by this role.
        </Typography>
      ) : (
        <StyledContainer
          data-testid="container"
          sx={{
            '& .permissions-list': {
              margin: 0,
              padding: 0,
              display: 'flex',
              listStyleType: 'none',
              flexWrap: 'wrap',
              maxHeight: '3.2em',
              '&.expanded': {
                maxHeight: 'none',
              },
            },
          }}
        >
          <TruncatedList className="permissions-list">
            {permissions.map((permission: PermissionType) => (
              <StyledPermissionItem data-testid="permission" key={permission}>
                {permission}
              </StyledPermissionItem>
            ))}
          </TruncatedList>
        </StyledContainer>
      )}
    </Grid>
  );
});

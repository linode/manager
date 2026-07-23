import { Button } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { Box } from '../../Shared/Box/Box';
import { IAM_ROLES_PENDO_IDS } from '../../Shared/constants';
import { Paper } from '../../Shared/Paper/Paper';

export const DefaultRolesPanel = () => {
  const navigate = useNavigate();

  return (
    <Paper marginBottom={Spacing.S16}>
      <Box
        direction="row"
        spacing={Spacing.S16}
        style={{ justifyContent: 'space-between' }}
      >
        <div>
          <h2 style={{ font: Typography.Heading.S }}>
            Default Roles for Delegate Users
          </h2>
          <p style={{ marginTop: Spacing.S16 }}>
            View and manage roles to be assigned to new delegate users by
            default.
          </p>
        </div>
        <div>
          <Button
            data-pendo-id={IAM_ROLES_PENDO_IDS.viewDefaultRoles}
            onClick={() => navigate({ to: '/iam/roles/defaults/roles' })}
            variant="secondary"
          >
            View Default Roles
          </Button>
        </div>
      </Box>
    </Paper>
  );
};

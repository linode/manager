import React from 'react';
import { Paper } from '@linode/ui';
import { RolesTable } from 'src/features/IAM/Roles/RolesTable/RolesTable';

export const RolesLanding = () => {
  return (
      <>
        <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>
          <RolesTable></RolesTable>
        </Paper>
      </>
  );
};

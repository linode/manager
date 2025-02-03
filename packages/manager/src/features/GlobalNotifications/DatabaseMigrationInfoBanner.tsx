import { Notice, Typography } from '@linode/ui';
import React from 'react';

export const DatabaseMigrationInfoBanner = () => {
  return (
    <Notice important top={10} variant="warning">
      <Typography fontFamily={(theme) => theme.font.bold} lineHeight="20px">
        Legacy clusters decommission
      </Typography>
      <Typography lineHeight="20px">
        The legacy database clusters will be available only till the end of{' '}
        2025. By that time, we’ll migrate your clusters to the new solution. In
        case of questions regarding the new database clusters or the migration,
        contact the Support team.
      </Typography>
    </Notice>
  );
};

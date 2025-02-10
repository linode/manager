import { Notice, Typography } from '@linode/ui';
import React from 'react';

import { SupportLink } from 'src/components/SupportLink';

export const DatabaseMigrationInfoBanner = () => {
  return (
    <Notice important top={10} variant="warning">
      <Typography fontFamily={(theme) => theme.font.bold} lineHeight="20px">
        Legacy clusters decommission
      </Typography>
      <Typography lineHeight="20px">
        Legacy database clusters will only be available until the end of June
        2025. At that time, we’ll migrate your clusters to the new solution. For
        questions regarding the new database clusters or the migration,{' '}
        <SupportLink entity={{ type: 'database_id' }} text="contact support" />.
      </Typography>
    </Notice>
  );
};

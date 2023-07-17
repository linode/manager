import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';

export const MigrateError: React.FC<{}> = () => {
  return (
    <Typography>
      Self-serve migrations are currently disabled on this account. {` `}
      <SupportLink
        description=""
        text="Please contact Support."
        title="Request for Inter-DC Migration"
      />
    </Typography>
  );
};

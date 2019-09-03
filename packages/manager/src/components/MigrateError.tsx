import * as React from 'react';

import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';

export const MigrateError: React.FC<{}> = () => {
  return (
    <>
      <Typography>
        Self-serve migrations are currently disabled on this account. {` `}
        <SupportLink
          title="Request for Inter-DC Migration"
          description=""
          text="Please contact Support."
        />
      </Typography>
    </>
  );
};

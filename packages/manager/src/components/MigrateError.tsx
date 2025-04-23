import { Typography } from '@linode/ui';
import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';

import type { EntityForTicketDetails } from './SupportLink/SupportLink';

export const MigrateError = (props: { entity?: EntityForTicketDetails }) => {
  const { entity } = props;

  return (
    <Typography>
      Self-serve migrations are currently disabled on this account. {` `}
      <SupportLink
        description=""
        entity={entity}
        text="Please contact Support."
        title="Request for Inter-DC Migration"
      />
    </Typography>
  );
};

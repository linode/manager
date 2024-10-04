import * as React from 'react';

import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

const sxTooltipIcon = {
  padding: '0',
  paddingLeft: '4px',
};

export const PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT =
  'The Public IP Addresses have been unassigned from the configuration profile.';

export const PublicIpsUnassignedTooltip = (
  <TooltipIcon
    text={
      <Typography>
        {PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT}{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-configuration-profiles-on-a-compute-instance">
          Learn more
        </Link>
        .
      </Typography>
    }
    status="help"
    sxTooltipIcon={sxTooltipIcon}
  />
);

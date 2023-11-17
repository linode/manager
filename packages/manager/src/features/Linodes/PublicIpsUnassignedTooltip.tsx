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
        <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/configuration-profiles/">
          Learn more
        </Link>
        .
      </Typography>
    }
    interactive
    status="help"
    sxTooltipIcon={sxTooltipIcon}
  />
);

import { TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

const sxTooltipIcon = {
  padding: '0',
  paddingLeft: '4px',
};

export const PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT =
  'The noted Public IP Addresses are provisionally reserved but not assigned to the network interfaces in this configuration profile.';

export const PublicIPAddressesTooltip = (
  <TooltipIcon
    text={
      <Typography>
        {PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT}{' '}
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

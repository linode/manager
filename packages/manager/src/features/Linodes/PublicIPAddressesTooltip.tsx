import { TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

const sxTooltipIcon = {
  padding: '0',
  paddingLeft: '4px',
};

export const PUBLIC_IP_ADDRESSES_CONFIG_INTERFACE_TOOLTIP_TEXT =
  'The noted Public IP Addresses are provisionally reserved but not assigned to the network interfaces in this configuration profile.';

export const PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_NOT_ASSIGNED_TOOLTIP_TEXT =
  'The noted Public IP Addresses are provisionally reserved but not assigned to a network interface.';

export const PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_DEFAULT_ROUTE_TOOLTIP_TEXT =
  'The noted Public IP Addresses are provisionally reserved but not the default route. To update this, please review your Interface Settings.';

export const PublicIPAddressesTooltip = ({
  hasPublicLinodeInterface,
  isLinodeInterface,
}: {
  hasPublicLinodeInterface: boolean | undefined;
  isLinodeInterface: boolean;
}) => {
  const linodeInterfaceCopy = hasPublicLinodeInterface
    ? PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_DEFAULT_ROUTE_TOOLTIP_TEXT
    : PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_NOT_ASSIGNED_TOOLTIP_TEXT;
  return (
    <TooltipIcon
      status="help"
      sxTooltipIcon={sxTooltipIcon}
      text={
        isLinodeInterface ? (
          <Typography>{linodeInterfaceCopy}</Typography>
        ) : (
          <Typography>
            {PUBLIC_IP_ADDRESSES_CONFIG_INTERFACE_TOOLTIP_TEXT}{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-configuration-profiles-on-a-compute-instance">
              Learn more
            </Link>
            .
          </Typography>
        )
      }
    />
  );
};

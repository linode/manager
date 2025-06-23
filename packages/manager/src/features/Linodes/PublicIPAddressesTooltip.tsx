import { TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import {
  PUBLIC_IP_ADDRESSES_CONFIG_INTERFACE_TOOLTIP_TEXT,
  PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_DEFAULT_ROUTE_TOOLTIP_TEXT,
  PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_NOT_ASSIGNED_TOOLTIP_TEXT,
} from './constants';

const sxTooltipIcon = {
  padding: '0',
  paddingLeft: '4px',
};

export const PublicIPAddressesTooltip = ({
  isUnreachablePublicIPv6,
  isLinodeInterface,
}: {
  isLinodeInterface: boolean;
  isUnreachablePublicIPv6: boolean | undefined;
}) => {
  const linodeInterfaceCopy =
    isLinodeInterface && isUnreachablePublicIPv6
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

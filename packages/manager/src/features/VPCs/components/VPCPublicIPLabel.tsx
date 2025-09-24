import { Stack, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

/**
 * A shared component that is intended to be the label for the
 * VPC 1:1 NAT (public IP) checkbox.
 */
export const VPCPublicIPLabel = () => {
  return (
    <Stack alignItems="center" direction="row">
      <Typography>Allow public IPv4 access (1:1 NAT)</Typography>
      <TooltipIcon
        status="info"
        text="Allow IPv4 access to the internet using 1:1 NAT on the VPC interface."
      />
    </Stack>
  );
};

/**
 * A shared component that is intended to be the label for the
 * VPC public IPv6 checkbox.
 */
export const VPCIPv6PublicIPLabel = () => {
  return (
    <Stack alignItems="center" direction="row">
      <Typography>Allow public IPv6 access</Typography>
      <TooltipIcon
        status="info"
        text="Enable to allow two-way IPv6 traffic between your VPC and the internet. Disable to restrict IPv6 traffic to within the VPC. When enabled, Linodes will be publicly reachable over IPv6 unless restricted by a Cloud Firewall."
      />
    </Stack>
  );
};
